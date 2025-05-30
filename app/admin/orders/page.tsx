"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { AdminTopbar } from "@/components/admin/AdminTopbar"
import { OrderGrid } from "@/components/admin/orders/OrderGrid"
import { OrderDateFilter } from "@/components/admin/orders/OrderDateFilter"
import { getOrdersByDate } from "@/lib/api/client/orders"
import { getEasternDateString, getTodayEasternDateString } from "@/lib/utils/date-utils"
import type { Order } from "@/types/order"

// WebSocket message types
interface WebSocketMessage {
  type: 'ORDER_CREATED' | 'ORDER_UPDATED' | 'ORDER_DELETED' | 'CONNECTION_STATUS'
  data: {
    order?: Order
    orderId?: string
    date?: string
    message?: string
  }
}

export default function AdminOrdersPage() {
  // Initialize with today's date in Eastern Time
  const [selectedDate, setSelectedDate] = useState(() => getTodayEasternDateString())
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // WebSocket state
  const [wsConnected, setWsConnected] = useState(false)
  const [wsError, setWsError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Extract fetchOrders function so it can be called directly
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Fetching orders for date:', selectedDate)
      
      const fetchedOrders = await getOrdersByDate(selectedDate)
      
      console.log('✅ Orders fetched successfully:', fetchedOrders.length)
      setOrders(fetchedOrders)
      
    } catch (err) {
      console.error('❌ Failed to fetch orders:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    try {
      // Replace with your WebSocket URL
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/orders'
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        console.log('🔌 WebSocket connected')
        setWsConnected(true)
        setWsError(null)
        
        // Subscribe to order updates for the selected date
        ws.send(JSON.stringify({
          type: 'SUBSCRIBE_ORDERS',
          data: { date: selectedDate }
        }))
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          console.log('📨 WebSocket message:', message)
          
          // Only process messages for the currently selected date
          if (message.data.date && message.data.date !== selectedDate) {
            return
          }

          switch (message.type) {
            case 'ORDER_CREATED':
              if (message.data.order) {
                setOrders(prevOrders => [...prevOrders, message.data.order!])
                console.log('➕ New order added via WebSocket')
              }
              break
              
            case 'ORDER_UPDATED':
              if (message.data.order) {
                setOrders(prevOrders => 
                  prevOrders.map(order => 
                    order.id === message.data.order!.id ? message.data.order! : order
                  )
                )
                console.log('✏️ Order updated via WebSocket')
              }
              break
              
            case 'ORDER_DELETED':
              if (message.data.orderId) {
                setOrders(prevOrders => 
                  prevOrders.filter(order => order.id !== message.data.orderId)
                )
                console.log('🗑️ Order deleted via WebSocket')
              }
              break
              
            case 'CONNECTION_STATUS':
              console.log('📡 Connection status:', message.data.message)
              break
          }
        } catch (err) {
          console.error('❌ Failed to parse WebSocket message:', err)
        }
      }

      ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason)
        setWsConnected(false)
        
        // Attempt to reconnect after 3 seconds if not a manual close
        if (event.code !== 1000) {
          setWsError('Connection lost. Reconnecting...')
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Attempting to reconnect...')
            connectWebSocket()
          }, 3000)
        }
      }

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        setWsError('WebSocket connection error')
      }

      wsRef.current = ws
      
    } catch (err) {
      console.error('❌ Failed to connect WebSocket:', err)
      setWsError('Failed to establish WebSocket connection')
    }
  }, [selectedDate])

  // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket()
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting')
      }
    }
  }, [connectWebSocket])

  // Update WebSocket subscription when date changes
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'SUBSCRIBE_ORDERS',
        data: { date: selectedDate }
      }))
    }
  }, [selectedDate])

  // Fetch orders when date changes
  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
  }

  // Handle order updates from the modal
  const handleOrderUpdate = (updatedOrder: Order) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === updatedOrder.id ? updatedOrder : order
      )
    )
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
          {/* Show selected date info and status */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-600">
                  {loading ? (
                    'Loading orders...'
                  ) : error ? (
                    <span className="text-red-600">
                      {error}
                      {process.env.NODE_ENV === 'development' && ' (using mock data)'}
                    </span>
                  ) : (
                    `Showing ${orders.length} orders for ${displayDate} (Eastern Time)`
                  )}
                </p>
                
                {/* WebSocket status indicator */}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    wsConnected ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-xs text-gray-500">
                    {wsConnected ? 'Live' : wsError || 'Disconnected'}
                  </span>
                </div>
              </div>
              
              {/* Refresh button */}
              <button
                onClick={fetchOrders}
                disabled={loading}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Error state */}
          {error && !loading && orders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Failed to load orders
              </div>
              <p className="text-gray-500 text-sm mb-4">{error}</p>
              <button
                onClick={fetchOrders}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Order Grid - only show when not loading */}
          {!loading && (
            <OrderGrid orders={orders} onOrderUpdate={handleOrderUpdate} />
          )}
        </div>
      </div>
    </div>
  )
}