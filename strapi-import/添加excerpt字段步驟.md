# 📝 在 Strapi 中添加 excerpt 字段 - 详细步骤

## ⚠️ 重要：必须先完成这个步骤！

如果 Strapi 中没有 `excerpt` 字段，工具会报错 "Invalid key excerpt"。

## 📋 详细步骤

### 1. 登入 Strapi 后台
- 访问 `http://localhost:1337/admin`
- 输入账号密码登入

### 2. 进入 Content-Type Builder
- 点击左侧菜单的 **Content-Type Builder**（图标是网格/表格）
- 如果没有看到，点击左侧的 **⚙️ Settings** → **Content-Type Builder**

### 3. 找到 Post 内容类型
- 在 **COLLECTION TYPES** 下找到 **Post**
- 点击 **Post**

### 4. 添加新字段
- 点击右上角的 **Add another field** 按钮
- 或者向下滚动，找到 **Add another field** 按钮

### 5. 选择字段类型
- 在弹出的窗口中，选择 **Text**（文本类型）
- 点击

### 6. 设置字段名称
- **Name**: 输入 `excerpt`
- **Type**: 应该是 **Text**（如果不是，选择 Text）
- 其他设置保持默认即可
- 点击 **Finish**

### 7. 保存
- 点击右上角的 **Save** 按钮
- 等待 Strapi 重新启动（可能需要 5-10 秒）
- 看到 "Content type saved successfully" 提示

### 8. 完成！
现在你可以在编辑文章时看到 `excerpt` 字段了。

## ✅ 验证

1. 进入 **Content Manager** → **Post**
2. 打开任意一篇文章
3. 应该能看到 **excerpt** 字段（在 `html` 字段附近）

## 🚀 然后就可以使用工具了

```bash
node edit-excerpt.js edit site1 retro-vs-modern
```




