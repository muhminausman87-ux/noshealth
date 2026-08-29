import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/AppHeader";
import { AppSidebar } from "@/components/AppSidebar";
import { QuickNav } from "@/components/QuickNav";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";


import appCss from "../styles.css?url";
import { NOS_MARK } from "@/lib/branding";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "NOS · Nursing Intelligence Layer" },
      { name: "description", content: "NOS is an AI-powered Nursing Intelligence Layer that works with your existing hospital EHR — connecting patient acuity, nursing capacity and clinical workflow to support safer care and better operational decisions." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "NOS · Nursing Intelligence Layer" },
      { property: "og:description", content: "An AI-powered Nursing Intelligence Layer on top of existing hospital EHRs — connecting patient acuity, nursing capacity and clinical workflow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "NOS · Nursing Intelligence Layer" },
      { name: "twitter:description", content: "An AI-powered Nursing Intelligence Layer on top of existing hospital EHRs — connecting patient acuity, nursing capacity and clinical workflow." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/6MQKTtwu2PYhWShBPYc7w4nAGdu1/social-images/social-1782296106998-1000877035.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/6MQKTtwu2PYhWShBPYc7w4nAGdu1/social-images/social-1782296106998-1000877035.webp" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon.png",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isAuthShell = pathname === "/login" || pathname === "/reset-password";

  // Single global auth subscriber: keep the router in step with the session.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event === "SIGNED_OUT") {
        queryClient.clear();
      } else {
        queryClient.invalidateQueries();
      }
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);


  return (
    <QueryClientProvider client={queryClient}>
      {/* Global NOS logo watermark — full-screen shadow behind every page */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${NOS_MARK})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "min(95vw, 95vh) auto",
          opacity: 0.05,
        }}
      />
      {isAuthShell ? (
        <div className="relative z-10">
          <Outlet />
        </div>
      ) : (
        <SidebarShell />
      )}
    </QueryClientProvider>
  );
}

const SIDEBAR_PREF_KEY = "nos-sidebar-open";

function SidebarShell() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isPatientWorkspace = pathname.startsWith("/patient/");
  const [open, setOpen] = useState(false);

  // Always collapse back to the slim icon rail after navigating to a new page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
  };


  return (
    <SidebarProvider
      defaultOpen={false}
      open={open}
      onOpenChange={handleOpenChange}
      style={{
        "--sidebar-width": "17rem",
        "--sidebar-width-icon": "3.25rem",
      } as React.CSSProperties}
    >
      <div className="relative z-10 flex min-h-screen w-full">
        <AppSidebar collapsible={isPatientWorkspace ? "offcanvas" : "icon"} />
        <SidebarInset className="min-w-0 bg-transparent">
          <AppHeader />
          <Outlet />
          <footer className="border-t border-border/70 bg-card/60 px-4 py-4 text-[11px] leading-snug text-muted-foreground">
            <div className="mx-auto flex max-w-[1400px] flex-wrap items-baseline justify-between gap-2">
              <span className="text-muted-foreground/80">
                NOS Workspace supports clinical and operational decision-making. It does not
                replace professional clinical judgment or existing hospital information systems.
              </span>
              <span className="text-muted-foreground/70">
                NOS Workspace · A FROMEX Health Tech product
              </span>
            </div>
          </footer>
        </SidebarInset>
        {!isPatientWorkspace && <QuickNav />}
      </div>
    </SidebarProvider>
  );
}

