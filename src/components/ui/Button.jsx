const VARIANTS = {
  primary: 'bg-accent text-on-accent hover:bg-accent-strong',
  dark: 'bg-fg text-bg hover:opacity-90',
  secondary: 'border border-line bg-surface text-accent hover:bg-accent-soft',
  ghost: 'bg-transparent text-accent hover:bg-accent-soft',
};

export default function Button({ variant = 'primary', className = '', type = 'button', ...rest }) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[14px] px-5 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...rest}
    />
  );
}
