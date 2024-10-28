import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import {
  CalendarCheckIcon,
  ColumnsIcon,
  DatabaseIcon,
  UserIcon,
  BriefcaseIcon,
  UsersIcon,
  HandshakeIcon,
  BoxIcon,
  ChevronUpIcon,
  RefreshCwIcon,
  TrophyIcon,
  CalendarIcon,
  LogOutIcon,
  HomeIcon,
  TargetIcon,
  ChevronUp,
  User2,
  ChevronsUpDown,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useQuery, gql } from "@apollo/client";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import Logo from "./logo";

const GET_USER_PHOTO = gql`
  query GetUserPhoto($email: String!) {
    user(email: $email) {
      photoUrl
    }
  }
`;

export function OmniscopeSidebar() {
  const { data: session } = useSession();
  const { data: userData } = useQuery(GET_USER_PHOTO, {
    variables: { email: session?.user?.email },
    skip: !session?.user?.email,
  });

  const analyticsSidebarItems = [
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

  const aboutUsSidebarItems = [
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

  const administrativeSidebarItems = [
    {
      title: "Refresh data",
      url: "/management/hit-refresh",
      icon: RefreshCwIcon,
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <Link
                href="/"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex items-center gap-2"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Logo className="size-6" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Omniscope</span>
                  <span className="truncate text-xs">Visual Management</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <OmniSidebarGroup title="Analytics" items={analyticsSidebarItems} />
        <OmniSidebarGroup title="About Us" items={aboutUsSidebarItems} />
        <OmniSidebarGroup
          title="Administrative"
          items={administrativeSidebarItems}
        />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={userData?.user?.photoUrl || "/profile-photo.jpg"}
                    />
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {session?.user?.name}
                    </span>
                    <span className="truncate text-xs">
                      {session?.user?.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <Link href="/api/auth/signout">
                    <span>Sign out</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function OmniSidebarGroup({
  title,
  items,
}: {
  title: string | null;
  items: { title: string; url: string; icon: any }[];
}) {
  return (
    <SidebarGroup>
      {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuSubItem key={item.title}>
            <SidebarMenuButton asChild>
              <Link href={item.url}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuSubItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
