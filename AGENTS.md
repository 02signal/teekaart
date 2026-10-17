# Agent Entry Point

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

Read `CLAUDE.md` first. It is the single source of truth for this repository.

Before planning or finishing work, also check `BACKLOG.md`.

Do not deploy, rename domains, change analytics IDs, or alter lead-routing behavior unless the user explicitly asks for it.
