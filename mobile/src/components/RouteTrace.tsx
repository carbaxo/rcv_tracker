import { View } from "react-native";
import Svg, { Circle, Polyline } from "react-native-svg";
import type { RoutePoint } from "../lib/types";
import { colors } from "../theme";

// Dibuja el trazado de la ruta normalizado (sin mapa de fondo: no requiere
// claves de API y funciona sin conexión).
export default function RouteTrace({
  route,
  height = 220,
  stroke = colors.cardio,
}: {
  route: RoutePoint[];
  height?: number;
  stroke?: string;
}) {
  if (route.length < 2) return <View style={{ height }} />;

  const lats = route.map((p) => p.lat);
  const lngs = route.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const W = 100;
  const H = 100;
  const pad = 8;
  // Corrección aproximada de la proyección: 1° de longitud se acorta con la latitud
  const latMid = (minLat + maxLat) / 2;
  const lngScale = Math.cos((latMid * Math.PI) / 180);
  const spanLat = Math.max(maxLat - minLat, 1e-5);
  const spanLng = Math.max((maxLng - minLng) * lngScale, 1e-5);
  const span = Math.max(spanLat, spanLng);

  const toXY = (p: RoutePoint) => {
    const x = pad + (((p.lng - minLng) * lngScale) / span) * (W - 2 * pad);
    const y = pad + ((maxLat - p.lat) / span) * (H - 2 * pad);
    return { x, y };
  };

  const pts = route.map(toXY);
  const start = pts[0];
  const end = pts[pts.length - 1];

  return (
    <Svg
      width="100%"
      height={height}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <Polyline
        points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke={stroke}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={start.x} cy={start.y} r={2.6} fill={colors.accent} />
      <Circle cx={end.x} cy={end.y} r={2.6} fill={colors.danger} />
    </Svg>
  );
}
