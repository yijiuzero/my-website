-- 在 Supabase SQL Editor 中执行
-- 添加 parent_id 字段支持评论回复

ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES comments(id) ON DELETE CASCADE;

-- 为 parent_id 创建索引加速查询
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
