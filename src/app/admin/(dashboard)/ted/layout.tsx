import type { Metadata } from "next";
import { TedNav } from "./_components/TedNav";

export const metadata: Metadata = {
  title: "Ted | Roadman Admin",
};

export default function TedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <TedNav />
      {children}
    </div>
  );
}
