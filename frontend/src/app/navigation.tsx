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
} from "lucide-react";

import { getFlag } from "./flags";

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
        ]
      : []),
  ];
}

export function getAnalyticsSidebarItems(userEmail?: string | null) {
  return [
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
}

export function getAboutUsSidebarItems() {
  return [
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
}

export function getOperationalSummariesSidebarItems() {
  return [
    {
      title: "Timeliness",
      url: "/operational-summaries/timeliness",
      icon: CheckCheckIcon,
    },
    {
      title: "Staleliness",
      url: "/operational-summaries/staleliness",
      icon: ClockIcon,
    },
  ];
}

export function getAdministrativeSidebarItems() {
  return [
    {
      title: "Refresh data",
      url: "/management/hit-refresh",
      icon: RefreshCwIcon,
    },
  ];
}
