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

public class TempSession extends ReactContextBaseJavaModule {
	ReactApplicationContext context;
	private SharedPreferences mSharedPreferences;

	public TempSession(ReactApplicationContext reactContext) {
		super(reactContext);
		mSharedPreferences = reactContext.getSharedPreferences("TempSession", Context.MODE_PRIVATE);
		context = reactContext;
	}

	@Override
	public String getName() {
		return "TempSession";
	}

	@ReactMethod
	public void set(String message) {
		SharedPreferences.Editor editor = mSharedPreferences.edit();
		editor.putString("TempSession", message);
		editor.commit();
	}
	@ReactMethod
	public void get(Callback successCallback) {
		String value = mSharedPreferences.getString("TempSession", "none");
		successCallback.invoke(value);
	}
}