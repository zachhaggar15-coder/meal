import { useId, useState } from 'react';

const MAX_FEEDBACK_LENGTH = 4000;

async function safeJson(res) {
  try { return await res.json(); } catch { return {}; }
}

export default function FeedbackBox({ className = '' }) {
  const feedbackId = useId();
  const honeypotId = useId();
  const [feedback, setFeedback] = useState('');
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
          source: window.location.href,
          website,
        }),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        throw new Error(data?.error || 'Could not send feedback. Please try again.');
      }

      setFeedback('');
      setWebsite('');
      setStatus('sent');
      setMessage('Thanks - your feedback has been sent.');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Could not send feedback. Please try again.');
    }
  }

  return (
    <section
      className={['plan-feedback-section', className].filter(Boolean).join(' ')}
      aria-labelledby={`${feedbackId}-heading`}
    >
      <div className="plan-feedback-copy">
        <h2 className="plan-feedback-heading" id={`${feedbackId}-heading`}>
          Feedback
        </h2>
        <p className="plan-feedback-text">
          Seen something off with this plan? Send a quick note and we will review it.
        </p>
      </div>
      <form className="feedback-form" onSubmit={handleSubmit}>
        <label className="feedback-label" htmlFor={`${feedbackId}-input`}>
          What should we improve?
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
          placeholder="Missing ingredient, confusing recipe, better swap idea..."
          rows={4}
          disabled={sending}
          required
        />
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
