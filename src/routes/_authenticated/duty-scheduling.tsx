import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/duty-scheduling")({
  beforeLoad: () => {
    throw redirect({
      to: "/scheduling",
    });
  },
});
