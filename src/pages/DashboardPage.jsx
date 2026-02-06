import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import ReceiptUpload from '../components/ReceiptUpload'
import ExpensesTabs from '../components/ExpensesTabs'
import { useLanguage, useT } from '../lib/i18n.jsx'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('receipt')
  const { lang, setLang } = useLanguage()
  const t = useT()

  const nextLang = lang === 'en' ? 'es' : 'en'

  async function logout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="container wide">
      <div className="topbar">
        <div>
          <h1 style={{ margin: 0 }}>{t('app_title')}</h1>
          <div className="muted">{t('app_subtitle')}</div>
        </div>
        <div className="row">
          <button className="tab" onClick={() => setTab('receipt')}>
            {t('tab_upload_receipt')}
          </button>
          <button className={tab === 'expenses' ? 'tab active' : 'tab'} onClick={() => setTab('expenses')}>
            {t('tab_expenses')}
          </button>
          <button className="tab" onClick={() => setLang(nextLang)} type="button" aria-label={`Switch language to ${nextLang}`}>
            EN/ES
          </button>
          <button className="button secondary" onClick={logout}>
            {t('action_logout')}
          </button>
        </div>
      </div>

      {tab === 'receipt' ? <ReceiptUpload /> : <ExpensesTabs />}
    </div>
  )
}
