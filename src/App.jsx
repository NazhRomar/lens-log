import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import AppLayout from './components/layout/AppLayout';
import GuidePage from './features/guide/GuidePage';
import GuideTopicPage from './features/guide/GuideTopicPage';
import HistoryPage from './features/history/HistoryPage';
import HomePage from './features/home/HomePage';
import OnboardingPage from './features/onboarding/OnboardingPage';
import SettingsPage from './features/settings/SettingsPage';
import SuppliesPage from './features/supplies/SuppliesPage';
import { useApplyTheme, useSettings } from './hooks/useSettings';
import NativeBridge from './platform/NativeBridge';
import { syncReminders } from './platform/reminders';

export default function App() {
  const settings = useSettings();
  useApplyTheme(settings?.theme);

  // Rebuild reminders on launch and when wear/replacement settings change.
  useEffect(() => {
    if (settings?.onboarded) syncReminders();
  }, [settings?.onboarded, settings?.maxWearHours, settings?.replacementDays]);

  if (!settings) return null; // database still opening

  return (
    <BrowserRouter>
      <NativeBridge />
      {settings.onboarded ? <AppRoutes /> : <OnboardingPage />}
    </BrowserRouter>
  );
}

function AppRoutes() {
  return (
    <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="guide" element={<GuidePage />} />
          <Route path="guide/:topicId" element={<GuideTopicPage />} />
          <Route path="supplies" element={<SuppliesPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
    </Routes>
  );
}
