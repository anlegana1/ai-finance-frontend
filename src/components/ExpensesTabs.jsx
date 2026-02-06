import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../lib/api'
import { formatDate } from '../lib/dateUtils'
import { useT } from '../lib/i18n.jsx'

function toLocalDateString(d) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export default function ExpensesTabs() {
  const t = useT()
  const [period, setPeriod] = useState('day')
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function load() {
    setError(null)
    setLoading(true)
    try {
      const data = await apiFetch('/expenses', { method: 'GET' })
      setExpenses(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const today = startOfDay(new Date())

    if (period === 'day') {
      const key = toLocalDateString(today)
      return expenses.filter((e) => e.expense_date === key)
    }

    if (period === 'week') {
      const start = new Date(today)
      start.setDate(start.getDate() - 6)
      return expenses.filter((e) => {
        const d = new Date(`${e.expense_date}T00:00:00`)
        return d >= start && d <= today
      })
    }

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    return expenses.filter((e) => {
      const d = new Date(`${e.expense_date}T00:00:00`)
      return d >= monthStart && d < nextMonth
    })
  }, [expenses, period])

  const total = useMemo(() => {
    return filtered.reduce((acc, e) => acc + Number(e.amount || 0), 0)
  }, [filtered])

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>{t('expenses_title')}</h2>
        <button className="button secondary" onClick={load} disabled={loading}>
          {loading ? t('expenses_loading') : t('expenses_refresh')}
        </button>
      </div>

      <div className="tabs">
        <button className={period === 'day' ? 'tab active' : 'tab'} onClick={() => setPeriod('day')}>
          {t('expenses_period_day')}
        </button>
        <button className={period === 'week' ? 'tab active' : 'tab'} onClick={() => setPeriod('week')}>
          {t('expenses_period_week')}
        </button>
        <button className={period === 'month' ? 'tab active' : 'tab'} onClick={() => setPeriod('month')}>
          {t('expenses_period_month')}
        </button>
      </div>

      {error ? <div className="error">{error}</div> : null}

      <div className="muted" style={{ marginTop: '10px' }}>
        {t('expenses_total', { total: total.toFixed(2) })}
      </div>

      <div className="tableWrap" style={{ marginTop: '10px' }}>
        <table className="table">
          <thead>
            <tr>
              <th>{t('table_date')}</th>
              <th>{t('table_description')}</th>
              <th>{t('table_category')}</th>
              <th>{t('table_amount')}</th>
              <th>{t('table_currency')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id}>
                <td>{formatDate(e.expense_date)}</td>
                <td>{e.description}</td>
                <td>{e.category}</td>
                <td>{Number(e.amount).toFixed(2)}</td>
                <td>{e.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
