module.exports = {
  extends: ["expo", "prettier", "plugin:jest/recommended"],
  plugins: ["prettier", "jest"],
  env: {
    jest: true,
  },
  rules: {
    "prettier/prettier": "error",
  },
};
