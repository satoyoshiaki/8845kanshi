export type RangeMinutes = 5 | 15 | 60

export function RangeSelector({ value, onChange }: { value: RangeMinutes; onChange: (value: RangeMinutes) => void }) {
  return (
    <div className="flex rounded-lg border border-line bg-canvas/60 p-0.5">
      {([5, 15, 60] as RangeMinutes[]).map((minutes) => (
        <button
          key={minutes}
          onClick={() => onChange(minutes)}
          className={`focus-ring rounded-md px-2.5 py-1 font-mono text-[10px] transition-colors ${value === minutes ? 'bg-accent/20 text-blue-300' : 'text-secondary hover:text-primary'}`}
        >
          {minutes === 60 ? '1H' : `${minutes}M`}
        </button>
      ))}
    </div>
  )
}
