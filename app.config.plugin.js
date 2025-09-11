// app.config.plugin.js
const { withAndroidStyles, withAndroidManifest } = require('@expo/config-plugins');

const withGoogleMaps = (config) => {
  // Android configuration
  config = withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application[0];
    
    // Add meta-data for Google Maps API key
    mainApplication['meta-data'] = mainApplication['meta-data'] || [];
    mainApplication['meta-data'].push({
      $: {
        'android:name': 'com.google.android.geo.API_KEY',
        'android:value': process.env.EXPO_PUBLIC_ANDROID_GOOGLE_MAPS_API_KEY || 'YOUR_ANDROID_GOOGLE_MAPS_API_KEY_HERE',
      },
    });

    return config;
  });

  return config;
};

module.exports = (config) => {
  return withGoogleMaps(config);
};