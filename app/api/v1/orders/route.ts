// app/api/v1/orders/route.ts
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

  // 基础数据检查
  if (!data) {
    errors.push('Request body is missing')
    return { isValid: false, errors }
  }

  // 联系信息验证
  if (!data.phone) {
    errors.push('Phone number is required')
  } else if (typeof data.phone !== 'string') {
    errors.push('Phone number must be a string')
  } else if (data.phone.length < 10) {
    errors.push(`Phone number must be at least 10 digits (received: ${data.phone.length} digits)`)
  }

  if (!data.name) {
    errors.push('Customer name is required')
  } else if (typeof data.name !== 'string') {
    errors.push('Customer name must be a string')
  } else if (data.name.trim().length < VALIDATION_RULES.NAME.MIN_LENGTH) {
    errors.push(`Customer name must be at least ${VALIDATION_RULES.NAME.MIN_LENGTH} characters (received: ${data.name.trim().length} characters)`)
  }

  // 订单项验证
  if (!data.items) {
    errors.push('Items array is required')
  } else if (!Array.isArray(data.items)) {
    errors.push(`Items must be an array (received: ${typeof data.items})`)
  } else if (data.items.length === 0) {
    errors.push('Cart cannot be empty - at least one item is required')
  } else if (data.items.length > BUSINESS_RULES.MAX_ORDER_ITEMS) {
    errors.push(`Order cannot contain more than ${BUSINESS_RULES.MAX_ORDER_ITEMS} items (received: ${data.items.length} items)`)
  } else {
    // 验证每个订单项
    data.items.forEach((item: any, index: number) => {
      const itemPrefix = `Item ${index + 1}`
      
      if (!item) {
        errors.push(`${itemPrefix}: Item data is missing`)
        return
      }

      if (!item.menuItemId) {
        errors.push(`${itemPrefix}: Menu item ID is required`)
      } else if (typeof item.menuItemId !== 'string') {
        errors.push(`${itemPrefix}: Menu item ID must be a string`)
      }

      if (!item.quantity) {
        errors.push(`${itemPrefix}: Quantity is required`)
      } else if (typeof item.quantity !== 'number') {
        errors.push(`${itemPrefix}: Quantity must be a number (received: ${typeof item.quantity})`)
      } else if (item.quantity < 1) {
        errors.push(`${itemPrefix}: Quantity must be at least 1 (received: ${item.quantity})`)
      } else if (item.quantity > BUSINESS_RULES.MAX_ITEM_QUANTITY) {
        errors.push(`${itemPrefix}: Quantity cannot exceed ${BUSINESS_RULES.MAX_ITEM_QUANTITY} (received: ${item.quantity})`)
      }

      if (typeof item.unitPrice !== 'number') {
        errors.push(`${itemPrefix}: Unit price must be a number (received: ${typeof item.unitPrice})`)
      } else if (item.unitPrice < 0) {
        errors.push(`${itemPrefix}: Unit price cannot be negative (received: ${item.unitPrice})`)
      }

      if (typeof item.finalPrice !== 'number') {
        errors.push(`${itemPrefix}: Final price must be a number (received: ${typeof item.finalPrice})`)
      } else if (item.finalPrice < 0) {
        errors.push(`${itemPrefix}: Final price cannot be negative (received: ${item.finalPrice})`)
      }

      // 验证选项
      if (item.options && !Array.isArray(item.options)) {
        errors.push(`${itemPrefix}: Options must be an array`)
      } else if (item.options) {
        item.options.forEach((option: any, optIndex: number) => {
          const optionPrefix = `${itemPrefix}, Option ${optIndex + 1}`
          
          if (!option.menuOptionId) {
            errors.push(`${optionPrefix}: Menu option ID is required`)
          }
          if (typeof option.quantity !== 'number' || option.quantity < 0) {
            errors.push(`${optionPrefix}: Valid quantity is required`)
          }
          if (typeof option.priceDelta !== 'number') {
            errors.push(`${optionPrefix}: Price delta must be a number`)
          }
        })
      }
    })
  }

  // 价格验证
  if (typeof data.subtotal !== 'number') {
    errors.push(`Subtotal must be a number (received: ${typeof data.subtotal})`)
  } else if (data.subtotal < 0) {
    errors.push(`Subtotal cannot be negative (received: ${data.subtotal})`)
  }

  if (typeof data.taxAmount !== 'number') {
    errors.push(`Tax amount must be a number (received: ${typeof data.taxAmount})`)
  } else if (data.taxAmount < 0) {
    errors.push(`Tax amount cannot be negative (received: ${data.taxAmount})`)
  }

  if (typeof data.serviceFee !== 'number') {
    errors.push(`Service fee must be a number (received: ${typeof data.serviceFee})`)
  } else if (data.serviceFee < 0) {
    errors.push(`Service fee cannot be negative (received: ${data.serviceFee})`)
  }

  if (typeof data.total !== 'number') {
    errors.push(`Total must be a number (received: ${typeof data.total})`)
  } else if (data.total < BUSINESS_RULES.MIN_ORDER_AMOUNT) {
    errors.push(`Order total must be at least $${BUSINESS_RULES.MIN_ORDER_AMOUNT} (received: $${data.total})`)
  }

  // 订单备注验证
  if (data.customerNote && typeof data.customerNote !== 'string') {
    errors.push(`Customer note must be a string (received: ${typeof data.customerNote})`)
  } else if (data.customerNote && data.customerNote.length > VALIDATION_RULES.ORDER_NOTE.MAX_LENGTH) {
    errors.push(`Customer note cannot exceed ${VALIDATION_RULES.ORDER_NOTE.MAX_LENGTH} characters (received: ${data.customerNote.length} characters)`)
  }

  // 数据一致性检查
  if (data.items && Array.isArray(data.items) && typeof data.subtotal === 'number') {
    const calculatedSubtotal = data.items.reduce((sum: number, item: any) => {
      return sum + (item.finalPrice || 0)
    }, 0)
    
    // 允许小的浮点数误差
    const subtotalDiff = Math.abs(calculatedSubtotal - data.subtotal)
    if (subtotalDiff > 0.01) {
      errors.push(`Subtotal mismatch: calculated $${calculatedSubtotal.toFixed(2)}, received $${data.subtotal.toFixed(2)}`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export async function POST(request: NextRequest) {
  try {
    let body: ExtendedCreateOrderRequest
    
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        ApiResponseBuilder.error(
          'Invalid JSON in request body',
          'JSON_PARSE_ERROR',
          API_RESPONSE_CODES.BAD_REQUEST,
          { 
            parseError: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
            tip: 'Check that the request body is valid JSON'
          }
        ),
        { status: API_RESPONSE_CODES.BAD_REQUEST }
      )
    }

    // 添加调试日志（生产环境可移除）
    // console.log('Received order data:', {
    //   hasPhone: !!body.phone,
    //   hasName: !!body.name,
    //   itemCount: body.items?.length || 0,
    //   subtotal: body.subtotal,
    //   total: body.total,
    //   orderSource: body.orderSource
    // })

    // 验证请求数据
    const validation = validateOrderData(body)

    if (!validation.isValid) {
      // console.log('Validation failed:', validation.errors)
      return NextResponse.json(
        ApiResponseBuilder.error(
          'Validation failed',
          'VALIDATION_ERROR',
          API_RESPONSE_CODES.BAD_REQUEST,
          { 
            errors: validation.errors,
            receivedData: {
              hasPhone: !!body.phone,
              hasName: !!body.name,
              itemCount: body.items?.length || 0,
              hasSubtotal: typeof body.subtotal === 'number',
              hasTotal: typeof body.total === 'number'
            }
          }
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

    return NextResponse.json(
      ApiResponseBuilder.success(order, SUCCESS_MESSAGES.ORDER_CREATED),
      { status: API_RESPONSE_CODES.CREATED }
    )

  } catch (error) {

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
        process.env.NODE_ENV === 'development' ? { 
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        } : {
          tip: 'Please try again or contact support if the problem persists'
        }
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