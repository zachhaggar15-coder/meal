// Vercel serverless function: POST /api/edit
// Receives the current plan JSON + a freetext instruction and returns an updated plan.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server is missing OPENAI_API_KEY.' });
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const { plan, instruction } = req.body || {};

  if (!plan || !instruction?.trim()) {
    return res.status(400).json({ error: 'Missing plan or instruction.' });
  }

  const prompt = `You are editing an existing meal plan. Here is the current plan in JSON format:

${JSON.stringify(plan, null, 2)}

The user wants to make the following change:
"${instruction.trim()}"

Rules:
- Make ONLY the changes needed to satisfy the request. Do not change anything else.
- If a meal is changed, update that meal's calories and protein to reflect the new food.
- After any changes, recalculate daily_totals.calories and daily_totals.protein so they equal the exact sum of all meals in that day.
- Keep the same JSON structure as the input — do not add or remove keys.
- Return the complete updated plan, not just the changed parts.
- Return ONLY valid JSON. No markdown, no commentary.`;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        response_format: { type: 'json_object' },
        temperature: 0.5,
        messages: [
          {
            role: 'system',
            content: 'You are a professional UK nutritionist editing meal plans. You ALWAYS reply with a single valid JSON object matching the schema of the input. No commentary, no markdown.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error('OpenAI error:', openaiRes.status, errText);
      return res.status(502).json({ error: `OpenAI API returned ${openaiRes.status}. Please try again.` });
    }

    const data = await openaiRes.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(502).json({ error: 'OpenAI response was empty.' });
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      const cleaned = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        return res.status(502).json({ error: 'Could not parse the updated plan. Please try again.' });
      }
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
