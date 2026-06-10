-- 1. 添加分类字段
ALTER TABLE articles ADD COLUMN IF NOT EXISTS category text;

-- 2. 给现有文章分配分类（可选，按需调整）
UPDATE articles SET category = 'tech' WHERE title LIKE '%Next.js%' OR title LIKE '%建站%';
UPDATE articles SET category = 'essay' WHERE title LIKE '%欢迎来到%';
