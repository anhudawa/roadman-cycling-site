"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

export class OptionalRuntimeBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Optional analytics runtime failed to load.", error, info);
    }
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
