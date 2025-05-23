'use client'

import { useState } from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Revenue Analytics | Admin Dashboard',
  description: 'Track and analyze restaurant revenue',
}

interface RevenueData {
  date: string
  amount: number
}

interface CategoryData {
  name: string
  amount: number
  percentage: number
}

export default function AdminRevenuePage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week')
  
  // This would be fetched from an API in a real app
  const revenueData: RevenueData[] = [
    { date: 'Mon', amount: 1250 },
    { date: 'Tue', amount: 1400 },
    { date: 'Wed', amount: 1800 },
    { date: 'Thu', amount: 2100 },
    { date: 'Fri', amount: 2400 },
    { date: 'Sat', amount: 1900 },
    { date: 'Sun', amount: 1600 },
  ]
  
  const categoryData: CategoryData[] = [
    { name: 'Main Dishes', amount: 5200, percentage: 42 },
    { name: 'Appetizers', amount: 2800, percentage: 23 },
    { name: 'Beverages', amount: 2300, percentage: 19 },
    { name: 'Desserts', amount: 1950, percentage: 16 },
  ]
  
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0)
  const averageOrderValue = 27.50
  const orderCount = 465
  
  const maxAmount = Math.max(...revenueData.map(item => item.amount))

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Revenue Analytics</h1>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              timeRange === 'week'
                ? 'bg-pink-100 text-pink-800'
                : 'bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              timeRange === 'month'
                ? 'bg-pink-100 text-pink-800'
                : 'bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              timeRange === 'year'
                ? 'bg-pink-100 text-pink-800'
                : 'bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            This Year
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-1">Total Revenue</h2>
          <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
          <div className="mt-2 text-sm text-green-600 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span>12.5% from last {timeRange}</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-1">Order Count</h2>
          <p className="text-2xl font-bold text-gray-900">{orderCount}</p>
          <div className="mt-2 text-sm text-green-600 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span>8.2% from last {timeRange}</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-1">Average Order Value</h2>
          <p className="text-2xl font-bold text-gray-900">${averageOrderValue.toFixed(2)}</p>
          <div className="mt-2 text-sm text-green-600 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span>3.7% from last {timeRange}</span>
          </div>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h2>
        
        <div className="h-64">
          <div className="flex h-full items-end space-x-2">
            {revenueData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-pink-200 rounded-t-sm" 
                  style={{ 
                    height: `${(item.amount / maxAmount) * 100}%`,
                    minHeight: '1%',
                  }}
                ></div>
                <div className="text-xs text-gray-500 mt-2">{item.date}</div>
                <div className="text-xs font-medium">${item.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Revenue by Category</h2>
        
        <div className="space-y-4">
          {categoryData.map((category, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
                <span className="text-sm text-gray-500">${category.amount} ({category.percentage}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-pink-400 h-2.5 rounded-full" 
                  style={{ width: `${category.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 