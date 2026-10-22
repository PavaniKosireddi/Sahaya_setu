export function HeroArt() {
  return (
    <svg viewBox="0 0 420 460" className="hero-svg" role="img" aria-label="Phone showing eligible schemes">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#10b981" /><stop offset="1" stopColor="#0b6e4f" /></linearGradient>
        <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fde68a" /><stop offset="1" stopColor="#f59e0b" /></linearGradient>
      </defs>
      <circle cx="210" cy="230" r="190" fill="#d1fae5" opacity=".7" />
      <circle cx="330" cy="90" r="46" fill="url(#g2)" />
      <rect x="110" y="40" width="200" height="390" rx="32" fill="#0f2a3d" />
      <rect x="120" y="56" width="180" height="358" rx="24" fill="#fff" />
      <rect x="170" y="46" width="80" height="8" rx="4" fill="#27465c" />
      <rect x="134" y="76" width="152" height="46" rx="14" fill="url(#g1)" />
      <rect x="146" y="90" width="70" height="8" rx="4" fill="#fff" opacity=".9" /><rect x="146" y="104" width="46" height="6" rx="3" fill="#fff" opacity=".6" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(134 ${140 + i * 62})`}>
          <rect width="152" height="52" rx="12" fill="#f1f7f4" />
          <circle cx="24" cy="26" r="13" fill={i === 3 ? "#fde68a" : "#10b981"} />
          <path d={i === 3 ? "M24 19v8M24 31v1" : "M18 26l5 5 9-10"} stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="46" y="14" width={[84, 70, 92, 60][i]} height="8" rx="4" fill="#0f2a3d" opacity=".8" />
          <rect x="46" y="29" width={[56, 64, 44, 74][i]} height="6" rx="3" fill="#0f2a3d" opacity=".25" />
        </g>
      ))}
      <rect x="134" y="392" width="152" height="12" rx="6" fill="#e2ece6" />
    </svg>
  );
}

export function StudentArt() {
  return (
    <svg viewBox="0 0 140 110" className="card-art"><rect width="140" height="110" rx="18" fill="#e0f2fe" />
      <path d="M70 26l46 20-46 20-46-20z" fill="#0f2a3d" /><path d="M42 58v18c0 8 56 8 56 0V58l-28 12z" fill="#1e5a7d" />
      <path d="M116 46v24" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" /><circle cx="116" cy="74" r="5" fill="#f59e0b" />
      <rect x="40" y="82" width="60" height="14" rx="3" fill="#10b981" /><rect x="44" y="86" width="52" height="3" rx="1.5" fill="#fff" opacity=".7" /></svg>
  );
}
export function WomanArt() {
  return (
    <svg viewBox="0 0 140 110" className="card-art"><rect width="140" height="110" rx="18" fill="#fce7f3" />
      <path d="M44 100c0-26 12-36 26-36s26 10 26 36z" fill="#be185d" /><circle cx="70" cy="42" r="17" fill="#fcd5b5" />
      <path d="M52 40c0-18 36-18 36 0 0 -8 -6 -12 -18 -12s-18 4 -18 12z" fill="#3b2314" /><path d="M52 40c-4 22 4 30 4 30M88 40c4 22-4 30-4 30" stroke="#3b2314" strokeWidth="6" strokeLinecap="round" fill="none" />
      <circle cx="70" cy="34" r="2.5" fill="#dc2626" /><circle cx="108" cy="30" r="9" fill="#fde68a" /><text x="108" y="34" fontSize="11" textAnchor="middle" fill="#92400e" fontWeight="700">₹</text></svg>
  );
}
export function FarmerArt() {
  return (
    <svg viewBox="0 0 140 110" className="card-art"><rect width="140" height="110" rx="18" fill="#fef3c7" />
      <circle cx="108" cy="28" r="14" fill="#f59e0b" /><rect y="74" width="140" height="36" fill="#65a30d" /><rect y="88" width="140" height="22" fill="#4d7c0f" />
      {[22, 46, 70, 94].map((x) => (<g key={x}><path d={`M${x} 90V52`} stroke="#a16207" strokeWidth="3" strokeLinecap="round" />
        {[0, 1, 2].map((j) => <ellipse key={j} cx={x + (j % 2 ? 6 : -6)} cy={56 + j * 9} rx="5" ry="3" fill="#ca8a04" transform={`rotate(${j % 2 ? 30 : -30} ${x + (j % 2 ? 6 : -6)} ${56 + j * 9})`} />)}</g>))}</svg>
  );
}
export const Logo = () => (
  <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true"><rect width="40" height="40" rx="11" fill="#0b6e4f" />
    <path d="M7 27c6-9 20-9 26 0" stroke="#fde68a" strokeWidth="3.5" fill="none" strokeLinecap="round" /><path d="M11 27v-6M20 27v-9M29 27v-6" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></svg>
);
