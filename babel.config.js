module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { reactCompiler: false }]],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./client",
            "@shared": "./shared",
          },
          extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
