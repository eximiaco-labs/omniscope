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
  ChartLineIcon,
  DollarSignIcon,
  TrendingUpIcon,
  PercentIcon,
  CheckCheckIcon,
  ClockIcon,
  ClipboardListIcon,
  AlertCircleIcon,
  BriefcaseBusinessIcon,
  BookIcon,
  BicepsFlexedIcon,
  StoreIcon,
  MonitorPlayIcon,
  HandPlatterIcon
} from "lucide-react";

import { getFlag } from "./flags";

export function getTeamSidebarItems() {
  return [
    {
      title: "Account Managers",
      url: "/team/account-managers",
      icon: BriefcaseBusinessIcon,
    },
    {
      title: "Consultants or Engineers",
      url: "/team/consultants-or-engineers",
      icon: BicepsFlexedIcon,
    },
  ];
}

export function getEngagementsSidebarItems() {
  return [
    {
      title: "Clients",
      url: "/engagements/clients",
      icon: StoreIcon,
    },
    {
      title: "Sponsors",
      url: "/engagements/sponsors",
      icon: HandshakeIcon,
    },
    {
      title: "Cases",
      url: "/engagements/cases",
      icon: MonitorPlayIcon,
    },
    {
      subsection: "Operational Summaries", 
      title: "Timeliness",
      url: "/engagements/timeliness",
      icon: CheckCheckIcon,
    },
    {
      subsection: "Operational Summaries", 
      title: "Staleliness",
      url: "/engagements/staleliness",
      icon: ClockIcon,
    },
    {
      subsection: "Operational Summaries",  
      title: "Unspecified Hours",
      url: "/engagements/unspecified-hours",
      icon: AlertCircleIcon,
    },
  ];
}

export function getMarketingAndSalesSidebarItems() {
  return [
    {
      title: "Offers",
      url: "/marketing-and-sales/offers",
      icon: HandPlatterIcon,
    },
    {
      title: "Deals",
      url: "/marketing-and-sales/deals",
      icon: PercentIcon,
    },
  ];
}

export function getFinancialSidebarItems(userEmail?: string | null) {
  return [
    ...(getFlag("is-fin-user", userEmail)
      ? [
          {
            title: "Revenue Tracking",
            url: "/financial/revenue-tracking",
            icon: DollarSignIcon,
          },
          {
            title: "Revenue Forecast",
            url: "/financial/revenue-forecast",
            icon: TrendingUpIcon,
          },
          {
            title: "Pro-Rata",
            url: "/financial/pro-rata",
            icon: PercentIcon,
          },
          {
            title: "2025 🎯",
            url: "/financial/2025",
            icon: CalendarIcon,
          },
        ]
      : []),
  ];
}


export type LinkToEntityType = "consultantOrEngineer" | "client" | "sponsor" | "case";

export function linkTo(entityType: LinkToEntityType, slug: string): string {
  switch (entityType) {
    case "consultantOrEngineer":
      return `/team/consultants-or-engineers/${slug}`;
    case "client":
      return `/engagements/clients/${slug}`;
    case "sponsor":
      return `/engagements/sponsors/${slug}`;
    case "case":
      return `/engagements/cases/${slug}`;
    default:
      return `/${entityType}/${slug}`;
  }
}
