package com.tecnicadigital;

import android.os.Bundle;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
//import com.zoontek.rnbootsplash.RNBootSplash;
import org.devio.rn.splashscreen.SplashScreen;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

public class MainActivity extends ReactActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // ThemeMode
    SharedPreferences sharedPref = getApplicationContext().getSharedPreferences("ThemePref", Context.MODE_PRIVATE);
    String appTheme = sharedPref.getString("appTheme", "default");
    //getTheme().applyStyle((appTheme.equals("dark"))? R.style.BootThemeDark: R.style.BootTheme, true);
    setTheme((appTheme.equals("dark"))? R.style.AppThemeDark: R.style.AppThemeLight);

    SplashScreen.show(this, (appTheme.equals("dark"))? R.style.SplashScreenThemeDark: R.style.SplashScreenThemeLight, false);
    //RNBootSplash.init(this);
    //super.onCreate(savedInstanceState);
    super.onCreate(null);
  }
  public void updateTheme() {
    SharedPreferences sharedPref = getApplicationContext().getSharedPreferences("ThemePref", Context.MODE_PRIVATE);
    String appTheme = sharedPref.getString("appTheme", "default");
    setTheme((appTheme.equals("dark"))? R.style.AppThemeDark: R.style.AppThemeLight);
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "TecnicaDigital";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. There the RootView is created and
   * you can specify the renderer you wish to use - the new renderer (Fabric) or the old renderer
   * (Paper).
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new MainActivityDelegate(this, getMainComponentName());
  }

  public static class MainActivityDelegate extends ReactActivityDelegate {
    public MainActivityDelegate(ReactActivity activity, String mainComponentName) {
      super(activity, mainComponentName);
    }

    @Override
    protected ReactRootView createRootView() {
      ReactRootView reactRootView = new ReactRootView(getContext());
      // If you opted-in for the New Architecture, we enable the Fabric Renderer.
      reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
      return reactRootView;
    }
    @Override
    protected boolean isConcurrentRootEnabled() {
      // If you opted-in for the New Architecture, we enable Concurrent Root (i.e. React 18).
      // More on this on https://reactjs.org/blog/2022/03/29/react-v18.html
      return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
    }
  }
}