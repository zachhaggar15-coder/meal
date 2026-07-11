// Vercel serverless function: POST /api/edit-meal
// Receives a single meal object + freetext prompt, returns { meal: updatedMeal }.

import {
  cleanMeta,
  createInMemoryRateLimiter,
  getRequestIp,
  jsonSize,
  parseBody,
} from '../server/http.js';
import {
  parseJsonObject,
  validateEditedMealPayload,
} from '../server/ai-validation.js';

const rateLimited = createInMemoryRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 18,
});
const MAX_MEAL_JSON_SIZE = 16000;
const MAX_PROMPT_LENGTH = 400;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const ip = getRequestIp(req);
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many meal edit attempts. Please try again in a few minutes.' });
  }

  const body = parseBody(req.body);
  const { meal } = body;
  const prompt = cleanMeta(body.prompt, MAX_PROMPT_LENGTH);

  if (!meal || !prompt) {
    return res.status(400).json({ error: 'Missing meal or prompt.' });
  }

  if (jsonSize(meal) > MAX_MEAL_JSON_SIZE || typeof meal.name !== 'string') {
    return res.status(400).json({ error: 'Meal payload is too large or invalid.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server is missing OPENAI_API_KEY.' });
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const userPrompt = `You are editing a single meal in a UK meal plan. Here is the current meal as JSON:

${JSON.stringify(meal, null, 2)}

The user wants to make this change: "${prompt}"

Rules:
- Return a JSON object with a single key "meal" whose value is the updated meal.
- Keep every field that exists in the input (type, name, kcal, protein, prep, desc, ingredients, portion_size, recipe).
- Update name, kcal, protein, prep, desc, ingredients, portion_size, and recipe to reflect the new dish.
- ingredients must be a flat array of strings, each with a precise quantity (e.g. "Chicken breast 150g").
- portion_size must be a comma-separated string of the main ingredients with gram/ml weights.
- recipe must be an array of 3-5 short, followable cooking steps that match the updated ingredients and portion_size.
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

    const parsed = parseJsonObject(content);
    if (!parsed) {
      return res.status(502).json({ error: 'Could not parse the updated meal. Please try again.' });
    }

    if (!validateEditedMealPayload(parsed)) {
      return res.status(502).json({ error: 'The updated meal was incomplete. Please try again.' });
    }

    return res.status(200).json({ meal: parsed.meal });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
