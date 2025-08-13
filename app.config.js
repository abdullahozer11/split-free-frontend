export default ({ config }) => {
  const variant = process.env.EXPO_PUBLIC_APP_VARIANT;

  let appName = "SplitFree";
  let packageId = "xyz.splitfree";
  if (variant === "development") {
    appName += " (Dev)";
    packageId += ".dev";
  } else if (variant === "preview") {
    appName += " (Preview)";
    packageId += ".preview";
  }

  return {
    ...config,
    name: appName,
    android: {
      ...config.android,
      package: packageId,
    },
    ios: {
      ...config.ios,
      bundleIdentifier: packageId,
    },
  };
};
