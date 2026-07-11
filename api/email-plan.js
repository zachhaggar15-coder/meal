// Vercel serverless function: POST /api/email-plan
// Sends a selected meal plan to the user. The plan is rebuilt from the slug on
// the server so the browser cannot inject arbitrary email content.

import { createHash } from 'node:crypto';
import { getPlanBySlug, scalePlanForHousehold } from '../src/utils/planBuilder.js';
import { SITE_CONTACT_EMAIL, SITE_NAME, SITE_URL } from '../src/constants/site.js';
import {
  cleanEmail,
  cleanMeta,
  createInMemoryRateLimiter,
  escapeHtml,
  getRequestIp,
  parseBody,
} from '../server/http.js';
import {
  buildHtmlEmail,
  resolveEmailFrom,
  resolveReplyTo,
  sendResendEmail,
} from '../server/email.js';

const rateLimited = createInMemoryRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const ip = getRequestIp(req);
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many email attempts. Please try again in a few minutes.' });
  }

  const body = parseBody(req.body);
  if (body.website) {
    return res.status(200).json({ ok: true });
  }

  const email = cleanEmail(body.email);
  if (!email) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const slug = cleanMeta(body.planSlug, 120);
  const basePlan = getPlanBySlug(slug);
  if (!basePlan) {
    return res.status(404).json({ error: 'Plan not found.' });
  }

  const householdMembers = Array.isArray(body.householdMembers)
    ? body.householdMembers.slice(0, 6).map((member, index) => ({
        id: cleanMeta(member?.id || `person-${index + 1}`, 50),
        label: cleanMeta(member?.label || member?.name || `Person ${index + 1}`, 60),
        portionScale: Number(member?.portionScale ?? member?.portion ?? 1),
      }))
    : 1;

  const plan = scalePlanForHousehold(basePlan, householdMembers);
  const source = cleanMeta(body.source || req.headers.referer || '', 500);
  const subject = `Your ${plan.title} meal plan`;
  const planUrl = basePlan.seo?.canonical || `${SITE_URL}/plans/${basePlan.slug}`;
  const text = buildPlanEmailText({ plan, planUrl, source });
  const html = buildPlanEmailHtml({ plan, planUrl, source });
  const idempotencyKey = createHash('sha256')
    .update(`email-plan:${email}:${slug}:${new Date().toISOString().slice(0, 10)}`)
    .digest('hex');

  try {
    const data = await sendResendEmail({
      from: resolveEmailFrom(
        process.env.MEALPREP_PLAN_FROM_EMAIL ||
        process.env.MEALPREP_FROM_EMAIL,
      ),
      to: email,
      replyTo: resolveReplyTo(process.env.MEALPREP_REPLY_TO_EMAIL || SITE_CONTACT_EMAIL),
      subject,
      text,
      html,
      idempotencyKey,
    });

    return res.status(200).json({ ok: true, id: data?.id || data?.data?.id || null });
  } catch (err) {
    console.error('Plan email failed:', err);
    return res.status(500).json({
      error: 'Could not send the email right now. Please try again in a minute.',
    });
  }
}

function buildPlanEmailText({ plan, planUrl }) {
  const dayLines = (plan.plan || []).flatMap(day => [
    '',
    `${day.day} - ${day.totals?.kcal || plan.calories} kcal, ${day.totals?.protein || 0}g protein`,
    ...(day.meals || []).map(meal => `- ${meal.type}: ${meal.name} (${meal.kcal} kcal, ${meal.protein}g protein)`),
  ]);

  const shoppingLines = Object.entries(plan.shoppingList || {}).flatMap(([category, items]) => (
    items?.length ? ['', categoryLabel(category), ...items.map(item => `- ${item}`)] : []
  ));

  return [
    `${SITE_NAME}`,
    '',
    plan.title,
    plan.summary?.calorieRange,
    `Budget estimate: ${plan.summary?.budgetRange || plan.priceEstimate}`,
    `Cooking for: ${plan.householdLabel || plan.peopleLabel || '1 person'}`,
    '',
    `Open the plan: ${planUrl}`,
    '',
    '7-day menu',
    ...dayLines,
    '',
    'Shopping list',
    ...shoppingLines,
    '',
    'Want weekly plans like this sent to you? Join the MealPrep+ waitlist on the site.',
  ].filter(Boolean).join('\n');
}

function buildPlanEmailHtml({ plan, planUrl }) {
  const dayHtml = (plan.plan || []).map(day => `
    <section style="border-top:1px solid #eee5d8;padding-top:16px;margin-top:16px;">
      <h2 style="font-size:18px;margin:0 0 8px;color:#17130d;">${escapeHtml(day.day)}</h2>
      <p style="margin:0 0 10px;color:#4a463d;">${escapeHtml(day.totals?.kcal || plan.calories)} kcal, ${escapeHtml(day.totals?.protein || 0)}g protein</p>
      <ul style="margin:0;padding-left:20px;color:#312d26;line-height:1.55;">
        ${(day.meals || []).map(meal => `
          <li><strong>${escapeHtml(meal.type)}:</strong> ${escapeHtml(meal.name)} (${escapeHtml(meal.kcal)} kcal, ${escapeHtml(meal.protein)}g protein)</li>
        `).join('')}
      </ul>
    </section>
  `).join('');

  const shoppingHtml = Object.entries(plan.shoppingList || {})
    .filter(([, items]) => items?.length)
    .map(([category, items]) => `
      <h3 style="font-size:15px;margin:14px 0 6px;color:#17130d;">${escapeHtml(categoryLabel(category))}</h3>
      <ul style="margin:0;padding-left:20px;color:#312d26;line-height:1.55;">
        ${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    `).join('');

  return buildHtmlEmail({
    title: plan.title,
    preview: `Your ${plan.summary?.calorieRange || '7-day'} meal plan from MealPrep.org.uk`,
    bodyHtml: `
      <p style="margin:0 0 16px;color:#4a463d;line-height:1.6;">
        Here is your plan, including meals, calories, protein and the shopping list.
      </p>
      <p style="margin:0 0 18px;">
        <a href="${escapeHtml(planUrl)}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;padding:12px 16px;font-weight:700;">Open full plan</a>
      </p>
      <div style="display:grid;gap:8px;margin:0 0 18px;color:#312d26;">
        <p style="margin:0;"><strong>Calories:</strong> ${escapeHtml(plan.summary?.calorieRange || `${plan.calories} kcal/day`)}</p>
        <p style="margin:0;"><strong>Budget:</strong> ${escapeHtml(plan.summary?.budgetRange || plan.priceEstimate)} estimate</p>
        <p style="margin:0;"><strong>Cooking for:</strong> ${escapeHtml(plan.householdLabel || plan.peopleLabel || '1 person')}</p>
      </div>
      ${dayHtml}
      <section style="border-top:1px solid #eee5d8;padding-top:18px;margin-top:20px;">
        <h2 style="font-size:20px;margin:0 0 10px;color:#17130d;">Shopping list</h2>
        ${shoppingHtml}
      </section>
      <p style="margin:22px 0 0;color:#4a463d;line-height:1.6;">
        Want weekly plans like this without re-planning? Join the MealPrep+ waitlist on MealPrep.org.uk.
      </p>
    `,
  });
}

function categoryLabel(category) {
  return {
    protein: 'Protein',
    carbs: 'Carbs and grains',
    vegetables: 'Vegetables',
    dairy: 'Dairy and eggs',
    fruit: 'Fruit',
    herbs: 'Herbs and spices',
    condiments: 'Condiments and oils',
    tins: 'Tins and jars',
    extras: 'Extras',
  }[category] || category;
}
