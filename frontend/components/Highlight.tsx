import React from 'react';

interface HighlightProps {
  text: string;
  query: string;
  className?: string;
}

const Highlight: React.FC<HighlightProps> = ({ text, query, className = "bg-primary/10 text-primary px-1 rounded-sm font-bold" }) => {
  if (!query.trim()) {
    return <>{text}</>;
  }

  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className={className}>
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
};

export default Highlight;
