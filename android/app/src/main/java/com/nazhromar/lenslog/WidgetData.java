package com.nazhromar.lenslog;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.SystemClock;
import android.text.SpannableStringBuilder;
import android.text.Spanned;
import android.text.style.ForegroundColorSpan;
import android.widget.RemoteViews;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

/**
 * Everything the widgets share: the stored data (written by WidgetBridgePlugin),
 * the derived text and states, the ring, and the tap actions.
 */
final class WidgetData {

    static final String PREFS = "lenslog_widget";
    static final long DAY = 24L * 60 * 60 * 1000;

    /** Deep links handled by the app (src/platform/NativeBridge.jsx). */
    static final String LINK_HOME = "com.nazhromar.lenslog://open/home";
    static final String LINK_SUPPLIES = "com.nazhromar.lenslog://open/supplies";
    static final String LINK_TOGGLE_WEAR = "com.nazhromar.lenslog://wear/toggle";

    /** States for colors: none, normal, last day / running low, due or overdue. */
    static final int NONE = -1, OK = 0, WARN = 1, DANGER = 2;

    final Context context;
    final boolean hasData, daily, lowLeft, lowRight;
    final long replaceBy, wearingSince, wornEarlierMs, wornDay, caseDue, solutionDue;
    final int totalDays, maxHours, stockLeft, stockRight;
    final String eyeLabel;

    WidgetData(Context context) {
        this.context = context;
        SharedPreferences p = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        hasData = p.contains("replaceBy");
        replaceBy = p.getLong("replaceBy", -1);
        wearingSince = p.getLong("wearingSince", -1);
        wornEarlierMs = p.getLong("wornEarlierMs", 0);
        wornDay = p.getLong("wornDay", -1);
        caseDue = p.getLong("caseDue", -1);
        solutionDue = p.getLong("solutionDue", -1);
        totalDays = Math.max(1, p.getInt("totalDays", 14));
        maxHours = Math.max(1, p.getInt("maxHours", 10));
        stockLeft = p.getInt("stockLeft", 0);
        stockRight = p.getInt("stockRight", 0);
        daily = p.getBoolean("daily", false);
        lowLeft = p.getBoolean("lowLeft", false);
        lowRight = p.getBoolean("lowRight", false);
        eyeLabel = p.getString("eyeLabel", "");
    }

    // ---- countdown ------------------------------------------------------

    boolean hasCountdown() {
        return hasData && !daily && replaceBy > 0;
    }

    long daysLeft() {
        return Math.round((replaceBy - startOfToday()) / (double) DAY);
    }

    int countdownState() {
        if (!hasCountdown()) return NONE;
        long d = daysLeft();
        if (d <= 0) return DANGER;
        if (d == 1) return WARN;
        return OK;
    }

    /** "5 days left", "Replace today", "2 days overdue", or a fallback. */
    String countdownTitle() {
        if (!hasData) return "Open Lens Log";
        if (daily) return "Daily lenses";
        if (replaceBy < 0) return "No lenses tracked";
        long d = daysLeft();
        if (d > 1) return d + " days left";
        if (d == 1) return "1 day left";
        if (d == 0) return "Replace today";
        return -d + (d == -1 ? " day overdue" : " days overdue");
    }

    /** Fraction of the lens's life used, for the ring. */
    int ringProgress() {
        if (!hasCountdown()) return 0;
        long used = totalDays - daysLeft();
        return (int) Math.max(0, Math.min(100, Math.round(used * 100.0 / totalDays)));
    }

    String replaceDate() {
        return new SimpleDateFormat("EEE, MMM d", Locale.getDefault()).format(new Date(replaceBy));
    }

    /** Fills a ring (layout widget_ring_core) with the countdown. */
    void bindRing(RemoteViews v) {
        int state = countdownState();
        int[] bars = { R.id.ring_ok, R.id.ring_warn, R.id.ring_danger };
        int shown = state == WARN ? 1 : state == DANGER ? 2 : 0;
        for (int i = 0; i < bars.length; i++) {
            v.setViewVisibility(bars[i], i == shown ? android.view.View.VISIBLE : android.view.View.GONE);
            v.setProgressBar(bars[i], 100, ringProgress(), false);
        }
        String number;
        String unit;
        if (!hasData || (!daily && replaceBy < 0)) {
            number = "–";
            unit = "";
        } else if (daily) {
            number = "1";
            unit = "day";
        } else {
            long d = daysLeft();
            if (d > 0) {
                number = String.valueOf(d);
                unit = d == 1 ? "day" : "days";
            } else if (d == 0) {
                number = "!";
                unit = "today";
            } else {
                number = String.valueOf(-d);
                unit = "over";
            }
        }
        v.setTextViewText(R.id.ring_number, number);
        v.setTextColor(R.id.ring_number, stateColor(state, R.color.widget_text));
        v.setTextViewText(R.id.ring_unit, unit);
    }

