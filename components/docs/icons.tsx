"use client";

import type { ReactNode } from "react";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import AssignmentIndRoundedIcon from "@mui/icons-material/AssignmentIndRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";

const map: Record<string, ReactNode> = {
  explore: <ExploreRoundedIcon />,
  shield: <ShieldRoundedIcon />,
  person: <PersonRoundedIcon />,
  verified: <VerifiedRoundedIcon />,
  work: <WorkRoundedIcon />,
  handshake: <HandshakeRoundedIcon />,
  description: <DescriptionRoundedIcon />,
  assignment: <AssignmentTurnedInRoundedIcon />,
  chat: <ChatRoundedIcon />,
  business: <BusinessRoundedIcon />,
  assignmentInd: <AssignmentIndRoundedIcon />,
  search: <SearchRoundedIcon />,
  receipt: <ReceiptLongRoundedIcon />,
  dashboard: <DashboardRoundedIcon />,
  tune: <TuneRoundedIcon />,
  report: <ReportProblemRoundedIcon />,
  category: <CategoryRoundedIcon />,
};

/** Resolve a doc icon key to an element, falling back to a book icon. */
export function docIcon(key: string): ReactNode {
  return map[key] ?? <MenuBookRoundedIcon />;
}
