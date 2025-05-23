import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Your Cart | Restaurant Ordering System',
  description: 'View and modify your food order',
}

export default function CartPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* This would be a real cart items list in a complete app */}
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex flex-col sm:flex-row justify-between border-b pb-4">
                  <div className="flex mb-4 sm:mb-0">
                    <div className="w-16 h-16 bg-gray-200 rounded-md mr-4 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-semibold text-lg">Menu Item {index + 1}</h3>
                      <p className="text-gray-600 text-sm">Extra cheese, Spicy sauce</p>
                      <div className="flex items-center mt-2">
                        <button className="w-6 h-6 rounded-full bg-pink-100 text-pink-800 flex items-center justify-center text-sm">-</button>
                        <span className="mx-2 font-medium">2</span>
                        <button className="w-6 h-6 rounded-full bg-pink-100 text-pink-800 flex items-center justify-center text-sm">+</button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <span className="text-pink-600 font-bold">$24.99</span>
                    <button className="text-sm text-gray-500 hover:text-red-500 transition-colors">Remove</button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between mt-6">
              <Link 
                href="/menu" 
                className="text-pink-600 hover:text-pink-800 font-medium flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Add more items
              </Link>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>$64.97</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>$5.85</span>
              </div>
            </div>
            
            <div className="border-t border-b py-4 mb-4">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-pink-600">$70.82</span>
              </div>
            </div>
            
            <Link
              href="/checkout"
              className="w-full block text-center bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 