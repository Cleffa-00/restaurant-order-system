# 🧩 配料选项组接口文档（OPTION_GROUP_ROUTES.md）

该接口模块主要用于管理员在创建或管理菜单项时，手动增删改“选项组”与“选项”（如辣度、附加配料等）。

---

## `GET /api/options/groups/:menuItemId` 🔐（管理员或后台使用）

### ✅ 功能说明：
根据菜单项 ID 获取该菜品的所有选项组与选项。

### ✅ 响应示例：
\`\`\`json
[
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
      { "id": "opt_3", "name": "加蛋", "priceDelta": 1 },
      { "id": "opt_4", "name": "加豆腐", "priceDelta": 1.5 }
    ]
  }
]
\`\`\`

### 🔁 响应状态码说明：
| 状态码 | 含义     | 说明                        |
|--------|----------|-----------------------------|
| 200    | OK       | 成功返回选项组数据          |
| 404    | Not Found| 找不到对应菜单项            |
| 401    | Unauthorized | 未认证                  |
| 500    | Server Error | 系统异常                |

---

## `POST /api/options/groups/:menuItemId` 🔐（管理员专用）

### ✅ 功能说明：
为指定菜单项新增一个选项组和其中的选项。

### ✅ 请求体：
\`\`\`json
{
  "name": "配料",
  "required": false,
  "options": [
    { "name": "加饭", "priceDelta": 1 },
    { "name": "加蛋", "priceDelta": 1 }
  ]
}
\`\`\`

### ✅ 成功响应：
\`\`\`json
{
  "id": "group_xyz",
  "message": "Option group created"
}
\`\`\`

### ❌ 失败响应示例：
\`\`\`json
{ "error": "Invalid group format" }
\`\`\`

### 🔁 响应状态码说明：
| 状态码 | 含义         | 说明                             |
|--------|--------------|----------------------------------|
| 201    | Created       | 创建成功                          |
| 400    | Bad Request   | 格式不正确，字段缺失              |
| 401    | Unauthorized  | 缺少管理员身份                   |
| 404    | Not Found     | 菜单项不存在                     |
| 500    | Server Error  | 系统异常                          |

---

## `PATCH /api/options/groups/:groupId` 🔐（管理员专用）

### ✅ 功能说明：
修改选项组名称、是否必选

### ✅ 请求体：
\`\`\`json
{
  "name": "选择辣度",
  "required": true
}
\`\`\`

---

## `DELETE /api/options/groups/:groupId` 🔐（管理员专用）

### ✅ 功能说明：
删除某个选项组及其所有选项（软删除或硬删除，视实现）

---

## 📌 注意事项

- 所有接口需管理员权限，建议统一使用 JWT 鉴权
- 可用作菜单新增流程中的动态编辑子模块
- 若前端提供“从模板复制”，建议单独调用模板 API，不用走此手动接口
