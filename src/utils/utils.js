// Función auxiliar para formatear la hora
export const formatTime = (date) => {
  if (!date) return '00:00:00'
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}