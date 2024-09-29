"use client"

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
} from "lucide-react";
import Logo from "./components/logo";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
          <main>
            {children}
          </main>
        </SidebarLayout>
      </body>
    </html>
  );
}

function OmniscopeSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarBody>
        <div className="flex mb-3">
          <div>
            <Logo />
          </div>
        </div>
        <SidebarSection>
          <SidebarItem href="/week-review" current={pathname === '/week-review'}>
            <CalendarCheckIcon />
            <SidebarLabel>Week Review</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/side-by-side" current={pathname === '/side-by-side'}>
            <ColumnsIcon />
            <SidebarLabel>Side-by-side</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/datasets" current={pathname === '/datasets'}>
            <DatabaseIcon />
            <SidebarLabel>Datasets</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
        <SidebarSection>
          <SidebarHeading>About Us</SidebarHeading>
          <SidebarItem href="/consultants" current={pathname === '/consultants'}>
            <UserIcon />
            <SidebarLabel>Consultants & Engineers</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/account-managers" current={pathname === '/account-managers'}>
            <BriefcaseIcon />
            <SidebarLabel>Account Managers</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/clients" current={pathname === '/clients'}>
            <UsersIcon />
            <SidebarLabel>Clients</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/sponsors" current={pathname === '/sponsors'}>
            <HandshakeIcon />
            <SidebarLabel>Sponsors</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/products-or-services" current={pathname === '/products-or-services'}>
            <BoxIcon />
            <SidebarLabel>Products and Services</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/cases" current={pathname === '/cases'}>
            <FolderOpenIcon />
            <SidebarLabel>Cases</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/projects" current={pathname === '/projects'}>
            <ProjectorIcon />
            <SidebarLabel>Projects</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
        <SidebarSection>
          <SidebarHeading>Administrative</SidebarHeading>
          <SidebarItem href="/inconsistency-finder" current={pathname === '/inconsistency-finder'}>
            <SearchIcon />
            <SidebarLabel>Inconsistency Finder</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/hit-refresh" current={pathname === '/hit-refresh'}>
            <ScaleIcon />
            <SidebarLabel>Refresh data</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
    </Sidebar>
  );
}
