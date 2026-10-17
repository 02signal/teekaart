# 02Signal Sales Site Rules

<!-- AMOS-TÖÖKORD:ALGUS (allikas: arthunt/amos-ops agents/amos-tookord-plokk.md – ära muuda siin) -->
## AMOS-i ühine töökord (omanik 16.10.2026)

Kehtib igale sessioonile ja agendile (Claude Code, Codex, pilv) selles repos. Täistekst: `arthunt/amos-ops` → `agents/uhised-reeglid.md` ja `docs/po-harta.md`.

- **Kohustus = GitHub issue.** Selle repo töö issue on selles repos. Kui töö puudutab mitut repot või hosti, tee issue repos `arthunt/amos-ops`. Sõnum ilma issue'ta ununeb.
- **Sildid:** `ala:<ala>` (üks), `olek:töös` / `olek:blokeeritud`, `omanik` (vajab omaniku otsust), `teise-ala`, `prio:kõrge`. Issue keha: `Väärtus:` (konversioon / õppija edu / CS aeg) ja `Valmis, kui:`.
- **Alustades** vaata oma ala järjekorda ja võta suurima väärtusega asi, mitte kõige uuem sõnum. WIP ≤ 5 `olek:töös`; GO + pakett valmis ja ootab ainult live'i akent → `olek:ootab-akent` (ei loe WIP-i). Sulge ainult tõendiga (PR, readback, link).
- **Merge klassi järgi** (autor ≠ kontrollija):
  - **A** (docs, logid, mälu): ise, kui CI on roheline. **Agentide reeglid (CLAUDE.md, AGENTS.md, `.claude/`) on B.**
  - **B** (õppijale/kliendile minev sisu): ise pärast valideerija GO-d (silt `valideerija-go`), tarne merge'itud sha-st;
  - **C** (tootmiskood ja juurutus, host, õigused, raha, kustutamine, www release): merge ise pärast VM GO-d; juurutus hostis teeb PO live'i aknas 10:00/16:00. **≤ 1 avatud C-PR ala kohta.**
  - Kahtluse korral vali kõrgem klass. **GO: C → `valideerija` (VM), B → `valideerija - mac` (Maci enda PR-id → VM).**
- **Sõnumid ainult üleandmiseks**, alati issue lingiga. Kui avastus puudutab teist ala, tee issue sinna sildiga `teise-ala`.
- Saladusi ega isikuandmeid ei kirjutata repodesse ega sõnumitesse. Kasuta ainult nimesid ja rolle.
<!-- AMOS-TÖÖKORD:LÕPP -->

This repository is part of the Ettevõtluskeskus OÜ / 02Signal sales-site group.

## Audience

Write for a pragmatic Estonian business owner, often 60-70+ years old, with little technical background.

Use plain Estonian. Prefer:
- "tüütu töö"
- "aeg"
- "raha"
- "kordub iga nädal"
- "inimene vaatab üle"
- "tasub ära"

Avoid jargon unless it is necessary. Avoid words such as "agentic", "flow", "pipeline", "autonomy", "canonical", "maturity" in public copy.

## Commercial Rule

Every main page should answer:
- what pain this solves;
- what the owner gets;
- what it may cost;
- when the first small project may pay back;
- what the next safe step is.

Money matters. Where possible, show time saved, monthly euro value, and payback logic.

## Site Roles

- `automatiseerimine.ee`: repeated manual work, reminders, copying, first small automation.
- `digitaliseerimine.ee`: paper, Excel, old software, information movement, small practical digitalisation.
- `digiteekaart.ee`: EIS digitalisation roadmap, RTE/software support and funding pre-assessment.
- `teekaart.ee`: route selector when the owner does not know which direction to choose.

Support and funding questions should route to `https://digiteekaart.ee/`.

## Tracking

Keep GA4 events stable:
- `tool_start`
- `tool_completed`
- `result_high_intent`
- `cta_click`
- `phone_click`
- `email_click`
- `partner_site_click`
- `lead_form_start`
- `lead_form_submit_attempt`
- `lead_form_submit`

When adding tools, include useful event parameters such as `tool_name`, `result_tier`, `monthly_cost`, `payback_months`, or `result_route`.

## Privacy

Do not expose raw personal data, secrets, tokens, signed URLs, or private payloads. Lead forms must explain what data is collected and why.

## Technical

The site is an Astro static site deployed on Vercel and served through Cloudflare/DNS.

Before completing code work:
1. Run `npm run build`.
2. Commit the scoped change.
3. Push and deploy only when requested.
4. Verify the live domain when deployed.
5. Update `BACKLOG.md` if a new follow-up is discovered.
