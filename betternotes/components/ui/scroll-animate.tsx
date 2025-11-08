'use client';

import { useEffect, useRef } from 'react';

interface ScrollAnimateProps {
  children: React.ReactNode;
  className?: string;
}

const ScrollAnimate: React.FC<ScrollAnimateProps> = ({ children, className = '' }) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: '0px 0px -50px 0px' // Start animation slightly before element comes into view
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, []);

  return (
    <div ref={elementRef} className={`fade-in-section ${className}`}>
      {children}
    </div>
  );
};

export default ScrollAnimate;