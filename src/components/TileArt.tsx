/**
 * Circular flat illustrations for the dashboard tiles: coloured disc, long diagonal shadow,
 * a central graphic, and the yellow target + red pointer in the bottom right.
 */

export type TileKind =
  | "challan"
  | "adhesive"
  | "reprint"
  | "cart"
  | "handover"
  | "report"
  | "verifyStamp"
  | "verifyChallan";

const palette: Record<TileKind, [string, string]> = {
  challan: ["#3fb64a", "#2a8a35"],
  adhesive: ["#a8255f", "#4a1c34"],
  reprint: ["#1fb0b8", "#136c72"],
  cart: ["#4f9d97", "#2f6e6a"],
  handover: ["#e0a24e", "#9a6a2c"],
  report: ["#d9c75a", "#a8973b"],
  verifyStamp: ["#8b6e5f", "#5e4a40"],
  verifyChallan: ["#a9c5c9", "#7fa0a5"],
};

function FormSheet({ x, y, w = 70, h = 96 }: { x: number; y: number; w?: number; h?: number }) {
  const rows = [0.18, 0.3, 0.42, 0.54, 0.66, 0.78];
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#fff" stroke="#9aa" strokeWidth="1" />
      <rect x={x + 5} y={y + 5} width={w - 10} height={h - 10} fill="none" stroke="#777" strokeWidth="0.8" />
      {rows.map((r) => (
        <line key={r} x1={x + 5} x2={x + w - 5} y1={y + h * r} y2={y + h * r} stroke="#999" strokeWidth="0.8" />
      ))}
      <line x1={x + w * 0.4} x2={x + w * 0.4} y1={y + h * 0.18} y2={y + h * 0.9} stroke="#999" strokeWidth="0.8" />
      <line x1={x + w * 0.7} x2={x + w * 0.7} y1={y + h * 0.18} y2={y + h * 0.9} stroke="#999" strokeWidth="0.8" />
      <rect x={x + w - 16} y={y + 8} width={9} height={7} fill="none" stroke="#666" strokeWidth="0.8" />
    </g>
  );
}

