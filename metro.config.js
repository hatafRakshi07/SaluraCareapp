const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Exclude Replit's temporary internal directories from being watched.
// These files are created and deleted by the Replit platform; if Metro
// tries to watch them after they are removed it crashes with ENOENT.
config.watchFolders = (config.watchFolders ?? []).filter(
  (folder) => !folder.includes(".local")
);

// Also block Metro's own internal watcher from scanning .local
config.resolver = {
  ...config.resolver,
  blockList: [
    ...(config.resolver?.blockList ?? []),
    /\/.local\//,
  ],
};

module.exports = config;
