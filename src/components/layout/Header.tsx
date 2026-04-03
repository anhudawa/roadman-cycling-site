"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { NAV_ITEMS } from "@/types";
import { Container } from "./Container";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all
          ${
            isScrolled
              ? "bg-charcoal/95 backdrop-blur-md border-b border-white/5 py-3"
              : "bg-transparent py-5"
          }
        `}
        style={{ transitionDuration: "var(--duration-normal)" }}
      >
        <Container>
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="relative z-10 flex items-center gap-3"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Image
                src="/images/logo-white.png"
                alt="Roadman Cycling"
                width={140}
                height={50}
                className="h-8 md:h-10 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {NAV_ITEMS.map((item) => (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className="relative font-body text-sm text-foreground-muted hover:text-off-white transition-colors after:absolute after:bottom-[-4px] after:left-0 after:h-[1px] after:w-0 hover:after:w-full after:bg-coral after:transition-all after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)]"
                  >
                    {item.label}
                    {item.children && (
                      <span className="ml-1 text-xs opacity-50">&#9662;</span>
                    )}
                  </Link>
                  {item.children && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all" style={{ transitionDuration: "var(--duration-normal)" }}>
                      <div className="bg-charcoal/95 backdrop-blur-md border border-white/10 rounded-lg p-2 min-w-[200px] shadow-[var(--shadow-elevated)]">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-3 py-2 text-sm text-foreground-muted hover:text-off-white hover:bg-white/5 rounded-md transition-colors"
                            style={{ transitionDuration: "var(--duration-fast)" }}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <Link
                href="/community/clubhouse"
                className="
                  font-heading text-sm tracking-wider
                  bg-coral hover:bg-coral-hover
                  text-off-white px-6 py-2.5 rounded-md
                  transition-all
                "
                style={{ transitionDuration: "var(--duration-fast)" }}
              >
                JOIN FREE
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden relative z-10 w-10 h-10 flex flex-col items-center justify-center gap-1.5"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              <span
                className={`block w-6 h-0.5 bg-off-white transition-transform ${
                  isMobileMenuOpen ? "rotate-45 translate-y-1" : ""
                }`}
                style={{ transitionDuration: "var(--duration-normal)" }}
              />
              <span
                className={`block w-6 h-0.5 bg-off-white transition-opacity ${
                  isMobileMenuOpen ? "opacity-0" : ""
                }`}
                style={{ transitionDuration: "var(--duration-normal)" }}
              />
              <span
                className={`block w-6 h-0.5 bg-off-white transition-transform ${
                  isMobileMenuOpen ? "-rotate-45 -translate-y-1" : ""
                }`}
                style={{ transitionDuration: "var(--duration-normal)" }}
              />
            </button>
          </nav>
        </Container>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`
          fixed inset-0 z-40 bg-deep-purple/98 backdrop-blur-lg
          flex flex-col items-center justify-center
          transition-opacity lg:hidden
          ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        style={{ transitionDuration: "var(--duration-slow)" }}
      >
        <nav className="flex flex-col items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-heading text-4xl text-off-white hover:text-coral transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ transitionDuration: "var(--duration-fast)" }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/community/clubhouse"
            className="
              mt-4 font-heading text-xl tracking-wider
              bg-coral hover:bg-coral-hover
              text-off-white px-10 py-4 rounded-md
              transition-all
            "
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ transitionDuration: "var(--duration-fast)" }}
          >
            JOIN THE CLUBHOUSE
          </Link>
        </nav>
      </div>
    </>
  );
}
