import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "登录 · 零号站台",
  description: "登录零号站台，参与评论和互动。",
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