    // ---- wear -----------------------------------------------------------

    boolean wearing() {
        return hasData && wearingSince > 0;
    }

    /** Total worn today, including the session running now. */
    long wornTodayMs() {
        long today = startOfToday();
        long earlier = wornDay == today ? wornEarlierMs : 0;
        long running = wearing() ? System.currentTimeMillis() - Math.max(wearingSince, today) : 0;
        return earlier + Math.max(0, running);
    }

    /** Chronometer base so it shows today's total and keeps counting live. */
    long chronometerBase() {
        return SystemClock.elapsedRealtime() - wornTodayMs();
    }

    boolean overLimit() {
        return wornTodayMs() >= maxHours * 60L * 60 * 1000;
    }

    int wearProgress() {
        return (int) Math.min(100, wornTodayMs() * 100 / (maxHours * 60L * 60 * 1000));
    }

    /** Styles the Put in / Take out button. */
    void bindWearButton(RemoteViews v, int id) {
        v.setTextViewText(id, wearing() ? "Take out" : "Put in");
        v.setInt(id, "setBackgroundResource", wearing() ? R.drawable.widget_button_dark : R.drawable.widget_button_accent);
        v.setTextColor(id, color(wearing() ? R.color.widget_button_dark_text : R.color.widget_button_accent_text));
        v.setOnClickPendingIntent(id, link(LINK_TOGGLE_WEAR, 2));
    }

    // ---- supplies -------------------------------------------------------

    static long daysUntil(long due) {
        return Math.round((due - startOfToday()) / (double) DAY);
    }

    static int supplyState(long due) {
        if (due < 0) return NONE;
        long d = daysUntil(due);
        if (d <= 0) return DANGER;
        if (d <= 14) return WARN;
        return OK;
    }

    static String supplyText(long due) {
        if (due < 0) return "—";
        long d = daysUntil(due);
        return d <= 0 ? "Due" : d + "d";
    }

    /** "Case 49d · Solution 10d · Spares L5 R1" with colored values. */
    CharSequence suppliesLine() {
        SpannableStringBuilder s = new SpannableStringBuilder();
        s.append("Case ");
        append(s, supplyText(caseDue), supplyState(caseDue));
        s.append(" · Solution ");
        append(s, supplyText(solutionDue), supplyState(solutionDue));
        s.append(" · Spares L");
        append(s, String.valueOf(stockLeft), lowLeft ? DANGER : NONE);
        s.append(" R");
        append(s, String.valueOf(stockRight), lowRight ? DANGER : NONE);
        return s;
    }

    private void append(SpannableStringBuilder s, String text, int state) {
        int start = s.length();
        s.append(text);
        if (state == WARN || state == DANGER) {
            s.setSpan(new ForegroundColorSpan(stateColor(state, R.color.widget_muted)), start, s.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        }
    }

    // ---- helpers --------------------------------------------------------

    int color(int res) {
        return context.getColor(res);
    }

    int stateColor(int state, int normalRes) {
        if (state == WARN) return color(R.color.widget_warn);
        if (state == DANGER) return color(R.color.widget_danger);
        return color(normalRes);
    }

    static String duration(long ms) {
        long min = ms / 60000;
        return (min / 60) + "h " + (min % 60) + "m";
    }

    PendingIntent link(String uri, int requestCode) {
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(uri), context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        return PendingIntent.getActivity(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
        );
    }

    static long startOfToday() {
        Calendar c = Calendar.getInstance();
        c.set(Calendar.HOUR_OF_DAY, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        return c.getTimeInMillis();
    }

    // ---- redraw ---------------------------------------------------------

    interface Builder {
        RemoteViews build(WidgetData data);
    }

    /** Redraws every placed widget of every Lens Log widget type. */
    static void updateAll(Context context) {
        WidgetData data = new WidgetData(context);
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        update(manager, context, LensLogWidget.class, data, LensLogWidget::build);
        update(manager, context, WearWidget.class, data, WearWidget::build);
        update(manager, context, RingWidget.class, data, RingWidget::build);
        update(manager, context, SuppliesWidget.class, data, SuppliesWidget::build);
        update(manager, context, OverviewWidget.class, data, OverviewWidget::build);
    }

    private static void update(
        AppWidgetManager manager,
        Context context,
        Class<? extends AppWidgetProvider> type,
        WidgetData data,
        Builder builder
    ) {
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, type));
        if (ids.length > 0) manager.updateAppWidget(ids, builder.build(data));
    }
}
