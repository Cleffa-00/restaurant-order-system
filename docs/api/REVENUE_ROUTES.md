# 📈 营收统计接口文档（REVENUE_ROUTES.md）

本模块属于系统后期开发功能，面向管理员展示订单营收、销量、趋势图表等分析数据。

---

## GET /api/admin/revenue/summary

### ✅ 功能说明：
获取最近时间段内的营收概览数据（可选按日、周、月聚合）。

### ✅ 可选查询参数：
| 参数       | 示例值      | 说明                     |
|------------|-------------|--------------------------|
| period     | `daily`     | 聚合维度：daily / weekly / monthly |
| startDate  | `2025-01-01`| 起始日期（ISO 格式）     |
| endDate    | `2025-01-31`| 截止日期（ISO 格式）     |

### ✅ 响应示例：
\`\`\`json
{
  "totalRevenue": 15392.5,
  "totalOrders": 287,
  "totalItems": 643,
  "averageOrderValue": 53.64
}
\`\`\`

---

## GET /api/admin/revenue/chart

### ✅ 功能说明：
返回图表数据：订单收入和数量随时间变化。

### ✅ 响应示例：
\`\`\`json
{
  "labels": ["2025-05-01", "2025-05-02", "2025-05-03"],
  "revenueData": [253.4, 412.8, 336.9],
  "orderCountData": [8, 11, 9]
}
\`\`\`

---

## 🔐 权限限制

- 所有接口仅限 `role = ADMIN / MANAGER` 使用
- 须在请求头中附带 JWT：
\`\`\`http
Authorization: Bearer <token>
\`\`\`

---

## 📌 开发说明

- 本模块为可选延伸功能，初期可用伪数据模拟
- 实现建议：使用 Prisma 查询 + 分组统计 + 缓存优化
