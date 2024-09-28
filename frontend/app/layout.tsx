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

export const metadata: Metadata = {
  title: "Omniscope",
  description:
    "Integrating information from various sources into a single system, ensuring that data is consistent and accessible.",
};

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
          {children}
        </SidebarLayout>
      </body>
    </html>
  );
}

function OmniscopeSidebar() {
  return (
    <Sidebar>
      <SidebarBody>
        <div className="flex mb-3">
          <div>
            <Logo />
          </div>
        </div>
        <SidebarSection>
          <SidebarItem href="/week-review">
            <CalendarCheckIcon />
            <SidebarLabel>Week Review</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/side-by-side">
            <ColumnsIcon />
            <SidebarLabel>Side-by-side</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/datasets">
            <DatabaseIcon />
            <SidebarLabel>Datasets</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
        <SidebarSection>
          <SidebarHeading>About Us</SidebarHeading>
          <SidebarItem href="/consultants">
            <UserIcon />
            <SidebarLabel>Consultants & Engineers</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/account-managers">
            <BriefcaseIcon />
            <SidebarLabel>Account Managers</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/clients">
            <UsersIcon />
            <SidebarLabel>Clients</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/sponsors">
            <HandshakeIcon />
            <SidebarLabel>Sponsors</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/products-or-services">
            <BoxIcon />
            <SidebarLabel>Products and Services</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/cases">
            <FolderOpenIcon />
            <SidebarLabel>Cases</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/projects">
            <ProjectorIcon />
            <SidebarLabel>Projects</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
        <SidebarSection>
          <SidebarHeading>Administrative</SidebarHeading>
          <SidebarItem href="/inconsistency-finder">
            <SearchIcon />
            <SidebarLabel>Inconsistency Finder</SidebarLabel>
          </SidebarItem>
          <SidebarItem href="/hit-refresh">
            <ScaleIcon />
            <SidebarLabel>Refresh data</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
    </Sidebar>
  );
}
