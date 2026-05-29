// Vercel serverless function: POST /api/edit-meal
// Receives a single meal object + freetext prompt, returns { meal: updatedMeal }.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server is missing OPENAI_API_KEY.' });
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const { meal, prompt } = req.body || {};

  if (!meal || !prompt?.trim()) {
    return res.status(400).json({ error: 'Missing meal or prompt.' });
  }

  const userPrompt = `You are editing a single meal in a UK meal plan. Here is the current meal as JSON:

${JSON.stringify(meal, null, 2)}

The user wants to make this change: "${prompt.trim()}"

Rules:
- Return a JSON object with a single key "meal" whose value is the updated meal.
- Keep every field that exists in the input (type, name, kcal, protein, prep, desc, ingredients, portion_size).
- Update name, kcal, protein, prep, desc, ingredients, and portion_size to reflect the new dish.
- ingredients must be a flat array of strings, each with a precise quantity (e.g. "Chicken breast 150g").
- portion_size must be a comma-separated string of the main ingredients with gram/ml weights.
- kcal and protein must be realistic integer estimates for the new dish.
- Keep the same meal type (Breakfast, Lunch, Dinner, Snack).
- Use only ingredients readily available at UK supermarkets.
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
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content: 'You are a professional UK nutritionist. You ALWAYS reply with a single valid JSON object containing a "meal" key. No commentary, no markdown.',
          },
          { role: 'user', content: userPrompt },
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
      try { parsed = JSON.parse(cleaned); } catch {
        return res.status(502).json({ error: 'Could not parse the updated meal. Please try again.' });
      }
    }

    if (!parsed?.meal) {
      return res.status(502).json({ error: 'Unexpected response format. Please try again.' });
    }

    return res.status(200).json({ meal: parsed.meal });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
