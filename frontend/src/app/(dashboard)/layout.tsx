import DashboardShell from "@/components/dashboard/dashboard-shell";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | VidSurvey",
    default: "Dashboard | VidSurvey",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
