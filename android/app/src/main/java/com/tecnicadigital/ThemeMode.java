package com.tecnicadigital;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.util.Log;

import com.tecnicadigital.MainActivity;

public class ThemeMode extends ReactContextBaseJavaModule {
	ReactApplicationContext context;
	private SharedPreferences mSharedPreferences;

	public ThemeMode(ReactApplicationContext reactContext) {
		super(reactContext);
		mSharedPreferences = reactContext.getSharedPreferences("ThemePref", Context.MODE_PRIVATE);
		context = reactContext;
	}

	@Override
	public String getName() {
		return "ThemeMode";
	}

	@ReactMethod
	public void set(String message) {
		//SharedPreferences.Editor editor = context.getSharedPreferences("ThemePref", Context.MODE_PRIVATE).edit();
		SharedPreferences.Editor editor = mSharedPreferences.edit();
		editor.putString("appTheme", message);
		editor.commit();
	}
	@ReactMethod
	public void get(Callback successCallback) {
		/*SharedPreferences sharedPref = context.getSharedPreferences("ThemePref", Context.MODE_PRIVATE);
        String appString = sharedPref.getString("appTheme", "default");
		return appString;*/
		String value = mSharedPreferences.getString("appTheme", "default");
		successCallback.invoke(value);
	}
	@ReactMethod
	public void update() {
		String value = mSharedPreferences.getString("appTheme", "default");
		context.getCurrentActivity().setTheme((value.equals("dark"))? R.style.AppThemeDark: R.style.AppThemeLight);
	}
}