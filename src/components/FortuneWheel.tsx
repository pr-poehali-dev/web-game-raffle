const MAIN_SECTORS = [
  { num: 0, color: "#4CAF50" },
  { num: 1, color: "#FFC107" },
  { num: 2, color: "#9C27B0" },
  { num: 3, color: "#F44336" },
  { num: 4, color: "#00BCD4" },
  { num: 5, color: "#FF9800" },
  { num: 6, color: "#3F51B5" },
  { num: 7, color: "#E91E63" },
  { num: 8, color: "#009688" },
  { num: 9, color: "#FF5722" },
];

const BONUS_COLORS = [
  "#e53935",
  "#d81b60",
  "#8e24aa",
  "#5e35b1",
  "#1e88e5",
  "#00897b",
  "#43a047",
  "#f4511e",
  "#fb8c00",
  "#fdd835",
];

interface FortuneWheelProps {
  selected: number | null;
  spinning: boolean;
  rotation: number;
  bonusRotation: number;
  onStart: () => void;
  onSelectSector: (n: number) => void;
  onBooster: () => void;
}

const FortuneWheel = ({
  selected,
  spinning,
  rotation,
  bonusRotation,
  onStart,
  onSelectSector,
  onBooster,
}: FortuneWheelProps) => {
  const SEG = 36;
  const C = 155; // центр SVG
  const SIZE = 310; // размер SVG и контейнера
  const R_OUTER = 148;
  const R_BONUS_OUT = 100;
  const R_BONUS_IN = 56;
  const R_BTN = 48;
  const GOLD_PAD = 5; // ширина золотого кольца

  const polar = (angleDeg: number, r: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: C + r * Math.cos(rad), y: C + r * Math.sin(rad) };
  };

  const annularPath = (i: number, rOut: number, rIn: number) => {
    const a0 = i * SEG;
    const a1 = a0 + SEG;
    const p1 = polar(a0, rOut);
    const p2 = polar(a1, rOut);
    const p3 = polar(a1, rIn);
    const p4 = polar(a0, rIn);
    return [
      `M${p4.x},${p4.y}`,
      `L${p1.x},${p1.y}`,
      `A${rOut},${rOut} 0 0,1 ${p2.x},${p2.y}`,
      `L${p3.x},${p3.y}`,
      `A${rIn},${rIn} 0 0,0 ${p4.x},${p4.y}`,
      "Z",
    ].join(" ");
  };

  const midPos = (i: number, r: number) => polar(i * SEG + SEG / 2, r);

  // Стрелка: на середине сектора 1 = 36+18 = 54°
  // Позиция на внешнем радиусе + золотое кольцо
  const arrowAngleDeg = 54; // середина сектора 1
  const arrowR = R_OUTER + GOLD_PAD + 2;
  const arrowPos = polar(arrowAngleDeg, arrowR);
  // Угол поворота стрелки: она должна смотреть к центру колеса
  const arrowRotate = arrowAngleDeg; // от 12 часов

  // Кнопка бустера: середина сектора 6 = 6*36 = 234°
  const boosterAngleDeg = 234;
  const boosterR = R_OUTER + GOLD_PAD + 14; // чуть дальше
  const boosterPos = polar(boosterAngleDeg, boosterR);

  return (
    <div className="relative select-none" style={{ width: SIZE, height: SIZE }}>
      {/* Gold outer ring */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg,#FFD700 0%,#FFA000 50%,#FFD700 100%)",
          padding: GOLD_PAD,
        }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{ background: "#0d47a1" }}
        />
      </div>

      {/* POINTER — на краю сектора 1 (угол 36°) */}
      <div
        className="absolute z-30 pointer-events-none"
        style={{
          left: arrowPos.x,
          top: arrowPos.y,
          transform: `translate(-50%, -50%) rotate(${arrowRotate}deg)`,
        }}
      >
        {/* Треугольная стрелка, острием вниз (к центру колеса) */}
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "12px solid transparent",
            borderRight: "12px solid transparent",
            borderTop: "24px solid #e53935",
            filter: "drop-shadow(0 0 6px rgba(229,57,53,0.9))",
          }}
        />
      </div>

      {/* BOOSTER BUTTON — на краю сектора 6 (угол 234°) */}
      <button
        onClick={onBooster}
        className="absolute z-30 w-11 h-11 rounded-full bg-green-500 border-4 border-red-500 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        style={{
          left: boosterPos.x,
          top: boosterPos.y,
          transform: "translate(-50%, -50%)",
        }}
      >
        <span className="text-white font-black leading-none text-4xl">+</span>
      </button>

      {/* MAIN WHEEL — rotates */}
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="absolute inset-0 transition-transform duration-[4000ms] ease-out"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {MAIN_SECTORS.map((s, i) => {
          const isSelected = s.num === selected;
          const mid = midPos(i, (R_OUTER + R_BONUS_OUT) / 2);
          const angle = i * SEG + SEG / 2;
          return (
            <g
              key={i}
              onClick={() => {
                if (!spinning) onSelectSector(s.num);
              }}
              style={{ cursor: spinning ? "default" : "pointer" }}
            >
              <path
                d={annularPath(i, R_OUTER, R_BONUS_OUT + 1)}
                fill={isSelected ? "#ffffff" : s.color}
                stroke="#fff"
                strokeWidth={1.5}
              />
              <text
                x={mid.x}
                y={mid.y}
                fill={isSelected ? s.color : "#fff"}
                fontSize={23}
                fontWeight={900}
                fontFamily="Oswald,sans-serif"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${angle} ${mid.x} ${mid.y})`}
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {s.num}
              </text>
            </g>
          );
        })}
        <circle
          cx={C}
          cy={C}
          r={R_OUTER}
          fill="none"
          stroke="#FFD700"
          strokeWidth={2.5}
          opacity={0.6}
        />
        <circle
          cx={C}
          cy={C}
          r={R_BONUS_OUT + 1}
          fill="none"
          stroke="#FFD700"
          strokeWidth={2.5}
        />
      </svg>

      {/* BONUS DRUM — rotates independently */}
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="absolute inset-0 transition-transform duration-[3500ms] ease-out"
        style={{ transform: `rotate(${bonusRotation}deg)` }}
      >
        {BONUS_COLORS.map((color, i) => {
          const mid = midPos(i, (R_BONUS_OUT + R_BONUS_IN) / 2);
          const angle = i * SEG + SEG / 2;
          return (
            <g key={i}>
              <path
                d={annularPath(i, R_BONUS_OUT, R_BONUS_IN)}
                fill={color}
                stroke="#fff"
                strokeWidth={1}
                opacity={0.92}
              />
              <text
                x={mid.x}
                y={mid.y}
                fill="#fff"
                fontSize={16}
                fontWeight={900}
                fontFamily="Arial,sans-serif"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${angle} ${mid.x} ${mid.y})`}
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                ?
              </text>
            </g>
          );
        })}
        <circle
          cx={C}
          cy={C}
          r={R_BONUS_IN}
          fill="#0d47a1"
          stroke="#1565c0"
          strokeWidth={2}
        />
        <circle
          cx={C}
          cy={C}
          r={R_BONUS_OUT}
          fill="none"
          stroke="#FFD700"
          strokeWidth={2}
          opacity={0.5}
        />
      </svg>

      {/* CENTER START BUTTON */}
      <button
        onClick={onStart}
        disabled={spinning || selected === null}
        className="absolute z-20 rounded-full border-4 border-yellow-400 text-white font-display font-black shadow-[0_0_20px_rgba(239,68,68,0.8)] active:scale-95 transition-transform disabled:opacity-60 flex items-center justify-center text-[15px]"
        style={{
          width: R_BTN * 2,
          height: R_BTN * 2,
          top: C - R_BTN,
          left: C - R_BTN,
          background: "radial-gradient(circle at 40% 35%, #ef5350, #b71c1c)",
        }}
      >
        START
      </button>
    </div>
  );
};

export default FortuneWheel;