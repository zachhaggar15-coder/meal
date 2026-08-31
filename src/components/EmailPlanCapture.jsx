import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { track } from '../utils/analytics.js';
import { apiHeaders } from '../utils/apiClient.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailPlanCapture({
  plan,
  householdMembers,
  sourcePage = 'plan',
  compact = false,
  className = '',
  // A reader on a blog post has not chosen this plan — it was matched to the
  // article. Naming it is the difference between "give us your email" and a
  // stated exchange, so callers off the plan pages pass their own framing.
  kicker = 'Save this week',
  heading = 'Email me this plan',
  blurb = 'Get the 7-day menu, shopping list and printable plan link in your inbox.',
  planName = '',
}) {
  const uid = useId();
  const sectionRef = useRef(null);
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const startedRef = useRef(false);
  const sending = status === 'sending';
  const sent = status === 'sent';
  const planSlug = plan?.slug;

  const viewContext = useMemo(() => ({
    plan_slug: planSlug,
    page_type: sourcePage,
    cta_location: compact ? 'compact_email_plan' : 'email_plan',
  }), [compact, planSlug, sourcePage]);

  // Impressions are the denominator for capture rate. Without them a fall in
  // completions cannot be told apart from a fall in traffic to the section.
  useEffect(() => {
    const section = sectionRef.current;
    if (!planSlug || !section || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.35)) return;
      track.emailPlanViewed(viewContext);
      observer.disconnect();
    }, { threshold: [0.35] });

    observer.observe(section);
    return () => observer.disconnect();
  }, [planSlug, viewContext]);

  if (!plan?.slug) return null;

  const analyticsContext = {
    plan_slug: plan.slug,
    supermarket: plan.supermarket,
    goal: plan.goal,
    calorie_target: plan.calories || plan.targetCalories,
    protein_target: plan.macrosGrams?.protein,
    page_type: sourcePage,
    cta_location: compact ? 'compact_email_plan' : 'email_plan',
  };

  function markStarted() {
    if (startedRef.current) return;
    startedRef.current = true;
    track.emailPlanStarted(analyticsContext);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (sending) return;

    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_RE.test(cleanEmail)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    markStarted();
    setStatus('sending');
    setMessage('');

    try {
      const response = await fetch('/api/email-plan', {
        method: 'POST',
        headers: apiHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          email: cleanEmail,
          website,
          planSlug: plan.slug,
          householdMembers,
          // Only identify the surface that sent the request. The browser URL
          // can contain encoded quiz answers and must never leave the device.
          source: String(sourcePage || 'plan').replace(/[^a-z0-9/_-]/gi, '').slice(0, 80),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || 'Could not send the plan.');

      setStatus('sent');
      setMessage('Sent. Check your inbox for the plan and shopping list.');
      track.emailPlanCompleted(analyticsContext);
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Could not send the plan right now.');
      track.emailPlanFailed({ ...analyticsContext, reason: error.message || 'unknown' });
    }
  }

  return (
    <section
      ref={sectionRef}
      className={[
        'plan-email-capture',
        compact ? 'plan-email-capture--compact' : '',
        className,
      ].filter(Boolean).join(' ')}
      aria-labelledby={`${uid}-heading`}
    >
      <div>
        <span className="offer-kicker">{kicker}</span>
        <h2 id={`${uid}-heading`}>{heading}</h2>
        <p>{blurb}</p>
        {planName && (
          <p className="plan-email-target">
            We'll send: <strong>{planName}</strong>
          </p>
        )}
      </div>

      {sent ? (
        <p className="plan-email-status plan-email-status--sent" role="status">{message}</p>
      ) : (
        <form className="plan-email-form" onSubmit={handleSubmit}>
          <label htmlFor={`${uid}-email`}>
            <span>Email address</span>
            <input
              id={`${uid}-email`}
              type="email"
              value={email}
              onFocus={markStarted}
              onChange={event => {
                setEmail(event.target.value);
                if (status === 'error') setStatus('idle');
              }}
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={sending}
              aria-describedby={status === 'error' ? `${uid}-status` : undefined}
            />
          </label>
          <label className="plan-email-honeypot" aria-hidden="true">
            Website
            <input
              type="text"
              value={website}
              onChange={event => setWebsite(event.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </label>
          <button className="btn-primary" type="submit" disabled={sending || !email.trim()}>
            {sending ? 'Sending...' : 'Send me the plan'}
          </button>
          {message && (
            <p
              id={`${uid}-status`}
              className={`plan-email-status plan-email-status--${status}`}
              role="status"
            >
              {message}
            </p>
          )}
          {/* The single most common reason a reader does not type an address
              is not knowing what else it will be used for. Answer it in the
              form, where the decision is being made, not in the footer.
              /api/email-plan sends and does not store, so this is the whole
              truth — but it does pass through a delivery provider, which is
              why the claim stops at "not a newsletter" and links the rest. */}
          <p className="plan-email-privacy">
            One email with the plan — not a newsletter.{' '}
            <Link to="/privacy">How we handle your address</Link>.
          </p>
        </form>
      )}

      <p className="plan-email-note">
        Want a new plan every week?{' '}
        <Link to="/mealprep-plus">Join the MealPrep+ waitlist</Link>.
      </p>
    </section>
  );
}
