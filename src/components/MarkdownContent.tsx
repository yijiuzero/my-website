import { marked } from "marked";

// 配置 marked
marked.setOptions({
  breaks: true,   // 换行 → <br>
  gfm: true,      // GitHub Flavored Markdown
});

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * 服务端 Markdown 渲染组件
 * 安全：内容来自已认证用户，通过 service_role 写入，无需额外 XSS 过滤
 */
export function MarkdownContent({ content, className }: MarkdownContentProps) {
  const html = marked.parse(content) as string;

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
