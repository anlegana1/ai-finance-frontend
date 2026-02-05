import { useState } from 'react'
import { apiFetch } from '../lib/api'
import { formatDate } from '../lib/dateUtils'

function toDisplayDate(isoDate) {
  if (!isoDate || typeof isoDate !== 'string') return ''
  const parts = isoDate.split('-')
  if (parts.length !== 3) return ''
  const [year, month, day] = parts
  if (!year || !month || !day) return ''
  return `${day}/${month}/${year}`
}

function toISODate(displayDate) {
  if (!displayDate) return ''
  const parts = displayDate.split('/')
  if (parts.length !== 3) return ''
  const [day, month, year] = parts
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function formatDateInput(value) {
  const cleaned = value.replace(/[^\d]/g, '')
  
  if (cleaned.length <= 2) {
    return cleaned
  } else if (cleaned.length <= 4) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`
  } else {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`
  }
}

function isValidDate(displayDate) {
  const parts = displayDate.split('/')
  if (parts.length !== 3) return false
  
  const [dayStr, monthStr, yearStr] = parts
  const day = parseInt(dayStr, 10)
  const month = parseInt(monthStr, 10)
  const year = parseInt(yearStr, 10)
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false
  if (day < 1 || day > 31) return false
  if (month < 1 || month > 12) return false
  if (year < 1900 || year > 2100) return false
  
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

export default function ReceiptUpload() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [draft, setDraft] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setResult(null)
    setSaved(null)
    setDraft([])

    if (!file) {
      setError('Selecciona una imagen (JPG/PNG).')
      return
    }

    setLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)

      const data = await apiFetch('/receipts/process', {
        method: 'POST',
        body: form,
      })

      setResult(data)
      setDraft((data.expenses_preview || []).map((x) => ({
        amount: x.amount,
        currency: x.currency,
        description: x.description,
        category: x.category,
        expense_date: x.expense_date,
      })))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function updateRow(idx, patch) {
    setDraft((prev) => prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)))
  }

  async function onSave() {
    if (!result?.receipt_path) return
    setError(null)
    setSaving(true)
    try {
      const payload = {
        receipt_path: result.receipt_path,
        expenses: draft.map((e) => ({
          amount: Number(e.amount),
          currency: String(e.currency || 'CAD').toUpperCase(),
          description: String(e.description || '').trim(),
          category: String(e.category || 'OTHER').trim(),
          expense_date: e.expense_date || null,
        })),
      }

      const data = await apiFetch('/receipts/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setSaved(data)
      
      setTimeout(() => {
        setResult(null)
        setDraft([])
        setSaved(null)
        setFile(null)
        setError(null)
      }, 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function onDiscard() {
    const confirmed = window.confirm('¿Está seguro que no quiere procesar estos cargos?')
    if (confirmed) {
      setResult(null)
      setDraft([])
      setSaved(null)
      setFile(null)
    }
  }

  return (
    <div className="card">
      <h2>Subir recibo</h2>

      <form onSubmit={onSubmit} className="form">
        <label className="label">
          Imagen
          <input
            className="input"
            type="file"
            accept="image/jpeg,image/png"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>

        {error ? <div className="error">{error}</div> : null}

        <button className="button" disabled={loading || result !== null} type="submit">
          {loading ? 'Procesando...' : 'Procesar recibo'}
        </button>
      </form>

      {result ? (
        <div className="section">
          <div>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 style={{ margin: 0 }}>Preview de gastos (editable)</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="button" onClick={onDiscard} style={{ backgroundColor: '#dc2626' }}>
                  Descartar
                </button>
                <button className="button" onClick={onSave} disabled={saving || !draft.length}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
              <div className="tableWrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Descripción</th>
                      <th>Categoría</th>
                      <th>Monto</th>
                      <th>Moneda</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draft.map((e, idx) => (
                      <tr key={idx}>
                        <td>
                          <input
                            className="input"
                            value={e.description}
                            onChange={(ev) => updateRow(idx, { description: ev.target.value })}
                          />
                        </td>
                        <td>
                          <input
                            className="input"
                            value={e.category}
                            onChange={(ev) => updateRow(idx, { category: ev.target.value })}
                          />
                        </td>
                        <td>
                          <input
                            className="input"
                            type="number"
                            step="0.01"
                            value={e.amount}
                            onChange={(ev) => updateRow(idx, { amount: ev.target.value })}
                          />
                        </td>
                        <td>
                          <select
                            className="input"
                            value={e.currency}
                            onChange={(ev) => updateRow(idx, { currency: ev.target.value })}
                            style={{ width: '90px' }}
                          >
                            <option value="CAD">CAD</option>
                            <option value="COP">COP</option>
                            <option value="USD">USD</option>
                          </select>
                        </td>
                        <td>
                          <input
                            className="input"
                            type="text"
                            placeholder="DD/MM/YYYY"
                            maxLength="10"
                            value={e.expense_date_display !== undefined ? e.expense_date_display : toDisplayDate(e.expense_date)}
                            onChange={(ev) => {
                              const formatted = formatDateInput(ev.target.value)
                              updateRow(idx, { expense_date_display: formatted, expense_date: undefined })
                            }}
                            onBlur={(ev) => {
                              const value = ev.target.value.trim()
                              if (!value) {
                                updateRow(idx, { expense_date: null, expense_date_display: undefined })
                                return
                              }
                              
                              if (isValidDate(value)) {
                                const iso = toISODate(value)
                                updateRow(idx, { expense_date: iso, expense_date_display: undefined })
                              } else {
                                alert('Fecha inválida. Use formato DD/MM/YYYY')
                                updateRow(idx, { expense_date_display: '' })
                              }
                            }}
                            style={{ 
                              width: '120px',
                              borderColor: e.expense_date_display && !isValidDate(e.expense_date_display) ? '#ff4444' : undefined
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            {saved ? (
              <div style={{ marginTop: '12px' }}>
                <div className="muted">Guardado OK. Se crearon {saved.expenses_created?.length || 0} gastos.</div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
