"use client";

import { signOut } from "next-auth/react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export default function LogoutButton() {
  return (
    <DropdownMenuItem onClick={() => signOut()}>
      Logout
    </DropdownMenuItem>
  );
}
