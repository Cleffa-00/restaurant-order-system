// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { 
  CreateOrderRequest, 
  OrderStatus, 
  PaymentStatus
} from '@/types'
import { ApiResponseBuilder } from '@/types/api'
import { 
  ORDER_NUMBER_PREFIX,
  BUSINESS_RULES,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  API_RESPONSE_CODES,
  PAGINATION_DEFAULTS
} from '@/types/constants'

const prisma = new PrismaClient()

// 扩展的订单请求类型，包含价格信息
interface ExtendedCreateOrderRequest extends CreateOrderRequest {
  subtotal: number
  taxAmount: number
  serviceFee: number
  total: number
  items: ExtendedCreateOrderItemRequest[]
}

interface ExtendedCreateOrderItemRequest {
  menuItemId: string
  quantity: number
  note?: string
  unitPrice: number
  finalPrice: number
  options?: ExtendedCreateOrderItemOptionRequest[]
}

interface ExtendedCreateOrderItemOptionRequest {
  menuOptionId: string
  quantity: number
  priceDelta: number
  optionNameSnapshot?: string
  groupNameSnapshot?: string
}

// 生成订单号
function generateOrderNumber(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  return `${ORDER_NUMBER_PREFIX}${year}${month}${day}-${randomNum}`
}

// 验证订单数据
function validateOrderData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.phone || typeof data.phone !== 'string' || data.phone.length < 10) {
    errors.push(VALIDATION_RULES.PHONE.MESSAGE)
  }

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < VALIDATION_RULES.NAME.MIN_LENGTH) {
    errors.push(`Name must be at least ${VALIDATION_RULES.NAME.MIN_LENGTH} characters`)
  }

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push(ERROR_MESSAGES.CART_EMPTY)
  }

  if (data.items && data.items.length > BUSINESS_RULES.MAX_ORDER_ITEMS) {
    errors.push(`Order cannot contain more than ${BUSINESS_RULES.MAX_ORDER_ITEMS} items`)
  }

  // 验证每个订单项
  data.items?.forEach((item: any, index: number) => {
    if (!item.menuItemId || typeof item.menuItemId !== 'string') {
      errors.push(`Item ${index + 1}: Menu item ID is required`)
    }
    if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1) {
      errors.push(`Item ${index + 1}: Valid quantity is required`)
    }
    if (item.quantity > BUSINESS_RULES.MAX_ITEM_QUANTITY) {
      errors.push(`Item ${index + 1}: Quantity cannot exceed ${BUSINESS_RULES.MAX_ITEM_QUANTITY}`)
    }
    if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
      errors.push(`Item ${index + 1}: Valid unit price is required`)
    }
    if (typeof item.finalPrice !== 'number' || item.finalPrice < 0) {
      errors.push(`Item ${index + 1}: Valid final price is required`)
    }
  })

  // 验证价格
  if (typeof data.subtotal !== 'number' || data.subtotal < 0) {
    errors.push('Valid subtotal is required')
  }
  if (typeof data.total !== 'number' || data.total < BUSINESS_RULES.MIN_ORDER_AMOUNT) {
    errors.push(`Order total must be at least ${BUSINESS_RULES.MIN_ORDER_AMOUNT}`)
  }

  // 验证订单备注长度
  if (data.customerNote && data.customerNote.length > VALIDATION_RULES.ORDER_NOTE.MAX_LENGTH) {
    errors.push(VALIDATION_RULES.ORDER_NOTE.MESSAGE)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ExtendedCreateOrderRequest = await request.json()
    console.log('Creating order with data:', JSON.stringify(body, null, 2))
    console.log('Request headers:', Object.fromEntries(request.headers.entries()))

    // 验证请求数据
    const validation = validateOrderData(body)
    console.log('Validation result:', validation)
    
    if (!validation.isValid) {
      console.log('Validation failed:', validation.errors)
      return NextResponse.json(
        ApiResponseBuilder.error(
          ERROR_MESSAGES.VALIDATION_ERROR,
          'VALIDATION_ERROR',
          API_RESPONSE_CODES.BAD_REQUEST,
          { errors: validation.errors }
        ),
        { status: API_RESPONSE_CODES.BAD_REQUEST }
      )
    }

    // 生成订单号
    const orderNumber = generateOrderNumber()

    // 验证菜单项存在性
    const menuItemIds = body.items.map(item => item.menuItemId)
    const existingMenuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        available: true,
        deleted: false
      }
    })

    if (existingMenuItems.length !== menuItemIds.length) {
      const missingItems = menuItemIds.filter(id => 
        !existingMenuItems.find(item => item.id === id)
      )
      return NextResponse.json(
        ApiResponseBuilder.error(
          ERROR_MESSAGES.ITEM_UNAVAILABLE,
          'MENU_ITEM_NOT_FOUND',
          API_RESPONSE_CODES.BAD_REQUEST,
          { missingItems }
        ),
        { status: API_RESPONSE_CODES.BAD_REQUEST }
      )
    }

    // 验证选项存在性
    const allOptionIds = body.items.flatMap(item => 
      item.options?.map(opt => opt.menuOptionId) || []
    )
    
    if (allOptionIds.length > 0) {
      const existingOptions = await prisma.menuOptions.findMany({
        where: {
          id: { in: allOptionIds },
          deleted: false
        }
      })

      if (existingOptions.length !== allOptionIds.length) {
        const missingOptions = allOptionIds.filter(id => 
          !existingOptions.find((opt: any) => opt.id === id)
        )
        return NextResponse.json(
          ApiResponseBuilder.error(
            'Some menu options are not available',
            'MENU_OPTION_NOT_FOUND',
            API_RESPONSE_CODES.BAD_REQUEST,
            { missingOptions }
          ),
          { status: API_RESPONSE_CODES.BAD_REQUEST }
        )
      }
    }

    // 开始数据库事务
    const order = await prisma.$transaction(async (tx) => {
      // 创建订单
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          phone: body.phone,
          name: body.name,
          status: OrderStatus.PENDING,
          subtotal: body.subtotal,
          taxAmount: body.taxAmount || 0,
          serviceFee: body.serviceFee || 0,
          total: body.total,
          paymentStatus: PaymentStatus.UNPAID,
          orderSource: body.orderSource || 'web',
          customerNote: body.customerNote || null,
        }
      })

      // 创建订单项
      for (const item of body.items) {
        const menuItem = existingMenuItems.find(mi => mi.id === item.menuItemId)
        if (!menuItem) continue

        const orderItem = await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            menuItemId: item.menuItemId,
            nameSnapshot: menuItem.name,
            imageUrlSnapshot: menuItem.imageUrl,
            categorySnapshot: null, // 可以从关联的 category 获取
            quantity: item.quantity,
            note: item.note || null,
            unitPrice: item.unitPrice,
            finalPrice: item.finalPrice,
          }
        })

        // 创建订单项选项
        if (item.options && item.options.length > 0) {
          for (const option of item.options) {
            await tx.orderItemOption.create({
              data: {
                orderItemId: orderItem.id,
                menuOptionId: option.menuOptionId,
                priceDelta: option.priceDelta,
                quantity: option.quantity,
                optionNameSnapshot: option.optionNameSnapshot || null,
                groupNameSnapshot: option.groupNameSnapshot || null,
              }
            })
          }
        }
      }

      // 返回包含完整信息的订单
      return await tx.order.findUnique({
        where: { id: newOrder.id },
        include: {
          items: {
            include: {
              options: {
                include: {
                  menuOption: true
                }
              },
              menuItem: true
            }
          }
        }
      })
    })

    console.log('Order created successfully:', order?.orderNumber)

    return NextResponse.json(
      ApiResponseBuilder.success(order, SUCCESS_MESSAGES.ORDER_CREATED),
      { status: API_RESPONSE_CODES.CREATED }
    )

  } catch (error) {
    console.error('Error creating order:', error)

    // 处理已知的错误类型
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          ApiResponseBuilder.error(
            'Order number already exists, please try again',
            'DUPLICATE_ORDER',
            API_RESPONSE_CODES.CONFLICT
          ),
          { status: API_RESPONSE_CODES.CONFLICT }
        )
      }
    }

    return NextResponse.json(
      ApiResponseBuilder.error(
        ERROR_MESSAGES.SERVER_ERROR,
        'INTERNAL_SERVER_ERROR',
        API_RESPONSE_CODES.INTERNAL_SERVER_ERROR,
        process.env.NODE_ENV === 'development' ? { error: error instanceof Error ? error.message : 'Unknown error' } : undefined
      ),
      { status: API_RESPONSE_CODES.INTERNAL_SERVER_ERROR }
    )
  }
}

// 获取订单列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    const status = searchParams.get('status') as OrderStatus | null
    const limit = Math.min(
      parseInt(searchParams.get('limit') || PAGINATION_DEFAULTS.LIMIT.toString()),
      PAGINATION_DEFAULTS.MAX_LIMIT
    )
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    
    if (phone) {
      where.phone = phone
    }
    
    if (status && Object.values(OrderStatus).includes(status)) {
      where.status = status
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              options: {
                include: {
                  menuOption: true
                }
              },
              menuItem: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.order.count({ where })
    ])

    return NextResponse.json(
      ApiResponseBuilder.paginated(orders, total, Math.floor(offset / limit) + 1, limit)
    )

  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      ApiResponseBuilder.error(
        ERROR_MESSAGES.SERVER_ERROR,
        'INTERNAL_SERVER_ERROR',
        API_RESPONSE_CODES.INTERNAL_SERVER_ERROR
      ),
      { status: API_RESPONSE_CODES.INTERNAL_SERVER_ERROR }
    )
  }
}