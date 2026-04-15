import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Roadman Cycling",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div data-admin-root>{children}</div>;
}
