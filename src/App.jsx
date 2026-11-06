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

export default function App() {
  const settings = useSettings();
  useApplyTheme(settings?.theme);

  if (!settings) return null; // database still opening

  if (!settings.onboarded) return <OnboardingPage />;

  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
