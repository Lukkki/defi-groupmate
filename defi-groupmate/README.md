# DeFi Groupmate

Minimaler akademischer Web-Chat für eine Gruppenübung zu **KI × Blockchain**.

- Frontend: eine einzige `index.html`
- Backend: eine Vercel Serverless Function unter `/api/chat`
- LLM: Anthropic Claude
- Onchain-Referenz im UI: **ERC-8004 Agent #10601 · Sepolia**
- Kein API-Key im Browser

## Schnell auf Vercel deployen

### Variante A — ohne Terminal: GitHub + Vercel

1. Entpacke `defi-groupmate.zip`.
2. Öffne GitHub und erstelle ein neues Repository, z. B. `defi-groupmate`.
3. Im neuen Repository: **Add file → Upload files**.
4. Ziehe **alle Dateien aus dem entpackten Ordner** hinein, inklusive des Ordners `api`.
5. Klicke **Commit changes**.
6. Öffne Vercel und melde dich an.
7. Klicke **Add New → Project**.
8. Wähle das GitHub-Repository `defi-groupmate`.
9. Klicke **Deploy**.
10. Nach dem ersten Deploy: **Project → Settings → Environment Variables**.
11. Neue Variable:
    - Name: `ANTHROPIC_API_KEY`
    - Value: dein geheimer `sk-ant-...` Key
    - Environment: Production, Preview, Development
12. Optional zweite Variable:
    - Name: `ANTHROPIC_MODEL`
    - Value: `claude-sonnet-5-5`
13. Speichern.
14. Gehe zu **Deployments**, öffne beim letzten Deployment das Menü `...` und wähle **Redeploy**.
15. Öffne danach deine `*.vercel.app` URL und teste den Chat.

WICHTIG: Den API-Key niemals in `index.html`, GitHub oder ERC-8004 eintragen.

## Eigene STRATO-Subdomain später verbinden

Wenn die Vercel-URL funktioniert:

1. Vercel → Project → **Settings → Domains**
2. z. B. `agent.deinedomain.ch` hinzufügen.
3. Vercel zeigt den nötigen DNS-Wert an.
4. Bei STRATO für die Subdomain `agent` den von Vercel angezeigten DNS/CNAME-Eintrag setzen.
5. Warten, bis Vercel die Domain als korrekt verifiziert.

Erst danach kannst du diese URL als **Web Endpoint** in den Metadaten deines bestehenden
ERC-8004 Agent #10601 eintragen.

## Dateien

- `index.html` – Oberfläche für Studierende
- `api/chat.js` – serverseitiger Claude-Aufruf und System-Prompt
- `vercel.json` – Vercel-Funktionskonfiguration
- `.env.example` – Beispiel für lokale Umgebungsvariablen
- `.gitignore` – verhindert versehentliches Committen lokaler Secrets

## Anpassung des Agenten

Die didaktischen Regeln stehen in `api/chat.js` in `SYSTEM_PROMPT`.
Dort kannst du Text, Aufgabe oder Ton leicht verändern.

## Datenschutz / Kursbetrieb

Der Browser sendet den aktuellen Chatverlauf an deine Vercel-Funktion, die ihn an die
Anthropic API weitergibt. Die App selbst speichert keine Chatverläufe in einer Datenbank.
Jeder Browser-Tab hat seinen eigenen temporären Chat.

Für einen produktiven Hochschulbetrieb solltest du die Datenschutz- und Beschaffungsregeln
deiner Institution sowie die Bedingungen des API-Anbieters prüfen.
