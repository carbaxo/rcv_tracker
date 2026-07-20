import type { DrillEl } from "@/lib/footballDrills";

// Diagrama de un ejercicio de fútbol dibujado por código (SVG, sin imágenes
// externas). Sistema de coordenadas 0..100 (x) × 0..64 (y) sobre un campo.
// Notación: flecha continua = pase · flecha discontinua = carrera sin balón ·
// línea ondulada = conducción/regate con balón.

const A = "#38bdf8"; // jugador con balón / equipo A
const B = "#fb7185"; // rival / equipo B
const CONE = "#fb923c";

function wavy(x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len; // perpendicular
  const ny = dx / len;
  const waves = Math.max(2, Math.round(len / 7));
  const amp = 1.8;
  let d = `M ${x1} ${y1}`;
  for (let i = 1; i <= waves; i++) {
    const t = i / waves;
    const px = x1 + dx * t;
    const py = y1 + dy * t;
    const off = (i % 2 === 0 ? 1 : -1) * amp;
    const cx = px - (dx / waves) * 0.5 + nx * off;
    const cy = py - (dy / waves) * 0.5 + ny * off;
    d += ` Q ${cx} ${cy} ${px} ${py}`;
  }
  return d;
}

export default function DrillPitch({
  diagram,
  className = "",
}: {
  diagram: DrillEl[];
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 64"
      className={`h-full w-full ${className}`}
      role="img"
      aria-label="Diagrama del ejercicio"
    >
      <defs>
        <marker id="ah" markerWidth="6" markerHeight="6" refX="4.5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
        </marker>
        <pattern id="grass" width="20" height="64" patternUnits="userSpaceOnUse">
          <rect width="10" height="64" fill="#0f3d24" />
          <rect x="10" width="10" height="64" fill="#12472a" />
        </pattern>
      </defs>

      {/* Campo */}
      <rect x="0" y="0" width="100" height="64" fill="url(#grass)" rx="3" />
      <rect
        x="2"
        y="2"
        width="96"
        height="60"
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="0.5"
        rx="2"
      />

      {diagram.map((el, i) => {
        switch (el.t) {
          case "zone":
            return (
              <rect
                key={i}
                x={el.x}
                y={el.y}
                width={el.w}
                height={el.h}
                fill="rgba(52,211,153,0.10)"
                stroke="rgba(52,211,153,0.5)"
                strokeWidth="0.4"
                strokeDasharray="1.5 1.5"
                rx="1"
              />
            );
          case "goal":
            return (
              <g key={i} stroke="#e5e7eb" strokeWidth="0.7" fill="none">
                <rect x={el.x - (el.w ?? 8) / 2} y={el.y - 1} width={el.w ?? 8} height="2" fill="rgba(255,255,255,0.15)" />
              </g>
            );
          case "arrow": // pase (continua)
            return (
              <line
                key={i}
                x1={el.x1}
                y1={el.y1}
                x2={el.x2}
                y2={el.y2}
                stroke="#e5e7eb"
                strokeWidth="0.7"
                markerEnd="url(#ah)"
                style={{ color: "#e5e7eb" }}
              />
            );
          case "run": // carrera sin balón (discontinua)
            return (
              <line
                key={i}
                x1={el.x1}
                y1={el.y1}
                x2={el.x2}
                y2={el.y2}
                stroke="#fde68a"
                strokeWidth="0.7"
                strokeDasharray="2 1.6"
                markerEnd="url(#ah)"
                style={{ color: "#fde68a" }}
              />
            );
          case "dribble": // conducción/regate (ondulada)
            return (
              <path
                key={i}
                d={wavy(el.x1, el.y1, el.x2, el.y2)}
                fill="none"
                stroke={A}
                strokeWidth="0.7"
                markerEnd="url(#ah)"
                style={{ color: A }}
              />
            );
          case "cone":
            return (
              <path
                key={i}
                d={`M ${el.x} ${el.y - 2} L ${el.x + 1.7} ${el.y + 1.5} L ${el.x - 1.7} ${el.y + 1.5} Z`}
                fill={CONE}
              />
            );
          case "ball":
            return (
              <circle key={i} cx={el.x} cy={el.y} r="1.5" fill="#fff" stroke="#111" strokeWidth="0.3" />
            );
          case "player":
            return (
              <g key={i}>
                <circle cx={el.x} cy={el.y} r="2.6" fill={el.color === "b" ? B : A} />
                {el.label && (
                  <text
                    x={el.x}
                    y={el.y + 1.1}
                    textAnchor="middle"
                    fontSize="3"
                    fontWeight="700"
                    fill="#06121f"
                  >
                    {el.label}
                  </text>
                )}
              </g>
            );
          default:
            return null;
        }
      })}
    </svg>
  );
}
