# 零号站台 (Platform Zero) — 项目总览

> 个人博客/站点平台，部署于 https://www.121338.xyz

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Next.js 16.2.9 (App Router) + React 19.2.4 |
| 样式 | Tailwind CSS 4 + CSS 变量设计系统 |
| 语言 | TypeScript 5 |
| 后端/数据库 | Supabase (PostgreSQL + Auth + REST API) |
| 部署 | Vercel |
| 字体 | Geist Sans + Geist Mono (Google Fonts) |
| Markdown | marked v18 + sanitize-html |
| 人机验证 | Cloudflare Turnstile (仅注册页) |

## 设计系统

### 色彩 (CSS 变量)
- **浅色模式**: --bg: #faf9f6, --fg: #1c1917, --accent: #d97706 (琥珀色)
- **暗色模式**: --bg: #0f0d0b, --fg: #fafaf9, --accent: #f59e0b
- **阴影**: --shadow-sm / --shadow-md / --shadow-lg (浅色 + 暗色两套)

### 关键设计决策
- 卡片默认有阴影，hover 时阴影加深 + 	ranslateY(-1px) 微上移
- Hero 标题上方有琥珀色装饰线
- 过渡动画 0.3s ease
- 中文界面，全站 max-width 80rem (max-w-4xl)

## 已实现功能

### 核心页面
- [x] 首页 (hero + 站点链接 + 最新文章)
- [x] 文章详情 (Markdown 渲染 + 评论)
- [x] 文章列表 (分页, 每页20篇, URL参数 ?page=2)
- [x] 文章发布 (Markdown编辑器 + 分类选择)
- [x] 登录/注册 (Supabase Auth)
- [x] 账号管理 (修改用户名/密码)

### 评论系统
- [x] 顶级评论 + 嵌套回复 (parent_id)
- [x] 回复时生成通知 (notifications 表)
- [x] 评论作者即时显示用户名+头像

### 用户系统
- [x] Session 存 localStorage (sb-session)
- [x] Token 自动刷新 (每30分钟 setInterval)
- [x] 通知中心 (铃铛+红点+下拉列表)
- [x] 用户名唯一性校验 (注册和修改时)

### SEO / 社交
- [x] 动态 sitemap.xml (首页+文章列表+所有文章)
- [x] robots.txt
- [x] Open Graph + Twitter Card meta
- [x] 每篇文章独立 meta description

### 安全
- [x] XSS 防护: sanitize-html 消毒 Markdown 输出
- [x] Turnstile 人机验证 (仅注册页)
- [x] Service Role Key 写入敏感数据
- [x] 用户名 2-24 字符限制
- [x] 评论内容 ≤2000 字符

## 待办事项

### 高优先级
- [ ] Rate limiting (登录/注册/评论)
- [ ] CSRF 防护 (改用 HttpOnly cookie)
- [ ] 数据库 username 字段加 unique constraint

### 中优先级
- [ ] 文章搜索功能
- [ ] 文章分类筛选
- [ ] 图片上传
- [ ] RSS feed
- [ ] 评论编辑/删除
- [ ] 找回密码功能

### 低优先级
- [ ] 多语言支持
- [ ] 文章点赞/收藏
- [ ] 访问统计

## 数据库表结构

### users
| 字段 | 类型 | 说明 |
|---|---|---|
| id | uuid | PK, = auth.users.id |
| username | text | 显示名 |
| avatar_url | text | 头像URL |

### articles
| 字段 | 类型 | 说明 |
|---|---|---|
| id | uuid | PK |
| title | text | 标题 |
| content | text | Markdown |
| category | text | tech/life/travel/essay |
| published | boolean | |
| author_id | uuid | FK → users |

### comments
| 字段 | 类型 | 说明 |
|---|---|---|
| id | uuid | PK |
| article_id | uuid | FK → articles |
| author_id | uuid | FK → users |
| content | text | |
| parent_id | uuid | FK → comments (可null) |

### links
| 字段 | 类型 | 说明 |
|---|---|---|
| id | uuid | PK |
| name | text | 站点名 |
| url | text | 链接 |
| description | text | |
| sort_order | int | 排序 |

### notifications
| 字段 | 类型 | 说明 |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → users |
| type | text | 默认 'reply' |
| article_id | uuid | FK → articles |
| read | boolean | |

## 环境变量

| 变量 | 说明 |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Supabase URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | 匿名密钥 |
| SUPABASE_SERVICE_ROLE_KEY | 服务端密钥 |
| NEXT_PUBLIC_TURNSTILE_SITE_KEY | Turnstile 站点密钥 |
| TURNSTILE_SECRET_KEY | Turnstile 服务端密钥 |

## 关键文件

\\\
src/
├── app/
│   ├── globals.css          # 设计系统
│   ├── layout.tsx           # 根布局
│   ├── page.tsx             # 首页
│   ├── error.tsx            # 全局错误边界
│   ├── robots.ts            # robots.txt
│   ├── sitemap.ts           # sitemap.xml
│   ├── api/
│   │   ├── articles/        # 文章 CRUD + 评论
│   │   ├── auth/            # 登录/注册
│   │   ├── notifications/   # 通知
│   │   └── user/            # 用户资料
│   ├── article/[id]/        # 文章详情
│   ├── articles/            # 列表 + 新建
│   └── auth/                # 登录/注册/账号页
├── components/
│   ├── AppShell.tsx         # 导航栏 + 通知 + 页脚
│   ├── AuthProvider.tsx     # 认证上下文
│   ├── CommentsSection.tsx  # 嵌套评论
│   ├── MarkdownContent.tsx  # Markdown 渲染
│   ├── ThemeToggle.tsx      # 主题切换
│   └── TurnstileWidget.tsx  # Turnstile
└── lib/
    ├── markdown.ts          # stripMarkdown
    └── turnstile.ts         # Turnstile 验证
\\\

## 已知问题 / 技术债
1. Token 存 localStorage 有 XSS 风险 (已缓解)
2. 没有 rate limiting
3. 用户名唯一性靠应用层校验，数据库无 unique constraint
4. 部分 API 有重复的认证逻辑未抽取

## 经验教训
- **不要过度思考**: 想超过5分钟就先做简单版本
- **重复思考是陷阱**: 发现反复分析同一问题立即停
- **小步快跑**: 每次改一个点，验证后再继续
- **marked v18**: 用 
ew Marked({...}) 实例化
- **Next.js 16**: params / searchParams 是 Promise
- **React Hooks**: 不能在条件 return 之后声明 hook

## Git
- 仓库: https://github.com/yijiuzero/my-website
- 分支: master
- 部署: Vercel 自动部署

