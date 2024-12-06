'use client'

import { useEffect, useRef, useState } from 'react'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import clsx from 'clsx'

interface Section {
  id: string
  title: string
  subtitle?: string
}

interface NavBarProps {
  sections: Section[]
}

function MenuIcon({
  open,
  ...props
}: React.ComponentPropsWithoutRef<'svg'> & {
  open: boolean
}) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        d={open ? 'M17 7 7 17M7 7l10 10' : 'm15 16-3 3-3-3M15 8l-3-3-3 3'}
      />
    </svg>
  )
}

export function NavBar({ sections }: NavBarProps) {
  let navBarRef = useRef<React.ElementRef<'div'>>(null)
  let [activeIndex, setActiveIndex] = useState<number | null>(null)
  let mobileActiveIndex = activeIndex === null ? 0 : activeIndex

  useEffect(() => {
    function updateActiveIndex() {
      if (!navBarRef.current) {
        return
      }

      let newActiveIndex = null
      let elements = sections
        .map(({ id }) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null)
      
      let navBarHeight = navBarRef.current.offsetHeight
      let offset = navBarHeight + 4

      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100
      ) {
        setActiveIndex(sections.length - 1)
        return
      }

      for (let index = 0; index < elements.length; index++) {
        let element = elements[index]
        let rect = element.getBoundingClientRect()
        
        if (rect.top <= offset + 8) {
          newActiveIndex = index
        } else {
          break
        }
      }

      setActiveIndex(newActiveIndex)
    }

    updateActiveIndex()

    window.addEventListener('resize', updateActiveIndex)
    window.addEventListener('scroll', updateActiveIndex, { passive: true })

    setTimeout(updateActiveIndex, 100)

    return () => {
      window.removeEventListener('resize', updateActiveIndex)
      window.removeEventListener('scroll', updateActiveIndex)
    }
  }, [sections])

  return (
    <div ref={navBarRef} className="sticky top-0 z-50">
      <Popover className="sm:hidden">
        {({ open }) => (
          <>
            <div
              className={clsx(
                'relative flex items-center px-4 py-3',
                !open &&
                  'bg-white/95 shadow-sm [@supports(backdrop-filter:blur(0))]:bg-white/80 [@supports(backdrop-filter:blur(0))]:backdrop-blur',
              )}
            >
              {!open && (
                <>
                  <div>
                    <span
                      className="font-mono text-sm text-gray-900 uppercase font-semibold"
                    >
                      {sections[mobileActiveIndex].title}
                    </span>
                    {sections[mobileActiveIndex].subtitle && (
                      <span className="text-xs text-gray-600 ml-2">
                        {sections[mobileActiveIndex].subtitle}
                      </span>
                    )}
                  </div>
                </>
              )}
              <PopoverButton
                className={clsx(
                  '-mr-1 ml-auto flex h-8 w-8 items-center justify-center',
                  open && 'relative z-10',
                )}
                aria-label="Toggle navigation menu"
              >
                {!open && (
                  <>
                    <span className="absolute inset-0" />
                  </>
                )}
                <MenuIcon open={open} className="h-6 w-6 stroke-slate-700" />
              </PopoverButton>
            </div>
            <PopoverPanel className="absolute inset-x-0 top-0 bg-white/95 py-3.5 shadow-sm [@supports(backdrop-filter:blur(0))]:bg-white/80 [@supports(backdrop-filter:blur(0))]:backdrop-blur">
              {sections.map((section) => (
                <PopoverButton
                  as="a"
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center px-4 py-1.5"
                >
                  <span className="text-sm font-semibold text-gray-900 uppercase">
                    {section.title}
                    {section.subtitle && (
                      <span className="text-xs text-gray-600 ml-2">
                        {section.subtitle}
                      </span>
                    )}
                  </span>
                </PopoverButton>
              ))}
            </PopoverPanel>
            <div className="absolute inset-x-0 bottom-full z-10 h-4 bg-white" />
          </>
        )}
      </Popover>
      <div className="hidden sm:flex sm:h-16 sm:justify-center sm:border-b sm:border-slate-200 sm:bg-white/95 sm:[@supports(backdrop-filter:blur(0))]:bg-white/80 sm:[@supports(backdrop-filter:blur(0))]:backdrop-blur">
        <ol
          role="list"
          className="mb-[-2px] grid auto-cols-[minmax(0,15rem)] grid-flow-col text-sm font-semibold text-gray-900 uppercase"
        >
          {sections.map((section, sectionIndex) => (
            <li key={section.id} className="flex">
              <a
                href={`#${section.id}`}
                className={clsx(
                  'flex w-full flex-col items-center justify-center border-b-2',
                  sectionIndex === activeIndex
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-transparent hover:bg-blue-50/40',
                )}
              >
                {section.title}
                {section.subtitle && (
                  <span className="text-xs text-gray-600">
                    {section.subtitle}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
