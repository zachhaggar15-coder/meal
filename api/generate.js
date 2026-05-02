// Vercel serverless function: POST /api/generate
// Receives form data, calls OpenAI, returns parsed JSON meal plan.
// The OpenAI API key NEVER leaves the server.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Server is missing OPENAI_API_KEY. Set it in .env (local) or Vercel Project Settings (production).'
    });
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  // Pull form values from the request body, with sensible defaults.
  const {
    days = 7,
    calories = 1800,
    meals = 3,
    diet = 'standard',
    supermarket = 'Tesco',
    cookTime = '30',
    include = '',
    avoid = '',
    snacks = false,
    shoppingList = true
  } = req.body || {};

  const prompt = buildPrompt({
    days: Number(days),
    calories,
    meals,
    diet,
    supermarket,
    cookTime,
    include,
    avoid,
    snacks,
    shoppingList
  });

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        // Force JSON output so we don't have to scrape it from prose.
        response_format: { type: 'json_object' },
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content:
              'You are a professional UK-based nutritionist. You ALWAYS reply with a single valid JSON object that matches the schema given by the user. No commentary, no markdown.'
          },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error('OpenAI error:', openaiRes.status, errText);
      return res.status(502).json({
        error: `OpenAI API returned ${openaiRes.status}. Please try again in a moment.`
      });
    }

    const data = await openaiRes.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(502).json({ error: 'OpenAI response was empty.' });
    }

    // Parse JSON. If it fails, do one cleanup attempt then give up gracefully.
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      const cleaned = content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      try {
        parsed = JSON.parse(cleaned);
      } catch (e2) {
        return res.status(502).json({
          error: 'Could not parse the meal plan. Please try generating again.',
          raw: content
        });
      }
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Something went wrong contacting OpenAI. Please try again.'
    });
  }
}

function buildPrompt({
  days,
  calories,
  meals,
  diet,
  supermarket,
  cookTime,
  include,
  avoid,
  snacks,
  shoppingList
}) {
  const cookTimeLabel =
    cookTime === 'any' ? 'no limit on prep time' : `prep time under ${cookTime} minutes`;
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const planDays = dayNames.slice(0, days);

  return `You are a professional nutritionist creating a structured meal plan.

Constraints:
- Plan length: ${days} day${days > 1 ? 's' : ''} (${planDays.join(', ')})
- Target daily calories: ${calories}
- Meals per day: ${meals}
- Include snacks: ${snacks ? 'yes' : 'no'}
- Diet type: ${diet}
- Supermarket: ${supermarket}
- Foods to include: ${include || 'none specified'}
- Foods to avoid: ${avoid || 'none specified'}
- Max cooking time per meal: ${cookTimeLabel}

Rules:
- Meals must be realistic, simple, and use common UK supermarket ingredients (${supermarket}).
- Avoid niche or expensive foods.
- Prioritise high-protein, low-calorie meals.
- Strictly respect the cooking time constraint for every meal.
- Ensure daily calories are within +/- 100 kcal of target.
- Ensure good variety across all ${days} day${days > 1 ? 's' : ''}.
${shoppingList ? '- Provide a consolidated shopping list grouped by category and an estimated total price in GBP.' : '- shopping_list and price_estimate may be empty objects/arrays.'}

Output format MUST be valid JSON matching exactly:
{
  "weekly_plan": [
    {
      "day": "Monday",
      "meals": [
        {
          "type": "Breakfast",
          "name": "",
          "calories": 0,
          "protein": 0,
          "prep_time": "",
          "description": ""
        }
      ],
      "daily_totals": { "calories": 0, "protein": 0 }
    }
  ],
  "shopping_list": {
    "protein": [],
    "carbs": [],
    "fats": [],
    "vegetables": [],
    "extras": []
  },
  "price_estimate": { "total": "", "notes": "" }
}

Return ONLY valid JSON. No markdown, no commentary.`;
}
