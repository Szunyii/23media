const NOISE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>
       <filter id='n'>
         <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/>
         <feColorMatrix type='saturate' values='0'/>
       </filter>
       <rect width='100%' height='100%' filter='url(#n)'/>
     </svg>`,
  );

/** Animated film-grain overlay that sits above every section. */
export default function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.05] mix-blend-screen"
      style={{
        backgroundImage: `url("${NOISE}")`,
        backgroundSize: "220px 220px",
        animation: "grain-shift 6s steps(8) infinite",
        width: "180%",
        height: "180%",
        left: "-40%",
        top: "-40%",
      }}
    />
  );
}
