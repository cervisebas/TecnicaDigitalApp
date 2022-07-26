package com.tecnicadigital;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.widget.RemoteViews;

import android.content.SharedPreferences;
import org.json.JSONException;
import org.json.JSONObject;
import android.content.Intent;
import android.app.PendingIntent;

/**
 * Implementation of App Widget functionality.
 */
public class MainWidget extends AppWidgetProvider {
    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        try {
            SharedPreferences sharedPref = context.getSharedPreferences("DATA", Context.MODE_PRIVATE);
            String appString = sharedPref.getString("appData", "{\"numAssist\":'Sin datos',\"numNotAssist\":'Sin datos',\"numTotal\":'Sin datos'}");
            JSONObject appData = new JSONObject(appString);
            
            Intent intent = new Intent(context, MainWidget.class);
            PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, 0);
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.main_widget);
            
            views.setTextViewText(R.id.numAssist, appData.getString("numAssist"));
            views.setTextViewText(R.id.numNotAssist, appData.getString("numNotAssist"));
            views.setTextViewText(R.id.numTotal, appData.getString("numTotal"));
            views.setOnClickPendingIntent(R.id.widgetFrameLayout, pendingIntent);

            appWidgetManager.updateAppWidget(appWidgetId, views);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // There may be multiple widgets active, so update all of them
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onEnabled(Context context) {
        // Enter relevant functionality for when the first widget is created
    }

    @Override
    public void onDisabled(Context context) {
        // Enter relevant functionality for when the last widget is disabled
    }
}