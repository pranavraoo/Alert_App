module.exports = {
  extends: [
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    project: "./src"
  },
  rules: {
    "no-console": "off",
    "prefer-const": "error",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn"
  },
  env: {
    node: true,
    browser: true
  }
}
