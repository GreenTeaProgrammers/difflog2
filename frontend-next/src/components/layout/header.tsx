"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";

export default function Header() {
  const { data: session } = useSession();
  const navItems = [
    { href: "/welcome", label: "Overview" },
    { href: "/timeline", label: "Timeline" },
    { href: "/captures", label: "Captures" },
    { href: "/compare", label: "Compare" },
    { href: "/analytics", label: "Analytics" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--shell-header-border)] bg-[color:var(--shell-header)] text-[color:var(--shell-header-text)]">
      <div className="mx-auto flex h-[var(--app-header-height)] max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-[0.3em] uppercase">
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px]">
              DL
            </span>
            DiffLog
          </Link>
          <nav className="hidden items-center gap-4 text-xs font-semibold uppercase tracking-wide text-[color:var(--shell-header-muted)] lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-[color:var(--shell-header-text)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        {session?.user ? (
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              className="hidden border-white/15 bg-white/5 text-[color:var(--shell-header-text)] hover:bg-white/15 hover:text-[color:var(--shell-header-text)] sm:inline-flex"
            >
              <Link href="/camera">New Capture</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="ring-1 ring-white/20">
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/analytics">Analytics</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/timeline">Timeline</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/captures">Captures</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/compare">Compare</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/camera">New Capture</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button
            asChild
            variant="outline"
            className="border-white/15 bg-white/5 text-[color:var(--shell-header-text)] hover:bg-white/15 hover:text-[color:var(--shell-header-text)]"
          >
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
