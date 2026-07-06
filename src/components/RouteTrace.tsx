import type { RoutePoint } from "@/lib/types";

// Trazado de la ruta GPS normalizado (grabada desde la app Android o
// importada de Strava). Sin mapa de fondo: no requiere claves de API.
export default function RouteTrace({ route }: { route: RoutePoint[] }) {
  if (route.length < 2) return null;

  const lats = route.map((p) => p.lat);
  const lngs = route.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const W = 100;
  const H = 100;
  const pad = 8;
  // 1° de longitud se acorta con la latitud: corrección aproximada
  const latMid = (minLat + maxLat) / 2;
  const lngScale = Math.cos((latMid * Math.PI) / 180);
  const spanLat = Math.max(maxLat - minLat, 1e-5);
  const spanLng = Math.max((maxLng - minLng) * lngScale, 1e-5);
  const span = Math.max(spanLat, spanLng);

  const pts = route.map((p) => ({
    x: pad + (((p.lng - minLng) * lngScale) / span) * (W - 2 * pad),
    y: pad + ((maxLat - p.lat) / span) * (H - 2 * pad),
  }));
  const start = pts[0];
  const end = pts[pts.length - 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-48 w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Trazado de la ruta GPS"
    >
      <polyline
        points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke="#f97316"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={start.x} cy={start.y} r={2.6} fill="#34d399" />
      <circle cx={end.x} cy={end.y} r={2.6} fill="#f87171" />
    </svg>
  );
}
