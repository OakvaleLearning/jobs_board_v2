import DashboardShell from "@/components/shell/DashboardShell";
import { requireRole } from "@/lib/session";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";

const nav = [
  { label: "Overview", href: "/admin", icon: <DashboardRoundedIcon /> },
  { label: "Employers", href: "/admin/employers", icon: <BusinessRoundedIcon /> },
  { label: "Workers", href: "/admin/workers", icon: <PeopleAltRoundedIcon /> },
  { label: "Certificates", href: "/admin/certificates", icon: <WorkspacePremiumRoundedIcon /> },
  { label: "Job Posts", href: "/admin/jobs", icon: <WorkRoundedIcon /> },
  { label: "Offers", href: "/admin/offers", icon: <LocalOfferRoundedIcon /> },
  { label: "Templates", href: "/admin/templates", icon: <DescriptionRoundedIcon /> },
  { label: "Matching", href: "/admin/matching", icon: <TuneRoundedIcon /> },
  { label: "Taxonomy", href: "/admin/taxonomy", icon: <CategoryRoundedIcon /> },
  { label: "Agent Workspace", href: "/agent", icon: <SupportAgentRoundedIcon /> },
  { label: "Audit Log", href: "/admin/audit", icon: <HistoryRoundedIcon /> },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ADMIN", "AGENT");
  return (
    <DashboardShell
      nav={nav}
      roleLabel={user.role === "ADMIN" ? "Platform Admin" : "Oakvale Agent"}
      userName={user.name ?? "Admin"}
    >
      {children}
    </DashboardShell>
  );
}
