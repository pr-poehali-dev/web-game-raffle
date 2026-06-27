const SECTORS = [
  { num: 0, color: '#4CAF50', darkColor: '#2E7D32' },
  { num: 1, color: '#FFC107', darkColor: '#F57F17' },
  { num: 2, color: '#9C27B0', darkColor: '#6A1B9A' },
  { num: 3, color: '#F44336', darkColor: '#B71C1C' },
  { num: 4, color: '#00BCD4', darkColor: '#006064' },
  { num: 5, color: '#FF9800', darkColor: '#E65100' },
  { num: 6, color: '#3F51B5', darkColor: '#1A237E' },
  { num: 7, color: '#E91E63', darkColor: '#880E4F' },
  { num: 8, color: '#009688', darkColor: '#004D40' },
  { num: 9, color: '#FF5722', darkColor: '#BF360C' },
];

const FortuneWheel = ({
  selected,
  spinning,
  rotation,
  onStart,
  onSelectSector,
}: {
  selected: number | null;
  spinning: boolean;
  rotation: number;
  onStart: () => void;
  onSelectSector: (n: number) => void;
}) => {
  const segAngle = 360 / SECTORS.length;
  const radius = 138;
  const center = 155;
  const outerRadius = 148;

  const polar = (angle: number, r: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: center + r * Math.cos(rad), y: center + r * Math.sin(rad) };
  };

  const handleSectorClick = (e: React.MouseEvent<SVGElement>, sectorIndex: number) => {
    if (spinning) return;
    e.stopPropagation();
    onSelectSector(SECTORS[sectorIndex].num);
  };

  return (
    <div className="relative w-[310px] h-[310px] mx-auto select-none">
      {/* Pointer arrow — right side */}
      <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 z-20">
        <div
          className="drop-shadow-[0_0_6px_rgba(255,50,50,0.8)]"
          style={{
            width: 0,
            height: 0,
            borderTop: '14px solid transparent',
            borderBottom: '14px solid transparent',
            borderRight: '28px solid #e53935',
          }}
        />
      </div>

      {/* Outer gold ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 50%, #FFD700 100%)',
          padding: '6px',
        }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)' }}
        />
      </div>

      {/* SVG Wheel */}
      <svg
        width={310}
        height={310}
        viewBox="0 0 310 310"
        className="absolute inset-0 transition-transform duration-[4000ms] ease-out"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {SECTORS.map((s, i) => {
          const start = i * segAngle;
          const end = start + segAngle;
          const p1 = polar(start, outerRadius);
          const p2 = polar(end, outerRadius);
          const mid = polar(start + segAngle / 2, outerRadius * 0.70);
          const isSelected = s.num === selected;

          return (
            <g
              key={i}
              onClick={(e) => handleSectorClick(e, i)}
              style={{ cursor: spinning ? 'default' : 'pointer' }}
            >
              <path
                d={`M${center},${center} L${p1.x},${p1.y} A${outerRadius},${outerRadius} 0 0,1 ${p2.x},${p2.y} Z`}
                fill={isSelected ? '#ffffff' : s.color}
                stroke="#fff"
                strokeWidth={2}
                opacity={isSelected ? 1 : 0.92}
              />
              {/* Dark inner part of sector */}
              <path
                d={`M${center},${center} L${polar(start, outerRadius * 0.38).x},${polar(start, outerRadius * 0.38).y} A${outerRadius * 0.38},${outerRadius * 0.38} 0 0,1 ${polar(end, outerRadius * 0.38).x},${polar(end, outerRadius * 0.38).y} Z`}
                fill={s.darkColor}
                stroke={s.darkColor}
                strokeWidth={0}
              />
              <text
                x={mid.x}
                y={mid.y}
                fill={isSelected ? s.color : '#fff'}
                fontSize={24}
                fontWeight={900}
                fontFamily="Oswald, sans-serif"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${start + segAngle / 2} ${mid.x} ${mid.y})`}
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {s.num}
              </text>
            </g>
          );
        })}

        {/* Inner dark circle */}
        <circle cx={center} cy={center} r={outerRadius * 0.36} fill="#1a237e" stroke="#283593" strokeWidth={2} />

        {/* Outer ring border */}
        <circle cx={center} cy={center} r={outerRadius} fill="none" stroke="#FFD700" strokeWidth={3} opacity={0.6} />
      </svg>

      {/* Center START button */}
      <button
        onClick={onStart}
        disabled={spinning || selected === null}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[72px] h-[72px] rounded-full border-4 border-yellow-400 text-white font-display font-black text-base shadow-[0_0_20px_rgba(239,68,68,0.7)] active:scale-95 transition-transform disabled:opacity-60 flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle at 40% 35%, #ef5350, #b71c1c)',
        }}
      >
        START
      </button>
    </div>
  );
};

export default FortuneWheel;
