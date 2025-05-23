# 🍽 菜单接口文档（MENU_ROUTES.md）

用于管理菜单项（MenuItem），包括获取、添加、更新、删除操作。

---

## `GET /api/menu`

获取所有菜单项及其选项组和选项。

### ✅ 响应示例：

```json
[
  {
    "id": "menu_1",
    "name": "番茄炒蛋",
    "description": "经典家常菜，营养丰富",
    "price": 10.99,
    "imageUrl": "https://example.com/tomato_egg.jpg",
    "available": true,
    "category": "热菜",
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
        "name": "附加",
        "required": false,
        "options": [
          { "id": "opt_3", "name": "加蛋", "priceDelta": 1.0 },
          { "id": "opt_4", "name": "加芝士", "priceDelta": 1.5 }
        ]
      }
    ]
  },
  {
    "id": "menu_2",
    "name": "酸辣汤",
    "description": "开胃爽口",
    "price": 8.50,
    "imageUrl": "https://example.com/sour_spicy_soup.jpg",
    "available": true,
    "category": "汤类",
    "optionGroups": []
  }
]
```

---

## `POST /api/menu` 🔐（需要管理员身份）

添加一个新菜单项（含选项组）

> 本接口需要管理员身份（JWT 鉴权）。请在请求 Header 中附加：
>
> `Authorization: Bearer YOUR_JWT_TOKEN`

### ✅ Headers 示例

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
Content-Type: application/json
```

### ✅ 请求体示例：

```json
{
  "name": "香煎鸡排",
  "description": "外酥里嫩，推荐加蛋",
  "price": 18.50,
  "imageUrl": "https://example.com/chicken_steak.jpg",
  "available": true,
  "category": "主食",
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
      "name": "附加",
      "required": false,
      "options": [
        { "name": "加蛋", "priceDelta": 1.0 },
        { "name": "双倍肉", "priceDelta": 3.0 }
      ]
    }
  ]
}
```

### ✅ 响应：

```json
{
  "id": "menu_3",
  "message": "Menu item created successfully"
}
```

---

## `PATCH /api/menu/:id` 🔐（需要管理员身份）

更新菜单项内容。

> 本接口需要管理员身份（JWT 鉴权）。请在请求 Header 中附加：
>
> `Authorization: Bearer YOUR_JWT_TOKEN`

### ✅ 请求体示例：

```json
{
  "name": "香煎鸡排（加大份）",
  "price": 22.50,
  "available": false,
  "description": "加大版更满足",
  "imageUrl": "https://example.com/chicken_steak_large.jpg",
  "category": "主食"
}
```

### ✅ 响应：

```json
{ "message": "Menu item updated successfully" }
```

---

## `DELETE /api/menu/:id` 🔐（需要管理员身份）

删除指定菜单项（不可恢复）

> 本接口需要管理员身份（JWT 鉴权）。请在请求 Header 中附加：
>
> `Authorization: Bearer YOUR_JWT_TOKEN`

### ✅ 响应：

```json
{ "message": "Menu item deleted" }
```