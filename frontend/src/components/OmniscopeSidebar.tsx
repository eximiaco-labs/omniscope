import React from 'react';
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarBody,
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
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
  FolderOpenIcon,
  ProjectorIcon,
  ScaleIcon,
} from "lucide-react";
import Logo from "../app/components/logo";

interface OmniSidebarItemProps {
  href: string;
  caption: string;
  icon: React.ReactNode;
}

function OmniSidebarItem({ href, caption, icon }: OmniSidebarItemProps) {
  const pathname = usePathname();
  return (
    <SidebarItem href={href} current={pathname === href}>
      {icon}
      <SidebarLabel>{caption}</SidebarLabel>
    </SidebarItem>
  );
}

export function OmniscopeSidebar() {
  const analyticsSidebarItems: OmniSidebarItemProps[] = [
    { href: "/analytics/week-review", caption: "Week Review", icon: <CalendarCheckIcon /> },
    { href: "/analytics/side-by-side", caption: "Side-by-side", icon: <ColumnsIcon /> },
    { href: "/analytics/datasets", caption: "Datasets", icon: <DatabaseIcon /> },
  ];

  const aboutUsSidebarItems: OmniSidebarItemProps[] = [
    { href: "/about-us/consultants-and-engineers", caption: "Consultants & Engineers", icon: <UserIcon /> },
    { href: "/about-us/account-managers", caption: "Account Managers", icon: <BriefcaseIcon /> },
    { href: "/about-us/clients", caption: "Clients", icon: <UsersIcon /> },
    { href: "/about-us/sponsors", caption: "Sponsors", icon: <HandshakeIcon /> },
    { href: "/about-us/products-or-services", caption: "Products and Services", icon: <BoxIcon /> },
    { href: "/about-us/cases", caption: "Cases", icon: <FolderOpenIcon /> },
    { href: "/about-us/projects", caption: "Projects", icon: <ProjectorIcon /> },
  ];

  const administrativeSidebarItems: OmniSidebarItemProps[] = [
    { href: "/management/hit-refresh", caption: "Refresh data", icon: <ScaleIcon /> },
  ];

  return (
    <Sidebar>
      <SidebarBody>
        <div className="flex mb-3">
          <Logo />
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
        <SidebarSection>
          <SidebarHeading>Administrative</SidebarHeading>
          {administrativeSidebarItems.map((item) => (
            <OmniSidebarItem key={item.href} {...item} />
          ))}
        </SidebarSection>
      </SidebarBody>
    </Sidebar>
  );
}
