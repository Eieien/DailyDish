const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = true;

// PowerSync ships separate native (@powersync/react-native) and web
// (@powersync/web) backends. Each is empty-stubbed on the platform it
// doesn't apply to, so only one ever ends up in a given bundle.
// https://docs.powersync.com/client-sdk-references/react-native-and-expo/react-native-web-support
//
// Expo Router's web "server" output also bundles a Node-side SSR render
// pass with platform === "web" (identifiable via customResolverOptions
// .environment === "node"). That pass must NOT get @powersync/web's UMD
// build — it's a browser-only bundle (assumes `self`) and crashes under
// Node. The SSR pass instead resolves @powersync/web to its plain ESM
// entry, which safely no-ops via PowerSync's own ssrMode detection.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isNodeEnvironment = context.customResolverOptions?.environment === "node";

  if (platform === "web") {
    if (["react-native-prompt-android", "@powersync/react-native"].includes(moduleName)) {
      return { type: "empty" };
    }
    if (moduleName === "react-native") {
      return context.resolveRequest(context, "react-native-web", platform);
    }
    if (moduleName === "@powersync/web" && !isNodeEnvironment) {
      return context.resolveRequest(context, "@powersync/web/dist/index.umd.js", platform);
    }
  } else if (moduleName === "@powersync/web") {
    return { type: "empty" };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
