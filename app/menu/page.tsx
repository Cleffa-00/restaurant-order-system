import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Menu | Restaurant Ordering System',
  description: 'Browse our delicious menu items',
}

export default function MenuPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Our Menu</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Menu categories will be displayed here */}
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
            <h2 className="text-xl font-semibold mb-4 text-pink-600">Categories</h2>
            <ul className="space-y-2">
              <li className="px-3 py-2 bg-pink-50 rounded-md text-pink-700 font-medium">All Items</li>
              <li className="px-3 py-2 hover:bg-pink-50 rounded-md transition-colors">Appetizers</li>
              <li className="px-3 py-2 hover:bg-pink-50 rounded-md transition-colors">Main Dishes</li>
              <li className="px-3 py-2 hover:bg-pink-50 rounded-md transition-colors">Desserts</li>
              <li className="px-3 py-2 hover:bg-pink-50 rounded-md transition-colors">Beverages</li>
            </ul>
          </div>
        </div>

        {/* Menu items will be displayed here */}
        <div className="col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* This is a placeholder for menu items that will come from the database */}
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">Menu Item {index + 1}</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Delicious description of this amazing dish that will make your mouth water.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-600 font-bold">$12.99</span>
                    <button className="bg-pink-100 hover:bg-pink-200 text-pink-800 font-medium px-4 py-2 rounded-full transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 