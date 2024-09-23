import Link from "next/link";
import * as LucideIcons from 'lucide-react';
import { LucideProps, ScanEye } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";
import React from "react";

function Sidebar() {
    const sidebarItems : SidebarItemProps[] = [
          { href: '/week-review', tooltip: 'Week Review', iconName: 'CalendarCheck2', isSelected: false },
          { href: '/side-by-side', tooltip: 'Side-by-Side', iconName: 'Columns2', isSelected: false },
          { href: '/datasets', tooltip: 'Datasets', iconName: 'Database', isSelected: false },
          { href: '/consultants', tooltip: 'Consultants & Engineers', iconName: 'UserCheck', isSelected: false },
          { href: '/account-managers', tooltip: 'Account Managers', iconName: 'Briefcase', isSelected: false },
          { href: '/clients', tooltip: 'Clients', iconName: 'Users', isSelected: false },
          { href: '/sponsors', tooltip: 'Sponsors', iconName: 'Handshake', isSelected: false },
          { href: '/products-or-services', tooltip: 'Products and Services', iconName: 'Box', isSelected: false },
          { href: '/cases', tooltip: 'Cases', iconName: 'FolderOpen', isSelected: false },
          { href: '/projects', tooltip: 'Projects', iconName: 'Route', isSelected: false },
          { href: '/inconsistency-finder', tooltip: 'Inconsistency Finder', iconName: 'Search', isSelected: false },
          { href: '/hit-refresh', tooltip: 'Refresh data', iconName: 'RefreshCw', isSelected: false }
    ];

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
                <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
                    <Link href="/"
                          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base">
                        <ScanEye className="h-4 w-4 transition-all group-hover:scale-110"/>
                        <span className="sr-only">Omniscope</span>
                    </Link>
                    {sidebarItems.map((item, index) => <SidebarItem key={index} href={item.href} tooltip={item.tooltip} iconName={item.iconName} isSelected={item.isSelected} />)}
                </nav>

                <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
                    <SidebarItem href='/settings' tooltip='Settings' iconName='Settings' isSelected={false}/>
                </nav>
            </aside>
        </div>
    )
}

type IconName = keyof typeof LucideIcons;

interface SidebarItemProps {
    href: string;
    tooltip: string;
    iconName: IconName;
    isSelected: boolean;
}

function SidebarItem({href, tooltip, iconName, isSelected}: SidebarItemProps) {

    const className = isSelected
        ? "flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
        : "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"

    return (
        <TooltipProvider delayDuration={100}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                        href={href}
                        className={className}
                    >
                    <Icon name={iconName} className="h-5 w-5"/>
                        <span className="sr-only">{tooltip}</span>
                    </Link>
                </TooltipTrigger>

                <TooltipContent side="right">{tooltip}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

interface IconProps extends LucideProps {
  name: IconName;
}

const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  const LucideIcon = LucideIcons[name] as React.ComponentType<LucideProps> | undefined;
  return LucideIcon ? <LucideIcon {...props} /> : null;
}

export default Sidebar;