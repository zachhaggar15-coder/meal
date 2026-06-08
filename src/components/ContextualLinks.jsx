import { Link } from 'react-router-dom';

export default function ContextualLinks({ blocks }) {
  if (!blocks?.length) return null;

  return (
    <div className="contextual-links">
      {blocks.map((block, blockIndex) => (
        <p key={blockIndex}>
          {block.parts.map((part, partIndex) => (
            part.to ? (
              <Link key={partIndex} to={part.to}>{part.label}</Link>
            ) : (
              <span key={partIndex}>{part.text}</span>
            )
          ))}
        </p>
      ))}
    </div>
  );
}
