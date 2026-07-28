import { type ReactNode } from "react";

type ContainerWidth = "default" | "wide" | "coaching" | "narrow";

interface ContainerProps {
  children: ReactNode;
  width?: ContainerWidth;
  className?: string;
  as?: "div" | "section" | "article" | "main";
}

const widthClasses: Record<ContainerWidth, string> = {
  default: "max-w-[1200px]",
  wide: "max-w-[1400px]",
  // 1,280px content width after the coaching system's 24px gutters.
  coaching: "max-w-[1328px]",
  narrow: "max-w-[720px]",
};

export function Container({
  children,
  width = "default",
  className = "",
  as: Tag = "div",
}: ContainerProps) {
  const paddingClass =
    width === "coaching" ? "px-4 md:px-6" : "px-5 md:px-8";

  return (
    <Tag
      className={`mx-auto w-full ${paddingClass} ${widthClasses[width]} ${className}`}
    >
      {children}
    </Tag>
  );
}
