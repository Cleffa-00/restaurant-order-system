"use client"

import { useState, useMemo } from "react"
import { AdminTopbar } from "@/components/admin/AdminTopbar"
import { OrderGrid } from "@/components/admin/orders/OrderGrid"
import { OrderDateFilter } from "@/components/admin/orders/OrderDateFilter"
import { mockOrders } from "@/lib/mock-data/mock-orders"
import { getEasternDateString, getTodayEasternDateString } from "@/lib/utils/date-utils"

export default function AdminOrdersPage() {
  // Initialize with today's date in Eastern Time
  const [selectedDate, setSelectedDate] = useState(() => getTodayEasternDateString())

  // Filter orders by selected date (comparing Eastern Time date strings)
  const filteredOrders = useMemo(() => {
    return mockOrders.filter((order) => {
      const orderEasternDate = getEasternDateString(order.createdAt)
      return orderEasternDate === selectedDate
    })
  }, [selectedDate])

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
  }

  // Format selected date for display in Eastern Time
  const selectedDateObj = new Date(selectedDate + "T00:00:00")
  const displayDate = selectedDateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Unified Admin Topbar */}
      <AdminTopbar rightContent={<OrderDateFilter selectedDate={selectedDate} onDateChange={handleDateChange} />} />

      {/* Main Content with slide-in animation */}
      <div className="animate-in slide-in-from-right-4 duration-300">
        <div className="p-4 sm:p-6">
          {/* Show selected date info */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Showing {filteredOrders.length} orders for {displayDate} (Eastern Time)
            </p>
          </div>

          {/* Order Grid with built-in empty state */}
          <OrderGrid orders={filteredOrders} />
        </div>
      </div>
    </div>
  )
}
