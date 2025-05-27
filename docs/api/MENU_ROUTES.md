# 🍽 菜单接口文档（MENU_ROUTES.md）

菜单相关接口，提供浏览菜单、添加、编辑、删除菜品的能力。

---

## `GET /api/menu`

### ✅ 功能说明：
获取所有上架的菜单项（`available: true`）及其配料结构。

### ✅ 请求示例：
无需参数

### ✅ 响应示例：
\`\`\`json
[
  {
    "id": "menu_1",
    "name": "番茄炒蛋",
    "description": "经典家常菜",
    "price": 12.5,
    "imageUrl": "https://example.com/tomato_egg.jpg",
    "category": {
      "id": "cat_main",
      "name": "主菜"
    },
    "optionGroups": [
      {
        "id": "group_1",
        "name": "辣度",
        "required": true,
        "options": [
          { "id": "opt_1", "name": "不辣", "priceDelta": 0 },
          { "id": "opt_2", "name": "微辣", "priceDelta": 0.5 }
        ]
      },
      {
        "id": "group_2",
        "name": "加料",
        "required": false,
        "options": [
          { "id": "opt_3", "name": "加蛋", "priceDelta": 1 },
          { "id": "opt_4", "name": "加豆腐", "priceDelta": 1.5 }
        ]
      }
    ]
  }
]
\`\`\`

### 🔁 响应状态码说明：
| 状态码 | 含义     | 说明             |
|--------|----------|------------------|
| 200    | OK       | 成功返回菜单数据 |
| 500    | Server Error | 系统异常     |

---

## `POST /api/menu` 🔐（管理员专用）

### ✅ 功能说明：
新增一个菜单项，可包含多个选项组（MenuOptionGroup）。

> ⚠️ 本接口需要管理员 JWT 鉴权，需在请求头添加：
> `Authorization: Bearer YOUR_JWT_TOKEN`

### ✅ 请求头：
\`\`\`
Authorization: Bearer your_token_here
Content-Type: application/json
\`\`\`

### ✅ 请求体：
\`\`\`json
{
  "name": "香煎鸡排",
  "description": "香脆多汁",
  "price": 18.00,
  "imageUrl": "https://example.com/chicken.jpg",
  "categoryId": "cat_main",
  "optionGroups": [
    {
      "name": "辣度",
      "required": true,
      "options": [
        { "name": "不辣", "priceDelta": 0 },
        { "name": "微辣", "priceDelta": 0.5 }
      ]
    },
    {
      "name": "加料",
      "required": false,
      "options": [
        { "name": "加蛋", "priceDelta": 1 },
        { "name": "加豆腐", "priceDelta": 1.5 }
      ]
    }
  ]
}
\`\`\`

### ✅ 成功响应：
\`\`\`json
{
  "id": "menu_2",
  "message": "Menu item created successfully"
}
\`\`\`

### ❌ 失败响应示例：
\`\`\`json
{
  "error": "Invalid request: 'name' is required"
}
\`\`\`

### 🔁 响应状态码说明：
| 状态码 | 含义         | 说明                                 |
|--------|--------------|--------------------------------------|
| 201    | Created       | 菜单创建成功                          |
| 400    | Bad Request   | 字段缺失或格式不合法                  |
| 401    | Unauthorized  | 未携带有效的管理员 JWT                |
| 500    | Server Error  | 系统异常                              |

---

## `PATCH /api/menu/:id` 🔐（管理员专用）

### ✅ 功能说明：
更新已有菜单项的名称、价格、描述、分类等信息。

### ✅ 请求体：
\`\`\`json
{
  "name": "香煎鸡排（升级版）",
  "price": 21.50,
  "available": true,
  "categoryId": "cat_main"
}
\`\`\`

### ❌ 失败响应示例：
\`\`\`json
{
  "error": "Menu item not found"
}
\`\`\`

### 🔁 响应状态码说明：
| 状态码 | 含义         | 说明                       |
|--------|--------------|----------------------------|
| 200    | OK           | 更新成功                   |
| 400    | Bad Request   | 请求参数无效               |
| 401    | Unauthorized  | 未授权访问                 |
| 404    | Not Found     | 菜单项不存在               |
| 500    | Server Error  | 系统异常                   |

---

## `DELETE /api/menu/:id` 🔐（管理员专用）

### ✅ 功能说明：
将菜单项标记为软删除（`deleted: true`）

### 🔁 响应状态码说明：
| 状态码 | 含义         | 说明                      |
|--------|--------------|---------------------------|
| 200    | OK           | 删除成功（软删除）        |
| 401    | Unauthorized  | 未授权访问                |
| 404    | Not Found     | 菜单项不存在              |
| 500    | Server Error  | 系统异常                  |

---

## 📌 接口注意事项

- 所有写操作（POST, PATCH, DELETE）均需管理员权限
- 返回错误结构统一为 `{ "error": string }`
- 删除应为软删除：标记 `deleted = true` 而不是从数据库中物理删除
