/**
 * 移除 Markdown 语法，返回纯文本摘要
 */
export function stripMarkdown(md: string, maxLen = 160): string {
  return md
    .replace(/^#{1,6}\s+/gm, "")          // 标题
    .replace(/\*\*(.+?)\*\*/g, "$1")       // 粗体
    .replace(/\*(.+?)\*/g, "$1")           // 斜体
    .replace(/`{1,3}[^`]*`{1,3}/g, "")     // 行内代码
    .replace(/```[\s\S]*?```/g, "")        // 代码块
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // 链接
    .replace(/!\[.*?\]\([^)]+\)/g, "")      // 图片
    .replace(/^>\s+/gm, "")                // 引用
    .replace(/^[-*+]\s+/gm, "")            // 无序列表
    .replace(/^\d+\.\s+/gm, "")            // 有序列表
    .replace(/^---+$/gm, "")               // 分割线
    .replace(/\n{2,}/g, " ")               // 多行合并
    .replace(/\s+/g, " ")                  // 多余空格
    .trim()
    .slice(0, maxLen);
}
