import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { AnnualDashboardData } from './adminAnnualData'

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const currency = (value: number) => `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value)} ₫`
const axisMoney = (value: number) => `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(value / 1000000)}tr`

export default function MonthlyRevenuePreview({ data, onYearChange }: { data: AnnualDashboardData; onYearChange: (year: number) => void }) {
  const rows = data.months.map(row => ({ ...row, label: monthNames[row.month - 1] }))
  return <section className="admin-preview__panel admin-preview__monthly">
    <div className="admin-preview__panel-heading">
      <div><h3>Xu hướng doanh thu theo tháng</h3><p>Jan–Dec {data.year} · Doanh thu và trung bình động 3 tháng</p></div>
      <label className="admin-preview__year-filter">Năm <select value={data.year} onChange={event => onYearChange(Number(event.target.value))} aria-label="Chọn năm xu hướng doanh thu">
        {data.availableYears.map(value => <option key={value} value={value}>{value}</option>)}
      </select></label>
    </div>
    <p className="admin-preview__version-note">Đơn đã giao theo ngày tạo đơn · Giờ Việt Nam</p>
    <div className="admin-preview__monthly-chart-scroll"><div className="admin-preview__monthly-chart" role="img" aria-label={`Biểu đồ doanh thu Jan đến Dec năm ${data.year} và trung bình động 3 tháng`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 16, right: 12, left: 0, bottom: 2 }}>
          <CartesianGrid stroke="var(--ap-border)" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: 'var(--ap-text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} interval={0} />
          <YAxis tickFormatter={axisMoney} tick={{ fill: 'var(--ap-text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} width={50} />
          <Tooltip formatter={(value, name) => [currency(Number(value)), String(name)]} contentStyle={{ borderRadius: 12, border: '1px solid var(--ap-border)', background: 'var(--ap-bg-card)', color: 'var(--ap-text-primary)' }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#2b648d" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="movingAverage" name="Trung bình động 3 tháng" stroke="#aa4b4b" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div></div>
    <div className="admin-preview__monthly-table-scroll">
      <table className="admin-preview__monthly-table">
        <thead><tr><th>Tháng</th><th>Doanh thu</th><th>Tăng trưởng theo tháng</th><th>Trung bình động 3 tháng</th></tr></thead>
        <tbody>{rows.map(row => <tr key={row.month}>
          <th>{row.label}</th><td>{row.revenue === null ? '—' : currency(row.revenue)}</td>
          <td className={row.growthPercent === null ? '' : row.growthPercent < 0 ? 'negative' : 'positive'}>{row.growthPercent === null ? '—' : `${row.growthPercent > 0 ? '+' : ''}${row.growthPercent.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`}</td>
          <td>{row.movingAverage === null ? '—' : currency(row.movingAverage)}</td>
        </tr>)}</tbody>
        <tfoot><tr><th>Tổng năm</th><td>{currency(rows.reduce((sum, row) => sum + (row.revenue ?? 0), 0))}</td><td>—</td><td>—</td></tr></tfoot>
      </table>
    </div>
  </section>
}
