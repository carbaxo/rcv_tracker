# 📱 RCV Tracker — App Android

App nativa de Android (React Native + Expo) que comparte cuenta y datos con
la versión web: inicias sesión con la misma cuenta de Google y todo se
sincroniza en tiempo real vía Firestore.

## ✨ Qué hace la app

- **🛰️ Cardio con GPS en vivo, también en segundo plano** — graba tu ruta
  mientras corres o pedaleas: distancia, tiempo y ritmo en directo, con
  filtrado de señal (descarta lecturas imprecisas y saltos de GPS),
  pausa/reanudación y trazado del recorrido. La grabación **sigue funcionando
  con la pantalla apagada o la app minimizada** gracias a un servicio en
  primer plano de Android (verás una notificación persistente durante la
  actividad), y la sesión se restaura intacta si Android llega a matar la
  app. Al guardar, la actividad aparece al instante en la web.

  Incluye **autopausa opcional** (interruptor en la pantalla de GPS, la
  preferencia se recuerda): si te paras más de 5 segundos —un semáforo, un
  descanso— el cronómetro se pausa solo y se reanuda al detectar movimiento,
  con histéresis de velocidad para no oscilar. El tiempo parado no cuenta
  para el ritmo.

  > Para grabar con la pantalla apagada, Android pedirá el permiso de
  > ubicación **«Permitir siempre»**. Si solo concedes «mientras se usa», la
  > app lo detecta y graba únicamente con la app en pantalla.
- **🔗 Importación desde Strava (API oficial)** — conecta tu cuenta con OAuth
  e importa hasta tus últimas 200 actividades con distancia, tiempo,
  frecuencia cardiaca, desnivel y el trazado de la ruta. Las actividades ya
  importadas se detectan por su ID y no se duplican. Los tokens se guardan
  cifrados en el dispositivo (SecureStore) y se refrescan solos al caducar.
- **🏠 Inicio** — resumen semanal/mensual y tus últimos entrenamientos
  (también los registrados desde la web), con vista del trazado GPS.
- **👤 Perfil** — cuenta, estadísticas y cierre de sesión.

El registro detallado de gimnasio, los planes, las gráficas y los objetivos
viven en la web (que también puedes instalar como PWA); esta app se centra en
lo que solo un móvil puede hacer: GPS e importación cómoda.

## 🚀 Puesta en marcha

### 1. Variables de entorno

```bash
cd mobile
npm install
cp .env.example .env
```

Rellena en `.env`:

1. **Firebase**: los mismos 6 valores que usa la web (README raíz, paso 2),
   con prefijo `EXPO_PUBLIC_FIREBASE_*`.
2. **Google Sign-In**: en
   [Google Cloud Console → Credenciales](https://console.cloud.google.com/apis/credentials)
   (el proyecto se llama igual que tu proyecto de Firebase):
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`: el cliente OAuth de tipo **Web** que
     Firebase creó automáticamente al habilitar Google en Authentication.
   - `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`: crea un cliente OAuth de tipo
     **Android** con el paquete `com.rcv.tracker` y la huella **SHA-1** de tu
     keystore (`cd android && ./gradlew signingReport`, o la que te da EAS).
3. **Strava**: crea una app gratuita en
   [strava.com/settings/api](https://www.strava.com/settings/api) y copia
   `EXPO_PUBLIC_STRAVA_CLIENT_ID` y `EXPO_PUBLIC_STRAVA_CLIENT_SECRET`. En
   "Authorization Callback Domain" pon `rcvtracker` (el esquema de la app).

### 2. Ejecutar en desarrollo

```bash
npx expo run:android        # con un emulador o móvil por USB
```

### 3. Generar la APK

Con [EAS Build](https://docs.expo.dev/build/setup/) (gratuito, compila en la
nube, no necesitas Android Studio):

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview   # genera una APK instalable
```

O de forma local si tienes el SDK de Android:

```bash
npx expo prebuild -p android
cd android && ./gradlew assembleRelease
# APK en android/app/build/outputs/apk/release/
```

> **Importante:** el inicio de sesión con Google en la APK requiere que el
> cliente OAuth de Android tenga la SHA-1 del keystore con el que se firma
> esa APK (EAS te la muestra con `eas credentials`).

## 🧱 Estructura

```
mobile/
├── App.tsx                  # Navegación por pestañas + proveedor de sesión
├── src/
│   ├── context/AuthContext.tsx   # Google Sign-In → Firebase (misma cuenta que la web)
│   ├── lib/
│   │   ├── firebase.ts      # Firebase con persistencia de sesión en el dispositivo
│   │   ├── db.ts            # Firestore en tiempo real (users/{uid}/workouts)
│   │   ├── strava.ts        # OAuth + API de Strava, refresco de tokens, mapeo
│   │   ├── geo.ts           # Haversine, decodificador de polylines, ritmo
│   │   └── types.ts         # Modelo de datos compartido con la web
│   ├── screens/             # Inicio, GPS, Strava, Perfil, Login
│   └── components/          # RouteTrace (SVG), UI base
└── app.json                 # Config Expo (permisos de ubicación, esquema OAuth)
```
