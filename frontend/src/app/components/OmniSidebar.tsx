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
  ChevronsUpDown,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useQuery, gql } from "@apollo/client";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import Logo from "./logo";

import {
  getAnalyticsSidebarItems,
  getAboutUsSidebarItems,
  getAdministrativeSidebarItems,
} from "@/app/navigation"

import React from "react";

const GET_USER_PHOTO = gql`
  query GetUserPhoto($email: String!) {
    user(email: $email) {
      photoUrl
    }
  }
`;

export function OmniSidebar() {
  const { data: session } = useSession();
  const { data: userData } = useQuery(GET_USER_PHOTO, {
    variables: { email: session?.user?.email },
    skip: !session?.user?.email,
  });

  const [analyticsItems, setAnalyticsItems] = React.useState<Array<{ title: string; url: string; icon: any }>>([]);
  const [aboutUsItems, setAboutUsItems] = React.useState<Array<{ title: string; url: string; icon: any }>>([]);
  const [adminItems, setAdminItems] = React.useState<Array<{ title: string; url: string; icon: any }>>([]);

  React.useEffect(() => {
    async function loadItems() {
      const analytics = await getAnalyticsSidebarItems(session?.user?.email);
      const aboutUs = await getAboutUsSidebarItems();
      const admin = await getAdministrativeSidebarItems();
      
      setAnalyticsItems(analytics);
      setAboutUsItems(aboutUs);
      setAdminItems(admin);
    }
    loadItems();
  }, []);

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
        <OmniSidebarGroup title="Analytics" items={analyticsItems} />
        <OmniSidebarGroup title="About Us" items={aboutUsItems} />
        <OmniSidebarGroup
          title="Administrative"
          items={adminItems}
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
