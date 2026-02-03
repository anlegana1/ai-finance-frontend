import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearToken } from '../lib/auth'
import ReceiptUpload from '../components/ReceiptUpload'
import ExpensesTabs from '../components/ExpensesTabs'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('receipt')

  function logout() {
    clearToken()
    navigate('/login', { replace: true })
  }

  return (
    <div className="container wide">
      <div className="topbar">
        <div>
          <h1 style={{ margin: 0 }}>AI Finance</h1>
          <div className="muted">Recibos y gastos</div>
        </div>
        <div className="row">
          <button className={tab === 'receipt' ? 'tab active' : 'tab'} onClick={() => setTab('receipt')}>
            Subir recibo
          </button>
          <button className={tab === 'expenses' ? 'tab active' : 'tab'} onClick={() => setTab('expenses')}>
            Gastos
          </button>
          <button className="button secondary" onClick={logout}>
            Salir
          </button>
        </div>
      </div>

      {tab === 'receipt' ? <ReceiptUpload /> : <ExpensesTabs />}
    </div>
  )
}
