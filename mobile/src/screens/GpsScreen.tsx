import { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import { useAuth } from "../context/AuthContext";
import { addWorkout } from "../lib/db";
import {
  capRoute,
  formatClock,
  haversineM,
  isoDate,
  pace,
} from "../lib/geo";
import { CARDIO_SPORTS, type CardioSport, type RoutePoint } from "../lib/types";
import { colors } from "../theme";
import RouteTrace from "../components/RouteTrace";
import { Button, Card, Stat } from "../components/ui";

type Status = "idle" | "tracking" | "paused" | "finished";

// Puntos con precisión peor que esto (en metros) se descartan para no
// ensuciar la ruta ni inflar la distancia.
const MAX_ACCURACY_M = 35;
// Saltos imposibles entre dos lecturas consecutivas se ignoran (túneles, GPS perdido)
const MAX_JUMP_M = 200;

export default function GpsScreen() {
  const { user } = useAuth();
  const [status, setStatus] = useState<Status>("idle");
  const [sport, setSport] = useState<CardioSport>("correr");
  const [route, setRoute] = useState<RoutePoint[]>([]);
  const [distanceM, setDistanceM] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [saving, setSaving] = useState(false);
  const [gpsSignal, setGpsSignal] = useState<"buscando" | "ok">("buscando");

  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const lastPointRef = useRef<RoutePoint | null>(null);
  const statusRef = useRef<Status>("idle");
  statusRef.current = status;

  // Cronómetro (solo avanza mientras grabamos)
  useEffect(() => {
    if (status !== "tracking") return;
    const id = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    return () => {
      watchRef.current?.remove();
    };
  }, []);

  const start = async () => {
    const { status: perm } = await Location.requestForegroundPermissionsAsync();
    if (perm !== "granted") {
      Alert.alert(
        "Permiso necesario",
        "RCV Tracker necesita acceso a tu ubicación para grabar la ruta."
      );
      return;
    }
    setRoute([]);
    setDistanceM(0);
    setElapsedSec(0);
    lastPointRef.current = null;
    setGpsSignal("buscando");
    setStatus("tracking");

    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 2000,
        distanceInterval: 5,
      },
      (loc) => {
        if (statusRef.current !== "tracking") return;
        const acc = loc.coords.accuracy ?? 999;
        if (acc > MAX_ACCURACY_M) return;
        setGpsSignal("ok");
        const point: RoutePoint = {
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        };
        const last = lastPointRef.current;
        if (last) {
          const d = haversineM(last, point);
          if (d > MAX_JUMP_M) return; // salto de GPS irreal
          if (d < 2) return; // ruido parado
          setDistanceM((m) => m + d);
        }
        lastPointRef.current = point;
        setRoute((r) => [...r, point]);
      }
    );
  };

  const pause = () => setStatus("paused");
  const resume = () => {
    // Al reanudar no unimos el hueco: reiniciamos el punto de referencia
    lastPointRef.current = null;
    setStatus("tracking");
  };

  const finish = () => {
    watchRef.current?.remove();
    watchRef.current = null;
    setStatus("finished");
  };

  const discard = () => {
    Alert.alert("Descartar actividad", "¿Seguro que quieres descartar esta actividad?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Descartar",
        style: "destructive",
        onPress: () => {
          watchRef.current?.remove();
          watchRef.current = null;
          setStatus("idle");
        },
      },
    ]);
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const distanceKm = Math.round((distanceM / 1000) * 100) / 100;
      const durationMin = Math.max(1, Math.round(elapsedSec / 60));
      const sportInfo = CARDIO_SPORTS.find((s) => s.value === sport)!;
      await addWorkout(user.uid, {
        type: "cardio",
        name: `${sportInfo.label} con GPS`,
        date: isoDate(new Date()),
        durationMin,
        cardio: {
          sport,
          distanceKm,
          route: capRoute(route),
        },
        createdAt: Date.now(),
      });
      setStatus("idle");
      Alert.alert("Guardado ✓", "Tu actividad se ha sincronizado con todos tus dispositivos.");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo guardar la actividad. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const distanceKm = distanceM / 1000;
  const durationMin = elapsedSec / 60;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <Text style={styles.title}>🛰️ Cardio con GPS</Text>

      {status === "idle" && (
        <>
          <Card>
            <Text style={styles.label}>Deporte</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {CARDIO_SPORTS.filter((s) =>
                ["correr", "bici", "caminar", "senderismo", "otro"].includes(s.value)
              ).map((s) => (
                <Button
                  key={s.value}
                  title={`${s.emoji} ${s.label}`}
                  variant={sport === s.value ? "primary" : "secondary"}
                  onPress={() => setSport(s.value)}
                  style={{ paddingVertical: 9, paddingHorizontal: 13 }}
                />
              ))}
            </View>
          </Card>
          <Button title="▶  Empezar actividad" onPress={start} style={{ paddingVertical: 18 }} />
          <Text style={styles.hint}>
            La ruta se graba con la pantalla encendida. La distancia, el ritmo y el
            trazado se calculan en vivo y se guardan en tu cuenta al terminar.
          </Text>
        </>
      )}

      {(status === "tracking" || status === "paused") && (
        <>
          <Card style={{ gap: 14 }}>
            <View style={{ flexDirection: "row" }}>
              <Stat label="Tiempo" value={formatClock(elapsedSec)} color={colors.text} />
              <Stat label="Distancia" value={`${distanceKm.toFixed(2)} km`} color={colors.cardio} />
              <Stat label="Ritmo" value={`${pace(durationMin, distanceKm)} /km`} />
            </View>
            <Text style={{ color: colors.textFaint, fontSize: 12, textAlign: "center" }}>
              {status === "paused"
                ? "⏸ En pausa"
                : gpsSignal === "buscando"
                  ? "📡 Buscando señal GPS…"
                  : `📡 GPS activo · ${route.length} puntos`}
            </Text>
          </Card>

          <Card style={{ padding: 8 }}>
            {route.length > 1 ? (
              <RouteTrace route={route} />
            ) : (
              <View style={{ height: 220, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: colors.textFaint }}>
                  El trazado aparecerá aquí en cuanto empieces a moverte
                </Text>
              </View>
            )}
          </Card>

          <View style={{ flexDirection: "row", gap: 10 }}>
            {status === "tracking" ? (
              <Button title="⏸ Pausar" variant="secondary" onPress={pause} style={{ flex: 1 }} />
            ) : (
              <Button title="▶ Reanudar" onPress={resume} style={{ flex: 1 }} />
            )}
            <Button title="⏹ Terminar" variant="danger" onPress={finish} style={{ flex: 1 }} />
          </View>
        </>
      )}

      {status === "finished" && (
        <>
          <Card style={{ gap: 14 }}>
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>
              Resumen de la actividad
            </Text>
            <View style={{ flexDirection: "row" }}>
              <Stat label="Tiempo" value={formatClock(elapsedSec)} color={colors.text} />
              <Stat label="Distancia" value={`${distanceKm.toFixed(2)} km`} color={colors.cardio} />
              <Stat label="Ritmo" value={`${pace(durationMin, distanceKm)} /km`} />
            </View>
          </Card>
          <Card style={{ padding: 8 }}>
            <RouteTrace route={route} />
          </Card>
          <Button
            title="💾 Guardar actividad"
            onPress={save}
            loading={saving}
            style={{ paddingVertical: 16 }}
          />
          <Button title="Descartar" variant="danger" onPress={discard} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 22, fontWeight: "800" },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  hint: { color: colors.textFaint, fontSize: 13, lineHeight: 19 },
});
