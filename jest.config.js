module.exports = {
  preset: "jest-expo",
  // Unit helpers only. Local Supabase usecase tests run via npm run test:supabase.
  testMatch: ["**/__tests__/**/*.(test|spec).[jt]s?(x)"],
  testPathIgnorePatterns: [
    "/node_modules/",
    // Root layout snapshot needs React Native native-module mocks.
    "<rootDir>/__tests__/App.test.js",
    "<rootDir>/__tests__/usecase/",
  ],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind|react-native-css-interop|react-native-reanimated|react-native-worklets|react-native-gesture-handler)",
  ],
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverage: true,
  coverageReporters: ["json", "lcov", "text", "clover"],
  collectCoverageFrom: [
    "**/*.{js,jsx,ts,tsx}",
    "!**/node_modules/**",
    "!**/vendor/**",
  ],
  coverageDirectory: "coverage",
};
