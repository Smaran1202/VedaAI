"use client";

import { UserProfile } from "@clerk/nextjs";

export function ProfilePanel() {
  return <UserProfile routing="path" path="/profile" />;
}
