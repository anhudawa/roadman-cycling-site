import type { Metadata } from "next";
import { AdminCursor } from "./AdminCursor";

export const metadata: Metadata = {
  title: "Admin Dashboard | Roadman Cycling",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminCursor />
      {children}
    </>
  );
}
