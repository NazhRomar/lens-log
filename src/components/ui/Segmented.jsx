/** Radio group styled as a segmented control. */
export default function Segmented({ name, legend, options, value, onChange }) {
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="mb-2 p-0 text-sm font-semibold">{legend}</legend>
      <div
        className="grid gap-1 rounded-[14px] bg-bg p-1"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((o) => (
          <label
            key={o.value}
            className={`flex min-h-11 cursor-pointer items-center justify-center rounded-[10px] px-2 text-center text-sm font-semibold has-focus-visible:outline-2 has-focus-visible:outline-accent ${
              value === o.value ? 'bg-surface text-fg shadow-sm' : 'text-muted'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
