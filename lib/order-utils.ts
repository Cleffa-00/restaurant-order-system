/**
 * Generate order number in RYYMMDD-XXXX format
 * @returns Order number string (e.g., "R250524-1831")
 */
export function generateOrderNumber(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2) // Last 2 digits of year
  const month = (now.getMonth() + 1).toString().padStart(2, "0") // Month with leading zero
  const day = now.getDate().toString().padStart(2, "0") // Day with leading zero
  const randomNum = Math.floor(1000 + Math.random() * 9000) // 4-digit random number

  return `R${year}${month}${day}-${randomNum}`
}

/**
 * Calculate order pricing breakdown
 * @param subtotal - Order subtotal amount
 * @returns Object with taxes, serviceFee, and total
 */
export function calculateOrderPricing(subtotal: number) {
  const taxRate = 0.0875 // 8.75%
  const taxes = Math.round(subtotal * taxRate * 100) / 100 // Round to 2 decimal places
  const serviceFee = Math.round(Math.min(subtotal * 0.05, 0.5) * 100) / 100 // Service fee with cap
  const total = subtotal + taxes + serviceFee

  return { taxes, serviceFee, total }
}
