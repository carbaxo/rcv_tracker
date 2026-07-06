import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useWorkouts } from "../lib/db";
import { colors } from "../theme";
import { Button, Card } from "../components/ui";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { data: workouts } = useWorkouts();

  const fromStrava = workouts.filter((w) => w.stravaId).length;
  const withGps = workouts.filter((w) => (w.cardio?.route?.length ?? 0) > 1).length;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, gap: 14 }}
    >
      <Text style={styles.title}>Perfil</Text>

      <Card style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        {user?.photoURL ? (
          <Image
            source={{ uri: user.photoURL }}
            style={{ width: 56, height: 56, borderRadius: 28 }}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={{ fontSize: 24 }}>👤</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontWeight: "700" }} numberOfLines={1}>
            {user?.displayName ?? "Usuario"}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 13 }} numberOfLines={1}>
            {user?.email}
          </Text>
          <Text style={{ color: colors.accent, fontSize: 12, marginTop: 2 }}>
            ✓ Sincronizado con la web y todos tus dispositivos
          </Text>
        </View>
      </Card>

      <Card>
        <Text style={{ color: colors.text, fontWeight: "700", marginBottom: 6 }}>
          📊 Tus datos
        </Text>
        <Text style={styles.line}>{workouts.length} entrenamientos en total</Text>
        <Text style={styles.line}>{withGps} actividades con ruta GPS</Text>
        <Text style={styles.line}>{fromStrava} importadas de Strava</Text>
      </Card>

      <Card>
        <Text style={{ color: colors.text, fontWeight: "700", marginBottom: 6 }}>
          🌐 Versión web
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>
          Los planes de entrenamiento, la biblioteca de ejercicios, las gráficas
          de progreso, los récords y los objetivos están en la versión web —
          con esta misma cuenta de Google verás ahí todo lo que grabes aquí.
        </Text>
      </Card>

      <Button title="Cerrar sesión" variant="danger" onPress={() => signOut()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 22, fontWeight: "800" },
  line: { color: colors.textMuted, fontSize: 14, marginTop: 2 },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.input,
    alignItems: "center",
    justifyContent: "center",
  },
});
