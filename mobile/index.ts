import { registerRootComponent } from "expo";
// Registra la tarea de GPS en segundo plano en el arranque del bundle:
// necesario para que Android pueda entregar posiciones aunque la app
// se relance en segundo plano.
import "./src/lib/tracking";
import App from "./App";

registerRootComponent(App);
