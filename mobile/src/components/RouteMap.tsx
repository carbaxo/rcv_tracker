import { useState } from "react";
import { Image, Text, View } from "react-native";
import Svg, { Circle, Polyline } from "react-native-svg";
import type { RoutePoint } from "../lib/types";
import { colors } from "../theme";

// Mapa real de fondo bajo la ruta usando teselas de OpenStreetMap
// (proyección Web Mercator). Sin claves de API: se calcula el zoom que
// encuadra el recorrido, se colocan las teselas necesarias y se dibuja la
// polilínea encima. Si no hay red, las teselas no cargan pero el trazado
// se sigue viendo sobre el fondo.

const TILE = 256;
const MAX_ZOOM = 17;
const MIN_ZOOM = 2;
const PAD = 24; // margen en píxeles alrededor de la ruta

function worldX(lng: number, z: number): number {
  return ((lng + 180) / 360) * TILE * Math.pow(2, z);
}

function worldY(lat: number, z: number): number {
  const clamped = Math.max(-85.051, Math.min(85.051, lat));
  const rad = (clamped * Math.PI) / 180;
  return (
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) *
    TILE *
    Math.pow(2, z)
  );
}

export default function RouteMap({
  route,
  height = 220,
}: {
  route: RoutePoint[];
  height?: number;
}) {
  const [width, setWidth] = useState(0);

  if (route.length < 2) {
    return <View style={{ height }} />;
  }

  const lats = route.map((p) => p.lat);
  const lngs = route.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  let content = null;
  if (width > 0) {
    // Mayor zoom en el que el recorrido cabe con margen
    let z = MIN_ZOOM;
    for (let candidate = MAX_ZOOM; candidate >= MIN_ZOOM; candidate--) {
      const dx = worldX(maxLng, candidate) - worldX(minLng, candidate);
      const dy = worldY(minLat, candidate) - worldY(maxLat, candidate);
      if (dx <= width - 2 * PAD && dy <= height - 2 * PAD) {
        z = candidate;
        break;
      }
    }

    const cx = (worldX(minLng, z) + worldX(maxLng, z)) / 2;
    const cy = (worldY(minLat, z) + worldY(maxLat, z)) / 2;
    const ox = cx - width / 2; // origen (esquina sup. izq.) en px de mundo
    const oy = cy - height / 2;

    const maxTile = Math.pow(2, z) - 1;
    const tx0 = Math.max(0, Math.floor(ox / TILE));
    const tx1 = Math.min(maxTile, Math.floor((ox + width) / TILE));
    const ty0 = Math.max(0, Math.floor(oy / TILE));
    const ty1 = Math.min(maxTile, Math.floor((oy + height) / TILE));

    const tiles: { x: number; y: number }[] = [];
    for (let tx = tx0; tx <= tx1; tx++) {
      for (let ty = ty0; ty <= ty1; ty++) {
        tiles.push({ x: tx, y: ty });
      }
    }

    const pts = route.map((p) => ({
      x: worldX(p.lng, z) - ox,
      y: worldY(p.lat, z) - oy,
    }));
    const start = pts[0];
    const end = pts[pts.length - 1];

    content = (
      <>
        {tiles.map((t) => (
          <Image
            key={`${z}/${t.x}/${t.y}`}
            source={{ uri: `https://tile.openstreetmap.org/${z}/${t.x}/${t.y}.png` }}
            style={{
              position: "absolute",
              left: t.x * TILE - ox,
              top: t.y * TILE - oy,
              width: TILE,
              height: TILE,
            }}
          />
        ))}
        <Svg
          width={width}
          height={height}
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          {/* Halo blanco para que la ruta destaque sobre cualquier mapa */}
          <Polyline
            points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="#ffffff"
            strokeWidth={6}
            strokeOpacity={0.9}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Polyline
            points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke={colors.cardio}
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx={start.x} cy={start.y} r={6} fill={colors.accent} stroke="#ffffff" strokeWidth={2} />
          <Circle cx={end.x} cy={end.y} r={6} fill={colors.danger} stroke="#ffffff" strokeWidth={2} />
        </Svg>
        {/* Atribución requerida por la política de OpenStreetMap */}
        <View
          style={{
            position: "absolute",
            right: 4,
            bottom: 3,
            backgroundColor: "rgba(255,255,255,0.75)",
            borderRadius: 4,
            paddingHorizontal: 4,
            paddingVertical: 1,
          }}
        >
          <Text style={{ fontSize: 9, color: "#333" }}>© OpenStreetMap</Text>
        </View>
      </>
    );
  }

  return (
    <View
      onLayout={(e) => setWidth(Math.round(e.nativeEvent.layout.width))}
      style={{
        height,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#d9e2ec",
      }}
    >
      {content}
    </View>
  );
}
