"use client";

import { gql, useQuery } from "@apollo/client";
import { format, addDays, differenceInDays } from "date-fns";
import SectionHeader from "@/components/SectionHeader";
import Link from "next/link";
import { NavBar } from "@/app/components/NavBar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Tracker {
  name: string;
  dueOn: string | null;
  kind: string | null;
}

interface Client {
  name: string;
  slug: string;
}

interface Case {
  title: string;
  slug: string;
  endOfContract: string | null;
  client: Client;
  tracker?: Tracker[];
}

interface Project {
  title: string;
  slug: string;
  clientName: string;
  clientSlug: string;
  projectName: string | null;
  projectKind: string | null;
  dueDate: string | null;
  isSubProject: boolean;
  parentCase: string;
}

const GET_DUE_DATES = gql`
  query GetDueDates {
    cases(onlyActives: true) {
      title
      slug
      endOfContract
      client { name, slug}
      tracker {
        name
        dueOn
        kind
      }
    }
  }
`;

export default function DueOnProjects() {
  const { data, loading, error } = useQuery(GET_DUE_DATES);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error.message}</p>
        </div>
      </div>
    );

  const today = new Date();

  const processProjects = (cases: Case[]): Project[] => {
    // Filter out cases with excluded clients
    const filteredCases = cases.filter(caseItem => {
      const clientName = caseItem.client?.name;
      return !clientName?.includes("EximiaCo") && !clientName?.includes("ElemarJR");
    });

    return filteredCases.map(caseItem => {
      const caseProject = {
        title: caseItem.title,
        slug: caseItem.slug,
        clientName: caseItem.client?.name || "No Client",
        clientSlug: caseItem.client?.slug || "",
        projectName: null,
        projectKind: null,
        dueDate: caseItem.endOfContract,
        isSubProject: false,
        parentCase: caseItem.title
      };

      const subProjects = caseItem.tracker?.length 
        ? caseItem.tracker.map((tracker) => ({
            title: caseItem.title,
            slug: caseItem.slug,
            clientName: caseItem.client?.name || "No Client",
            clientSlug: caseItem.client?.slug || "",
            projectName: tracker.name,
            projectKind: tracker.kind,
            dueDate: tracker.dueOn || caseItem.endOfContract,
            isSubProject: true,
            parentCase: caseItem.title
          }))
        : [{
            title: caseItem.title,
            slug: caseItem.slug,
            clientName: caseItem.client?.name || "No Client",
            clientSlug: caseItem.client?.slug || "",
            projectName: "No tracking project",
            projectKind: null,
            dueDate: caseItem.endOfContract,
            isSubProject: true,
            parentCase: caseItem.title
          }];

      return [caseProject, ...subProjects];
    }).flat();
  };

  const getDueDateCategories = (dueDate: string | null): string[] => {
    if (!dueDate) return ["noDueDate"];
    const date = new Date(dueDate);
    const daysUntilDue = differenceInDays(date, today);
    
    const categories = [];
    if (daysUntilDue <= 30) categories.push("next30Days");
    if (daysUntilDue <= 90) categories.push("next31to90Days");
    if (daysUntilDue > 90) categories.push("beyond90Days");
    return categories;
  };

  const categorizeProjects = (projects: Project[]): Record<string, Project[]> => {
    // Group projects by case first
    const groupedByCase = projects.reduce<Record<string, Project[]>>((acc, project) => {
      if (!acc[project.parentCase]) {
        acc[project.parentCase] = [];
      }
      if (!project.isSubProject) {
        acc[project.parentCase].unshift(project); // Add case to beginning
      } else {
        acc[project.parentCase].push(project); // Add projects after case
      }
      return acc;
    }, {});

    // Sort cases by due date and categorize
    const categorized = {
      next30Days: [] as Project[],
      next31to90Days: [] as Project[],
      beyond90Days: [] as Project[],
      noDueDate: [] as Project[]
    };

    Object.values(groupedByCase)
      .sort((a, b) => {
        const aDate = new Date(a[0].dueDate || '9999-12-31').getTime();
        const bDate = new Date(b[0].dueDate || '9999-12-31').getTime();
        return aDate - bDate;
      })
      .forEach(caseProjects => {
        const mainCase = caseProjects[0];
        const categories = getDueDateCategories(mainCase.dueDate);
        categories.forEach(category => {
          if (category in categorized) {
            categorized[category as keyof typeof categorized] = [...categorized[category as keyof typeof categorized], ...caseProjects];
          }
        });
      });

    return categorized;
  };

  const allProjects = processProjects(data.cases);
  const categorizedProjects = categorizeProjects(allProjects);

  const ProjectTable = ({ projects, title }: { projects: Project[], title: string }) => {
    const casesCount = new Set(projects.filter(p => !p.isSubProject).map(p => p.title)).size;
    const projectsCount = projects.filter(p => p.isSubProject).length;
    const clientsCount = new Set(projects.filter(p => !p.isSubProject).map(p => p.clientName)).size;
    
    return (
      <div className="mb-8 mt-16">
        <SectionHeader 
          title={title}
          subtitle={`${casesCount} cases, ${projectsCount} projects, ${clientsCount} clients`}
        />
        <Table className="ml-2 mr-2">
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold text-sm text-muted-foreground">
                Title
              </TableHead>
              <TableHead className="font-semibold text-sm text-muted-foreground w-[150px]">
                Client
              </TableHead>
              <TableHead className="font-semibold text-sm text-muted-foreground w-[200px]">
                Due On
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project, index) => (
              <TableRow 
                key={`${project.title}-${index}`}
                className={project.isSubProject ? "bg-muted/50" : ""}
              >
                <TableCell className={`py-4 text-sm ${project.isSubProject ? "pl-12" : "font-medium"}`}>
                  {project.isSubProject ? (
                    `${project.projectName} ${project.projectKind ? `(${project.projectKind})` : ""}`
                  ) : (
                    <Link 
                      href={`/about-us/cases/${project.slug}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {project.title}
                    </Link>
                  )}
                </TableCell>
                <TableCell className="py-4 text-sm">
                  {!project.isSubProject && (
                    project.clientName === "No Client" ? (
                      <span>{project.clientName}</span>
                    ) : (
                      <Link
                        href={`/about-us/clients/${project.clientSlug}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {project.clientName}
                      </Link>
                    )
                  )}
                </TableCell>
                <TableCell className="py-4 text-sm">
                  {project.dueDate
                    ? format(new Date(project.dueDate), "MMM dd, yyyy")
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <NavBar
        sections={[
          {
            id: "next30Days",
            title: "Next 30 Days",
            subtitle: `${categorizedProjects.next30Days.filter(p => p.isSubProject).length} projects`,
          },
          {
            id: "next31to90Days",
            title: "31-90 Days",
            subtitle: `${categorizedProjects.next31to90Days.filter(p => p.isSubProject).length} projects`,
          },
          {
            id: "beyond90Days",
            title: "After 90 Days",
            subtitle: `${categorizedProjects.beyond90Days.filter(p => p.isSubProject).length} projects`,
          },
          {
            id: "noDueDate",
            title: "No Due Date",
            subtitle: `${categorizedProjects.noDueDate.filter(p => p.isSubProject).length} projects`,
          },
        ]}
      />

      {categorizedProjects.next30Days.length > 0 && (
        <div id="next30Days" className="scroll-mt-[68px] sm:scroll-mt-[68px]">
          <ProjectTable 
            projects={categorizedProjects.next30Days} 
            title="Due in Next 30 Days" 
          />
        </div>
      )}

      {categorizedProjects.next31to90Days.length > 0 && (
        <div id="next31to90Days" className="scroll-mt-[68px] sm:scroll-mt-[68px]">
          <ProjectTable 
            projects={categorizedProjects.next31to90Days} 
            title="Due in 31-90 Days" 
          />
        </div>
      )}

      {categorizedProjects.beyond90Days.length > 0 && (
        <div id="beyond90Days" className="scroll-mt-[68px] sm:scroll-mt-[68px]">
          <ProjectTable 
            projects={categorizedProjects.beyond90Days} 
            title="Due After 90 Days" 
          />
        </div>
      )}

      {categorizedProjects.noDueDate.length > 0 && (
        <div id="noDueDate" className="scroll-mt-[68px] sm:scroll-mt-[68px]">
          <ProjectTable 
            projects={categorizedProjects.noDueDate} 
            title="No Due Date Assigned" 
          />
        </div>
      )}
    </div>
  );
}
