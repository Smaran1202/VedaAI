"use client";

import { useCallback, useEffect, useState } from "react";
import * as workspaceProfileService from "@/services/workspace-profile.service";
import type { WorkspaceProfile } from "@/types";

export function useWorkspaceProfile() {
  const [profile, setProfile] = useState<WorkspaceProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setProfile(await workspaceProfileService.getWorkspaceProfile());
    } catch {
      setError("Unable to load workspace profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    profile,
    setProfile,
    loading,
    error,
    refresh
  };
}
