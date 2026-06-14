import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getToken } from "@/lib/token";
import { ConfigForm } from "@/components/ConfigForm";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const token = getToken();

  const sessionQuery = useQuery({
    queryKey: ["session"],
    queryFn: api.getSession,
    enabled: !!token,
    retry: false,
    staleTime: 30_000,
  });

  if (!token || sessionQuery.isError) {
    return <Expired />;
  }

  if (sessionQuery.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading session…</p>
      </div>
    );
  }

  const { guild, expires_at } = sessionQuery.data;
  const expiresAt = new Date(expires_at);

  return (
    <div className="mx-auto max-w-2xl py-10 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">RunStats Admin</h1>
        <p className="text-muted-foreground">{guild.name}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Session expires at {expiresAt.toLocaleTimeString()}
        </p>
      </div>
      <Separator className="mb-8" />
      <ConfigForm guildId={guild.id} />
    </div>
  );
}

function Expired() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-4">
      <h2 className="text-xl font-semibold text-destructive">Session Expired</h2>
      <p className="text-sm text-muted-foreground">
        Run{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">/admin</code> in
        Discord to generate a new link.
      </p>
    </div>
  );
}
