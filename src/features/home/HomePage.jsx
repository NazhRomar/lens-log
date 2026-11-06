import { Link } from 'react-router';
import { format } from 'date-fns';
import { Settings } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import { useNow } from '../../hooks/useNow';

// TODO(v1): wear timer, per-eye replacement rings, supplies status strip, red-flags shortcut.
export default function HomePage() {
  const now = useNow();
  return (
    <>
      <PageHeader
        eyebrow={format(now, 'EEE, MMM d')}
        title="Lens Log"
        action={
          <Link
            to="/settings"
            aria-label="Settings"
            className="flex size-11 items-center justify-center rounded-xl border border-line bg-surface text-fg-soft"
          >
            <Settings aria-hidden="true" size={20} strokeWidth={1.8} />
          </Link>
        }
      />
      <Card>
        <p className="m-0 text-[15px] text-fg-soft">Home screen not built yet.</p>
      </Card>
    </>
  );
}
