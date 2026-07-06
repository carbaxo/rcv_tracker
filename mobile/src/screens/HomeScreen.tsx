import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useWorkouts } from "../lib/db";
import { formatDuration, isoDate, pace } from "../lib/geo";
import { CARDIO_SPORTS, type Workout } from "../lib/types";
import { colors } from "../theme";
import RouteMap from "../components/RouteMap";
import { Card, Stat } from "../components/ui";

function startOfWeekIso(): string {
  const d = new Date();
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return isoDate(d);
}

function WorkoutRow({ workout }: { workout: Workout }) {
  const [open, setOpen] = useState(false);
  const isCardio = workout.type === "cardio";
  const sport = CARDIO_SPORTS.find((s) => s.value === workout.cardio?.sport);
  const hasRoute = (workout.cardio?.route?.length ?? 0) > 1;

  return (
    <Card style={{ marginBottom: 10 }}>
      <Pressable onPress={() => setOpen((o) => !o)}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={{ fontSize: 24 }}>{isCardio ? (sport?.emoji ?? "🏃") : "🏋️"}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: "700" }} numberOfLines={1}>
              {workout.name}
              {workout.stravaId ? "  🔗" : workout.healthConnectId ? "  ⌚" : ""}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>
              {workout.date} · {formatDuration(workout.durationMin)}
              {isCardio && workout.cardio
                ? ` · ${workout.cardio.distanceKm} km · ${pace(
                    workout.durationMin,
                    workout.cardio.distanceKm
                  )} /km`
                : workout.volumeKg
                  ? ` · ${Math.round(workout.volumeKg)} kg`
                  : ""}
            </Text>
          </View>
          {hasRoute && <Text style={{ color: colors.textFaint, fontSize: 12 }}>🗺️</Text>}
        </View>
      </Pressable>
      {open && hasRoute && (
        <View style={{ marginTop: 10 }}>
          <RouteMap route={workout.cardio!.route!} height={180} />
        </View>
      )}
      {open && !isCardio && workout.exercises && (
        <View style={{ marginTop: 10, gap: 6 }}>
          {workout.exercises.map((ex, i) => (
            <Text key={i} style={{ color: colors.textMuted, fontSize: 13 }}>
              {ex.name}:{" "}
              {ex.sets
                .map((s) => `${s.weight > 0 ? `${s.weight}kg×` : ""}${s.reps}`)
                .join(" · ")}
            </Text>
          ))}
        </View>
      )}
    </Card>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { data: workouts, loading } = useWorkouts();

  const weekStart = startOfWeekIso();
  const thisWeek = workouts.filter((w) => w.date >= weekStart);
  const monthPrefix = isoDate(new Date()).slice(0, 7);
  const monthKm = workouts
    .filter((w) => w.type === "cardio" && w.date.startsWith(monthPrefix))
    .reduce((a, w) => a + (w.cardio?.distanceKm || 0), 0);

  const firstName = user?.displayName?.split(" ")[0] ?? "atleta";

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      data={workouts.slice(0, 30)}
      keyExtractor={(w) => w.id!}
      renderItem={({ item }) => <WorkoutRow workout={item} />}
      ListHeaderComponent={
        <View style={{ gap: 14, marginBottom: 14 }}>
          <Text style={styles.title}>Hola, {firstName} 👋</Text>
          <Card>
            <View style={{ flexDirection: "row" }}>
              <Stat label="Semana" value={`${thisWeek.length} ses.`} color={colors.gym} />
              <Stat label="Mes cardio" value={`${monthKm.toFixed(1)} km`} color={colors.cardio} />
              <Stat label="Total" value={`${workouts.length}`} />
            </View>
          </Card>
          <Text style={styles.section}>Últimos entrenamientos</Text>
          {loading && (
            <Text style={{ color: colors.textFaint }}>Cargando…</Text>
          )}
          {!loading && workouts.length === 0 && (
            <Card>
              <Text style={{ color: colors.textMuted, lineHeight: 20 }}>
                Aún no hay entrenamientos. Graba una actividad con GPS, importa
                tu historial de Strava o registra sesiones desde la web — todo
                se sincroniza aquí automáticamente. 🌱
              </Text>
            </Card>
          )}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 22, fontWeight: "800" },
  section: { color: colors.text, fontSize: 16, fontWeight: "700", marginTop: 4 },
});
