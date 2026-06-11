// Vercel serverless function: POST /api/generate
// Streams the OpenAI response as SSE events so the frontend can show real progress.
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

  // SSE headers — keep the connection open and disable proxy buffering
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const sendEvent = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: Math.min(8000, Number(days) * Number(meals) * 500 + 2000),
        stream: true,
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
      sendEvent({ type: 'error', error: `OpenAI API returned ${openaiRes.status}. Please try again in a moment.` });
      return res.end();
    }

    const reader = openaiRes.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    let fullContent = '';

    outer: while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;

        const raw = trimmed.slice(6);
        if (raw === '[DONE]') {
          let parsed;
          try {
            parsed = JSON.parse(fullContent);
          } catch {
            const cleaned = fullContent
              .replace(/^```json\s*/i, '')
              .replace(/^```\s*/i, '')
              .replace(/```\s*$/i, '')
              .trim();
            try {
              parsed = JSON.parse(cleaned);
            } catch {
              sendEvent({ type: 'error', error: 'Could not parse the meal plan. Please try generating again.' });
              return res.end();
            }
          }
          sendEvent({ type: 'done', plan: parsed });
          return res.end();
        }

        try {
          const chunk = JSON.parse(raw);
          const token = chunk.choices?.[0]?.delta?.content || '';
          if (token) {
            fullContent += token;
            sendEvent({ type: 'progress', chars: fullContent.length });
          }
        } catch {
          // skip malformed SSE chunks
        }
      }
    }
  } catch (err) {
    console.error(err);
    sendEvent({ type: 'error', error: 'Something went wrong contacting OpenAI. Please try again.' });
    res.end();
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

  const mealCalories = buildMealCalorieSplit(Number(calories), Number(meals), snacks);

  return `You are a professional nutritionist creating a structured meal plan.

Constraints:
- Plan length: ${days} day${days > 1 ? 's' : ''} (${planDays.join(', ')})
- DAILY CALORIE TARGET: ${calories} kcal — this is a hard requirement, not a suggestion
- Meals per day: ${meals}
- Include snacks: ${snacks ? 'yes' : 'no'}
- Diet type: ${diet}
- Supermarket: ${supermarket}
- Foods to include: ${include || 'none specified'}
- Foods to avoid: ${avoid || 'none specified'}
- Max cooking time per meal: ${cookTimeLabel}

Calorie distribution per meal (you MUST hit these targets for every day):
${mealCalories.map(m => `  ${m.type}: ~${m.target} kcal`).join('\n')}
  Daily total: ${calories} kcal

CRITICAL CALORIE RULES — failure to follow these will make the output unusable:
1. Every individual meal's "calories" field must reflect its ACTUAL calorie content for the portion described.
2. "daily_totals.calories" MUST equal the SUM of all meal calories for that day.
3. Each day's total must be within 50 kcal of ${calories}. Do not round to a convenient number.
4. Do not write placeholder zeros. Every calories field must be a realistic non-zero number.

CRITICAL RECIPE QUALITY RULES — failure to follow these will make the output unusable:
5. Every named dish must include ALL of its authentic cooking components in the "ingredients" list.
   - A CURRY must include: curry paste or spice blend, aromatics (onion, garlic, ginger), a liquid base (coconut milk, tinned tomatoes, or stock), oil — not just protein and carb.
   - A STIR-FRY must include: soy sauce or stir-fry sauce, sesame oil, garlic, ginger, and the vegetables that define it.
   - A PASTA DISH must include: the sauce (passata, pesto, cream, etc.), garlic, herbs — not just pasta and protein.
   - Apply the same logic to every named dish: include what actually makes it taste like that dish.
6. Do NOT name a dish after a sauce, paste, or spice blend and then omit that sauce, paste, or spice blend from the ingredients.
7. The shopping list must consolidate EVERY ingredient from every meal across all days — including all oils, spices, pastes, sauces, stock, and condiments. These belong in the "pantry" category and must never be omitted.
8. Every meal must include a "recipe" array with 3-5 short, followable cooking steps that match the ingredients and portion_size.

Other rules:
- Meals must be practical, well-flavoured, and use common UK supermarket ingredients (${supermarket}).
- Avoid niche or expensive foods.
- Prioritise high-protein meals.
- Strictly respect the cooking time constraint for every meal.
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
          "description": "up to 20 words describing taste and texture, e.g. 'Rich and warming with a gentle heat, great for batch cooking.'",
          "portion_size": "e.g. 50g oats, 200ml skimmed milk, 1 banana",
          "ingredients": [
            { "item": "rolled oats", "amount": "50g" },
            { "item": "skimmed milk", "amount": "200ml" },
            { "item": "banana", "amount": "1 medium" }
          ],
          "recipe": [
            "Add the oats, milk and sliced banana to a bowl or container.",
            "Stir well, then chill overnight or microwave for 2-3 minutes.",
            "Serve cold or warm, adjusting with a splash of milk if needed."
          ]
        }
      ],
      "daily_totals": { "calories": 0, "protein": 0 }
    }
  ],
  "shopping_list": {
    "protein": [
      { "name": "Chicken breast", "amount": "1 kg", "packs": "2 × 500g packs" }
    ],
    "carbs": [
      { "name": "Rolled oats", "amount": "500g", "packs": "1 × 500g bag" }
    ],
    "fats": [],
    "vegetables": [
      { "name": "Broccoli", "amount": "600g", "packs": "2 × 300g heads" }
    ],
    "pantry": [
      { "name": "Curry paste", "amount": "1 jar", "packs": "1 × 283g jar" },
      { "name": "Soy sauce", "amount": "50ml", "packs": "1 × 150ml bottle" },
      { "name": "Olive oil", "amount": "100ml", "packs": "1 × 500ml bottle" }
    ],
    "extras": []
  },
  "price_estimate": { "total": "", "notes": "" }
}

