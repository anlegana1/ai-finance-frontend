export function formatDate(dateStr) {
  if (!dateStr) return ''
  
  // Parse YYYY-MM-DD without timezone conversion
  const [year, month, day] = dateStr.split('-').map(Number)
  if (year && month && day) {
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
  }
  
  // Fallback for other formats
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = date.getFullYear()
  
  return `${d}/${m}/${y}`
}

export function toISODate(dateStr) {
  if (!dateStr) return ''
  return dateStr
}
