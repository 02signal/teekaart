# Agent Entry Point

<!-- AMOS-TÖÖKORD:ALGUS (levitatud allikast – ära muuda siin) -->
## AMOS-i ühine töökord (omanik 16.10.2026)

Kehtib igale sessioonile ja agendile (Claude Code, Codex, pilv) selles repos.

- **Kohustus = GitHub issue.** Selle repo töö issue on selles repos. Sõnum ilma issue'ta ununeb.
- **Sildid:** `ala:<ala>` (üks), `olek:töös` / `olek:blokeeritud`, `omanik` (vajab omaniku otsust), `teise-ala`, `prio:kõrge`. Issue keha: `Väärtus:` (konversioon / õppija edu / CS aeg) ja `Valmis, kui:`.
- **Alustades** vaata oma ala järjekorda ja võta suurima väärtusega asi, mitte kõige uuem sõnum. WIP ≤ 5 `olek:töös`; GO + pakett valmis ja ootab ainult live'i akent → `olek:ootab-akent` (ei loe WIP-i). Sulge ainult tõendiga (PR, readback, link).
- **Sõnumid ainult üleandmiseks**, alati issue lingiga.
- **Andmed:** saladusi (paroole, võtmeid, tokeneid) ei kirjutata kuhugi. Selle repo issue'desse, PR-idesse ja commit'idesse isikuandmeid ei panda.
- **Muudatus läheb sisse PR-i ja sõltumatu ülevaatusega** (autor ≠ kontrollija).
<!-- AMOS-TÖÖKORD:LÕPP -->

Read `CLAUDE.md` first. It is the single source of truth for this repository.

Before planning or finishing work, also check `BACKLOG.md`.

Do not deploy, rename domains, change analytics IDs, or alter lead-routing behavior unless the user explicitly asks for it.