function StampSheet({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) {
  return (
    <g transform={`rotate(${rot} ${x + 35} ${y + 45})`}>
      <rect x={x} y={y} width={70} height={90} fill="#fdf6d8" stroke="#c9b87a" />
      <rect x={x + 5} y={y + 5} width={60} height={80} fill="none" stroke="#cc3b3b" strokeWidth="1.2" />
      <ellipse cx={x + 35} cy={y + 32} rx={16} ry={10} fill="none" stroke="#3a8a4a" strokeWidth="1.4" />
      <ellipse cx={x + 35} cy={y + 32} rx={8} ry={5} fill="#b8d9a8" />
      {[50, 58, 66, 74].map((d) => (
        <line key={d} x1={x + 12} x2={x + 58} y1={y + d} y2={y + d} stroke="#3a8a4a" strokeWidth="1" />
      ))}
    </g>
  );
}

function Board({ children }: { children: React.ReactNode }) {
  return (
    <g>
      <rect x={52} y={36} width={96} height={124} rx={4} fill="#1d3b2a" />
      <rect x={56} y={40} width={88} height={116} rx={2} fill="#3cae55" />
      {children}
    </g>
  );
}

function Center({ kind }: { kind: TileKind }) {
  switch (kind) {
    case "challan":
      return (
        <Board>
          <FormSheet x={62} y={48} w={76} h={100} />
        </Board>
      );
    case "adhesive":
      return (
        <Board>
          <FormSheet x={70} y={48} w={68} h={100} />
          <rect x={54} y={66} width={22} height={60} fill="#b0285f" stroke="#fff" strokeWidth="1.5" />
          <circle cx={65} cy={84} r={6} fill="none" stroke="#fff" strokeWidth="1.2" />
          <line x1={58} x2={72} y1={100} y2={100} stroke="#fff" />
          <line x1={58} x2={72} y1={108} y2={108} stroke="#fff" />
        </Board>
      );
    case "reprint":
      return (
        <Board>
          <FormSheet x={62} y={48} w={76} h={100} />
          <rect x={30} y={100} width={46} height={30} rx={3} fill="#3c3c3c" />
          <rect x={38} y={90} width={30} height={12} fill="#fff" />
          <rect x={36} y={124} width={34} height={20} fill="#fff" stroke="#ccc" />
          <line x1={40} x2={66} y1={131} y2={131} stroke="#bbb" />
          <line x1={40} x2={60} y1={137} y2={137} stroke="#bbb" />
        </Board>
      );
    case "cart":
      return (
        <Board>
          <StampSheet x={72} y={44} />
          <StampSheet x={64} y={54} />
          <StampSheet x={58} y={62} />
          <g transform="translate(30 104)">
            <path d="M0 4h8l6 26h28l6-18H14" fill="#f1c24b" stroke="#c9922a" strokeWidth="2" />
            <circle cx={18} cy={36} r={4} fill="#333" />
            <circle cx={38} cy={36} r={4} fill="#333" />
            <path d="M24 -6v18l-6-6m6 6 6-6" stroke="#1d3b2a" strokeWidth="3" fill="none" />
          </g>
        </Board>
      );
    case "handover":
      return (
        <Board>
          <StampSheet x={72} y={44} />
          <StampSheet x={64} y={54} />
          <StampSheet x={58} y={62} />
          <rect x={26} y={116} width={14} height={24} fill="#2fa84f" />
          <path d="M40 120c14-4 28-8 42-4l22 2c6 1 6 9 0 10l-22 2c-10 6-26 10-42 8z" fill="#caa67a" stroke="#8a6a42" />
          <rect x={82} y={112} width={30} height={14} rx={2} fill="#dfe7d0" stroke="#666" transform="rotate(-8 97 119)" />
          <text x={90} y={123} fontSize="9" fontWeight="bold" fill="#333" transform="rotate(-8 97 119)">
            Rs
          </text>
        </Board>
      );
    case "report":
      return (
        <g>
          <rect x={52} y={36} width={96} height={124} rx={4} fill="#5b4a3a" />
          <rect x={58} y={42} width={84} height={112} fill="#fff" />
          <path d="M126 42l16 16h-16z" fill="#c9d6e8" />
          <rect x={66} y={52} width={40} height={6} fill="#555" />
          <circle cx={78} cy={78} r={12} fill="#f2994a" />
          <path d="M78 78V66a12 12 0 0 1 12 12z" fill="#eb5757" />
          {[72, 78, 84].map((y) => (
            <rect key={y} x={96} y={y} width={38} height={3} fill="#bbb" />
          ))}
          {[100, 108, 116].map((y) => (
            <rect key={y} x={66} y={y} width={30} height={3} fill="#bbb" />
          ))}
          <rect x={102} y={130} width={6} height={14} fill="#2d9cdb" />
          <rect x={112} y={118} width={6} height={26} fill="#eb5757" />
          <rect x={122} y={108} width={6} height={36} fill="#9b51e0" />
          <rect x={132} y={98} width={6} height={46} fill="#27ae60" />
        </g>
      );
    case "verifyStamp":
      return (
        <g>
          <rect x={40} y={46} width={120} height={84} rx={4} fill="#3a3a3a" />
          <rect x={46} y={52} width={108} height={70} fill="#3ea8e6" />
          <circle cx={100} cy={78} r={14} fill="#fff" />
          <circle cx={100} cy={74} r={6} fill="#7a4a2a" />
          <path d="M90 88c2-6 18-6 20 0" fill="#1d3b6a" />
          <rect x={64} y={98} width={72} height={12} rx={6} fill="#fff" />
          {[74, 84, 94, 104, 114].map((x) => (
            <circle key={x} cx={x} cy={104} r={2} fill="#3ea8e6" />
          ))}
          <rect x={88} y={130} width={24} height={12} fill="#999" />
          <rect x={70} y={142} width={60} height={5} fill="#777" />
          <path
            d="M112 104v-10a4 4 0 0 1 8 0v18l4-2c4-2 8 0 8 4l-2 18c-1 6-6 10-12 10h-8c-5 0-9-2-12-6l-10-14c-2-3 2-7 6-5l8 6z"
            fill="#fff"
            stroke="#333"
            strokeWidth="2"
          />
        </g>
      );
    case "verifyChallan":
      return (
        <g>
          <rect x={66} y={40} width={82} height={116} rx={3} fill="#cfdcc0" />
          <rect x={74} y={52} width={66} height={100} fill="#fff" stroke="#ccc" />
          <path d="M104 44h24l6 12h-36z" fill="#f2c94c" />
          {[70, 80, 90, 100, 110, 120, 130].map((y) => (
            <line key={y} x1={82} x2={132} y1={y} y2={y} stroke="#ddd" strokeWidth="2" />
          ))}
          <circle cx={72} cy={52} r={22} fill="#fff" stroke="#1f7a2e" strokeWidth="5" />
          <path d="M61 52l8 8 15-16" fill="none" stroke="#1f7a2e" strokeWidth="6" strokeLinecap="round" />
        </g>
      );
  }
}

export function TileArt({ kind, size = 186 }: { kind: TileKind; size?: number }) {
  const [bg, shadow] = palette[kind];
  const clipId = `clip-${kind}`;
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden className="shrink-0">
      <defs>
        <clipPath id={clipId}>
          <circle cx={100} cy={100} r={96} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <circle cx={100} cy={100} r={96} fill={bg} />
        {/* long flat-design shadow cast to the bottom right */}
        <path d="M60 40 L200 180 L200 200 L150 200 L50 150 Z" fill={shadow} opacity={0.55} />
        <Center kind={kind} />
      </g>
      {/* target + pointer */}
      <g transform="translate(150 150)">
        <circle r={20} fill="#f7e733" />
        <circle r={14} fill="none" stroke="#2c6fa8" strokeWidth={3} />
        <circle r={7} fill="none" stroke="#2c6fa8" strokeWidth={3} />
        <path d="M4 4 L26 14 L17 17 L27 27 L22 32 L12 22 L9 31 Z" fill="#e0232b" stroke="#fff" strokeWidth={1.5} />
      </g>
    </svg>
  );
}
