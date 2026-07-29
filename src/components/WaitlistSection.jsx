import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  WAITLIST_SUPERMARKETS,
  WAITLIST_GOALS,
  WAITLIST_FEATURES,
} from '../data/waitlistOptions.js';
import { track } from '../utils/analytics.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function safeJson(res) {
  try { return await res.json(); } catch { return {}; }
}

/**
 * MealPrep+ waitlist / product-validation section.
 * Posts to the /api/waitlist serverless function (Supabase insert + welcome
 * email). No Supabase keys ever touch the browser.
 */
export default function WaitlistSection({ sourcePage = '', className = '', compact = false }) {
  const uid = useId();
  const sectionRef = useRef(null);
  const startedRef = useRef(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [supermarket, setSupermarket] = useState('');
  const [goal, setGoal] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [status, setStatus] = useState('idle'); // idle | sending | success | duplicate | error
  const [message, setMessage] = useState('');

  const sending = status === 'sending';
  const done = status === 'success' || status === 'duplicate';
  const analyticsContext = useMemo(() => ({
    source_page: sourcePage || 'unknown',
    page_type: sourcePage || 'unknown',
    cta_location: compact ? 'compact_waitlist' : 'waitlist',
  }), [compact, sourcePage]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.35)) return;
      track.waitlistViewed(analyticsContext);
      observer.disconnect();
    }, { threshold: [0.35] });

    observer.observe(section);
    return () => observer.disconnect();
  }, [analyticsContext]);

  function markStarted() {
    if (startedRef.current) return;
    startedRef.current = true;
    track.waitlistStarted(analyticsContext);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (sending) return;
    markStarted();

    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_RE.test(cleanEmail)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('sending');
    setMessage('');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          firstName: firstName.trim(),
          supermarket,
          goal,
          website,
          source: typeof window !== 'undefined' ? window.location.href : sourcePage,
        }),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        throw new Error(data?.error || 'Something went wrong. Please try again.');
      }
      if (data.duplicate) {
        setStatus('duplicate');
      } else {
        setStatus('success');
      }
      track.waitlistCompleted({
        ...analyticsContext,
        registration_status: data.duplicate ? 'duplicate' : 'new',
        supermarket: supermarket || undefined,
        goal: goal || undefined,
      });
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong. Please try again.');
    }
  }

  return (
    <section
      ref={sectionRef}
      className={['waitlist', className].filter(Boolean).join(' ')}
      aria-labelledby={`${uid}-title`}
    >
      <div className="waitlist-inner">
        <div className="waitlist-intro">
          <span className="waitlist-badge">MealPrep+ · Coming soon</span>
          <h2 id={`${uid}-title`} className="waitlist-title">
            Get next week's personalised plan automatically.
          </h2>
          <p className="waitlist-sub">
            <strong>MealPrep+</strong> is a planned low-cost service that would send a fresh weekly
            meal plan and shopping list built around your supermarket, budget, calories and protein
            target. Join the waitlist to tell us this saved effort would be useful.
          </p>

          {!compact && (
            <div className="waitlist-features">
              <h3 className="waitlist-features-title">Each week, subscribers would receive:</h3>
              <ul className="waitlist-feature-list">
                {WAITLIST_FEATURES.map(f => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <p className="waitlist-nopay">No payment today. You're simply joining the waitlist.</p>
            </div>
          )}
        </div>

        <div className="waitlist-form-card">
          {done ? (
            <div className="waitlist-success" role="status" aria-live="polite">
              <div className="waitlist-success-check" aria-hidden="true">✓</div>
              {status === 'duplicate' ? (
                <p>You're already on the waitlist — thanks for your interest.</p>
              ) : (
                <>
                  <p className="waitlist-success-lead">Thanks — you're on the waitlist.</p>
                  <p>
                    If enough people are interested, we'll begin building MealPrep+ and you'll be among
                    the first to hear about it.
                  </p>
                </>
              )}
            </div>
          ) : (
            <form className="waitlist-form" onSubmit={handleSubmit} noValidate>
              <h3 className="waitlist-form-title">Join the MealPrep+ waitlist</h3>

              <div className="waitlist-field">
                <label htmlFor={`${uid}-email`}>
                  Email address <span className="waitlist-req" aria-hidden="true">*</span>
                </label>
                <input
                  id={`${uid}-email`}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={email}
                  onFocus={markStarted}
                  onChange={e => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
                  placeholder="you@example.com"
                  disabled={sending}
                  aria-invalid={status === 'error'}
                  aria-describedby={status === 'error' ? `${uid}-email-error` : undefined}
                />
              </div>

              {!compact && (
                <>
                  <div className="waitlist-field">
                    <label htmlFor={`${uid}-name`}>First name <span className="waitlist-optional">(optional)</span></label>
                    <input
                      id={`${uid}-name`}
                      type="text"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="Alex"
                      disabled={sending}
                    />
                  </div>

                  <div className="waitlist-field-row">
                    <div className="waitlist-field">
                      <label htmlFor={`${uid}-supermarket`}>Favourite supermarket <span className="waitlist-optional">(optional)</span></label>
                      <select
                        id={`${uid}-supermarket`}
                        value={supermarket}
                        onChange={e => setSupermarket(e.target.value)}
                        disabled={sending}
                      >
                        <option value="">Select…</option>
                        {WAITLIST_SUPERMARKETS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div className="waitlist-field">
                      <label htmlFor={`${uid}-goal`}>Primary goal <span className="waitlist-optional">(optional)</span></label>
                      <select
                        id={`${uid}-goal`}
                        value={goal}
                        onChange={e => setGoal(e.target.value)}
                        disabled={sending}
                      >
                        <option value="">Select…</option>
                        {WAITLIST_GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Honeypot — hidden from real users */}
              <div className="waitlist-honeypot" aria-hidden="true">
                <label htmlFor={`${uid}-website`}>Website</label>
                <input
                  id={`${uid}-website`}
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                />
              </div>

              <button className="waitlist-submit" type="submit" disabled={sending}>
                {sending ? 'Joining…' : 'Join the Waitlist'}
              </button>

              {status === 'error' && (
                <p className="waitlist-error" role="alert" id={`${uid}-email-error`}>{message}</p>
              )}

              <p className="waitlist-privacy">
                We'll only email you about MealPrep+ updates. You can unsubscribe at any time.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
