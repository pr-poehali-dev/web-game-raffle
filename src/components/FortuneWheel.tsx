import { useState } from 'react';

const SECTORS = [
  { num: 1, color: '#FF3B6B' },
  { num: 2, color: '#FF9500' },
  { num: 3, color: '#FFD60A' },
  { num: 4, color: '#34C759' },
  { num: 5, color: '#00C7BE' },
  { num: 6, color: '#0A84FF' },
  { num: 7, color: '#5E5CE6' },
  { num: 8, color: '#BF5AF2' },
  { num: 9, color: '#FF2D55' },
  { num: 0, color: '#FF6B35' },
];

const FortuneWheel = ({
  selected,
  spinning,
  rotation,
  onStart,
}: {
  selected: number | null;
  spinning: boolean;
  rotation: number;
  onStart: () => void;
}) => {
  const segAngle = 360 / SECTORS.length;
  const radius = 140;
  const center = 150;

  const polar = (angle: number, r: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: center + r * Math.cos(rad), y: center + r * Math.sin(rad) };
  };

  return (
    <div className="relative w-[300px] h-[300px] mx-auto">
      {/* Pointer */}
      <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 z-20">
        <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[26px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
      </div>

      <svg
        width={300}
        height={300}
        viewBox="0 0 300 300"
        className="transition-transform duration-[4000ms] ease-out drop-shadow-[0_0_30px_rgba(168,85,247,0.6)]"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {SECTORS.map((s, i) => {
          const start = i * segAngle;
          const end = start + segAngle;
          const p1 = polar(start, radius);
          const p2 = polar(end, radius);
          const mid = polar(start + segAngle / 2, radius * 0.68);
          return (
            <g key={i}>
              <path
                d={`M${center},${center} L${p1.x},${p1.y} A${radius},${radius} 0 0,1 ${p2.x},${p2.y} Z`}
                fill={s.color}
                stroke="#0d0d1a"
                strokeWidth={2}
              />
              <text
                x={mid.x}
                y={mid.y}
                fill="#fff"
                fontSize={26}
                fontWeight={800}
                fontFamily="Oswald"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${start + segAngle / 2} ${mid.x} ${mid.y})`}
              >
                {s.num}
              </text>
            </g>
          );
        })}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#fff" strokeWidth={3} opacity={0.3} />
      </svg>

      {/* Center START button */}
      <button
        onClick={onStart}
        disabled={spinning || selected === null}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[78px] h-[78px] rounded-full bg-gradient-to-br from-red-500 to-red-700 border-4 border-white text-white font-display font-bold text-lg shadow-[0_0_25px_rgba(239,68,68,0.7)] active:scale-95 transition-transform disabled:opacity-60 flex items-center justify-center"
      >
        START
      </button>
    </div>
  );
};

export default FortuneWheel;
