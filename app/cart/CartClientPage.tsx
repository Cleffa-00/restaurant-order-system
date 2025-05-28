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
import { formatCurrency } from "@/lib/utils/cart"

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

  // Touch event handlers for swipe (保持原有的触摸事件处理逻辑)
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

  // Handle checkout - 现在支持直接创建订单或跳转到checkout页面
  const handleCheckout = async () => {
    // 方案1: 跳转到 checkout 页面（推荐）
    router.push("/checkout")
    
    // 方案2: 在此处直接创建订单（如果你想要简化流程）
    // await handleQuickCheckout()
  }

  // 快速结账（如果选择直接在购物车页面处理订单）
  const handleQuickCheckout = async () => {
    // 这里可以弹出一个模态框收集用户信息，然后直接创建订单
    // 示例代码：
    /*
    try {
      setIsSubmittingOrder(true)
      
      // 收集用户信息（可以通过模态框或表单）
      const customerInfo = {
        phone: "用户手机号",
        name: "用户姓名",
        customerNote: customerNote
      }
      
      const orderData = createOrderData(customerInfo)
      const result = await CartApiService.createOrder(orderData)
      
      if (result.success) {
        // 订单创建成功，跳转到确认页面
        router.push(`/order-confirmation/${result.data.orderNumber}`)
      } else {
        // 处理错误
      }
    } catch (error) {
    } finally {
      setIsSubmittingOrder(false)
    }
    */
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
        {/* <OrderNoteInput value={customerNote} onChange={setCustomerNote} /> */}
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