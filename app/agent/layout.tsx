import DashboardShell from "@/components/shell/DashboardShell";
import { requireAgent } from "@/lib/session";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";

const nav = [
  { label: "My Tasks", href: "/agent", icon: <DashboardRoundedIcon /> },
  { label: "Accounts", href: "/agent/accounts", icon: <BusinessRoundedIcon /> },
  { label: "Placements", href: "/agent/placements", icon: <AssignmentTurnedInRoundedIcon /> },
  { label: "Complaints", href: "/agent/complaints", icon: <ReportProblemRoundedIcon /> },
  { label: "Matching", href: "/agent/matching", icon: <TravelExploreRoundedIcon /> },
  { label: "Reviews", href: "/agent/reviews", icon: <StarRoundedIcon /> },
];

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAgent();
  return (
    <DashboardShell
      nav={nav}
      roleLabel={user.role === "ADMIN" ? "Platform Admin" : "Oakvale Agent"}
      userName={user.name ?? "Agent"}
    >
      {children}
    </DashboardShell>
  );
}
