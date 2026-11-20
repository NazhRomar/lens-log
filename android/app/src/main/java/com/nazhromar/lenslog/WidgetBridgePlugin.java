package com.nazhromar.lenslog;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Receives widget data from the web app (src/platform/widget.js), stores it,
 * and redraws every Lens Log widget on the home screen.
 */
@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {

    private static final String[] LONGS = {
        "replaceBy", "wearingSince", "wornEarlierMs", "wornDay", "caseDue", "solutionDue"
    };
    private static final String[] INTS = { "totalDays", "maxHours", "stockLeft", "stockRight" };
    private static final String[] BOOLS = { "daily", "lowLeft", "lowRight" };

    @PluginMethod
    public void update(PluginCall call) {
        SharedPreferences.Editor prefs = prefs().edit();
        // Dates are epoch milliseconds (-1 = none). Read them as plain Numbers:
        // org.json parses large values as Long, and PluginCall.getDouble()
        // silently returns the default for a Long, so every date became -1.
        for (String key : LONGS) prefs.putLong(key, number(call, key, -1).longValue());
        for (String key : INTS) prefs.putInt(key, number(call, key, 0).intValue());
        for (String key : BOOLS) prefs.putBoolean(key, call.getBoolean(key, false));
        prefs.putString("eyeLabel", call.getString("eyeLabel", ""));
        prefs.apply();

        WidgetData.updateAll(getContext());
        call.resolve();
    }

    @PluginMethod
    public void clear(PluginCall call) {
        prefs().edit().clear().apply();
        WidgetData.updateAll(getContext());
        call.resolve();
    }

    /**
     * Asks the launcher to add a widget to the home screen (Android shows its
     * own confirmation). type: countdown | wear | ring | supplies | overview.
     */
    @PluginMethod
    public void pinWidget(PluginCall call) {
        Context context = getContext();
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        Class<?> provider;
        switch (call.getString("type", "")) {
            case "wear": provider = WearWidget.class; break;
            case "ring": provider = RingWidget.class; break;
            case "supplies": provider = SuppliesWidget.class; break;
            case "overview": provider = OverviewWidget.class; break;
            default: provider = LensLogWidget.class;
        }
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O || !manager.isRequestPinAppWidgetSupported()) {
            call.reject("This launcher can't add widgets from an app. Long-press the home screen and choose Widgets.");
            return;
        }
        manager.requestPinAppWidget(new ComponentName(context, provider), null, null);
        call.resolve();
    }

    /** Any JS number (Integer, Long or Double on the Java side), or the fallback. */
    private static Number number(PluginCall call, String key, long fallback) {
        Object value = call.getData().opt(key);
        return value instanceof Number ? (Number) value : fallback;
    }

    private SharedPreferences prefs() {
        return getContext().getSharedPreferences(WidgetData.PREFS, Context.MODE_PRIVATE);
    }
}
