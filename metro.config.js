/**
 * Metro config pour Expo SDK 55 sur Windows.
 *
 * blockList :
 *   Sur Windows sans Watchman, Metro crée des dossiers temporaires
 *   node_modules/@react-native/.metro-config-XXXX qu'il supprime
 *   ensuite ; le FallbackWatcher tente de les surveiller et plante
 *   avec ENOENT. On les exclut du resolver.
 */

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver = config.resolver || {};
config.resolver.blockList = /node_modules[\\/]@react-native[\\/]\.metro-config.*/;

module.exports = config;
