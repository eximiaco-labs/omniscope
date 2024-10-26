import React from 'react';
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Sidebar,
  SidebarBody,
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarFooter,
  SidebarSpacer,
} from "@/components/catalyst/sidebar";
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
  TargetIcon
} from "lucide-react";
import Logo from "./logo";
import { Avatar } from '@/components/catalyst/avatar';
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/catalyst/dropdown';
import { useQuery, gql } from '@apollo/client';
import Link from 'next/link';

interface OmniSidebarItemProps {
  href: string;
  caption: string;
  icon: React.ReactNode;
}

function OmniSidebarItem({ href, caption, icon }: OmniSidebarItemProps) {
  const pathname = usePathname();
  return (
    <SidebarItem href={href} current={href === '/' ? pathname === '/' : pathname.startsWith(href)}>
      {icon}
      <SidebarLabel>{caption}</SidebarLabel>
    </SidebarItem>
  );
}

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
  const analyticsSidebarItems: OmniSidebarItemProps[] = [
    { href: "/", caption: "Home", icon: <HomeIcon /> },
    { href: "/analytics/week-review", caption: "Week Review", icon: <CalendarCheckIcon /> },
    { href: "/analytics/side-by-side", caption: "Side-by-side", icon: <ColumnsIcon /> },
    { href: "/analytics/datasets", caption: "Datasets", icon: <DatabaseIcon /> },
    { href: "/analytics/approved-vs-actual", caption: "Approved vs Actual", icon: <TargetIcon /> },
  ];

  const aboutUsSidebarItems: OmniSidebarItemProps[] = [
    { href: "/about-us/consultants-and-engineers", caption: "Consultants & Engineers", icon: <UserIcon /> },
    { href: "/about-us/account-managers", caption: "Account Managers", icon: <BriefcaseIcon /> },
    { href: "/about-us/clients", caption: "Clients", icon: <UsersIcon /> },
    { href: "/about-us/sponsors", caption: "Sponsors", icon: <HandshakeIcon /> },
    { href: "/about-us/products-or-services", caption: "Products and Services", icon: <BoxIcon /> },
    { href: "/about-us/cases", caption: "Cases", icon: <TrophyIcon /> },
    { href: "/about-us/projects", caption: "Projects", icon: <CalendarIcon /> },
  ];

  const administrativeSidebarItems: OmniSidebarItemProps[] = [
    { href: "/management/hit-refresh", caption: "Refresh data", icon: <RefreshCwIcon /> },
  ];

  return (
    <Sidebar>
      <SidebarBody>
        <div className="flex mb-3">
          <Link href="/">
            <Logo width={150} height={30} />
          </Link>
        </div>
        <SidebarSection>
          {analyticsSidebarItems.map((item) => (
            <OmniSidebarItem key={item.href} {...item} />
          ))}
        </SidebarSection>
        <SidebarSection>
          <SidebarHeading>About Us</SidebarHeading>
          {aboutUsSidebarItems.map((item) => (
            <OmniSidebarItem key={item.href} {...item} />
          ))}
        </SidebarSection>
        <SidebarSpacer />
        <SidebarSection>
          {administrativeSidebarItems.map((item) => (
            <OmniSidebarItem key={item.href} {...item} />
          ))}
        </SidebarSection>
      </SidebarBody>
      <SidebarFooter className="max-lg:hidden">
        <Dropdown>
          <DropdownButton as={SidebarItem}>
            <span className="flex min-w-0 items-center gap-3">
              <Avatar src={userData?.user?.photoUrl || "/profile-photo.jpg"} className="size-10" square alt="" />
              <span className="min-w-0">
                <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                  {session?.user?.name || "Not recognized"}
                </span>
                <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                  {session?.user?.email || ""}
                </span>
              </span>
            </span>
            <ChevronUpIcon />
          </DropdownButton>
          <DropdownMenu className="min-w-64" anchor="top start">
            <DropdownItem href="/api/auth/signout">
              <LogOutIcon />
              <DropdownLabel>Sign out</DropdownLabel>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </SidebarFooter>
    </Sidebar>
  );
}
