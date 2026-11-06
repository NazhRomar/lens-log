import Button from '../../components/ui/Button';
import { updateSettings } from '../../hooks/useSettings';

// TODO(v1): lens type → link eyes → max wear hours → "opened a pack today?" → optional guide walkthrough.
export default function OnboardingPage() {
  return (
    <main className="mx-auto flex h-full max-w-md flex-col justify-center gap-6 px-6">
      <img src="/favicon.svg" alt="" width="64" height="64" />
      <div className="flex flex-col gap-2">
        <h1 className="m-0 text-3xl font-bold tracking-tight">Lens Log</h1>
        <p className="m-0 text-base leading-relaxed text-fg-soft">
          Track when to replace your lenses, how long you wear them, and how to care for them.
        </p>
      </div>
      <Button onClick={() => updateSettings({ onboarded: true })}>Get started</Button>
    </main>
  );
}
