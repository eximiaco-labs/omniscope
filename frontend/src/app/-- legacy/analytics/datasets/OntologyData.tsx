import React from 'react';
import { OntologyOverview } from '@/app/components/analytics/OntologyOverview';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Heading } from "@/components/catalyst/heading";
import { Divider } from "@/components/catalyst/divider";

interface OntologyDataProps {
  ontologyData: any;
}

const OntologyData: React.FC<OntologyDataProps> = ({ ontologyData }) => {
  if (!ontologyData || !ontologyData.ontology) {
    return null;
  }

  const { totalEntries, uniqueClasses, uniqueAuthors, byAuthor, byClass } = ontologyData.ontology;

  const prepareData = (data: any[], subKey: string) => {
    return data.map(item => ({
      name: item.name,
      totalEntries: item.totalEntries,
      ...item[subKey].reduce((acc: any, subItem: any) => {
        acc[subItem.name] = subItem.entries;
        return acc;
      }, {})
    }));
  };

  const authorData = prepareData(byAuthor, 'classes');
  const classData = prepareData(byClass, 'authors');

  const generateColors = (count: number, seed: number) => {
    const random = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    return Array.from({ length: count }, (_, i) => {
      const hue = Math.floor(random(seed + i) * 360);
      const saturation = 70 + Math.floor(random(seed + i + 1) * 30);
      const lightness = 50 + Math.floor(random(seed + i + 2) * 20);
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    });
  };

  const getUniqueItems = (data: any[], key: string) => 
    Array.from(new Set(data.flatMap(item => item[key].map((subItem: any) => subItem.name))));

  const allClasses = getUniqueItems(byAuthor, 'classes');
  const allAuthors = getUniqueItems(byClass, 'authors');

  const classColors = generateColors(allClasses.length, 13);
  const authorColors = generateColors(allAuthors.length, 40);

  const renderBarChart = (data: any[], items: string[], title: string, colors: string[]) => (
    <div className="mb-6">
      <Heading>{title}</Heading>
      <Divider className="my-3" />
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {items.map((item, index) => (
            <Bar key={item} dataKey={item} stackId="a" fill={colors[index]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <>
      <OntologyOverview
        ontology={{ totalEntries, uniqueClasses, uniqueAuthors }}
        className="mb-6"
      />

      {renderBarChart(authorData, allClasses, "By Author", classColors)}
      {renderBarChart(classData, allAuthors, "By Class", authorColors)}
    </>
  );
};

export default OntologyData;
