import DashboardShell from "@/components/shell/DashboardShell";
import { requireRole } from "@/lib/session";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";

const nav = [
  { label: "Dashboard", href: "/employer", icon: <DashboardRoundedIcon /> },
  { label: "My Jobs", href: "/employer/jobs", icon: <WorkRoundedIcon /> },
  { label: "Find Workers", href: "/employer/workers", icon: <PeopleAltRoundedIcon /> },
  { label: "Shortlists", href: "/employer/shortlists", icon: <BookmarkRoundedIcon /> },
  { label: "Placements", href: "/employer/placements", icon: <AssignmentTurnedInRoundedIcon /> },
  { label: "Assessment", href: "/employer/assessment", icon: <AssignmentRoundedIcon /> },
  { label: "Billing", href: "/employer/billing", icon: <ReceiptLongRoundedIcon /> },
  { label: "Messages", href: "/employer/messages", icon: <ChatRoundedIcon /> },
  { label: "Complaints", href: "/employer/complaints", icon: <ReportProblemRoundedIcon /> },
  { label: "Company Profile", href: "/employer/onboarding", icon: <BusinessRoundedIcon /> },
];

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("EMPLOYER");
  return (
    <DashboardShell nav={nav} roleLabel="Employer" userName={user.name ?? "Employer"}>
      {children}
    </DashboardShell>
  );
}
