'use client'

import { useState } from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Orders Management | Admin Dashboard',
  description: 'Manage customer orders',
}

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  options?: string[]
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  items: OrderItem[]
  total: number
  createdAt: string
}

export default function AdminOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  
  // This would come from an API in a real app
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'ORD-12345',
      customerName: 'John Smith',
      customerPhone: '(123) 456-7890',
      status: 'pending',
      items: [
        { id: '1', name: 'Classic Burger', quantity: 2, price: 12.99 },
        { id: '2', name: 'French Fries', quantity: 1, price: 4.99, options: ['Extra Salt'] },
      ],
      total: 30.97,
      createdAt: '2023-10-15T14:30:00Z',
    },
    {
      id: '2',
      orderNumber: 'ORD-12346',
      customerName: 'Jane Doe',
      customerPhone: '(234) 567-8901',
      status: 'processing',
      items: [
        { id: '3', name: 'Caesar Salad', quantity: 1, price: 8.99 },
        { id: '4', name: 'Grilled Chicken', quantity: 1, price: 14.99 },
      ],
      total: 23.98,
      createdAt: '2023-10-15T15:45:00Z',
    },
    {
      id: '3',
      orderNumber: 'ORD-12347',
      customerName: 'Bob Johnson',
      customerPhone: '(345) 678-9012',
      status: 'completed',
      items: [
        { id: '5', name: 'Veggie Pizza', quantity: 1, price: 16.99 },
        { id: '6', name: 'Soda', quantity: 2, price: 2.99 },
      ],
      total: 22.97,
      createdAt: '2023-10-15T13:15:00Z',
    },
  ])

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
  }

  const handleCloseDetails = () => {
    setSelectedOrder(null)
  }

  const handleUpdateStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    )
    
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(order => order.status === filterStatus)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        
        <div className="flex items-center">
          <label htmlFor="status-filter" className="mr-2 text-sm font-medium text-gray-700">
            Filter by Status:
          </label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{order.customerName}</div>
                  <div className="text-sm text-gray-500">{order.customerPhone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${order.total.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span 
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleViewDetails(order)}
                    className="text-pink-600 hover:text-pink-900"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order details modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Order Details - {selectedOrder.orderNumber}</h2>
              <button
                onClick={handleCloseDetails}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Customer Information</h3>
                <p className="text-gray-900">{selectedOrder.customerName}</p>
                <p className="text-gray-900">{selectedOrder.customerPhone}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Order Information</h3>
                <p className="text-gray-900">Date: {formatDate(selectedOrder.createdAt)}</p>
                <p className="text-gray-900">
                  Status: 
                  <span 
                    className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedOrder.status === 'completed' ? 'bg-green-100 text-green-800' :
                      selectedOrder.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Order Items</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.name}</div>
                          {item.options && item.options.length > 0 && (
                            <div className="text-xs text-gray-500">
                              {item.options.join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.quantity}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${item.price.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-900">${(item.quantity * item.price).toFixed(2)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                        Total
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        ${selectedOrder.total.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Update Order Status</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'pending')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    selectedOrder.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Pending
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'processing')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    selectedOrder.status === 'processing' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Processing
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    selectedOrder.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Completed
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    selectedOrder.status === 'cancelled' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancelled
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 