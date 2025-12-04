# 📝 如何在 Strapi 中添加 excerpt 字段

## 🎯 目的

`excerpt` 字段用于存储文章的描述/摘要，会显示在首页的「精選攻略」区块中。

## 📋 步骤

### 1. 登入 Strapi 后台

访问 `http://localhost:1337/admin`

### 2. 进入 Content-Type Builder

点击左侧菜单的 **Content-Type Builder**

### 3. 编辑 Post 内容类型

- 找到 **Post** 并点击
- 点击右上角的 **Add another field**

### 4. 添加 Text 字段

- 选择 **Text** 类型
- 字段名称输入：`excerpt`
- 点击 **Finish**

### 5. 保存

- 点击右上角的 **Save** 按钮
- 等待 Strapi 重新启动（可能需要几秒钟）

## ✅ 完成

现在你可以在：
- **Content Manager** → **Post** → 编辑文章时看到 `excerpt` 字段
- 使用 `node edit-excerpt.js edit site1 retro-vs-modern` 命令编辑描述

## 💡 使用工具编辑描述

```bash
cd strapi-import
node edit-excerpt.js edit site1 retro-vs-modern
```

然后输入新的描述文字即可。




