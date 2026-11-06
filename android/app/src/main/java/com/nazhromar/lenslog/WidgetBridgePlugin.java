package com.nazhromar.lenslog;

import android.content.Context;
import android.content.SharedPreferences;
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
        // JS numbers arrive as doubles; dates are epoch milliseconds, -1 = none.
        for (String key : LONGS) prefs.putLong(key, call.getDouble(key, -1.0).longValue());
        for (String key : INTS) prefs.putInt(key, call.getDouble(key, 0.0).intValue());
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

    private SharedPreferences prefs() {
        return getContext().getSharedPreferences(WidgetData.PREFS, Context.MODE_PRIVATE);
    }
}
