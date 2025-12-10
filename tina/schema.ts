// Tina CMS Schema 定義
// 定義 Posts 和 Pages 的結構

export const schema = {
  collections: [
    // Posts（文章）
    {
      label: 'Posts',
      name: 'post',
      path: 'content/posts',
      format: 'mdx', // 或 'md' 如果使用 Markdown
      fields: [
        {
          type: 'string',
          label: 'Site',
          name: 'site',
          required: true,
          options: ['site1', 'site2', 'site3', 'site4', 'site5'],
        },
        {
          type: 'string',
          label: 'Category',
          name: 'category',
          required: true,
          options: ['daily', 'fixed'],
        },
        {
          type: 'string',
          label: 'Slug',
          name: 'slug',
          required: true,
          description: '文章 slug，例如：2025-12-01 或 retro-vs-modern',
        },
        {
          type: 'string',
          label: 'Title',
          name: 'title',
          required: true,
        },
        {
          type: 'rich-text',
          label: 'HTML Content',
          name: 'html',
          required: true,
          isBody: true,
          description: '文章 HTML 內容',
        },
        {
          type: 'string',
          label: 'Date',
          name: 'date',
          description: '發布日期，格式：YYYY-MM-DD',
        },
        {
          type: 'string',
          label: 'Image URL',
          name: 'imageUrl',
          description: '文章圖片 URL',
        },
        {
          type: 'boolean',
          label: 'Is Featured',
          name: 'isFeatured',
          description: '是否為精選文章',
        },
        {
          type: 'string',
          label: 'Excerpt',
          name: 'excerpt',
          description: '文章摘要',
        },
      ],
    },
    // Pages（頁面）
    {
      label: 'Pages',
      name: 'page',
      path: 'content/pages',
      format: 'mdx',
      fields: [
        {
          type: 'string',
          label: 'Site',
          name: 'site',
          required: true,
          options: ['site1', 'site2', 'site3', 'site4', 'site5'],
        },
        {
          type: 'string',
          label: 'Type',
          name: 'type',
          required: true,
          options: ['home', 'about', 'contact', 'privacy'],
        },
        {
          type: 'string',
          label: 'Slug',
          name: 'slug',
          required: true,
          options: ['index', 'about', 'contact', 'privacy'],
        },
        {
          type: 'string',
          label: 'Title',
          name: 'title',
          required: true,
        },
        {
          type: 'rich-text',
          label: 'HTML Content',
          name: 'html',
          required: true,
          isBody: true,
          description: '頁面 HTML 內容',
        },
        {
          type: 'string',
          label: 'Image URL',
          name: 'imageUrl',
          description: '頁面圖片 URL',
        },
      ],
    },
  ],
};




