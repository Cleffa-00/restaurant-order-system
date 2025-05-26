// Helper function to check if two dates are the same day in Eastern Time
export function isSameDay(dateA: Date | string, dateB: Date | string): boolean {
  const a = new Date(dateA)
  const b = new Date(dateB)

  // Convert to Eastern Time for comparison
  const aEastern = new Date(a.toLocaleString("en-US", { timeZone: "America/New_York" }))
  const bEastern = new Date(b.toLocaleString("en-US", { timeZone: "America/New_York" }))

  return (
    aEastern.getFullYear() === bEastern.getFullYear() &&
    aEastern.getMonth() === bEastern.getMonth() &&
    aEastern.getDate() === bEastern.getDate()
  )
}

// Helper function to get date string in Eastern Time (yyyy-mm-dd format)
export function getEasternDateString(date: Date | string): string {
  const d = new Date(date)
  // Convert to Eastern Time
  const easternDate = new Date(d.toLocaleString("en-US", { timeZone: "America/New_York" }))

  const year = easternDate.getFullYear()
  const month = String(easternDate.getMonth() + 1).padStart(2, "0")
  const day = String(easternDate.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

// Helper function to get today's date in Eastern Time as yyyy-mm-dd string
export function getTodayEasternDateString(): string {
  const now = new Date()
  return getEasternDateString(now)
}

// Helper function to get yesterday's date in Eastern Time
export function getYesterdayEasternDateString(): string {
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  return getEasternDateString(yesterday)
}

// Helper function to format date for display with actual date
export function formatDateForDisplay(dateString: string): string {
  const todayEastern = getTodayEasternDateString()
  const yesterdayEastern = getYesterdayEasternDateString()

  if (dateString === todayEastern) {
    // Parse the date to show actual date alongside "Today"
    const date = new Date(dateString + "T00:00:00")
    const monthDay = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
    return `Today (${monthDay})`
  } else if (dateString === yesterdayEastern) {
    // Parse the date to show actual date alongside "Yesterday"
    const date = new Date(dateString + "T00:00:00")
    const monthDay = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
    return `Yesterday (${monthDay})`
  } else {
    // Display the actual date
    const date = new Date(dateString + "T00:00:00")
    const currentYear = new Date().getFullYear()

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== currentYear ? "numeric" : undefined,
    })
  }
}

// Helper function to format time for order cards (Eastern Time, precise to minutes)
export function formatOrderTime(dateString: string): string {
  const date = new Date(dateString)

  // Format in Eastern Time, precise to minutes
  return date
    .toLocaleString("en-US", {
      timeZone: "America/New_York",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(",", "")
}
