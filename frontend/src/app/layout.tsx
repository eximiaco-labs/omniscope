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
  AlertCircle,
} from "lucide-react";
import Logo from "./components/logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ForwardRefExoticComponent, ReactNode, RefAttributes } from "react";
import { ApolloProvider, ApolloClient, InMemoryCache, useQuery, gql } from '@apollo/client';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';

// Create and export the Apollo Client instance
export const client = new ApolloClient({
  uri: 'http://127.0.0.1:5000/graphql', 
  cache: new InMemoryCache(),
});

const GET_INCONSISTENCIES = gql`
  query GetInconsistencies {
    inconsistencies {
      title
      description
    }
  }
`;

function InconsistencyAlerts() {
  const { loading, error, data } = useQuery(GET_INCONSISTENCIES);

  if (loading) return null;
  if (error) return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>Error fetching inconsistencies</AlertDescription>
    </Alert>
  );

  return (
    <AnimatePresence>
      {data.inconsistencies.map((inconsistency: { title: string; description: string }, index: number) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{inconsistency.title}</AlertTitle>
            <AlertDescription>{inconsistency.description}</AlertDescription>
          </Alert>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

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
      <head>
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </head>
      <ApolloProvider client={client}>
        <body>
          <SidebarLayout
            sidebar={OmniscopeSidebar()}
            navbar={<Navbar>{/* Your navbar content */}</Navbar>}
          >
            <InconsistencyAlerts />
            <main>{children}</main>
          </SidebarLayout>
        </body>
      </ApolloProvider>
    </html>
  );
}

function OmniscopeSidebar() {
  const pathname = usePathname();

  const analyticsSidebarItems: OmmiSidebarItemProps[] = [
    {
      href: "/analytics/week-review",
      caption: "Week Review",
      icon: <CalendarCheckIcon />
    },
    {
      href: "/analytics/side-by-side",
      caption: "Side-by-side",
      icon: <ColumnsIcon />
    },
    {
      href: "/analytics/datasets",
      caption: "Datasets",
      icon: <DatabaseIcon />
    },
  ];

  const aboutUsSidebarItems: OmmiSidebarItemProps[] = [
    {
      href: "/about-us/consultants-and-engineers",
      caption: "Consultants & Engineers",
      icon: <UserIcon />
    },
    {
      href: "/about-us/account-managers",
      caption: "Account Managers",
      icon: <BriefcaseIcon />
    },
    {
      href: "/about-us/clients",
      caption: "Clients",
      icon: <UsersIcon />
    },
    {
      href: "/about-us/sponsors",
      caption: "Sponsors",
      icon: <HandshakeIcon />
    },
    {
      href: "/about-us/products-or-services",
      caption: "Products and Services",
      icon: <BoxIcon />
    },
    {
      href: "/about-us/cases",
      caption: "Cases",
      icon: <FolderOpenIcon />
    },
    {
      href: "/about-us/projects",
      caption: "Projects",
      icon: <ProjectorIcon />
    },
  ];

  const administrativeSidebarItems: OmmiSidebarItemProps[] = [
    {
      href: "/management/hit-refresh",
      caption: "Refresh data",
      icon: <ScaleIcon />
    }
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