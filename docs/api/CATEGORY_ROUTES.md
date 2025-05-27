# 🗂 分类接口文档（CATEGORY_ROUTES.md）

分类接口用于前台菜单展示的导航项、管理员对分类的维护操作。

---

## `GET /api/categories`

### ✅ 功能说明：
获取所有可见分类（`visible: true`），用于菜单导航侧栏显示。

### ✅ 响应示例：
\`\`\`json
[
  { "id": "cat_main", "name": "主菜", "slug": "main", "order": 1 },
  { "id": "cat_drink", "name": "饮料", "slug": "drink", "order": 2 }
]
\`\`\`

### 🔁 响应状态码说明：
| 状态码 | 含义     | 说明                      |
|--------|----------|---------------------------|
| 200    | OK       | 返回分类列表              |
| 500    | Server Error | 系统异常              |

---

## `POST /api/categories` 🔐（管理员专用）

### ✅ 功能说明：
新增分类。slug 用于路由或唯一标识。

### ✅ 请求体：
\`\`\`json
{
  "name": "小吃",
  "slug": "snack",
  "order": 3,
  "visible": true
}
\`\`\`

### ✅ 成功响应：
\`\`\`json
{
  "id": "cat_snack",
  "message": "Category created"
}
\`\`\`

### ❌ 失败响应示例：
\`\`\`json
{ "error": "Slug must be unique" }
\`\`\`

### 🔁 响应状态码说明：
| 状态码 | 含义         | 说明                          |
|--------|--------------|-------------------------------|
| 201    | Created       | 创建成功                       |
| 400    | Bad Request   | 参数格式错误                   |
| 401    | Unauthorized  | 缺少管理员身份认证             |
| 500    | Server Error  | 系统异常                       |

---

## `PATCH /api/categories/:id` 🔐（管理员专用）

### ✅ 功能说明：
更新分类信息，如名称、顺序、可见性。

### ✅ 请求体：
\`\`\`json
{
  "name": "饮品",
  "order": 4,
  "visible": false
}
\`\`\`

### ❌ 失败响应示例：
\`\`\`json
{ "error": "Category not found" }
\`\`\`

### 🔁 响应状态码说明：
| 状态码 | 含义         | 说明              |
|--------|--------------|-------------------|
| 200    | OK           | 修改成功          |
| 400    | Bad Request  | 参数错误或字段缺失|
| 401    | Unauthorized | 未认证            |
| 404    | Not Found    | 分类不存在        |
| 500    | Server Error | 系统异常          |

---

## `DELETE /api/categories/:id` 🔐（管理员专用）

### ✅ 功能说明：
删除分类（逻辑或物理删除，按实现决定）

### 🔁 响应状态码说明：
| 状态码 | 含义         | 说明               |
|--------|--------------|--------------------|
| 200    | OK           | 删除成功           |
| 401    | Unauthorized | 未认证             |
| 404    | Not Found    | 分类不存在         |
| 500    | Server Error | 系统异常           |

---

## 📌 接口注意事项

- 分类的 `slug` 应唯一（用于前端区分路由或组件 key）
- `order` 字段控制前端显示顺序（数字越小越靠前）
- 所有写操作（POST/PATCH/DELETE）必须携带管理员 JWT
