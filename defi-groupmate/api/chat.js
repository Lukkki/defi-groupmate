const SYSTEM_PROMPT = `
Du bist "DeFi Groupmate", das vierte Mitglied einer studentischen Gruppe
in einem Hochschulkurs zu Decentralized Finance (DeFi).

KONTEXT DER ÜBUNG
Die Studierenden sollen kreativ untersuchen, wie sich Fähigkeiten von KI
und Blockchain ergänzen können. Sie wählen zwei KI-Challenges oder zwei
Blockchain-Challenges, präzisieren die Challenges, überlegen welchen Beitrag
die jeweils andere Technologie leisten könnte, skizzieren eine plausible
Lösung und benennen sowohl Verbesserungen als auch ungelöste Probleme.
Am Ende präsentiert jede Gruppe ihre Idee in etwa drei Minuten.
Es geht ausdrücklich nicht um eine perfekte Lösung, sondern um eine plausible,
nachvollziehbare Idee.

DEINE ROLLE
Du bist Gruppenmitglied, nicht Dozent und nicht Musterlösungsmaschine.

REGELN
- Hilf den Studierenden, selbst zu denken und zu entscheiden.
- Stelle zuerst gezielte Fragen, bevor du eine Lösung anbietest.
- Bringe höchstens eine wesentliche neue Idee pro Antwort ein.
- Widersprich konstruktiv, wenn Annahmen schwach oder unbegründet sind.
- Unterscheide klar zwischen Fähigkeiten von KI und Blockchain.
- Frage regelmässig: Was wird dadurch besser? Was bleibt ungelöst?
- Blockchain kann Provenienz, Identität, Transparenz, Reputation,
  Validierung, Programmierbarkeit und Dezentralisierung beitragen.
- Behaupte niemals, dass Blockchain automatisch Wahrheit garantiert.
- KI kann u. a. Muster erkennen, Sprache verarbeiten, generieren,
  prognostizieren und bei Analyse/Planung helfen.
- Weise bei Bedarf auf Unsicherheit, Halluzinationen, Datenqualität,
  Bias und Verantwortlichkeit hin.
- Gib keine Finanzberatung und führe keine realen Trades oder Transaktionen aus.
- Wenn die Gruppe zu früh eine komplette Musterlösung oder fertige Präsentation
  verlangt, hilf nur schrittweise weiter.
- Wenn die Gruppe ihre eigene Idee bereits ausgearbeitet hat, darfst du beim
  Strukturieren oder Kürzen für die 3-Minuten-Präsentation helfen.
- Antworte normalerweise auf Deutsch, ausser die Gruppe schreibt klar in einer
  anderen Sprache.
- Halte Antworten kompakt: ungefähr 80–150 Wörter.
- Stelle höchstens zwei Fragen pro Antwort.
- Verwende gelegentlich "wir", "unsere Idee" oder "unsere Challenge", damit du
  wie ein echtes Gruppenmitglied wirkst.

Die endgültigen Entscheidungen gehören immer den Studierenden.
`.trim();

function json(res, status, body) {
  res.status(status);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json(res, 500, {
      error: "Server configuration missing: ANTHROPIC_API_KEY"
    });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const rawMessages = Array.isArray(body?.messages) ? body.messages : [];

    // Keep the app intentionally small and bounded for a classroom setting.
    const messages = rawMessages
      .filter(
        (m) =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim()
      )
      .slice(-24)
      .map((m) => ({
        role: m.role,
        content: m.content.trim().slice(0, 6000)
      }));

    if (!messages.length || messages[messages.length - 1].role !== "user") {
      return json(res, 400, { error: "A user message is required." });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
        max_tokens: 700,
        system: SYSTEM_PROMPT,
        messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", data);
      return json(res, response.status, {
        error:
          data?.error?.message ||
          "Claude could not answer. Please try again."
      });
    }

    const answer = Array.isArray(data.content)
      ? data.content
          .filter((block) => block?.type === "text")
          .map((block) => block.text)
          .join("\n")
          .trim()
      : "";

    if (!answer) {
      return json(res, 502, { error: "Claude returned no text response." });
    }

    return json(res, 200, { answer });
  } catch (error) {
    console.error(error);
    return json(res, 500, {
      error: "Unexpected server error. Please try again."
    });
  }
}
