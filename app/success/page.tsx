import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order Successful | Restaurant Ordering System',
  description: 'Your order has been successfully placed',
}

export default function SuccessPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Order Successful!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your order. We've received your payment and are preparing your delicious meal.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-medium">#ORD12345</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Estimated Time:</span>
            <span className="font-medium">30-45 minutes</span>
          </div>
        </div>
        
        <Link
          href="/menu"
          className="block w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 rounded-lg transition-colors"
        >
          Back to Menu
        </Link>
      </div>
    </div>
  )
} 