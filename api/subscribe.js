// Vercel serverless function — lead capture for teekaart.ee.
//
// Ported from ~/GitHub/automatiseerimine/api/subscribe.js (itself ported from
// mikrokvalifikatsioon — the ONE lead capture pattern proven end to end: site
// form -> this function -> AMOS outreach-capture -> Listmonk double opt-in ->
// confirmed subscriber). This site's form used to POST to a Supabase edge
// function (PUBLIC_SITE_LEAD_WEBHOOK_URL) whose hardcoded allow-list never
// included "funnel_teekaart" — every submission returned 400 and silently
// fell back to mailto:, so no lead from this site was ever recorded
// anywhere. Per owner direction, that Supabase path is being retired
// entirely (not patched) in favour of the AMOS path every other brand now
// shares. Same envelope contract as mkval/automatiseerimine
// (amos.outreach.lead_capture/v1), same double-opt-in + suppression +
// erasure path. This function stores nothing itself and never sees secrets
// beyond the forward token.
//
// Only ONE capture surface exists on this site today: the "suunav päring"
// (routing/direction request) form on / (index.astro). `source_site` is
// therefore fixed to `funnel_teekaart` — already a live member of both the
// AMOS lead-capture-contract ALLOWED_CAPTURE_SITES enum and the service's
// CAPTURE_SITE_TO_BRAND_KEY map (-> brand_key "teekaart", verified against
// 02S-AMOS infra/services/outreach-capture/app/service.mjs before this
// shipped — unlike automatiseerimine/digitaliseerimine, teekaart already has
// its OWN registered brand_key and its own Resend-verified sender address,
// tugi@teekaart.ee).
//
// Topic choice: `interest_topic` MUST be a member of AMOS's
// ALLOWED_INTEREST_TOPICS (infra/contracts/outreach/lead-capture-contract.mjs)
// — inventing a new one is out of scope for this change. None of the
// ratified topics name "teekaart" itself. `b2b_koolitus` is wired to the
// mkval trainer/provider list and Twenty classification
// (confirmed-subscriber-list-routing-contract.mjs,
// outreach-confirmed-capture-twenty-queue-contract.mjs) and would misroute
// this site's leads there; the other named topics (mikrokvalifikatsioon,
// digiteekaart, automatiseerimine, juhtimine) all belong to a SPECIFIC
// sibling brand's own course/program line and would falsely tag a teekaart
// lead as interested in that other brand's program when AMOS's topic-notify
// feature later mails confirmed subscribers about a new program under that
// topic. `projekt` ("Projektid") is the one ratified, brand-neutral bucket
// not yet claimed by any specific brand's course line — the correct fit for
// a one-off route/roadmap advisory request rather than a named course, same
// reasoning digitaliseerimine.ee and automatiseerimine.ee already applied by
// using consent_purpose "b2b_outreach" instead of "course_offers" (teekaart's
// own brand-sender registry entry already lists "advisory" and "b2b_outreach"
// in its purpose_scope, so this is not a new capability grant).
//
// Required env (Vercel project settings — same ingress every ported site uses):
//   AMOS_TOPIC_CAPTURE_URL   the AMOS ingress endpoint (https)
//   AMOS_CAPTURE_TOKEN       shared bearer the ingress checks

