import { useEffect, useRef } from 'react';
import anime from 'animejs';

export default function RadialMeter({ value, max, title, unit, icon }) {
  const progressRef = useRef(null);
  const valueRef = useRef(null);

  useEffect(() => {
    const progress = progressRef.current;
    const valueElement = valueRef.current;
    
    if (value === null || value === undefined) {
      console.warn(`RadialMeter: Invalid value for ${title}:`, value);
      return;
    }

    console.log(`RadialMeter ${title}: Updating with value:`, value);
    
    const percentage = (value / max) * 100;
    const strokeDashoffset = 283 - (283 * percentage) / 100;

    anime({
      targets: progress,
      strokeDashoffset: strokeDashoffset,
      easing: 'easeInOutQuad',
      duration: 1000
    });

    anime({
      targets: valueElement,
      innerHTML: [0, value],
      round: 1,
      easing: 'easeInOutQuad',
      duration: 1000
    });
  }, [value, max, title]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        {icon}
      </div>
      
      <div className="relative w-32 h-32 mx-auto">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-gray-200 stroke-current"
            strokeWidth="8"
            cx="50"
            cy="50"
            r="45"
            fill="none"
          />
          <circle
            ref={progressRef}
            className="text-blue-600 stroke-current"
            strokeWidth="8"
            strokeLinecap="round"
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeDasharray="283"
            strokeDashoffset="283"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span ref={valueRef} className="text-2xl font-bold">
            0
          </span>
          <span className="text-sm ml-1">{unit}</span>
        </div>
      </div>
    </div>
  );
}
