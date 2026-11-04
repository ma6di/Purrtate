// iOS 27 asserts at launch unless the app adopts the UIScene life cycle.
// Wires the generated AppDelegate to Expo's ExpoAppSceneDelegate.
const { withInfoPlist, withAppDelegate } = require('expo/config-plugins');

const withSceneManifest = (config) =>
  withInfoPlist(config, (cfg) => {
    cfg.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: 'EXExpoAppSceneDelegate',
          },
        ],
      },
    };
    return cfg;
  });

const withSceneAppDelegate = (config) =>
  withAppDelegate(config, (cfg) => {
    if (cfg.modResults.language !== 'swift') {
      throw new Error('withSceneLifecycle: only Swift AppDelegate is supported');
    }
    let src = cfg.modResults.contents;

    src = src.replace(
      /class AppDelegate: ExpoAppDelegate \{/,
      'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {'
    );

    // The scene delegate creates the window and starts React Native.
    src = src.replace(
      /#if os\(iOS\) \|\| os\(tvOS\)\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\s*factory\.startReactNative\([\s\S]*?\)\s*#endif\s*/,
      '\n    '
    );

    if (!src.includes('ExpoReactNativeFactoryProvider')) {
      throw new Error('withSceneLifecycle: AppDelegate template changed, patch failed');
    }
    cfg.modResults.contents = src;
    return cfg;
  });

module.exports = (config) => withSceneAppDelegate(withSceneManifest(config));
