package com.nazhromar.lenslog;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.text.SpannableStringBuilder;
import android.text.Spanned;
import android.text.style.ForegroundColorSpan;
import android.widget.RemoteViews;

/** C · Supplies 2x1: days left on the case and solution, and spare lenses per eye. */
public class SuppliesWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        manager.updateAppWidget(ids, build(new WidgetData(context)));
    }

    static RemoteViews build(WidgetData d) {
        RemoteViews v = new RemoteViews(d.context.getPackageName(), R.layout.widget_supplies);

        v.setTextViewText(R.id.supply_case, WidgetData.supplyText(d.caseDue));
        v.setTextColor(R.id.supply_case, d.stateColor(WidgetData.supplyState(d.caseDue), R.color.widget_text));
        v.setTextViewText(R.id.supply_solution, WidgetData.supplyText(d.solutionDue));
        v.setTextColor(R.id.supply_solution, d.stateColor(WidgetData.supplyState(d.solutionDue), R.color.widget_text));

        if (d.hasData) {
            // "5 · 1" (left · right), each red when low.
            SpannableStringBuilder s = new SpannableStringBuilder();
            spare(s, d, d.stockLeft, d.lowLeft);
            s.append(" · ");
            spare(s, d, d.stockRight, d.lowRight);
            v.setTextViewText(R.id.supply_spares, s);
        }

        v.setOnClickPendingIntent(R.id.widget_root, d.link(WidgetData.LINK_SUPPLIES, 3));
        return v;
    }

    private static void spare(SpannableStringBuilder s, WidgetData d, int count, boolean low) {
        int start = s.length();
        s.append(String.valueOf(count));
        if (low) {
            s.setSpan(new ForegroundColorSpan(d.color(R.color.widget_danger)), start, s.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        }
    }
}
