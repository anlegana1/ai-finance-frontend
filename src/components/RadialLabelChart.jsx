import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  Label,
} from 'recharts'

export default function RadialLabelChart({ value, label }) {
  const v = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0

  const data = [{ name: 'progress', value: v, fill: '#3b82f6' }]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div style={{ width: 140, height: 140 }}>
        <RadialBarChart
          width={140}
          height={140}
          data={data}
          startAngle={90}
          endAngle={-270}
          innerRadius={52}
          outerRadius={68}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} dataKey="value" tick={false} axisLine={false} />
          <PolarGrid gridType="circle" radialLines={false} stroke="#2a3342" />
          <RadialBar dataKey="value" cornerRadius={10} background={{ fill: '#2a3342' }} />
          <PolarRadiusAxis tick={false} axisLine={false}>
            <Label
              position="center"
              content={({ viewBox }) => {
                if (!viewBox || typeof viewBox.cx !== 'number' || typeof viewBox.cy !== 'number') return null
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={viewBox.cx} y={viewBox.cy} fill="#e5e7eb" fontSize="22" fontWeight="700">
                      {Math.round(v)}%
                    </tspan>
                  </text>
                )
              }}
            />
          </PolarRadiusAxis>
        </RadialBarChart>
      </div>
      <div className="muted" style={{ textAlign: 'center' }}>{label}</div>
    </div>
  )
}
