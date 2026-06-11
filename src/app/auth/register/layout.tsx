import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "注册 · 零号站台",
  description: "注册零号站台账号，成为站长之家的一员。",
  robots: { index: false, follow: false },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
