import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";

interface OmniBreadcrumbProps {
  currentPage: string;
}

export function OmniBreadcrumb({ currentPage }: OmniBreadcrumbProps) {
  const pathname = usePathname();
  const pathSegments = pathname
    .split("/")
    .filter(segment => segment !== "")
    .slice(1) // Skip first element
    .map(segment => ({
      name: segment.split("-").map(word => {
        const connectors = ['e', 'do', 'de', 'das', 'dos', 'da', 'and', 'or', 'but', 'if', 'then', 'because', 'as', "by",  'until', 'while', 'as', 'until', 'while', 'as', 'until', 'while'];
        return connectors.includes(word) 
          ? word 
          : word.charAt(0).toUpperCase() + word.slice(1);
      }).join(" "),
      path: segment
    }));

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          {pathSegments.length === 0 ? (
            <BreadcrumbPage>Home</BreadcrumbPage>
          ) : (
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {pathSegments.map((segment, index) => (
          <>
            <BreadcrumbSeparator key={`sep-${index}`} className="hidden md:block" />
            <BreadcrumbItem key={`item-${index}`} className="hidden md:block">
              {index === pathSegments.length - 1 ? (
                <BreadcrumbPage>{segment.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={`/${pathSegments.slice(0, index + 1).map(s => s.path).join("/")}`}>
                  {segment.name}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
