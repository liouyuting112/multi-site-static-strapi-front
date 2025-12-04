import { defineConfig } from 'tinacms';

// Tina CMS 設定檔案
export default defineConfig({
  branch: process.env.GITHUB_BRANCH || 'main',
  
  // 如果使用 Tina Cloud，填入您的 client ID
  clientId: process.env.TINA_CLIENT_ID || '',
  
  // 如果使用本地模式，設為 null
  token: process.env.TINA_TOKEN || null,
  
  // 內容儲存位置
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  
  // 媒體設定
  media: {
    tina: {
      mediaRoot: 'shared-assets',
      publicFolder: '',
    },
  },
  
  // Schema 定義（在 schema.ts 中）
  schema: {
    collections: [
      // Posts（文章）
      {
        label: 'Posts',
        name: 'post',
        path: 'content/posts',
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
          },
          {
            type: 'string',
            label: 'Date',
            name: 'date',
          },
          {
            type: 'image',
            label: 'Image URL',
            name: 'imageUrl',
          },
          {
            type: 'boolean',
            label: 'Is Featured',
            name: 'isFeatured',
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
          },
        ],
      },
    ],
  },
});


