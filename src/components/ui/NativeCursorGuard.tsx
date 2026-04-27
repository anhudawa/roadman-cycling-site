"use client";

import { useEffect } from "react";

export function NativeCursorGuard() {
  useEffect(() => {
    document.body.classList.add("native-cursor-active");
    document.body.classList.remove("smooth-cursor-active");

    return () => {
      document.body.classList.remove("native-cursor-active");
    };
  }, []);

  return null;
}
