import type {Metadata} from "next";
import "./globals.css";
import {SidebarLayout} from "@/components/catalyst/sidebar-layout";
import {Sidebar} from "@/components/catalyst/sidebar";
import {Navbar} from "@/components/catalyst/navbar";

export const metadata: Metadata = {
    title: "Omniscope",
    description: "Integrating information from various sources into a single system, ensuring that data is consistent and accessible.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body>
        <SidebarLayout
            sidebar={<Sidebar>{/* Your sidebar content */}</Sidebar>}
            navbar={<Navbar>{/* Your navbar content */}</Navbar>}
        >
            {children}
        </SidebarLayout>
        </body>
        </html>
    );
}

