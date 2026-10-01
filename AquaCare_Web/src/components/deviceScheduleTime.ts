/** Calculate an off time from the chosen on time, or from the user's local clock. */
export function scheduleAfterMinutes(onTime: string, durationMinutes: number, now = new Date()) {
  const startTime = onTime || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const [hours, minutes] = startTime.split(':').map(Number)
  const endMinutes = (hours * 60 + minutes + durationMinutes) % (24 * 60)
  const offTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`
  return { onTime: startTime, offTime }
}
