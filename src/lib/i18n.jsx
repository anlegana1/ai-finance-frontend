import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'ai_finance_lang'

const translations = {
  en: {
    app_title: 'AI Finance',
    app_subtitle: 'Receipts and expenses',
    tab_upload_receipt: 'Home',
    tab_expenses: 'Expenses',
    action_logout: 'Logout',

    login_title: 'Login',
    login_subtitle: 'Sign in to upload receipts and view your expenses.',
    login_email: 'Email',
    login_password: 'Password',
    login_button: 'Sign in',
    login_loading: 'Signing in...',
    session_checking: 'Checking session...',

    receipt_upload_title: 'Upload receipt',
    receipt_upload_image_label: 'Image',
    receipt_upload_select_image_error: 'Select an image (JPG/PNG).',
    receipt_upload_process: 'Process receipt',
    receipt_upload_processing: 'Processing...',

    receipt_preview_title: 'Expenses preview (editable)',
    receipt_discard: 'Discard',
    receipt_save: 'Save',
    receipt_saving: 'Saving...',
    receipt_discard_confirm: 'Are you sure you do not want to process these charges?',
    receipt_saved_ok: 'Saved OK. Created {count} expenses.',
    receipt_invalid_date: 'Invalid date. Use DD/MM/YYYY',

    expenses_title: 'Expenses',
    expenses_refresh: 'Refresh',
    expenses_loading: 'Loading...',
    expenses_period_day: 'Day',
    expenses_period_week: 'Week',
    expenses_period_month: 'Month',
    expenses_total: 'Total: {total}',

    table_date: 'Date',
    table_description: 'Description',
    table_category: 'Category',
    table_amount: 'Amount',
    table_currency: 'Currency',
    table_actions: 'Actions',
    action_duplicate: 'Duplicate',
    action_delete: 'Delete',
  },
  es: {
    app_title: 'AI Finance',
    app_subtitle: 'Recibos y gastos',
    tab_upload_receipt: 'Inicio',
    tab_expenses: 'Gastos',
    action_logout: 'Salir',

    login_title: 'Login',
    login_subtitle: 'Inicia sesión para subir recibos y ver tus gastos.',
    login_email: 'Email',
    login_password: 'Password',
    login_button: 'Entrar',
    login_loading: 'Entrando...',
    session_checking: 'Verificando sesión...',

    receipt_upload_title: 'Subir recibo',
    receipt_upload_image_label: 'Imagen',
    receipt_upload_select_image_error: 'Selecciona una imagen (JPG/PNG).',
    receipt_upload_process: 'Procesar recibo',
    receipt_upload_processing: 'Procesando...',

    receipt_preview_title: 'Preview de gastos (editable)',
    receipt_discard: 'Descartar',
    receipt_save: 'Guardar',
    receipt_saving: 'Guardando...',
    receipt_discard_confirm: '¿Está seguro que no quiere procesar estos cargos?',
    receipt_saved_ok: 'Guardado OK. Se crearon {count} gastos.',
    receipt_invalid_date: 'Fecha inválida. Use formato DD/MM/YYYY',

    expenses_title: 'Gastos',
    expenses_refresh: 'Refrescar',
    expenses_loading: 'Cargando...',
    expenses_period_day: 'Día',
    expenses_period_week: 'Semana',
    expenses_period_month: 'Mes',
    expenses_total: 'Total: {total}',

    table_date: 'Fecha',
    table_description: 'Descripción',
    table_category: 'Categoría',
    table_amount: 'Monto',
    table_currency: 'Moneda',
    table_actions: 'Acciones',
    action_duplicate: 'Duplicar',
    action_delete: 'Eliminar',
  },
}

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
})

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('en')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved && (saved === 'en' || saved === 'es')) {
        setLangState(saved)
      }
    } catch {
      // ignore
    }
  }, [])

  const setLang = useCallback((next) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }, [])

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  return useContext(LanguageContext)
}

export function useT() {
  const { lang } = useLanguage()

  return useCallback(
    (key, vars) => {
      const dict = translations[lang] || translations.en
      const fallback = translations.en
      let s = dict[key] ?? fallback[key] ?? key

      if (vars && typeof s === 'string') {
        for (const [k, v] of Object.entries(vars)) {
          s = s.replaceAll(`{${k}}`, String(v))
        }
      }

      return s
    },
    [lang],
  )
}
