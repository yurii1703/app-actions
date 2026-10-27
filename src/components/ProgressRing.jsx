export function ProgressRing({ value, size = 40, strokeWidth = 3 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = circumference * (1 - Math.min(100, Math.max(0, value)) / 100)
  return (
    <span className="progress-ring" role="img" aria-label={`${value}% виконано`} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className="progress-ring-track" cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} />
        <circle className="progress-ring-value" cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={progress} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
    </span>
  )
}