import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  DollarSignIcon,
  BarChart3Icon,
  UsersIcon,
  SettingsIcon,
  CheckCheckIcon,
} from "lucide-react";

import { useSession } from "next-auth/react";
import { useQuery, gql } from "@apollo/client";
import Link from "next/link";
import Logo from "./logo";

import {
  getAnalyticsSidebarItems,
  getAboutUsSidebarItems,
  getAdministrativeSidebarItems,
  getFinancialSidebarItems,
  getOperationalSummariesSidebarItems,
} from "@/app/navigation";

import React from "react";
import { NavUser } from "./NavUser";
import { getFlag } from "@/app/flags";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";
import OmniSidebarFooter from "./OmniSidebarFooter";
import SectionHeader from "@/components/SectionHeader";
import { OmniCommandsButton } from "./OmniCommands";
import { LucideIcon } from "lucide-react";

const GET_USER_PHOTO = gql`
  query GetUserPhoto($email: String!) {
    user(email: $email) {
      photoUrl
    }
  }
`;

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

interface SidebarSection {
  section: string;
  items: MenuItem[];
  icon: LucideIcon;
  tooltip: string;
  show?: boolean;
}

export function OmniSidebar() {
  const { data: session } = useSession();
  const { data: userData } = useQuery(GET_USER_PHOTO, {
    variables: { email: session?.user?.email },
    skip: !session?.user?.email,
  });
  const { setOpen } = useSidebar();
  const pathname = usePathname();

  const [financialItems, setFinancialItems] = React.useState<MenuItem[]>([]);
  const [analyticsItems, setAnalyticsItems] = React.useState<MenuItem[]>([]);
  const [aboutUsItems, setAboutUsItems] = React.useState<MenuItem[]>([]);
  const [adminItems, setAdminItems] = React.useState<MenuItem[]>([]);
  const [operationalItems, setOperationalItems] = React.useState<MenuItem[]>(
    []
  );

  const [activeSection, setActiveSection] = React.useState<string>("Analytics");
  const [activeItems, setActiveItems] = React.useState<MenuItem[]>([]);

  const hasFinancialAccess = getFlag("is-fin-user", session?.user?.email);

  React.useEffect(() => {
    async function loadItems() {
      const financial = await getFinancialSidebarItems(session?.user?.email);
      const analytics = await getAnalyticsSidebarItems(session?.user?.email);
      const operationalSummaries = await getOperationalSummariesSidebarItems();
      const aboutUs = await getAboutUsSidebarItems();
      const admin = await getAdministrativeSidebarItems();

      setFinancialItems(financial);
      setAnalyticsItems(analytics);
      setAboutUsItems(aboutUs);
      setAdminItems(admin);
      setOperationalItems(operationalSummaries);

      // Determine active section based on current path
      let initialSection = "Analytics";
      let initialItems = analytics;

      if (hasFinancialAccess) {
        const isFinancialPath = financial.some((item) =>
          pathname.startsWith(item.url)
        );
        if (isFinancialPath) {
          initialSection = "Financial";
          initialItems = financial;
        }
      }

      const isAnalyticsPath = analytics.some((item) =>
        pathname.startsWith(item.url)
      );
      if (isAnalyticsPath) {
        initialSection = "Analytics";
        initialItems = analytics;
      }

      const isOperationalSummariesPath = operationalSummaries.some((item) =>
        pathname.startsWith(item.url)
      );
      if (isOperationalSummariesPath) {
        initialSection = "Operational Summaries";
        initialItems = operationalSummaries;
      }

      const isAboutUsPath = aboutUs.some((item) =>
        pathname.startsWith(item.url)
      );
      if (isAboutUsPath) {
        initialSection = "About Us";
        initialItems = aboutUs;
      }

      const isAdminPath = admin.some((item) => pathname.startsWith(item.url));
      if (isAdminPath) {
        initialSection = "Administrative";
        initialItems = admin;
      }

      setActiveSection(initialSection);
      setActiveItems(initialItems);
    }
    loadItems();
  }, [session?.user?.email, hasFinancialAccess, pathname]);

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
    >
      {/* First sidebar - Section selection */}
      <Sidebar
        collapsible="none"
        className="gray !w-[calc(var(--sidebar-width-icon)_+_1px)] border-r"
      >
        {/* <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <Link href="/">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Logo className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Omniscope</span>
                    <span className="truncate text-xs">Visual Management</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader> */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {(
                  [
                    hasFinancialAccess && {
                      section: "Financial",
                      items: financialItems,
                      icon: DollarSignIcon,
                      tooltip: "Financial",
                      show: financialItems.length > 0,
                    },
                    {
                      section: "Analytics",
                      items: analyticsItems,
                      icon: BarChart3Icon,
                      tooltip: "Analytics",
                    },
                    {
                      section: "About Us",
                      items: aboutUsItems,
                      icon: UsersIcon,
                      tooltip: "About Us",
                    },
                    {
                      section: "Operational Summaries",
                      items: operationalItems,
                      icon: CheckCheckIcon,
                      tooltip: "Operational",
                    },
                    {
                      section: "Administrative",
                      items: adminItems,
                      icon: SettingsIcon,
                      tooltip: "Admin",
                    },
                  ].filter(Boolean) as SidebarSection[]
                ).map(
                  (item) =>
                    item.show !== false && (
                      <SidebarMenuItem key={item.section}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <SidebarMenuButton
                                isActive={activeSection === item.section}
                                onClick={() => {
                                  setActiveSection(item.section);
                                  setActiveItems(item.items);
                                  setOpen(true);
                                }}
                              >
                                <item.icon className="size-4" />
                                <span>{item.section}</span>
                              </SidebarMenuButton>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              {item.tooltip}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </SidebarMenuItem>
                    )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </Sidebar>

      {/* Second sidebar - Items for selected section */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarContent>
          <div className="m-2">
            <div>
              <OmniCommandsButton />
            </div>
          </div>
          <SidebarGroup>
            <SidebarGroupLabel>{activeSection}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {activeItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(item.url)}
                    >
                      <Link href={item.url}>
                        {/* <item.icon /> */}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <OmniSidebarFooter />
        </SidebarFooter>
      </Sidebar>
    </Sidebar>
  );
}
