import { type ReactNode } from "react";

type ContainerWidth = "default" | "wide" | "narrow";

interface ContainerProps {
  children: ReactNode;
  width?: ContainerWidth;
  className?: string;
  as?: "div" | "section" | "article" | "main";
}

const widthClasses: Record<ContainerWidth, string> = {
  default: "max-w-[1200px]",
  wide: "max-w-[1400px]",
  narrow: "max-w-[720px]",
};

export function Container({
  children,
  width = "default",
  className = "",
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag className={`mx-auto w-full px-5 md:px-8 ${widthClasses[width]} ${className}`}>
      {children}
    </Tag>
  );
}
