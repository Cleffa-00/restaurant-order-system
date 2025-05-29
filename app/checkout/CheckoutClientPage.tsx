"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { CartHeader } from "@/components/cart/cart-header"
import { CartTutorial } from "@/components/cart/cart-tutorial"
import { CartItemList } from "@/components/cart/cart-item-list"
import { OrderNoteInput } from "@/components/cart/order-note-input"
import { CartSummary } from "@/components/cart/cart-summary"
import { EmptyCartNotice } from "@/components/cart/empty-cart-notice"
import { CartApiService } from "@/lib/api/cart"
import { useIsMobile } from "@/hooks/use-mobile"
import { ErrorModal } from "@/components/ui/error-modal"
// 导入订单相关的类型定义
import type { CreateOrderRequest, Order } from '@/types/order'

interface SwipeState {
  startX: number
  startY: number
  currentX: number
  isDragging: boolean
  isSwipeMode: boolean
  itemId: string | null
}

export default function CartClientPage() {
  const router = useRouter()
  const { 
    items: cartItems, 
    removeItem, 
    getCartSummary,
    getTotalQuantity,
    createOrderData,
    isSubmittingOrder,
    setIsSubmittingOrder 
  } = useCart()
  
  const [customerNote, setCustomerNote] = useState("")
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    details?: string
    showRetry: boolean
  }>({
    isOpen: false,
    title: "",
    message: "",
    details: "",
    showRetry: false
  })
  const [swipeState, setSwipeState] = useState<SwipeState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    isDragging: false,
    isSwipeMode: false,
    itemId: null,
  })
  const [swipedItemId, setSwipedItemId] = useState<string | null>(null)
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set())
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)
  const [showSummary, setShowSummary] = useState(cartItems.length > 0)
  const [isMobile, setIsMobile] = useState(false)
  const demoTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 获取购物车摘要
  const cartSummary = getCartSummary()

  // Simplified scroll-based visibility - always show bottom bar when cart has items
  const [isScrollingDown, setIsScrollingDown] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const lastScrollY = useRef(0)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Tutorial states
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialStep, setTutorialStep] = useState<"waiting" | "animating" | "complete">("waiting")

  // Detect if device is mobile/touch-enabled
  useEffect(() => {
    const checkIsMobile = () => {
      const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth < 768
      setIsMobile(isTouchDevice && isSmallScreen)
    }

    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)

    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Auto-demo animation on mobile
  useEffect(() => {
    if (isMobile && cartItems.length > 0) {
      const hasSeenTutorial = localStorage.getItem("cart-swipe-tutorial-seen")
      if (!hasSeenTutorial) {
        setShowTutorial(true)

        demoTimeoutRef.current = setTimeout(() => {
          setTutorialStep("animating")
          setSwipedItemId(cartItems[0].id)

          setTimeout(() => {
            setSwipedItemId(null)
            setTutorialStep("complete")

            setTimeout(() => {
              setShowTutorial(false)
              localStorage.setItem("cart-swipe-tutorial-seen", "true")
            }, 500)
          }, 3000)
        }, 1000)
      }
    }

    return () => {
      if (demoTimeoutRef.current) {
        clearTimeout(demoTimeoutRef.current)
      }
    }
  }, [cartItems.length, isMobile])

  // Simplified scroll direction detection
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollThreshold = 50

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      if (Math.abs(currentScrollY - lastScrollY.current) > scrollThreshold) {
        const scrollingDown = currentScrollY > lastScrollY.current && currentScrollY > 100
        setIsScrollingDown(scrollingDown)
        setScrollY(currentScrollY)
        lastScrollY.current = currentScrollY
      }

      // Auto-show after stopping scroll
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrollingDown(false)
      }, 1000)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  // Handle smooth animation when cart becomes empty or gets items
  useEffect(() => {
    if (cartItems.length === 0 && showSummary) {
      setIsAnimatingOut(true)
      setTimeout(() => {
        setShowSummary(false)
        setIsAnimatingOut(false)
      }, 300)
    } else if (cartItems.length > 0 && !showSummary) {
      setShowSummary(true)
    }
  }, [cartItems.length, showSummary])

  // Touch event handlers for swipe
  const handleTouchStart = (e: React.TouchEvent, itemId: string) => {
    if (!isMobile || tutorialStep === "animating") return

    const touch = e.touches[0]
    setSwipeState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      isDragging: true,
      isSwipeMode: false,
      itemId,
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !swipeState.isDragging || tutorialStep === "animating") return

    const touch = e.touches[0]
    const deltaX = touch.clientX - swipeState.startX
    const deltaY = touch.clientY - swipeState.startY

    if (!swipeState.isSwipeMode && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setSwipeState((prev) => ({
          ...prev,
          isSwipeMode: true,
        }))
        e.preventDefault()
      } else {
        setSwipeState({
          startX: 0,
          startY: 0,
          currentX: 0,
          isDragging: false,
          isSwipeMode: false,
          itemId: null,
        })
        return
      }
    }

    if (swipeState.isSwipeMode) {
      const clampedDeltaX = Math.max(-120, Math.min(20, deltaX))
      setSwipeState((prev) => ({
        ...prev,
        currentX: swipeState.startX + clampedDeltaX,
      }))

      e.preventDefault()
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile || !swipeState.isDragging || tutorialStep === "animating") return

    if (swipeState.isSwipeMode) {
      const deltaX = swipeState.currentX - swipeState.startX
      const threshold = -60

      if (deltaX < threshold) {
        setSwipedItemId(swipeState.itemId)
      } else {
        setSwipedItemId(null)
      }

      e.preventDefault()
    }

    setSwipeState({
      startX: 0,
      startY: 0,
      currentX: 0,
      isDragging: false,
      isSwipeMode: false,
      itemId: null,
    })
  }

  // Get swipe transform for an item
  const getSwipeTransform = (itemId: string) => {
    if (!isMobile) return "translateX(0)"

    if (showTutorial && tutorialStep === "animating" && itemId === cartItems[0]?.id) {
      return "translateX(-80px)"
    }

    if (swipedItemId === itemId && tutorialStep !== "animating") {
      return "translateX(-80px)"
    }

    if (
      swipeState.isDragging &&
      swipeState.itemId === itemId &&
      swipeState.isSwipeMode &&
      tutorialStep !== "animating"
    ) {
      const deltaX = swipeState.currentX - swipeState.startX
      const clampedDeltaX = Math.max(-80, Math.min(0, deltaX))
      return `translateX(${clampedDeltaX}px)`
    }

    return "translateX(0)"
  }

  // Remove item from cart with animation
  const handleRemoveItem = (itemId: string) => {
    setDeletingItems((prev) => new Set([...prev, itemId]))
    setSwipedItemId(null)

    setTimeout(() => {
      removeItem(itemId)
      setDeletingItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }, 300)
  }

  // Handle checkout - 现在直接在这里处理订单创建
  const handleCheckout = async () => {
    // 清除之前的错误
    setErrorModal({ isOpen: false, title: "", message: "", showRetry: false })
    
    // 如果你想跳转到单独的 checkout 页面，使用这行代码：
    // router.push("/checkout")
    
    // 否则，直接在这里处理订单创建：
    await handleQuickCheckout()
  }

  // 快速结账（带详细错误处理）
  const handleQuickCheckout = async () => {
    try {
      setIsSubmittingOrder(true)
      setErrorModal({ isOpen: false, title: "", message: "", showRetry: false })
      
      // 收集用户信息（这里需要你实际的用户信息收集逻辑）
      const customerInfo = {
        phone: "1234567890", // 这里应该从表单获取
        name: "Test User",   // 这里应该从表单获取
        customerNote: customerNote
      }
      
      // 直接构建订单数据，不依赖 createOrderData 函数
      const orderData: CreateOrderRequest = {
        phone: customerInfo.phone,
        name: customerInfo.name,
        customerNote: customerInfo.customerNote,
        orderSource: 'web',
        subtotal: cartSummary.subtotal,
        taxAmount: cartSummary.taxAmount,
        serviceFee: cartSummary.serviceFee,
        total: cartSummary.total,
        items: cartItems.map(cartItem => ({
          menuItemId: cartItem.menuItemId,
          quantity: cartItem.quantity,
          note: cartItem.specialInstructions || '',
          unitPrice: cartItem.price,
          finalPrice: cartItem.price * cartItem.quantity + (cartItem.options || []).reduce((sum, opt) => sum + (opt.priceDelta * opt.quantity * cartItem.quantity), 0),
          options: (cartItem.options || []).map(option => ({
            menuOptionId: option.optionId,
            quantity: option.quantity,
            priceDelta: option.priceDelta,
            optionNameSnapshot: option.optionName,
            groupNameSnapshot: option.groupName
          }))
        }))
      }
      
      // 本地验证（调试用）
      const validation = CartApiService.validateOrderData(orderData)
      if (!validation.isValid) {
        setErrorModal({
          isOpen: true,
          title: "Invalid Order Data",
          message: "Please check your order and try again.",
          details: validation.errors.join('\n'),
          showRetry: true
        })
        return
      }
      
      const result = await CartApiService.createOrder(orderData)
      
      if (result.success && result.data) {
        // 清空购物车
        cartItems.forEach(item => removeItem(item.id))
        // 跳转到确认页面
        router.push(`/order-confirmation/${result.data.orderNumber}`)
      } else {
        // 解析错误信息
        let title = "Order Failed"
        let message = result.error || 'Failed to create order'
        let details = ""
        let showRetry = true
        
        // 根据错误类型设置不同的提示
        if (result.details?.networkError) {
          title = "Connection Error"
          message = "Unable to connect to the server. Please check your internet connection and try again."
          showRetry = true
        } else if (result.details?.code === 'VALIDATION_ERROR') {
          title = "Order Validation Failed"
          message = "There's an issue with your order details:"
          // 优先使用 errors 数组，如果没有就使用原始错误消息
          if (result.details?.errors && Array.isArray(result.details.errors)) {
            details = result.details.errors.join('\n')
          } else {
            details = result.error || "Unknown validation error"
          }
          showRetry = true
        } else if (result.details?.status === 400) {
          title = "Invalid Request"
          message = "Please check your order and try again."
          details = result.error || ""
          showRetry = true
        } else if (result.details?.status >= 500) {
          title = "Server Error"
          message = "We're experiencing technical difficulties. Please try again in a moment."
          showRetry = true
        } else {
          // 通用错误处理
          details = JSON.stringify(result.details, null, 2)
        }
        
        setErrorModal({
          isOpen: true,
          title,
          message,
          details,
          showRetry
        })
      }
    } catch (error) {
      console.error('Unexpected error during checkout:', error)
      setErrorModal({
        isOpen: true,
        title: "Unexpected Error",
        message: "Something went wrong while processing your order.",
        details: error instanceof Error ? error.message : 'Unknown error',
        showRetry: true
      })
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  // Go back to menu - 智能导航
  const goBackToMenu = () => {
    // 检查浏览器历史记录长度和当前页面
    if (typeof window !== 'undefined') {
      // 检查 document.referrer 是否来自本站的合理页面
      const referrer = document.referrer
      const currentOrigin = window.location.origin
      const isFromSameSite = referrer.startsWith(currentOrigin)
      
      // 检查 referrer 是否是菜单页面
      const isFromMenu = referrer.includes('/menu')
      
      // 如果有合理的历史记录且来自本站，使用 back()
      if (window.history.length > 1 && isFromSameSite && (isFromMenu || referrer.includes('/checkout'))) {
        window.history.back()
      } else {
        // 否则直接导航到菜单页面
        router.push('/menu')
      }
    } else {
      // 服务端渲染情况下直接导航到菜单
      router.push('/menu')
    }
  }

  // Reset swipe state when clicking elsewhere
  const resetSwipe = () => {
    if (isMobile && tutorialStep !== "animating") {
      setSwipedItemId(null)
    }
  }

  // Clear error message
  const clearError = () => {
    setErrorModal({ isOpen: false, title: "", message: "", showRetry: false })
  }

  // Determine if checkout bar should be visible - simplified logic
  const shouldShowCheckoutBar = showSummary && !isScrollingDown

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <CartHeader onBack={goBackToMenu} />
        <div className="flex-1 flex items-center justify-center">
          <EmptyCartNotice onBackToMenu={goBackToMenu} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" onClick={resetSwipe}>
      <CartHeader onBack={goBackToMenu} />

      {/* 错误提示模态框 */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={clearError}
        title={errorModal.title}
        message={errorModal.message}
        details={errorModal.details}
        showRetry={errorModal.showRetry}
        onRetry={handleQuickCheckout}
      />

      <CartTutorial isVisible={isMobile && showTutorial} tutorialStep={tutorialStep} />

      <div className={`transition-all duration-300 ease-out ${shouldShowCheckoutBar ? "pb-32" : "pb-6"}`}>
        <CartItemList
          items={cartItems}
          isMobile={isMobile}
          deletingItems={deletingItems}
          swipedItemId={swipedItemId}
          tutorialStep={tutorialStep}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onRemoveItem={handleRemoveItem}
          getSwipeTransform={getSwipeTransform}
        />

        {/* Order Instructions with extra bottom spacing */}
        <OrderNoteInput value={customerNote} onChange={setCustomerNote} />
      </div>

      <CartSummary
        totalPrice={cartSummary.total}
        itemCount={cartSummary.itemCount}
        isVisible={shouldShowCheckoutBar}
        isAnimatingOut={isAnimatingOut}
        onCheckout={handleCheckout}
        isSubmitting={isSubmittingOrder}
      />
    </div>
  )
}