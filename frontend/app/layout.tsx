"use client";

import type { Metadata } from "next";
import "./globals.css";
import { SidebarLayout } from "@/components/catalyst/sidebar-layout";
import {
  Sidebar,
  SidebarBody,
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
} from "@/components/catalyst/sidebar";
import { Navbar } from "@/components/catalyst/navbar";
import {
  CalendarCheckIcon,
  ColumnsIcon,
  DatabaseIcon,
  SearchIcon,
  UserIcon,
  BriefcaseIcon,
  UsersIcon,
  HandshakeIcon,
  BoxIcon,
  FolderOpenIcon,
  ProjectorIcon,
  ScaleIcon,
  LucideProps,
} from "lucide-react";
import Logo from "./components/logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ForwardRefExoticComponent, ReactNode, RefAttributes } from "react";

// export const metadata: Metadata = {
//   title: "Omniscope",
//   description:
//     "Integrating information from various sources into a single system, ensuring that data is consistent and accessible.",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="bg-white lg:bg-zinc-100 dark:bg-zinc-900 dark:lg:bg-zinc-950"
    >
      <body>
        <SidebarLayout
          sidebar={OmniscopeSidebar()}
          navbar={<Navbar>{/* Your navbar content */}</Navbar>}
        >
          <main>{children}</main>
        </SidebarLayout>
      </body>
    </html>
  );
}

function OmniscopeSidebar() {
  const pathname = usePathname();

  const sidebarItems: OmmiSidebarItemProps[] = [
    {
      href: "/pages/analytics/week-review",
      caption: "Week Review",
      icon: <CalendarCheckIcon />
    },
    {
      href: "/pages/analytics/side-by-side",
      caption: "Side-by-side",
      icon: <ColumnsIcon />
    },
    {
      href: "/pages/analytics/datasets",
      caption: "Datasets",
      icon: <DatabaseIcon />
    },
    {
      href: "/pages/about-us/consultants-and-engineers",
      caption: "Consultants & Engineers",
      icon: <UserIcon />
    },
    {
      href: "/pages/about-us/account-managers",
      caption: "Account Managers",
      icon: <BriefcaseIcon />
    },
    {
      href: "/pages/about-us/clients",
      caption: "Clients",
      icon: <UsersIcon />
    },
    {
      href: "/pages/about-us/sponsors",
      caption: "Sponsors",
      icon: <HandshakeIcon />
    },
    {
      href: "/pages/about-us/products-or-services",
      caption: "Products and Services",
      icon: <BoxIcon />
    },
    {
      href: "/pages/about-us/cases",
      caption: "Cases",
      icon: <FolderOpenIcon />
    },
    {
      href: "/pages/about-us/projects",
      caption: "Projects",
      icon: <ProjectorIcon />
    },
    {
      href: "/pages/management/inconsistency-finder",
      caption: "Inconsistency Finder",
      icon: <SearchIcon />
    },
    {
      href: "/pages/management/hit-refresh",
      caption: "Refresh data",
      icon: <ScaleIcon />
    }
  ];

  return (
    <Sidebar>
      <SidebarBody>
        <div className="flex mb-3">
          <div>
            <Logo />
          </div>
        </div>
        <SidebarSection>
          {sidebarItems.slice(0, 3).map((item) => (
            <OmniSidebarItem key={item.href} {...item} />
          ))}
        </SidebarSection>
        <SidebarSection>
          <SidebarHeading>About Us</SidebarHeading>
          {sidebarItems.slice(3, 10).map((item) => (
            <OmniSidebarItem key={item.href} {...item} />
          ))}
        </SidebarSection>
        <SidebarSection>
          <SidebarHeading>Administrative</SidebarHeading>
          {sidebarItems.slice(10).map((item) => (
            <OmniSidebarItem key={item.href} {...item} />
          ))}
        </SidebarSection>
      </SidebarBody>
    </Sidebar>
  );
}

interface OmmiSidebarItemProps {
  href: string,
  caption: string,
  icon: ReactNode
}

function OmniSidebarItem(
  { href, caption, icon }: OmmiSidebarItemProps
) {
  const pathname = usePathname();
  return (
    <SidebarItem
      href={href}
      current={pathname === href}
    >
      {icon}
      <SidebarLabel>{caption}</SidebarLabel>
    </SidebarItem>
  );
}
