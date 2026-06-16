import { Marked } from "marked";
import sanitizeHtml from "sanitize-html";

const marked = new Marked({ breaks: true, gfm: true });

const sanitizeOpts: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "br", "hr",
    "ul", "ol", "li",
    "blockquote", "pre", "code",
    "a", "strong", "em", "del", "s", "u",
    "img", "table", "thead", "tbody", "tr", "th", "td",
    "details", "summary", "sup", "sub", "span",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
    code: ["class"],
    pre: ["class"],
    span: ["class"],
    td: ["align"],
    th: ["align"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  disallowedTagsMode: "discard",
};

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/** 服务端 Markdown 渲染组件，输出经 sanitize-html 消毒 */
export function MarkdownContent({ content, className }: MarkdownContentProps) {
  const rawHtml = marked.parse(content) as string;
  const html = sanitizeHtml(rawHtml, sanitizeOpts);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
