package com.nazhromar.lenslog;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.widget.RemoteViews;

/** Countdown · 2x1: days until new lenses, and whether lenses are in. */
public class LensLogWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        manager.updateAppWidget(ids, build(new WidgetData(context)));
    }

    static RemoteViews build(WidgetData d) {
        Context c = d.context;
        String wear;
        if (!d.hasData) {
            wear = "to start tracking";
        } else if (d.wearing()) {
            wear = "In " + d.wearingSinceTime(); // short enough to fit next to the eye label
        } else {
            wear = "Lenses out";
        }
        String detail = d.eyeLabel.isEmpty() || d.daily ? wear : d.eyeLabel + " · " + wear;

        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget_lens_log);
        v.setTextViewText(R.id.widget_title, d.countdownTitle());
        v.setTextColor(R.id.widget_title, d.stateColor(d.countdownState(), R.color.widget_text));
        v.setTextViewText(R.id.widget_detail, detail);
        v.setOnClickPendingIntent(R.id.widget_root, d.link(WidgetData.LINK_HOME, 1));
        return v;
    }
}
