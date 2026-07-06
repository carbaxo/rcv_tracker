import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { getDb } from "./firebase";
import { useAuth } from "../context/AuthContext";
import type { Workout } from "./types";

// Misma estructura que la web: users/{uid}/workouts — los entrenamientos
// grabados aquí aparecen al instante en la web y viceversa.

export function useWorkouts() {
  const { user } = useAuth();
  const [data, setData] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(
      collection(getDb(), "users", user.uid, "workouts"),
      orderBy("date", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Workout));
        setLoading(false);
      },
      (err) => {
        console.error("Error cargando entrenamientos:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, [user]);

  return { data, loading };
}

export async function addWorkout(uid: string, w: Omit<Workout, "id">) {
  return addDoc(collection(getDb(), "users", uid, "workouts"), w);
}
