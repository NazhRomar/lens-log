package com.nazhromar.lenslog;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.widget.RemoteViews;

/** B · Ring 1x1: days until new lenses, nothing else. */
public class RingWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        manager.updateAppWidget(ids, build(new WidgetData(context)));
    }

    static RemoteViews build(WidgetData d) {
        RemoteViews v = new RemoteViews(d.context.getPackageName(), R.layout.widget_ring);
        d.bindRing(v);
        v.setOnClickPendingIntent(R.id.widget_root, d.link(WidgetData.LINK_HOME, 1));
        return v;
    }
}
