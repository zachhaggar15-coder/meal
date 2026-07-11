// Vercel serverless function: POST /api/edit
// Receives the current plan JSON + a freetext instruction and returns an updated plan.

import {
  cleanMeta,
  createInMemoryRateLimiter,
  getRequestIp,
  jsonSize,
  parseBody,
} from '../server/http.js';
import {
  parseJsonObject,
  validateGeneratedPlan,
} from '../server/ai-validation.js';

const rateLimited = createInMemoryRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 12,
});
const MAX_PLAN_JSON_SIZE = 160000;
const MAX_INSTRUCTION_LENGTH = 500;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const ip = getRequestIp(req);
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many edit attempts. Please try again in a few minutes.' });
  }

  const body = parseBody(req.body);
  const { plan } = body;
  const instruction = cleanMeta(body.instruction, MAX_INSTRUCTION_LENGTH);

  if (!plan || !instruction) {
    return res.status(400).json({ error: 'Missing plan or instruction.' });
  }

  if (jsonSize(plan) > MAX_PLAN_JSON_SIZE || !validateGeneratedPlan(plan)) {
    return res.status(400).json({ error: 'Plan payload is too large or invalid.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server is missing OPENAI_API_KEY.' });
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const prompt = `You are editing an existing meal plan. Here is the current plan in JSON format:

${JSON.stringify(plan, null, 2)}

The user wants to make the following change:
"${instruction}"

Rules:
- Make ONLY the changes needed to satisfy the request. Do not change anything else.
- If a meal is changed, update that meal's calories and protein to reflect the new food.
- After any changes, recalculate daily_totals.calories and daily_totals.protein so they equal the exact sum of all meals in that day.
- Keep the same JSON structure as the input — do not add or remove keys.
- Every meal must have a "portion_size" field with exact gram/ml weights (e.g. "150g chicken breast, 40g brown rice (dry), 200g broccoli"). If a meal is changed, update its portion_size to match the new dish.
- Every meal must have an "ingredients" array listing EVERY ingredient used in the dish (protein, carbs, vegetables, oil, spices, sauces, aromatics, condiments), each with a precise quantity. If a meal is changed, replace its ingredients array completely to match the new dish — including all flavourings and cooking ingredients, not just the main protein and carb.
- If the input meal includes a "recipe" array, keep it. If that meal is changed, replace recipe with 3-5 short, followable steps that match the updated ingredients and portion_size.
- A named dish must include all components that define it: a curry needs curry paste/spice blend, aromatics, and a liquid base; a stir-fry needs sauce and aromatics; a pasta dish needs its sauce.
- If the input includes shopping_list and any meal or ingredient changes, rebuild shopping_list from every meal's ingredients. Remove ingredients no longer used and add replacement ingredients.
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

    const parsed = parseJsonObject(content);
    if (!parsed) {
      return res.status(502).json({ error: 'Could not parse the updated plan. Please try again.' });
    }

    if (!validateGeneratedPlan(parsed)) {
      return res.status(502).json({ error: 'The updated plan was incomplete. Please try again.' });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
