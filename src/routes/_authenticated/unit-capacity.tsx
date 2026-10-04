import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/unit-capacity")({
  beforeLoad: () => {
    throw redirect({
      to: "/workforce-intelligence",
    });
  },
});
