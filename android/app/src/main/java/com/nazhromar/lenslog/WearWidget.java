package com.nazhromar.lenslog;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.view.View;
import android.widget.RemoteViews;

/** A · Wear timer 2x1: live total worn today and a Put in / Take out button. */
public class WearWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        manager.updateAppWidget(ids, build(new WidgetData(context)));
    }

    static RemoteViews build(WidgetData d) {
        RemoteViews v = new RemoteViews(d.context.getPackageName(), R.layout.widget_wear);

        if (!d.hasData) {
            v.setTextViewText(R.id.wear_status, "Open Lens Log");
            v.setTextColor(R.id.wear_status, d.color(R.color.widget_muted));
        } else {
            v.setTextViewText(R.id.wear_status, d.wearing() ? "Wearing" : "Not wearing");
            v.setTextColor(R.id.wear_status, d.color(d.wearing() ? R.color.widget_ok : R.color.widget_muted));
        }

        if (d.wearing()) {
            // Ticks live on the home screen, starting from today's total.
            v.setChronometer(R.id.wear_chrono, d.chronometerBase(), null, true);
            v.setViewVisibility(R.id.wear_chrono, View.VISIBLE);
            v.setViewVisibility(R.id.wear_total, View.GONE);
        } else {
            v.setChronometer(R.id.wear_chrono, d.chronometerBase(), null, false);
            v.setViewVisibility(R.id.wear_chrono, View.GONE);
            v.setViewVisibility(R.id.wear_total, View.VISIBLE);
            v.setTextViewText(R.id.wear_total, WidgetData.duration(d.wornTodayMs()));
        }

        v.setTextViewText(R.id.wear_limit, "of " + d.maxHours + "h today");
        v.setTextColor(R.id.wear_limit, d.color(d.overLimit() ? R.color.widget_danger : R.color.widget_muted));

        d.bindWearButton(v, R.id.wear_button);
        v.setOnClickPendingIntent(R.id.widget_root, d.link(WidgetData.LINK_HOME, 1));
        return v;
    }
}
