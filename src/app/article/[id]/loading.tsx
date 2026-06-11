export default function ArticleLoading() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-8 md:py-12 animate-pulse">
      {/* 返回 */}
      <div
        className="h-5 w-24 rounded mb-8"
        style={{ backgroundColor: "var(--surface)" }}
      />

      {/* 分类标签 */}
      <div
        className="h-5 w-12 rounded-full mb-3"
        style={{ backgroundColor: "var(--surface)" }}
      />

      {/* 标题 */}
      <div
        className="h-10 w-3/4 rounded mb-4"
        style={{ backgroundColor: "var(--surface)" }}
      />

      {/* 时间 */}
      <div
        className="h-4 w-40 rounded mb-8"
        style={{ backgroundColor: "var(--surface)" }}
      />

      {/* 正文骨架 */}
      <div className="space-y-3">
        <div
          className="h-4 w-full rounded"
          style={{ backgroundColor: "var(--surface)" }}
        />
        <div
          className="h-4 w-5/6 rounded"
          style={{ backgroundColor: "var(--surface)" }}
        />
        <div
          className="h-4 w-4/6 rounded"
          style={{ backgroundColor: "var(--surface)" }}
        />
        <div
          className="h-4 w-full rounded"
          style={{ backgroundColor: "var(--surface)" }}
        />
        <div
          className="h-4 w-3/4 rounded"
          style={{ backgroundColor: "var(--surface)" }}
        />
        <div
          className="h-4 w-2/3 rounded"
          style={{ backgroundColor: "var(--surface)" }}
        />
      </div>
    </div>
  );
}
