import * as SecureStore from "expo-secure-store";
import { capRoute, decodePolyline } from "./geo";
import type { CardioSport, Workout } from "./types";

// Cliente de la API de Strava (https://developers.strava.com).
// El usuario autoriza la app vía OAuth y los tokens se guardan cifrados
// en el dispositivo con SecureStore.

export const STRAVA_CLIENT_ID = process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID ?? "";
const STRAVA_CLIENT_SECRET = process.env.EXPO_PUBLIC_STRAVA_CLIENT_SECRET ?? "";

export const stravaConfigured = Boolean(STRAVA_CLIENT_ID && STRAVA_CLIENT_SECRET);

export const STRAVA_DISCOVERY = {
  authorizationEndpoint: "https://www.strava.com/oauth/mobile/authorize",
  tokenEndpoint: "https://www.strava.com/oauth/token",
};

const TOKEN_KEY = "strava_tokens";

interface StravaTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch en segundos
  athleteName?: string;
}

export async function getStoredTokens(): Promise<StravaTokens | null> {
  const raw = await SecureStore.getItemAsync(TOKEN_KEY);
  return raw ? (JSON.parse(raw) as StravaTokens) : null;
}

async function storeTokens(t: StravaTokens) {
  await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(t));
}

export async function disconnectStrava() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// Intercambia el código de autorización por tokens de acceso
export async function exchangeCode(code: string): Promise<StravaTokens> {
  const res = await fetch(STRAVA_DISCOVERY.tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Strava devolvió ${res.status} al canjear el código`);
  const data = await res.json();
  const tokens: StravaTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
    athleteName: data.athlete
      ? `${data.athlete.firstname ?? ""} ${data.athlete.lastname ?? ""}`.trim()
      : undefined,
  };
  await storeTokens(tokens);
  return tokens;
}

// Devuelve un access token válido, refrescándolo si ha caducado
async function getValidAccessToken(): Promise<string> {
  const tokens = await getStoredTokens();
  if (!tokens) throw new Error("No hay conexión con Strava");
  if (tokens.expiresAt * 1000 > Date.now() + 60000) return tokens.accessToken;

  const res = await fetch(STRAVA_DISCOVERY.tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: tokens.refreshToken,
    }),
  });
  if (!res.ok) throw new Error(`Strava devolvió ${res.status} al refrescar el token`);
  const data = await res.json();
  const updated: StravaTokens = {
    ...tokens,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
  };
  await storeTokens(updated);
  return updated.accessToken;
}

interface StravaActivity {
  id: number;
  name: string;
  type: string;
  distance: number; // metros
  moving_time: number; // segundos
  start_date_local: string;
  average_heartrate?: number;
  total_elevation_gain?: number;
  calories?: number;
  map?: { summary_polyline?: string };
}

const SPORT_MAP: Record<string, CardioSport> = {
  Run: "correr",
  TrailRun: "correr",
  VirtualRun: "correr",
  Ride: "bici",
  VirtualRide: "bici",
  MountainBikeRide: "bici",
  GravelRide: "bici",
  Swim: "natacion",
  Walk: "caminar",
  Hike: "senderismo",
  Rowing: "remo",
  Elliptical: "eliptica",
};

// Descarga las últimas actividades del atleta autenticado
export async function fetchActivities(perPage = 50, page = 1): Promise<StravaActivity[]> {
  const token = await getValidAccessToken();
  const res = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}&page=${page}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Strava devolvió ${res.status} al listar actividades`);
  return (await res.json()) as StravaActivity[];
}

// Convierte una actividad de Strava a nuestro modelo de entrenamiento
export function activityToWorkout(a: StravaActivity): Omit<Workout, "id"> | null {
  const distanceKm = Math.round((a.distance / 1000) * 100) / 100;
  const durationMin = Math.max(1, Math.round(a.moving_time / 60));
  if (!distanceKm && !durationMin) return null;

  const sport = SPORT_MAP[a.type] ?? "otro";
  const route = a.map?.summary_polyline
    ? capRoute(decodePolyline(a.map.summary_polyline))
    : undefined;

  const workout: Omit<Workout, "id"> = {
    type: "cardio",
    name: a.name || "Actividad de Strava",
    date: a.start_date_local.slice(0, 10),
    durationMin,
    cardio: {
      sport,
      distanceKm,
      avgHr: a.average_heartrate ? Math.round(a.average_heartrate) : null,
      elevationM: a.total_elevation_gain ? Math.round(a.total_elevation_gain) : null,
      calories: a.calories ? Math.round(a.calories) : null,
      ...(route && route.length > 1 ? { route } : {}),
    },
    stravaId: a.id,
    createdAt: Date.now(),
  };
  return workout;
}
