import { useId, useState } from 'react';

const MAX_FEEDBACK_LENGTH = 4000;

async function safeJson(res) {
  try { return await res.json(); } catch { return {}; }
}

export default function FeedbackBox({
  className = '',
  title = 'Feedback',
  description = 'Seen something off with this plan? Send a quick note and we will review it.',
  label = 'What should we improve?',
  placeholder = 'Missing ingredient, confusing recipe, better swap idea...',
  // Off by default: the in-page boxes on plan pages are meant to be a two-second
  // note, and an address field there would only slow that down. The standalone
  // form turns it on, because that is where someone writing at length is most
  // likely to want an answer.
  showEmail = false,
}) {
  const feedbackId = useId();
  const honeypotId = useId();
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const feedbackText = feedback.trim();
  const sending = status === 'sending';
  const canSubmit = Boolean(feedbackText) && !sending;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus('sending');
    setMessage('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: feedbackText,
          email: showEmail ? email.trim() : '',
          source: window.location.href,
          website,
        }),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        if (res.status === 404 && isLocalPreview()) {
          throw new Error('Feedback can only be submitted when the local server is running with Vercel dev or after deployment.');
        }
        throw new Error(data?.error || 'Could not send feedback. Please try again.');
      }

      setFeedback('');
      setEmail('');
      setWebsite('');
      setStatus('sent');
      setMessage(data?.provider === 'server-log'
        ? 'Thanks - your feedback has been received for review.'
        : 'Thanks - your feedback has been sent.');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Could not send feedback right now. Please try again in a minute.');
    }
  }

  return (
    <section
      className={['plan-feedback-section', className].filter(Boolean).join(' ')}
      aria-labelledby={`${feedbackId}-heading`}
    >
      <div className="plan-feedback-copy">
        <h2 className="plan-feedback-heading" id={`${feedbackId}-heading`}>
          {title}
        </h2>
        <p className="plan-feedback-text">
          {description}
        </p>
      </div>
      <form className="feedback-form" onSubmit={handleSubmit}>
        <label className="feedback-label" htmlFor={`${feedbackId}-input`}>
          {label}
        </label>
        <textarea
          id={`${feedbackId}-input`}
          className="feedback-textarea"
          value={feedback}
          onChange={(e) => {
            setFeedback(e.target.value);
            if (status === 'error') {
              setStatus('idle');
              setMessage('');
            }
          }}
          maxLength={MAX_FEEDBACK_LENGTH}
          placeholder={placeholder}
          rows={4}
          disabled={sending}
          required
        />
        {showEmail && (
          <>
            <label className="feedback-label" htmlFor={`${feedbackId}-email`}>
              Your email <span className="feedback-optional">(optional, only if you want a reply)</span>
            </label>
            <input
              id={`${feedbackId}-email`}
              className="feedback-input"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'error') {
                  setStatus('idle');
                  setMessage('');
                }
              }}
              placeholder="you@example.com"
              autoComplete="email"
              maxLength={254}
              disabled={sending}
            />
          </>
        )}
        <label className="feedback-honeypot" htmlFor={honeypotId}>
          Website
        </label>
        <input
          id={honeypotId}
          className="feedback-honeypot"
          type="text"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
        <button className="feedback-submit" type="submit" disabled={!canSubmit}>
          {sending ? 'Sending...' : 'Submit feedback'}
        </button>
        {message && (
          <p className={`feedback-status feedback-status--${status}`} aria-live="polite">
            {message}
          </p>
        )}
      </form>
    </section>
  );
}

function isLocalPreview() {
  if (typeof window === 'undefined') return false;
  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
}
