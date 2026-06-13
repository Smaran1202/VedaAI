import { RoleDashboard } from "@/components/dashboard/role-dashboard";
import { AppShell } from "@/components/layout/app-shell";

export default function DashboardPage() {
  return (
    <AppShell>
      <RoleDashboard />
    </AppShell>
  );
}
