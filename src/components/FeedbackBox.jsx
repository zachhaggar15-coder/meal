import { useState } from 'react';

const MAX_FEEDBACK_LENGTH = 4000;

async function safeJson(res) {
  try { return await res.json(); } catch { return {}; }
}

export default function FeedbackBox() {
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
    <div className="footer-feedback">
      <h4>Feedback</h4>
      <form className="feedback-form" onSubmit={handleSubmit}>
        <label className="feedback-label" htmlFor="site-feedback">
          How can we improve?
        </label>
        <textarea
          id="site-feedback"
          className="feedback-textarea"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          maxLength={MAX_FEEDBACK_LENGTH}
          placeholder="Share feedback, bugs, or meal plan ideas"
          rows={4}
          disabled={sending}
          required
        />
        <label className="feedback-honeypot" htmlFor="feedback-website">
          Website
        </label>
        <input
          id="feedback-website"
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
    </div>
  );
}
