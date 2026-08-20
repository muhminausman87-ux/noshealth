import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/**
 * Authentication gate for every internal NOS module.
 *
 * `ssr: false` because the Supabase session lives in the browser; gating on the
 * server would loop on hard refresh. Access to data is additionally enforced by
 * Postgres RLS — this guard only controls which screens are rendered.
 */
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    return { user: data.user };
  },
  component: () => <Outlet />,
});
