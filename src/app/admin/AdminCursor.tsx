"use client";

import { useEffect } from "react";

/**
 * Toggles `admin-cursor` class on <body> while mounted.
 * Paired with body.admin-cursor rules in globals.css to restore the native OS
 * cursor inside /admin (globals.css hides it everywhere else via cursor:none).
 */
export function AdminCursor() {
  useEffect(() => {
    document.body.classList.add("admin-cursor");
    return () => {
      document.body.classList.remove("admin-cursor");
    };
  }, []);
  return null;
}
