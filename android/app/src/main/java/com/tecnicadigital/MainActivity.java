package com.tecnicadigital;

import android.os.Bundle;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
//import com.zoontek.rnbootsplash.RNBootSplash;
import org.devio.rn.splashscreen.SplashScreen;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

public class MainActivity extends ReactActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    this.clearSessionTemp();
    // ThemeMode
    SharedPreferences sharedPref = getApplicationContext().getSharedPreferences("ThemePref", Context.MODE_PRIVATE);
    String appTheme = sharedPref.getString("appTheme", "default");
    setTheme((appTheme.equals("dark"))? R.style.AppThemeDark: R.style.AppThemeLight);

    SplashScreen.show(this, (appTheme.equals("dark"))? R.style.SplashScreenThemeDark: R.style.SplashScreenThemeLight, false);
    //RNBootSplash.init(this);
    //super.onCreate(savedInstanceState);
    super.onCreate(null);
  }
  @Override
  protected void onDestroy() {
    this.clearSessionTemp();
    super.onDestroy();
  }

  private void clearSessionTemp() {
    // TempSession
    SharedPreferences sessionPref = getApplicationContext().getSharedPreferences("TempSession", Context.MODE_PRIVATE);
    SharedPreferences.Editor editor = sessionPref.edit();
    editor.remove("TempSession");
    editor.clear(); 
    editor.commit();
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
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        DefaultNewArchitectureEntryPoint.getFabricEnabled(), // fabricEnabled
        // If you opted-in for the New Architecture, we enable Concurrent React (i.e. React 18).
        DefaultNewArchitectureEntryPoint.getConcurrentReactEnabled() // concurrentRootEnabled
        );
  }
}