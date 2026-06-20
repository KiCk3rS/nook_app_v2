/** @type {import('expo/config').ExpoConfig} */
const appJson = require('./app.json');

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

if (process.env.EAS_BUILD === 'true' && !googleMapsApiKey) {
  throw new Error(
    'GOOGLE_MAPS_API_KEY manquant pendant le build EAS. ' +
      'Créez le secret : eas secret:create --name GOOGLE_MAPS_API_KEY --value "VOTRE_CLE" --scope project',
  );
}

module.exports = {
  expo: {
    ...appJson.expo,
    android: {
      ...appJson.expo.android,
      package: 'com.valro.nook_app_v2',
    },
    extra: {
      ...appJson.expo.extra,
      eas: {
        projectId: 'bde6503d-b255-4390-8c1f-4a9dd8f8dd51',
      },
    },
    plugins: [
      'expo-router',
      'expo-status-bar',
      'expo-dev-client',
      'expo-font',
      'expo-splash-screen',
      [
        'expo-audio',
        {
          recordAudioAndroid: false,
          enableBackgroundPlayback: true,
        },
      ],
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'NOOK utilise votre position pour afficher les lieux à proximité et centrer la carte.',
        },
      ],
      [
        'react-native-maps',
        {
          androidGoogleMapsApiKey: googleMapsApiKey,
        },
      ],
    ],
  },
};
