const { withAndroidManifest } = require("@expo/config-plugins");

// Plugin de configuración para Health Connect (react-native-health-connect):
// añade al AndroidManifest los puntos de entrada que Android exige para
// mostrar la pantalla de permisos de salud.
// Ref: https://matinzd.github.io/react-native-health-connect/docs/get-started

module.exports = function withHealthConnect(config) {
  return withAndroidManifest(config, (config) => {
    const app = config.modResults.manifest.application?.[0];
    if (!app) return config;

    // Android 13: la actividad principal debe responder a la intención de
    // "mostrar justificación de permisos" de Health Connect
    const mainActivity = (app.activity ?? []).find(
      (a) => a.$?.["android:name"] === ".MainActivity"
    );
    if (mainActivity) {
      mainActivity["intent-filter"] = mainActivity["intent-filter"] ?? [];
      const already = mainActivity["intent-filter"].some((f) =>
        (f.action ?? []).some(
          (a) =>
            a.$?.["android:name"] ===
            "androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE"
        )
      );
      if (!already) {
        mainActivity["intent-filter"].push({
          action: [
            {
              $: {
                "android:name":
                  "androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE",
              },
            },
          ],
        });
      }
    }

    // Android 14+: alias equivalente con la intención VIEW_PERMISSION_USAGE
    app["activity-alias"] = app["activity-alias"] ?? [];
    const aliasExists = app["activity-alias"].some(
      (a) => a.$?.["android:name"] === "ViewPermissionUsageActivity"
    );
    if (!aliasExists) {
      app["activity-alias"].push({
        $: {
          "android:name": "ViewPermissionUsageActivity",
          "android:exported": "true",
          "android:targetActivity": ".MainActivity",
          "android:permission": "android.permission.START_VIEW_PERMISSION_USAGE",
        },
        "intent-filter": [
          {
            action: [
              { $: { "android:name": "android.intent.action.VIEW_PERMISSION_USAGE" } },
            ],
            category: [
              { $: { "android:name": "android.intent.category.HEALTH_PERMISSIONS" } },
            ],
          },
        ],
      });
    }

    return config;
  });
};
