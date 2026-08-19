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
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";

// Operational review pages — agents and admins both work here.
const operationalNav = [
  { label: "Employers", href: "/admin/employers", icon: <BusinessRoundedIcon /> },
  { label: "Workers", href: "/admin/workers", icon: <PeopleAltRoundedIcon /> },
  { label: "Certificates", href: "/admin/certificates", icon: <WorkspacePremiumRoundedIcon /> },
  { label: "Job Posts", href: "/admin/jobs", icon: <WorkRoundedIcon /> },
  { label: "Offers", href: "/admin/offers", icon: <LocalOfferRoundedIcon /> },
];

// Configuration pages — Platform Admin only.
const configNav = [
  { label: "Overview", href: "/admin", icon: <DashboardRoundedIcon /> },
  { label: "Staff", href: "/admin/staff", icon: <BadgeRoundedIcon /> },
  { label: "Templates", href: "/admin/templates", icon: <DescriptionRoundedIcon /> },
  { label: "Matching", href: "/admin/matching", icon: <TuneRoundedIcon /> },
  { label: "Taxonomy", href: "/admin/taxonomy", icon: <CategoryRoundedIcon /> },
  { label: "Audit Log", href: "/admin/audit", icon: <HistoryRoundedIcon /> },
];

const agentWorkspaceNav = { label: "Agent Workspace", href: "/agent", icon: <SupportAgentRoundedIcon /> };
const docsNav = { label: "Help & Docs", href: "/docs", icon: <MenuBookRoundedIcon /> };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ADMIN", "AGENT");
  const nav =
    user.role === "ADMIN"
      ? [configNav[0], ...operationalNav, ...configNav.slice(1), agentWorkspaceNav, docsNav]
      : [...operationalNav, agentWorkspaceNav, docsNav];
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
