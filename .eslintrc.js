module.exports = {
  extends: ["expo", "prettier", "plugin:jest/recommended"],
  plugins: ["prettier", "jest"],
  env: {
    jest: true,
  },
  rules: {
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
      },
    ],
  },
  overrides: [
    {
      files: [
        "*.config.js",
        "babel.config.js",
        "metro.config.js",
        "tailwind.config.js",
        "jest.config.js",
        "jest.setup.js",
      ],
      env: {
        node: true,
      },
    },
  ],
};
