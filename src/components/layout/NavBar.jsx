import { NavLink } from 'react-router';
import { BookOpen, History, House, Package } from 'lucide-react';

const ITEMS = [
  { to: '/', label: 'Home', Icon: House, end: true },
  { to: '/guide', label: 'Guide', Icon: BookOpen },
  { to: '/supplies', label: 'Supplies', Icon: Package },
  { to: '/history', label: 'History', Icon: History },
];

/** Bottom tab bar on phones, side rail from 768px up. */
export default function NavBar() {
  return (
    <nav
      aria-label="Main"
      className="order-last shrink-0 border-t border-line bg-surface pb-[max(var(--safe-area-inset-bottom),12px)] md:order-first md:w-24 md:border-t-0 md:border-r md:pt-6 md:pb-6"
    >
      <div className="hidden justify-center pb-6 md:flex">
        <img src="/favicon.svg" alt="Lens Log" width="40" height="40" />
      </div>
      <ul className="grid grid-cols-4 px-2 pt-2 md:flex md:flex-col md:gap-2 md:pt-0">
        {ITEMS.map(({ to, label, Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex min-h-11 flex-col items-center gap-1 rounded-xl py-1.5 text-xs no-underline ${
                  isActive ? 'font-semibold text-accent md:bg-accent-soft' : 'font-medium text-muted hover:text-fg'
                }`
              }
            >
              <Icon aria-hidden="true" size={24} strokeWidth={1.8} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
