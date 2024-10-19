import { Stat } from "@/app/components/analytics/stat";
import { Heading } from "@/components/catalyst/heading";
import { Divider } from "@/components/catalyst/divider";

interface OntologyOverviewProps {
  ontology: {
    totalEntries: number;
    uniqueClasses: number;
    uniqueAuthors: number;
  };
}

export function OntologyOverview({ ontology, className }: OntologyOverviewProps & { className?: string }) {
  return (
    <div className={className}>
      <Heading>Ontology Overview</Heading>
      <Divider className="my-3" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pl-3 pr-3">
        <Stat
          title="Total Entries"
          value={ontology.totalEntries.toString()}
        />
        <Stat
          title="Unique Classes"
          value={ontology.uniqueClasses.toString()}
        />
        <Stat
          title="Unique Authors"
          value={ontology.uniqueAuthors.toString()}
        />
      </div>
    </div>
  );
}
