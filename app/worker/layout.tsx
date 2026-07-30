import DashboardShell from "@/components/shell/DashboardShell";
import { requireRole } from "@/lib/session";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";

const nav = [
  { label: "Dashboard", href: "/worker", icon: <DashboardRoundedIcon /> },
  { label: "My Profile", href: "/worker/profile", icon: <PersonRoundedIcon /> },
  { label: "Browse Jobs", href: "/worker/jobs", icon: <WorkRoundedIcon /> },
  { label: "My Applications", href: "/worker/applications", icon: <DescriptionRoundedIcon /> },
  { label: "My Placements", href: "/worker/placements", icon: <AssignmentTurnedInRoundedIcon /> },
  { label: "My Reviews", href: "/worker/reviews", icon: <StarRoundedIcon /> },
  { label: "Messages", href: "/worker/messages", icon: <ChatRoundedIcon /> },
  { label: "Complaints", href: "/worker/complaints", icon: <ReportProblemRoundedIcon /> },
];

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("WORKER");
  return (
    <DashboardShell nav={nav} roleLabel="Care Worker" userName={user.name ?? "Worker"}>
      {children}
    </DashboardShell>
  );
}
