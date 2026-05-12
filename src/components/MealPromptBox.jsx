import { useState } from 'react';

export default function MealPromptBox({ meal }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const prompt = `Adapt this meal for me:
Meal: ${meal.name}
Current ingredients: ${meal.desc}
My calorie target: [enter target]
My protein target: [enter target]
Dietary requirements: [enter requirements]
Foods I dislike: [enter dislikes]
Preferred supermarket: [Tesco / Aldi / Lidl / ASDA / Sainsbury's]
Budget: [enter budget]
Please keep it high protein, simple to cook, and suitable for UK supermarket ingredients.`;

  function handleCopy() {
    navigator.clipboard?.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className="meal-prompt-box">
      <button
        className="meal-prompt-toggle"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        type="button"
      >
        {open ? '▴ Hide prompt' : '▾ Adapt this meal'}
      </button>
      {open && (
        <div className="meal-prompt-content">
          <p className="meal-prompt-hint">
            Fill in your details below, then copy the prompt and paste it into the AI generator
            to get a version tailored to your requirements.
          </p>
          <textarea
            className="meal-prompt-textarea"
            defaultValue={prompt}
            rows={10}
            readOnly
            aria-label="Meal adaptation prompt"
          />
          <div className="meal-prompt-actions">
            <button
              className="action-btn"
              onClick={handleCopy}
              data-event="copy_meal_prompt"
              type="button"
            >
              {copied ? 'Copied ✓' : 'Copy prompt'}
            </button>
            <a
              href="/"
              className="action-btn action-btn--accent"
              data-event="use_prompt_in_generator"
            >
              Open generator &rarr;
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
