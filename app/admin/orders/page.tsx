"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { AdminTopbar } from "@/components/admin/AdminTopbar"
import { OrderGrid } from "@/components/admin/orders/OrderGrid"
import { OrderDateFilter } from "@/components/admin/orders/OrderDateFilter"
import { getOrdersByDate } from "@/lib/api/client/orders"
import { getEasternDateString, getTodayEasternDateString } from "@/lib/utils/date-utils"
import type { Order } from "@/types/order"

// 动态导入 socket.io-client
import { io, Socket } from 'socket.io-client'

export default function AdminOrdersPage() {
  // Initialize with today's date in Eastern Time
  const [selectedDate, setSelectedDate] = useState(() => getTodayEasternDateString())
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Socket.IO state
  const [socketConnected, setSocketConnected] = useState(false)
  const [socketError, setSocketError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)
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

  // Socket.IO connection management
  const connectSocket = useCallback(() => {
    try {
      // Clean up existing connection
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }

      // Socket.IO server URL configuration
      const getSocketUrl = () => {
        // 优先使用环境变量
        if (process.env.NEXT_PUBLIC_SOCKET_SERVER_URL) {
          return process.env.NEXT_PUBLIC_SOCKET_SERVER_URL
        }
        
        // 开发环境
        if (process.env.NODE_ENV === 'development') {
          return 'http://localhost:3001'
        }
        
        // 生产环境 - 使用 Render 部署的 URL
        return 'https://restaurant-socket-server.onrender.com'
      }
      
      const socketUrl = getSocketUrl()
      
      console.log('🔌 Connecting to Socket.IO server:')
      console.log('- URL:', socketUrl)
      console.log('- Environment:', process.env.NODE_ENV)
      
      const socket = io(socketUrl, {
        transports: ['polling', 'websocket'], // 先使用 polling，然后升级到 websocket
        timeout: 20000, // 增加超时时间
        forceNew: true,
        autoConnect: true,
        // 重连配置
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10
      })
      
      socket.on('connect', () => {
        console.log('🔌 Socket.IO connected successfully')
        console.log('- Socket ID:', socket.id)
        console.log('- Transport:', socket.io.engine.transport.name)
        setSocketConnected(true)
        setSocketError(null)
        
        // Subscribe to order updates for the selected date
        console.log('📡 Subscribing to orders for date:', selectedDate)
        socket.emit('subscribe-orders', { date: selectedDate })
      })

      socket.on('subscription-confirmed', (data) => {
        console.log('✅ Subscription confirmed:', data)
      })

      socket.on('order-update', (data) => {
        console.log('📨 Received order update:', data)
        
        const { type, data: updateData } = data
        
        // Only process messages for the currently selected date
        if (updateData.date && updateData.date !== selectedDate) {
          console.log('🚫 Ignoring update for different date:', updateData.date)
          return
        }

        switch (type) {
          case 'ORDER_CREATED':
            if (updateData.order) {
              setOrders(prevOrders => [...prevOrders, updateData.order])
              console.log('➕ New order added via Socket.IO:', updateData.order.orderNumber)
            }
            break
            
          case 'ORDER_UPDATED':
            if (updateData.order) {
              setOrders(prevOrders => 
                prevOrders.map(order => 
                  order.id === updateData.order.id ? updateData.order : order
                )
              )
              console.log('✏️ Order updated via Socket.IO:', updateData.order.orderNumber)
            }
            break
            
          case 'ORDER_DELETED':
            if (updateData.orderId) {
              setOrders(prevOrders => 
                prevOrders.filter(order => order.id !== updateData.orderId)
              )
              console.log('🗑️ Order deleted via Socket.IO:', updateData.orderId)
            }
            break
        }
      })

      socket.on('disconnect', (reason) => {
        console.log('🔌 Socket.IO disconnected:', reason)
        setSocketConnected(false)
        
        if (reason === 'io server disconnect') {
          // The disconnection was initiated by the server, reconnect manually
          setSocketError('Server disconnected. Reconnecting...')
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Attempting to reconnect...')
            connectSocket()
          }, 3000)
        } else {
          // The disconnection was initiated by the client or network issues
          setSocketError('Connection lost. Reconnecting...')
        }
      })

      socket.on('connect_error', (error) => {
        console.error('❌ Socket.IO connection error:', error)
        console.error('- Error message:', error.message)
        console.error('- Socket URL:', socketUrl)
        
        let errorMessage = 'Connection error'
        if (error.message.includes('CORS')) {
          errorMessage = 'CORS error - check server configuration'
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Connection timeout - server may be starting up'
        } else if (error.message.includes('refused')) {
          errorMessage = 'Connection refused - server may be offline'
        }
        
        setSocketError(`${errorMessage}: ${error.message}`)
      })

      socket.on('error', (error) => {
        console.error('❌ Socket.IO error:', error)
        setSocketError(`Socket error: ${error}`)
      })

      // 监听传输升级
      socket.io.engine.on('upgrade', () => {
        console.log('📈 Socket.IO upgraded to websocket')
      })
      

      socketRef.current = socket
      
    } catch (err) {
      console.error('❌ Failed to create Socket.IO connection:', err)
      setSocketError('Failed to establish Socket.IO connection: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }, [selectedDate])

  // Initialize Socket.IO connection
  useEffect(() => {
    connectSocket()
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [connectSocket])

  // Update Socket.IO subscription when date changes
  useEffect(() => {
    if (socketRef.current?.connected) {
      console.log('📅 Updating subscription to date:', selectedDate)
      socketRef.current.emit('update-subscription', { date: selectedDate })
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
                
                {/* Socket.IO status indicator */}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    socketConnected ? 'bg-green-500' : 'bg-red-500'
                  } animate-pulse`} />
                  <span className="text-xs text-gray-500">
                    {socketConnected ? 'Live' : socketError || 'Disconnected'}
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