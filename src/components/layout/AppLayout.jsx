import { Outlet } from 'react-router';
import NavBar from './NavBar';

export default function AppLayout() {
  return (
    // The frame starts below the status bar, so scrolled content never slides under it.
    <div className="flex h-full flex-col bg-bg pt-[var(--safe-area-inset-top)] md:flex-row">
      <NavBar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-5 pt-6 pb-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
