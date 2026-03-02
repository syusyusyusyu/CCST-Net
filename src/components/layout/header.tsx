"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "ダッシュボード" },
  { href: "/textbook", label: "教科書" },
  { href: "/study", label: "問題演習" },
  { href: "/exam", label: "模擬試験" },
  { href: "/glossary", label: "用語集" },
];

export function Header() {
  const pathname = usePathname();

  // 模擬試験セッション中はヘッダーを簡素化
  if (pathname === "/exam/session") return null;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-primary">
          CCST Networking
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}
