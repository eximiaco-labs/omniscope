"use client";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { OmniSidebar } from "./components/OmniSidebar";
import { Separator } from "@/components/ui/separator";
import { OmniBreadcrumb } from "./components/OmniBreadcrumb";
import { SessionComponent } from "./components/SessionComponent";
import { Analytics } from "@/components/Analytics";
import { ApolloWrapper } from "./components/ApolloWrapper";

// Disable auto-refresh on focus and tab visibility change
if (typeof window !== 'undefined') {
  // @ts-ignore - Next.js internal property
  window._nextClearAutoFocus = true;
  
  // Disable auto-refresh on tab visibility change
  window.addEventListener('visibilitychange', (e) => {
    e.stopPropagation();
  }, true);
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="bg-white dark:bg-zinc-900"
    >
      <head>
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <title>Omniscope</title>
        <meta name="description" content="Analytics and management platform" />
      </head>
      <body>
        <SessionProvider>
          <SessionComponent>
            {(session) =>
              session ? (
                <>
                  <Analytics />
                  <ApolloWrapper session={session}>
                    <SidebarProvider>
                      <OmniSidebar />
                      <SidebarInset>
                        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                          <div className="flex items-center gap-2 px-4 flex-1">
                            <SidebarTrigger className="-ml-1" />
                            <Separator
                              orientation="vertical"
                              className="mr-2 h-4"
                            />
                            <OmniBreadcrumb currentPage="Data Fetching" />
                          </div>
                        </header>
                        <main>
                          <div className="container mx-auto px-4">
                            {children}
                          </div>
                        </main>
                      </SidebarInset>
                    </SidebarProvider>
                  </ApolloWrapper>
                </>
              ) : null
            }
          </SessionComponent>
        </SessionProvider>
      </body>
    </html>
  );
}
