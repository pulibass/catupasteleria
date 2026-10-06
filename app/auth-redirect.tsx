"use client";

import { useEffect } from "react";

// If the redirect URL is not allow-listed, Supabase falls back to the Site URL (`/`).
// Forward any auth callback that lands here to the password screen, keeping its params.
export function AuthRedirect() {
  useEffect(() => {
    const { search, hash } = window.location;
    const query = new URLSearchParams(search); const fragment = new URLSearchParams(hash.slice(1));
    if (query.has("code") || fragment.has("access_token") || fragment.has("error_code") || query.has("error_code")) {
      window.location.replace(`/admin/password${search}${hash}`);
    }
  }, []);
  return null;
}
