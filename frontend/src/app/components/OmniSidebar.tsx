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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  DollarSignIcon,
  BarChart3Icon,
  UsersIcon,
  SettingsIcon,
  CheckCheckIcon,
  BookOpenIcon,
  BriefcaseIcon,
  UsersRoundIcon,
} from "lucide-react";

import { useSession } from "next-auth/react";
import { useQuery, gql } from "@apollo/client";
import Link from "next/link";
import Logo from "./logo";

import {
  getTeamSidebarItems,
  getAnalyticsSidebarItems,
  getAboutUsSidebarItems,
  getAdministrativeSidebarItems,
  getFinancialSidebarItems,
  getOntologySidebarItems,
  getEngagementsSidebarItems,
  getMarketingAndSalesSidebarItems,
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

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPersonRunning, 
  faPeopleGroup, 
  faCommentsDollar,
  faMagnifyingGlassDollar,
  faBookAtlas
} from "@fortawesome/free-solid-svg-icons"

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
  subItems?: MenuItem[];
  subsection?: string;
}

interface SidebarSection {
  section: string;
  items: MenuItem[];
  icon: () => JSX.Element;
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
  const [ontologyItems, setOntologyItems] = React.useState<MenuItem[]>([]);
  const [teamItems, setTeamItems] = React.useState<MenuItem[]>([]);
  const [engagementItems, setEngagementItems] = React.useState<MenuItem[]>([]);
  const [marketingAndSalesItems, setMarketingAndSalesItems] = React.useState<MenuItem[]>([]);

  const [activeSection, setActiveSection] = React.useState<string>("Analytics");
  const [activeItems, setActiveItems] = React.useState<MenuItem[]>([]);

  const hasFinancialAccess = getFlag("is-fin-user", session?.user?.email);

  React.useEffect(() => {
    async function loadItems() {
      const financial = await getFinancialSidebarItems(session?.user?.email);
      const analytics = await getAnalyticsSidebarItems(session?.user?.email);
      const aboutUs = await getAboutUsSidebarItems();
      const admin = await getAdministrativeSidebarItems();
      const ontology = await getOntologySidebarItems();
      const team = await getTeamSidebarItems();
      const engagements = await getEngagementsSidebarItems();
      const marketingAndSales = await getMarketingAndSalesSidebarItems();

      setFinancialItems(financial);
      setAnalyticsItems(analytics);
      setAboutUsItems(aboutUs);
      setAdminItems(admin);
      setOntologyItems(ontology);
      setTeamItems(team);
      setEngagementItems(engagements);
      setMarketingAndSalesItems(marketingAndSales);

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

      const isMarketingAndSalesPath = marketingAndSales.some((item) =>
        pathname.startsWith(item.url)
      );
      if (isMarketingAndSalesPath) {
        initialSection = "Marketing and Sales";
        initialItems = marketingAndSales;
      }

      const isAnalyticsPath = analytics.some((item) =>
        pathname.startsWith(item.url)
      );
      if (isAnalyticsPath) {
        initialSection = "Analytics";
        initialItems = analytics;
      }


      const isAboutUsPath = aboutUs.some((item) =>
        pathname.startsWith(item.url)
      );
      if (isAboutUsPath) {
        initialSection = "About Us";
        initialItems = aboutUs;
      }

      const isOntologyPath = ontologyItems.some((item: MenuItem) => pathname.startsWith(item.url));
      if (isOntologyPath) {
        initialSection = "Ontology";
        initialItems = ontologyItems;
      }

      const isAdminPath = admin.some((item) => pathname.startsWith(item.url));
      if (isAdminPath) {
        initialSection = "Administrative";
        initialItems = admin;
      }

      const isTeamPath = team.some((item) => pathname.startsWith(item.url));
      if (isTeamPath) {
        initialSection = "Team";
        initialItems = team;
      }

      const isEngagementsPath = engagements.some((item) => pathname.startsWith(item.url));
      if (isEngagementsPath) {
        initialSection = "Engagements";
        initialItems = engagements;
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
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {(
                  [
                    hasFinancialAccess && {
                      section: "Financial",
                      items: financialItems,
                      icon: () => <FontAwesomeIcon icon={faMagnifyingGlassDollar} />,
                      tooltip: "Financial",
                      show: financialItems.length > 0,
                    },
                    {
                      section: "Team",
                      items: teamItems,
                      icon: () => <FontAwesomeIcon icon={faPeopleGroup} />,
                      tooltip: "Team",
                    },
                    {
                      section: "Engagements",
                      items: engagementItems,
                      icon: () => <FontAwesomeIcon icon={faPersonRunning} />,
                      tooltip: "Engagements",
                    },
                    {
                      section: "Marketing and Sales",
                      items: marketingAndSalesItems,
                      icon: () => <FontAwesomeIcon icon={faCommentsDollar} />,
                      tooltip: "Marketing and Sales",
                      show: marketingAndSalesItems.length > 0,
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
                                <div className="size-4">
                                  <item.icon />
                                </div>
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
          {/* Group items without subsection */}
          {activeItems.some(item => !item.subsection) && (
            <SidebarGroup>
              <SidebarGroupLabel>{activeSection}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {activeItems
                    .filter(item => !item.subsection)
                    .map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname.startsWith(item.url)}
                        >
                          <Link href={item.url}>
                            <item.icon className="size-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                        {item.subItems && item.subItems.length > 0 && (
                          <SidebarMenuSub>
                            {item.subItems.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild isActive={pathname.startsWith(subItem.url)}>
                                  <Link href={subItem.url}>
                                    <subItem.icon className="size-4" />
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        )}
                      </SidebarMenuItem>
                    ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
          {/* Group items by subsection */}
          {Array.from(new Set(activeItems.map(item => item.subsection).filter(Boolean))).map(subsection => (
            <SidebarGroup key={subsection}>
              <SidebarGroupLabel>{subsection}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {activeItems
                    .filter(item => item.subsection === subsection)
                    .map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname.startsWith(item.url)}
                        >
                          <Link href={item.url}>
                            <item.icon className="size-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                        {item.subItems && item.subItems.length > 0 && (
                          <SidebarMenuSub>
                            {item.subItems.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild isActive={pathname.startsWith(subItem.url)}>
                                  <Link href={subItem.url}>
                                    <subItem.icon className="size-4" />
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        )}
                      </SidebarMenuItem>
                    ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <OmniSidebarFooter />
        </SidebarFooter>
      </Sidebar>
    </Sidebar>
  );
}
