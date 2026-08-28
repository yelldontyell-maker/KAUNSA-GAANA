import React, { useMemo } from 'react';
import './RainEffect.css';

const RainEffect = () => {
  // Generate drops only once to prevent re-renders changing their positions
  const drops = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${0.7 + Math.random() * 0.5}s`,
      opacity: 0.2 + Math.random() * 0.3
    }));
  }, []);

  return (
    <div className="rain-container">
      {drops.map(drop => (
        <div 
          key={drop.id} 
          className="drop"
          style={{
            left: drop.left,
            animationDelay: drop.animationDelay,
            animationDuration: drop.animationDuration,
            opacity: drop.opacity
          }}
        />
      ))}
    </div>
  );
};

export default RainEffect;
