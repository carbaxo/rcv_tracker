import type { CardioSport, RoutePoint, Workout } from "./types";
import { isoDate } from "./stats";

// Importador de archivos GPX (exportación de Strava, Garmin, relojes…).
// Se parsea en el navegador con DOMParser: los archivos no salen de tu
// equipo, solo el entrenamiento resultante se guarda en tu cuenta.

function haversineM(a: RoutePoint, b: RoutePoint): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// Límite de puntos por documento de Firestore (muestreo uniforme)
function capRoute(points: RoutePoint[], max = 800): RoutePoint[] {
  if (points.length <= max) return points;
  const out: RoutePoint[] = [];
  const step = (points.length - 1) / (max - 1);
  for (let i = 0; i < max; i++) out.push(points[Math.round(i * step)]);
  return out;
}

const SPORT_PATTERNS: [RegExp, CardioSport][] = [
  [/trail|run|corr|jog/i, "correr"],
  [/rid|bik|cycl|bici|velo|mtb/i, "bici"],
  [/swim|nata/i, "natacion"],
  [/hik|send|mountain/i, "senderismo"],
  [/walk|camin/i, "caminar"],
  [/row|remo|kayak/i, "remo"],
  [/ellip|elípt/i, "eliptica"],
];

function guessSport(...hints: (string | null | undefined)[]): CardioSport {
  for (const hint of hints) {
    if (!hint) continue;
    for (const [pattern, sport] of SPORT_PATTERNS) {
      if (pattern.test(hint)) return sport;
    }
  }
  return "otro";
}

// Convierte un archivo GPX a nuestro modelo de entrenamiento.
// Devuelve null si el archivo no es un GPX válido con track y tiempos.
export function parseGpx(xml: string, fileName: string): Omit<Workout, "id"> | null {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.getElementsByTagName("parsererror").length > 0) return null;

  const trkpts = Array.from(doc.getElementsByTagName("trkpt"));
  if (trkpts.length < 2) return null;

  const points: RoutePoint[] = [];
  let distanceM = 0;
  let firstTime: number | null = null;
  let lastTime: number | null = null;
  let hrSum = 0;
  let hrCount = 0;
  let elevGain = 0;
  let prevEle: number | null = null;
  let prev: RoutePoint | null = null;

  for (const pt of trkpts) {
    const lat = parseFloat(pt.getAttribute("lat") ?? "");
    const lng = parseFloat(pt.getAttribute("lon") ?? "");
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const p: RoutePoint = { lat, lng };

    const timeEl = pt.getElementsByTagName("time")[0];
    if (timeEl?.textContent) {
      const t = Date.parse(timeEl.textContent);
      if (Number.isFinite(t)) {
        if (firstTime === null) firstTime = t;
        lastTime = t;
      }
    }

    const eleEl = pt.getElementsByTagName("ele")[0];
    if (eleEl?.textContent) {
      const ele = parseFloat(eleEl.textContent);
      if (Number.isFinite(ele)) {
        // Solo deltas razonables: los saltos grandes son ruido de GPS
        if (prevEle !== null && ele > prevEle && ele - prevEle < 30) {
          elevGain += ele - prevEle;
        }
        prevEle = ele;
      }
    }

    // Frecuencia cardiaca en la extensión estándar (gpxtpx:hr y similares)
    const hrEl = pt.getElementsByTagNameNS("*", "hr")[0];
    if (hrEl?.textContent) {
      const hr = parseFloat(hrEl.textContent);
      if (Number.isFinite(hr) && hr > 0) {
        hrSum += hr;
        hrCount++;
      }
    }

    if (prev) {
      const d = haversineM(prev, p);
      if (d < 500) distanceM += d; // salto irreal entre puntos: no sumar
    }
    prev = p;
    points.push(p);
  }

  if (points.length < 2 || firstTime === null || lastTime === null || lastTime <= firstTime) {
    return null; // sin tiempos no podemos calcular duración ni ritmo
  }

  const durationMin = Math.max(1, Math.round((lastTime - firstTime) / 60000));
  const trk = doc.getElementsByTagName("trk")[0];
  const trkName = trk?.getElementsByTagName("name")[0]?.textContent?.trim();
  const trkType = trk?.getElementsByTagName("type")[0]?.textContent?.trim();
  const sport = guessSport(trkType, trkName, fileName);
  const distanceKm = Math.round((distanceM / 1000) * 100) / 100;

  return {
    type: "cardio",
    name: trkName || fileName.replace(/\.gpx$/i, ""),
    date: isoDate(new Date(firstTime)),
    durationMin,
    cardio: {
      sport,
      distanceKm,
      avgHr: hrCount > 0 ? Math.round(hrSum / hrCount) : null,
      elevationM: elevGain > 0 ? Math.round(elevGain) : null,
      calories: null,
      route: capRoute(points),
    },
    // ID estable para no duplicar si se importa el mismo archivo dos veces
    gpxId: `gpx-${new Date(firstTime).toISOString()}-${Math.round(distanceM)}`,
    createdAt: Date.now(),
  };
}
