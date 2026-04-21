import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ted | Roadman Admin",
};

export default function TedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
