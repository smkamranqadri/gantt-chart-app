import { formatDate } from '../helpers/date'

type WeekHeaderProps = {
  days: Date[]
  todayIndex: number | null
}

function WeekHeader({ days, todayIndex }: WeekHeaderProps) {
  return (
    <div className="grid grid-cols-[160px_repeat(7,120px)] border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white text-xs font-semibold uppercase text-slate-500">
      <div className="flex items-center px-4 py-4">Lane</div>
      {days.map((date, index) => (
        <div
          key={formatDate(date)}
          className={`px-2 py-4 text-center ${
            todayIndex === index ? 'bg-sky-100/80 text-slate-700' : ''
          }`}
        >
          <div className="text-[11px] font-semibold text-slate-500">
            {date.toLocaleDateString('en-US', { weekday: 'short' })}
          </div>
          <div className="text-[11px] font-medium text-slate-600">
            {formatDate(date)}
          </div>
        </div>
      ))}
    </div>
  )
}

export default WeekHeader
