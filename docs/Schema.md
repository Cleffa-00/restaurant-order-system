# 🗂 数据库结构文档（ER 图说明）

本项目使用 Prisma + PostgreSQL 搭配 Neon 构建数据库，以下是系统核心模型及其关系简述，以及自动生成的 ER 图（实体关系图）。

---

## 🧩 核心模型说明

### 👨‍🍳 MenuItem（菜品）
- 基础信息（名称、价格、描述、图片）
- 与多个 MenuOptionGroup（选项组）关联
- 被多个订单项（OrderItem）引用

### 🧂 MenuOptionGroup（选项组）
- 属于某个 MenuItem
- 标记为必选 / 可选
- 包含多个 MenuOption（具体配料项）

### 🍱 MenuOption（选项项）
- 属于某个选项组
- 可附加价格增量（如加蛋 +$1）

### 🧾 Order（订单）
- 包含手机号、姓名、支付状态、订单状态
- 与多个 OrderItem（订单中的菜）关联

### 🍽 OrderItem（订单项）
- 记录点的某道菜及其数量、备注
- 包含多个 OrderItemOption（具体配料选择）

### 🧂 OrderItemOption（订单项配料）
- 记录顾客为某道菜选择的配料内容

### 🔑 AdminUser（管理员）
- 用于后台管理登录

---

## 🖼 ER 图预览

./ERD.svg

此图展示了所有模型之间的关系，包括一对多、多对一等外键结构，适合快速理解系统数据流。

---