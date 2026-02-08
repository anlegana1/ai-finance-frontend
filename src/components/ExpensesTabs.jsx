import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../lib/api'
import { formatDate } from '../lib/dateUtils'
import { useT } from '../lib/i18n.jsx'
import RadialLabelChart from './RadialLabelChart'

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

function monthKey(d) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${yyyy}-${mm}`
}

function monthOptionsFromNowToDecember() {
  const now = new Date()
  const y = now.getFullYear()
  const startM = now.getMonth()
  const opts = []
  for (let m = startM; m <= 11; m++) {
    const key = `${y}-${String(m + 1).padStart(2, '0')}`
    opts.push(key)
  }
  return opts
}

function RadialProgress({ value, label }) {
  return <RadialLabelChart value={value} label={label} />
}

export default function ExpensesTabs() {
  const t = useT()
  const [period, setPeriod] = useState('day')
  const [expenses, setExpenses] = useState([])
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(false)
  const [budgetsLoading, setBudgetsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [budgetsError, setBudgetsError] = useState(null)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userCurrency = String(user?.default_currency || 'CAD').toUpperCase()

  const [budgetMonth, setBudgetMonth] = useState(monthKey(new Date()))
  const [budgetCategory, setBudgetCategory] = useState('OTHER')
  const [budgetAmount, setBudgetAmount] = useState('')

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

  async function loadBudgets(m) {
    setBudgetsError(null)
    setBudgetsLoading(true)
    try {
      const q = m ? `?month=${encodeURIComponent(m)}` : ''
      const data = await apiFetch(`/budgets${q}`, { method: 'GET' })
      setBudgets(Array.isArray(data) ? data : [])
    } catch (err) {
      setBudgetsError(err.message)
    } finally {
      setBudgetsLoading(false)
    }
  }

  useEffect(() => {
    if (period === 'budget') {
      loadBudgets(budgetMonth)
    }
  }, [period, budgetMonth])

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

  const budgetMonthExpenses = useMemo(() => {
    if (!budgetMonth) return []
    const [y, m] = String(budgetMonth).split('-').map((x) => Number(x))
    if (!y || !m) return []
    const start = new Date(y, m - 1, 1)
    const end = new Date(y, m, 1)
    return expenses.filter((e) => {
      const d = new Date(`${e.expense_date}T00:00:00`)
      return d >= start && d < end
    })
  }, [expenses, budgetMonth])

  const spentByCategory = useMemo(() => {
    const map = new Map()
    for (const e of budgetMonthExpenses) {
      const cat = String(e.category || 'OTHER')
      map.set(cat, (map.get(cat) || 0) + Number(e.amount || 0))
    }
    return map
  }, [budgetMonthExpenses])

  const total = useMemo(() => {
    return filtered.reduce((acc, e) => acc + Number(e.amount || 0), 0)
  }, [filtered])

  async function onSaveBudget(e) {
    e.preventDefault()
    setBudgetsError(null)
    const amt = Number(budgetAmount)
    if (!budgetMonth) {
      setBudgetsError(t('budget_error_month'))
      return
    }
    if (!budgetCategory) {
      setBudgetsError(t('budget_error_category'))
      return
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      setBudgetsError(t('budget_error_amount'))
      return
    }
    setBudgetsLoading(true)
    try {
      await apiFetch('/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: budgetMonth, category: budgetCategory, amount: amt }),
      })
      setBudgetAmount('')
      await loadBudgets(budgetMonth)
    } catch (err) {
      setBudgetsError(err.message)
    } finally {
      setBudgetsLoading(false)
    }
  }

  async function onDeleteBudget(id) {
    setBudgetsError(null)
    setBudgetsLoading(true)
    try {
      await apiFetch(`/budgets/${id}`, { method: 'DELETE' })
      await loadBudgets(budgetMonth)
    } catch (err) {
      setBudgetsError(err.message)
    } finally {
      setBudgetsLoading(false)
    }
  }

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
        <button className={period === 'budget' ? 'tab active' : 'tab'} onClick={() => setPeriod('budget')}>
          {t('expenses_period_budget')}
        </button>
      </div>

      {error ? <div className="error">{error}</div> : null}

      {period !== 'budget' ? (
        <div className="muted" style={{ marginTop: '10px' }}>
          {t('expenses_total', { total: total.toFixed(2) })}
        </div>
      ) : null}

      {period !== 'budget' ? (
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
      ) : (
        <div style={{ marginTop: '10px' }}>
          <div className="muted" style={{ marginBottom: '10px' }}>
            {t('budget_currency_locked', { currency: userCurrency })}
          </div>

          <form onSubmit={onSaveBudget} className="form" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
            <label className="label">
              {t('budget_month')}
              <select className="input" value={budgetMonth} onChange={(e) => setBudgetMonth(e.target.value)}>
                {monthOptionsFromNowToDecember().map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>

            <label className="label">
              {t('budget_category')}
              <select className="input" value={budgetCategory} onChange={(e) => setBudgetCategory(e.target.value)}>
                <option value="FOOD">FOOD</option>
                <option value="GROCERIES">GROCERIES</option>
                <option value="TRANSPORT">TRANSPORT</option>
                <option value="ENTERTAINMENT">ENTERTAINMENT</option>
                <option value="HEALTH">HEALTH</option>
                <option value="UTILITIES">UTILITIES</option>
                <option value="RENT">RENT</option>
                <option value="OTHER">OTHER</option>
              </select>
            </label>

            <label className="label">
              {t('budget_amount')}
              <input
                className="input"
                type="number"
                step="0.01"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder={`0.00 ${userCurrency}`}
              />
            </label>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button className="button" type="submit" disabled={budgetsLoading}>
                {budgetsLoading ? t('budget_saving') : t('budget_save')}
              </button>
              <button className="button secondary" type="button" onClick={() => loadBudgets(budgetMonth)} disabled={budgetsLoading}>
                {budgetsLoading ? t('budget_loading') : t('budget_refresh')}
              </button>
            </div>
          </form>

          {budgetsError ? <div className="error">{budgetsError}</div> : null}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginTop: '12px' }}>
            {budgets.map((b) => {
              const spent = Number(spentByCategory.get(String(b.category)) || 0)
              const pct = b.amount > 0 ? (spent / Number(b.amount)) * 100 : 0
              const label = `${b.category}: ${spent.toFixed(2)} / ${Number(b.amount).toFixed(2)} ${userCurrency}`

              return (
                <div key={b.id} className="card" style={{ padding: '12px' }}>
                  <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{b.category}</div>
                      <div className="muted">{b.month}</div>
                    </div>
                    <button className="tab" type="button" onClick={() => onDeleteBudget(b.id)} disabled={budgetsLoading}>
                      {t('budget_delete')}
                    </button>
                  </div>

                  <div style={{ marginTop: '10px' }}>
                    <RadialProgress value={pct} label={label} />
                  </div>
                </div>
              )
            })}
          </div>

          {!budgetsLoading && budgets.length === 0 ? <div className="muted" style={{ marginTop: '10px' }}>{t('budget_empty')}</div> : null}
        </div>
      )}
    </div>
  )
}
