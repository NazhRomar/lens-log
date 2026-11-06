import { Outlet } from 'react-router';
import NavBar from './NavBar';

export default function AppLayout() {
  return (
    <div className="flex h-full flex-col md:flex-row">
      <NavBar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-5 pt-[max(env(safe-area-inset-top),24px)] pb-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
