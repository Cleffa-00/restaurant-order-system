📘 Schema 总览介绍（帮助你理解结构）
css
复制
编辑
AdminUser
  └── 管理员账号（用于登录后台）

MenuItem
  └── 菜品信息：名称、价格、是否上架
      └── MenuOptionGroup[]（每道菜的配料组）
          └── MenuOption[]（选项组下的选项）

Order
  └── 顾客订单（手机号、姓名、总价、状态）
      └── OrderItem[]（每道点的菜）
          └── menuItem → MenuItem
          └── OrderItemOption[]（每道菜的所选配料）

OrderItemOption
  └── 记录顾客为某道菜选择了哪些配料