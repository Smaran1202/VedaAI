"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import * as userService from "@/services/user.service";
import type { CurrentUser, UserRole } from "@/types";

interface CurrentUserState {
  user: CurrentUser | null;
  role: UserRole | null;
  loading: boolean;
  needsOnboarding: boolean;
  refresh: () => Promise<void>;
}

export function useCurrentUser(): CurrentUserState {
  const { isLoaded, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setUser(null);
      setNeedsOnboarding(false);
      setLoading(!isLoaded);
      return;
    }

    setLoading(true);

    try {
      const result = await userService.getCurrentUser();
      setUser(result.user);
      setNeedsOnboarding(result.needsOnboarding);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    void refresh();
  }, [refresh, clerkUser?.id]);

  return {
    user,
    role: user?.role ?? null,
    loading,
    needsOnboarding,
    refresh
  };
}
