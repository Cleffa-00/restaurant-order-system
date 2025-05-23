'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Modifier {
  id: string
  name: string
  price: number
}

export default function MenuItemModal({
  params,
}: {
  params: { menuItemId: string }
}) {
  const router = useRouter()
  const { menuItemId } = params
  
  // This would come from a database in a real app
  const [quantity, setQuantity] = useState(1)
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([])
  
  // Dummy data (would be fetched from API in a real app)
  const menuItem = {
    id: menuItemId,
    name: 'Delicious Dish',
    description: 'A fantastic dish with amazing flavors and texture.',
    price: 12.99,
    image: '/placeholder.jpg'
  }
  
  const modifiers: Modifier[] = [
    { id: 'mod1', name: 'Extra Cheese', price: 1.50 },
    { id: 'mod2', name: 'Spicy Sauce', price: 0.75 },
    { id: 'mod3', name: 'Gluten-Free Option', price: 2.00 },
  ]

  const handleClose = () => {
    router.back()
  }

  const toggleModifier = (modifierId: string) => {
    setSelectedModifiers(prev => 
      prev.includes(modifierId)
        ? prev.filter(id => id !== modifierId)
        : [...prev, modifierId]
    )
  }

  const calculateTotal = () => {
    const basePrice = menuItem.price * quantity
    const modifiersPrice = selectedModifiers.reduce((total, modId) => {
      const modifier = modifiers.find(m => m.id === modId)
      return total + (modifier?.price || 0)
    }, 0)
    
    return (basePrice + modifiersPrice).toFixed(2)
  }

  const handleAddToCart = () => {
    // Would add to cart in a real app
    router.back()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="relative h-48 bg-gray-200">
          {/* In a real app, this would be a real image */}
          <div className="absolute top-3 right-3">
            <button 
              onClick={handleClose}
              className="bg-white rounded-full p-2 shadow-md"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">{menuItem.name}</h2>
          <p className="text-gray-600 mb-4">{menuItem.description}</p>
          <p className="text-pink-600 font-bold text-xl mb-6">${menuItem.price.toFixed(2)}</p>
          
          {/* Quantity selector */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Quantity</h3>
            <div className="flex items-center space-x-3">
              <button 
                className="w-8 h-8 rounded-full bg-pink-100 text-pink-800 flex items-center justify-center"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              >
                -
              </button>
              <span className="text-lg font-medium">{quantity}</span>
              <button 
                className="w-8 h-8 rounded-full bg-pink-100 text-pink-800 flex items-center justify-center"
                onClick={() => setQuantity(prev => prev + 1)}
              >
                +
              </button>
            </div>
          </div>
          
          {/* Modifiers/add-ons */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Customize</h3>
            <div className="space-y-2">
              {modifiers.map(mod => (
                <div 
                  key={mod.id} 
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:border-pink-300"
                  onClick={() => toggleModifier(mod.id)}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 mr-3 rounded-md border flex items-center justify-center ${
                      selectedModifiers.includes(mod.id) ? 'bg-pink-500 border-pink-500' : 'border-gray-300'
                    }`}>
                      {selectedModifiers.includes(mod.id) && (
                        <span className="text-white text-sm">✓</span>
                      )}
                    </div>
                    <span>{mod.name}</span>
                  </div>
                  <span className="text-gray-600">+${mod.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Total and add to cart */}
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Total:</span>
              <span className="text-xl font-bold text-pink-600">${calculateTotal()}</span>
            </div>
            
            <button 
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 rounded-lg transition-colors"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 