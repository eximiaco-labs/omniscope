"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  getFinancialSidebarItems,
  getTeamSidebarItems,
  getEngagementsSidebarItems,
  getMarketingAndSalesSidebarItems
} from "@/app/navigation"

import { Button } from "@/components/ui/button"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"
import { useQuery, gql } from "@apollo/client"
import { UserIcon, BriefcaseIcon, UsersIcon, HandshakeIcon, TrophyIcon } from "lucide-react"
import { getFlag } from '../flags';
import { useSession } from "next-auth/react"

const GET_CONSULTANTS = gql`
  query GetConsultants {
    consultantsAndEngineers {
      slug
      name
    }
    accountManagers {
      slug
      name
    }
    clients {
      slug
      name
    }
    sponsors {
      slug
      name
    }
    cases(onlyActives: true) {
      slug
      title
      tracker {
        name
      }
    }
  }
`

export function OmniCommandsButton() {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-[0.5rem] text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <MagnifyingGlassIcon className="mr-2 h-4 w-4" />
        Search...
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <OmniCommands open={open} setOpen={setOpen} />
    </>
  )
}

interface OmniCommandsProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function OmniCommands({ open, setOpen }: OmniCommandsProps) {
  const router = useRouter()
  const { data } = useQuery(GET_CONSULTANTS)
  const { data: session } = useSession();
  const [financialItems, setFinancialItems] = React.useState<Array<{ title: string; url: string; icon: any }>>([])
  const [teamItems, setTeamItems] = React.useState<Array<{ title: string; url: string; icon: any }>>([])
  const [engagementsItems, setEngagementsItems] = React.useState<Array<{ title: string; url: string; icon: any }>>([])
  const [marketingAndSalesItems, setMarketingAndSalesItems] = React.useState<Array<{ title: string; url: string; icon: any }>>([])

  React.useEffect(() => {
    async function loadItems() {
      const financial = await getFinancialSidebarItems(session?.user?.email)
      const team = getTeamSidebarItems()
      const engagements = getEngagementsSidebarItems()
      const marketingAndSales = getMarketingAndSalesSidebarItems()
      
      setFinancialItems(financial)
      setTeamItems(team)
      setEngagementsItems(engagements)
      setMarketingAndSalesItems(marketingAndSales)
    }
    loadItems()
  }, [session?.user?.email])

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [setOpen])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [setOpen])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Financial">
          {financialItems.map((item) => (
              <CommandItem
                key={item.url}
                onSelect={() => runCommand(() => router.push(item.url))}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Team">
          {teamItems.map((item) => (
            <CommandItem
              key={item.url}
              onSelect={() => runCommand(() => router.push(item.url))}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Engagements">
          {engagementsItems.map((item) => (
            <CommandItem
              key={item.url}
              onSelect={() => runCommand(() => router.push(item.url))}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Marketing & Sales">
          {marketingAndSalesItems.map((item) => (
            <CommandItem
              key={item.url}
              onSelect={() => runCommand(() => router.push(item.url))}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Consultants & Engineers">
          {data?.consultantsAndEngineers.map((person: { slug: string, name: string }) => (
            <CommandItem
              key={person.slug}
              onSelect={() => runCommand(() => router.push(`/home/${person.slug}`))}
            >
              <UserIcon className="mr-2 h-4 w-4" />
              {person.name}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Account Managers">
          {data?.accountManagers.map((person: { slug: string, name: string }) => (
            <CommandItem
              key={person.slug}
              onSelect={() => runCommand(() => router.push(`/home/${person.slug}`))}
            >
              <BriefcaseIcon className="mr-2 h-4 w-4" />
              {person.name}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Clients">
          {data?.clients.map((client: { slug: string, name: string }) => (
            <CommandItem
              key={client.slug}
              onSelect={() => runCommand(() => router.push(`/about-us/clients/${client.slug}`))}
            >
              <UsersIcon className="mr-2 h-4 w-4" />
              {client.name}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Sponsors">
          {data?.sponsors.map((sponsor: { slug: string, name: string }) => (
            <CommandItem
              key={sponsor.slug}
              onSelect={() => runCommand(() => router.push(`/about-us/sponsors/${sponsor.slug}`))}
            >
              <HandshakeIcon className="mr-2 h-4 w-4" />
              {sponsor.name}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Cases">
          {data?.cases.map((caseItem: { slug: string, title: string, tracker: { name: string }[] }) => (
            <React.Fragment key={caseItem.slug}>
              <CommandItem
                onSelect={() => runCommand(() => router.push(`/about-us/cases/${caseItem.slug}`))}
              >
                <TrophyIcon className="mr-2 h-4 w-4" />
                {caseItem.title}
              </CommandItem>
              {caseItem.tracker?.map((tracker, index) => (
                <CommandItem
                  key={`${caseItem.slug}-${index}`}
                  onSelect={() => runCommand(() => router.push(`/about-us/cases/${caseItem.slug}`))}
                >
                  <TrophyIcon className="mr-2 h-4 w-4" />
                  {tracker.name}
                </CommandItem>
              ))}
            </React.Fragment>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}