import { useState } from 'react'
import type { AnnualDashboardData } from './adminAnnualData'

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const versions = ['V1', 'V2', 'V3', 'V4'] as const
const money = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)} ₫`
const percent = (value: number | null) => value === null ? '—' : `${value > 0 ? '+' : ''}${value.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`

export default function VersionRevenuePreview({ data, onYearChange }: { data: AnnualDashboardData; onYearChange: (year: number) => void }) {
  const [month, setMonth] = useState(new Date().getMonth())
  const availableMonths = data.months.filter(row => row.revenue !== null).map(row => row.month - 1)
  const selectedMonth = availableMonths.includes(month) ? month : availableMonths[availableMonths.length - 1]
  const monthlyVersions = data.byVersion.find(row => row.month === selectedMonth + 1)?.versions
  const rows = versions.map(version => ({ version, revenue: monthlyVersions?.[version] ?? 0 }))
  const total = rows.reduce((sum, row) => sum + row.revenue, 0)
  const highest = Math.max(...rows.map(row => row.revenue))
  const lowest = Math.min(...rows.map(row => row.revenue))
  const peak = data.highlights

  return <div className="admin-preview__insights-grid"><section className="admin-preview__panel admin-preview__versions">
    <div className="admin-preview__panel-heading">
      <div><h3>Doanh thu theo phiên bản</h3><p>Giá trị đơn đã giao của V1–V4</p></div>
      <div className="admin-preview__version-filters">
        <label>Tháng <select value={selectedMonth} onChange={event => setMonth(Number(event.target.value))} aria-label="Chọn tháng doanh thu theo phiên bản">
          {availableMonths.map(index => <option key={index} value={index}>{monthNames[index]}</option>)}
        </select></label>
        <label>Năm <select value={data.year} onChange={event => onYearChange(Number(event.target.value))} aria-label="Chọn năm doanh thu theo phiên bản">
          {data.availableYears.map(value => <option key={value} value={value}>{value}</option>)}
        </select></label>
      </div>
    </div>
    <p className="admin-preview__version-note">Xanh: cao nhất · Đỏ nhạt: thấp nhất · Tỷ trọng trong doanh thu thiết bị</p>
    <div className="admin-preview__monthly-table-scroll">
      <table className="admin-preview__monthly-table admin-preview__version-table">
        <thead><tr><th>Phiên bản thiết bị</th><th>Doanh thu {monthNames[selectedMonth]}/{data.year}</th><th>Tỷ trọng</th></tr></thead>
        <tbody>{rows.map(row => <tr key={row.version} className={total > 0 ? row.revenue === highest ? 'highest' : row.revenue === lowest ? 'lowest' : '' : ''}>
          <th>{row.version}{total > 0 && row.revenue === highest && <span className="admin-preview__version-tag">Cao nhất</span>}</th>
          <td>{money(row.revenue)}</td><td>{total > 0 ? `${(row.revenue / total * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%` : '—'}</td>
        </tr>)}</tbody>
        <tfoot><tr><th>Tổng thiết bị</th><td>{money(total)}</td><td>{total > 0 ? '100%' : '—'}</td></tr></tfoot>
      </table>
    </div>
  </section>
  <section className="admin-preview__panel admin-preview__highlights">
    <div className="admin-preview__panel-heading"><div><h3>Điểm nổi bật</h3><p>Tổng kết doanh thu theo tháng trong năm {data.year}</p></div></div>
    <p className="admin-preview__version-note">Tính từ đơn đã giao theo ngày tạo đơn · Giờ Việt Nam</p>
    <div className="admin-preview__monthly-table-scroll">
      <table className="admin-preview__monthly-table admin-preview__highlights-table">
        <thead><tr><th>Chỉ tiêu</th><th>Kết quả</th></tr></thead>
        <tbody>
          <tr><th>Doanh thu cao nhất theo tháng</th><td>{money(peak.peakMonthlyRevenue)}</td></tr>
          <tr><th>Tháng có doanh thu cao nhất</th><td>{peak.peakMonth === null ? '—' : `${monthNames[peak.peakMonth - 1]}/${data.year}`}</td></tr>
          <tr><th>% tăng trưởng cao nhất</th><td className="positive">{percent(peak.maxGrowthPercent)}</td></tr>
          <tr><th>% giảm mạnh nhất</th><td className="negative">{percent(peak.maxDeclinePercent)}</td></tr>
        </tbody>
      </table>
    </div>
  </section></div>
}