CRITICAL — ingredients array is REQUIRED on every meal. List EVERY ingredient used to cook the dish (protein, carbs, vegetables, oil, spices, sauces, aromatics, condiments), each with a precise quantity. Do not omit any flavouring or cooking ingredient — this list drives the shopping list.
CRITICAL — portion_size is REQUIRED on every meal. Comma-separated list of main ingredients with exact gram/ml weights. Format: "150g chicken breast, 40g brown rice (dry), 200g broccoli".
CRITICAL — recipe array is REQUIRED on every meal. Use 3-5 practical steps that a beginner can follow and that match the listed ingredients.
Rules for shopping_list items: each item must have "name", "amount" (total needed for the whole plan), and "packs" (e.g. "2 × 500g packs"). The "pantry" category covers ALL spices, pastes, sauces, oils, stock, and condiments — these must never be omitted or left empty when meals require them.

Return ONLY valid JSON. No markdown, no commentary.`;
}

function buildMealCalorieSplit(calories, meals, snacks) {
  const splits = {
    3: [
      { type: 'Breakfast', share: 0.28 },
      { type: 'Lunch',     share: 0.32 },
      { type: 'Dinner',    share: 0.40 },
    ],
    4: [
      { type: 'Breakfast', share: 0.25 },
      { type: 'Lunch',     share: 0.30 },
      { type: 'Dinner',    share: 0.35 },
      { type: 'Snack',     share: 0.10 },
    ],
    5: [
      { type: 'Breakfast', share: 0.22 },
      { type: 'Snack 1',   share: 0.08 },
      { type: 'Lunch',     share: 0.28 },
      { type: 'Dinner',    share: 0.34 },
      { type: 'Snack 2',   share: 0.08 },
    ],
  };

  const base = splits[meals] || splits[3];

  const hasMealsWithSnack = base.some(m => m.type.toLowerCase().includes('snack'));
  let list = base;
  if (snacks && !hasMealsWithSnack) {
    const snackCals = Math.round(calories * 0.10);
    const remaining = calories - snackCals;
    const scale = remaining / calories;
    list = [
      ...base.map(m => ({ ...m, share: m.share * scale })),
      { type: 'Snack', share: 0.10 },
    ];
  }

  return list.map(m => ({ type: m.type, target: Math.round(calories * m.share) }));
}
