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
  analyticsSidebarItems, 
  aboutUsSidebarItems, 
  administrativeSidebarItems 
} from "@/app/config/navigation"
import { Button } from "@/components/ui/button"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"
import { useQuery, gql } from "@apollo/client"
import { UserIcon, BriefcaseIcon, UsersIcon, HandshakeIcon } from "lucide-react"

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
  }
`

export function OmniCommandsButton() {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-60 justify-start rounded-[0.5rem] text-sm text-muted-foreground sm:pr-12 md:w-64 lg:w-80"
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
        
        <CommandGroup heading="Analytics">
          {analyticsSidebarItems.map((item) => (
            <CommandItem
              key={item.url}
              onSelect={() => runCommand(() => router.push(item.url))}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="About Us">
          {aboutUsSidebarItems.map((item) => (
            <CommandItem
              key={item.url}
              onSelect={() => runCommand(() => router.push(item.url))}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Administrative">
          {administrativeSidebarItems.map((item) => (
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
      </CommandList>
    </CommandDialog>
  )
} 