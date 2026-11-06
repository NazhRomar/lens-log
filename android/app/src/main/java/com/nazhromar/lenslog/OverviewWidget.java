package com.nazhromar.lenslog;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.view.View;
import android.widget.RemoteViews;

/** D · Overview 4x2: ring and next pair, live wear total with bar, supplies, and the wear button. */
public class OverviewWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        manager.updateAppWidget(ids, build(new WidgetData(context)));
    }

    static RemoteViews build(WidgetData d) {
        RemoteViews v = new RemoteViews(d.context.getPackageName(), R.layout.widget_overview);
        d.bindRing(v);

        // Title: when the next pair is due.
        String title;
        if (!d.hasCountdown() || d.daysLeft() <= 0) {
            title = d.countdownTitle();
        } else if (d.eyeLabel.equals("Both eyes") || d.eyeLabel.isEmpty()) {
            title = "New pair on " + d.replaceDate();
        } else {
            title = d.eyeLabel + " · " + d.replaceDate();
        }
        v.setTextViewText(R.id.ov_title, title);
        v.setTextColor(R.id.ov_title, d.stateColor(d.countdownState() == WidgetData.DANGER ? WidgetData.DANGER : WidgetData.NONE, R.color.widget_text));

        // Wear line: live clock while wearing, today's total otherwise.
        if (d.wearing()) {
            v.setTextViewText(R.id.ov_wear_prefix, "Wearing · ");
            v.setChronometer(R.id.ov_chrono, d.chronometerBase(), null, true);
            v.setViewVisibility(R.id.ov_chrono, View.VISIBLE);
            v.setViewVisibility(R.id.ov_wear_total, View.GONE);
            v.setTextViewText(R.id.ov_wear_suffix, " of " + d.maxHours + "h");
        } else {
            v.setTextViewText(R.id.ov_wear_prefix, d.hasData ? "Lenses out · " : "");
            v.setChronometer(R.id.ov_chrono, d.chronometerBase(), null, false);
            v.setViewVisibility(R.id.ov_chrono, View.GONE);
            v.setViewVisibility(R.id.ov_wear_total, d.hasData ? View.VISIBLE : View.GONE);
            v.setTextViewText(R.id.ov_wear_total, WidgetData.duration(d.wornTodayMs()));
            v.setTextViewText(R.id.ov_wear_suffix, d.hasData ? " today" : "to start tracking");
        }

        boolean over = d.overLimit();
        v.setViewVisibility(R.id.ov_bar, over ? View.GONE : View.VISIBLE);
        v.setViewVisibility(R.id.ov_bar_over, over ? View.VISIBLE : View.GONE);
        v.setProgressBar(R.id.ov_bar, 100, d.wearProgress(), false);
        v.setProgressBar(R.id.ov_bar_over, 100, 100, false);

        v.setTextViewText(R.id.ov_supplies, d.hasData ? d.suppliesLine() : "");
        d.bindWearButton(v, R.id.ov_button);
        v.setOnClickPendingIntent(R.id.widget_root, d.link(WidgetData.LINK_HOME, 1));
        return v;
    }
}
