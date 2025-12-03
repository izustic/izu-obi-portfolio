import React, { ReactNode } from 'react';

interface SectionProps {
  id?: string;
  title?: string;
  children: ReactNode;
  className?: string;
  delay?: string;
}

const Section: React.FC<SectionProps> = ({ id, title, children, className = "", delay = "0ms" }) => {
  return (
    <section id={id} className={`py-16 md:py-24 px-6 md:px-12 max-w-6xl mx-auto ${className}`}>
      {title && (
        <h2 
          className="text-3xl md:text-4xl font-bold mb-12 text-slate-900 dark:text-white border-l-4 border-primary-500 pl-4 animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          {title}
        </h2>
      )}
      <div 
        className="animate-fade-in-up"
        style={{ animationDelay: delay }}
      >
        {children}
      </div>
    </section>
  );
};

export default Section;