const ALLOWED_TOPICS = new Set(['projekt']);
const ALLOWED_SITES = new Set(['funnel_teekaart']);
const ALLOWED_KINDS = new Set(['topic_subscribe']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Bounded per the shared envelope contract (infra/contracts/outreach/
// lead-capture-contract.mjs: MAX_CONTEXT_OUTCOMES=24, MAX_CONTEXT_TEXT_LENGTH=240,
// CONTEXT_FORBIDDEN_TEXT_REGEX rejects @ / http(s):// / < / > / control chars).
// `field` is clipped tighter (64) on purpose — it carries a short task label,
// never a paragraph.
const MAX_FIELD_LEN = 64;
const MAX_OUTCOMES = 24;
const MAX_OUTCOME_LEN = 240;
const FORBIDDEN_TEXT_RE = /(@|https?:\/\/|<|>|[\u0000-\u001f])/gi;

function readBody(req) {
  return new Promise((resolve) => {
    if (req.body) { resolve(typeof req.body === 'string' ? safeParse(req.body) : req.body); return; }
    let raw = '';
    req.on('data', (c) => { raw += c; if (raw.length > 32768) req.destroy(); });
    req.on('end', () => resolve(safeParse(raw)));
    req.on('error', () => resolve(null));
  });
}
function safeParse(s) { try { return JSON.parse(s); } catch { return null; } }

// Defensive client-side-adjacent sanitising: strip whatever the envelope
// contract would reject outright (never trust the browser), then bound
// length. Returns null for "nothing usable left" rather than an empty string,
// so callers can tell "not provided" from "provided but empty".
function cleanText(value, maxLen) {
  if (typeof value !== 'string') return null;
  const stripped = value.replace(FORBIDDEN_TEXT_RE, '').trim().slice(0, maxLen);
  return stripped || null;
}

function cleanOutcomes(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const out = [];
  for (const item of value) {
    const text = cleanText(item, MAX_OUTCOME_LEN);
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(text);
    if (out.length >= MAX_OUTCOMES) break;
  }
  return out;
}

// GDPR erasure (Art. 17): route an account-deletion request to the AMOS erasure
// endpoint (POST /api/outreach/v1/erasure — suppression-first, then deletion).
// NEVER subscribes. Endpoint: AMOS_ERASURE_URL, else derived from
// AMOS_TOPIC_CAPTURE_URL (…/erasure). Kept even though this site has no
// account UI: it is the same public POST target, so the same fail-closed
// GDPR branch has to exist here too.
async function forwardErasure(email, sourceSite, res) {
  const erasureUrl =
    process.env.AMOS_ERASURE_URL
    || (process.env.AMOS_TOPIC_CAPTURE_URL || '').replace(/\/[^/]*$/, '/erasure');
  if (erasureUrl) {
    try {
      const r = await fetch(erasureUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(process.env.AMOS_CAPTURE_TOKEN ? { authorization: `Bearer ${process.env.AMOS_CAPTURE_TOKEN}` } : {}),
        },
        body: JSON.stringify({
          capture_version: 'amos.outreach.lead_capture/v1',
          email,
          requested_at: new Date().toISOString(),
          scope: 'all_outreach_data',
          status: 'received',
          source_site: sourceSite,
        }),
      });
      if (r.ok) { res.status(200).json({ ok: true, status: 'erasure_requested' }); return; }
      console.error('subscribe: erasure ingress status', r.status);
    } catch (e) {
      console.error('subscribe: erasure ingress error', e && e.message);
    }
  } else {
    console.error('subscribe: no erasure endpoint configured (AMOS_ERASURE_URL / AMOS_TOPIC_CAPTURE_URL)');
  }
  // Fail-closed for GDPR: we did NOT subscribe. Honest response.
  res.status(200).json({
    ok: true,
    status: 'erasure_pending',
    message: 'Kustutustaotlus on vastu võetud. Kui see ei jõua automaatselt kohale, kirjuta info@02signal.ai.',
  });
}

export default async function handler(req, res) {
  res.setHeader('content-type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') { res.status(405).json({ message: 'Method not allowed' }); return; }

  const body = await readBody(req);
  if (!body || typeof body !== 'object') { res.status(400).json({ message: 'Vigane päring.' }); return; }

  const kind = ALLOWED_KINDS.has(body.kind) ? body.kind : 'topic_subscribe';
  const email = String(body.email || '').trim().toLowerCase();
  const field = cleanText(body.field, MAX_FIELD_LEN);
  const outcomes = cleanOutcomes(body.outcomes);
  const sourceSite = ALLOWED_SITES.has(body.source_site) ? body.source_site : 'funnel_teekaart';

  if (!EMAIL_RE.test(email) || email.length > 254) { res.status(400).json({ message: 'Palun sisesta korrektne e-post.' }); return; }

  // PBI-01-equivalent (GDPR Art. 17): account deletion must NEVER fall through
  // to a subscription. Checked on the RAW body.kind, before normalisation.
  if (body.kind === 'account_delete' || body.kind === 'erasure') {
    return forwardErasure(email, sourceSite, res);
  }

  const topic = String(body.topic || '').trim();
  if (!ALLOWED_TOPICS.has(topic)) { res.status(400).json({ message: 'Tundmatu teema.' }); return; }

  const ingress = process.env.AMOS_TOPIC_CAPTURE_URL;
  if (!ingress) {
    // Never silently drop a subscriber: tell them honestly + log for the operator.
    console.error('subscribe: AMOS_TOPIC_CAPTURE_URL is not configured');
    res.status(503).json({ message: 'Ühenduse võtmine on hetkel ajutiselt suletud. Proovi varsti uuesti või helista +372 5818 0435.' });
    return;
  }

  try {
    const r = await fetch(ingress, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(process.env.AMOS_CAPTURE_TOKEN ? { authorization: `Bearer ${process.env.AMOS_CAPTURE_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        // Forward ONLY keys the AMOS lead_capture ingress allow-lists (kind,
        // email, interest_topic, field, outcomes, consent_purpose, source_site,
        // captured_at) — any other key is rejected (422).
        kind,
        email,
        interest_topic: topic,
        ...(field ? { field } : {}),
        ...(outcomes.length ? { outcomes } : {}),
        // Teekaart sells one-off route/roadmap advisory work, not a course —
        // b2b_outreach is the correct ratified consent purpose
        // (amos.outreach.lead_capture/v1), distinct from course_offers, and
        // already listed in teekaart's own brand-sender registry purpose_scope.
        consent_purpose: 'b2b_outreach',
        source_site: sourceSite,
        captured_at: new Date().toISOString(),
      }),
    });
    if (!r.ok) { console.error('subscribe: ingress status', r.status); res.status(502).json({ message: 'Saatmine ebaõnnestus. Proovi hiljem uuesti.' }); return; }
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('subscribe: ingress error', e && e.message);
    res.status(502).json({ message: 'Saatmine ebaõnnestus. Proovi hiljem uuesti.' });
  }
}
