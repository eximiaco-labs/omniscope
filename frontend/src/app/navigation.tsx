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
      subItems: [
        {
          title: "Tracking Projects",
          url: "/about-us/cases/tracking-projects",
          icon: TrophyIcon,
        },
      ],
    },
    {
      title: "Deals",
      url: "/about-us/deals",
      icon: PercentIcon,
    },
    {
      title: "Projects",
      url: "/about-us/projects",
      icon: CalendarIcon,
    },
  ];
}


export function getOntologySidebarItems() {
  return [
    {
      title: "Classes",
      url: "/ontology/classes",
      icon: BookIcon,
    },
  ];
}

export function getAdministrativeSidebarItems() {
  return [
    {
      title: "Changelog",
      url: "/admin/changelog",
      icon: ClipboardListIcon,
    },
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
