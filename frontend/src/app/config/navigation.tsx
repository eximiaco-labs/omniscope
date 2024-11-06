import {
  CalendarCheckIcon,
  ColumnsIcon,
  DatabaseIcon,
  UserIcon,
  BriefcaseIcon,
  UsersIcon,
  HandshakeIcon,
  BoxIcon,
  RefreshCwIcon,
  TrophyIcon,
  CalendarIcon,
  TargetIcon,
  ChartLineIcon
} from "lucide-react";

export const analyticsSidebarItems = [
  {
    title: "Performance Analysis",
    url: "/analytics/performance-analysis",
    icon: ChartLineIcon,
  },
  {
    title: "Week Review",
    url: "/analytics/week-review",
    icon: CalendarCheckIcon,
  },
  {
    title: "Side-by-side",
    url: "/analytics/side-by-side",
    icon: ColumnsIcon,
  },
  {
    title: "Datasets",
    url: "/analytics/datasets",
    icon: DatabaseIcon,
  },
  {
    title: "Approved vs Actual",
    url: "/analytics/approved-vs-actual",
    icon: TargetIcon,
  },
];

export const aboutUsSidebarItems = [
  {
    title: "Consultants & Engineers",
    url: "/about-us/consultants-and-engineers",
    icon: UserIcon,
  },
  {
    title: "Account Managers",
    url: "/about-us/account-managers",
    icon: BriefcaseIcon,
  },
  {
    title: "Clients",
    url: "/about-us/clients",
    icon: UsersIcon,
  },
  {
    title: "Sponsors",
    url: "/about-us/sponsors",
    icon: HandshakeIcon,
  },
  {
    title: "Products and Services",
    url: "/about-us/products-or-services",
    icon: BoxIcon,
  },
  {
    title: "Cases",
    url: "/about-us/cases",
    icon: TrophyIcon,
  },
  {
    title: "Projects",
    url: "/about-us/projects",
    icon: CalendarIcon,
  },
];

export const administrativeSidebarItems = [
  {
    title: "Refresh data",
    url: "/management/hit-refresh",
    icon: RefreshCwIcon,
  },
]; 