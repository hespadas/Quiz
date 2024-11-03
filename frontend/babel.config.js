// babel.config.js
module.exports = {
  presets: [
    "@babel/preset-env",
    [
      "@babel/preset-react",
      {
        runtime: "automatic",
      },
    ],
  ],
  plugins: [
    "@babel/plugin-transform-private-methods",
    "@babel/plugin-transform-numeric-separator",
    "@babel/plugin-transform-nullish-coalescing-operator",
    "@babel/plugin-transform-class-properties",
  ],
};
