import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/nursing-workforce-intelligence")({
  beforeLoad: () => {
    throw redirect({
      to: "/workforce-intelligence",
    });
  },
});
