import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { storeToken } from "@/lib/token";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: IndexPage,
});

function IndexPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      storeToken(token);
      void navigate({ to: "/dashboard", replace: true });
    }
  }, [token, navigate]);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-destructive mb-2">No session token</h1>
          <p className="text-muted-foreground text-sm">
            Run{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">/admin</code> in
            your Discord server to get a link.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
