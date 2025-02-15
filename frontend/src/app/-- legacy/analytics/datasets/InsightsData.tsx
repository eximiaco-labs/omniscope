import React from 'react';
import { Heading } from "@/components/catalyst/heading";
import { Divider } from "@/components/catalyst/divider";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface InsightsDataProps {
  insightsData: any;
}

const InsightsData: React.FC<InsightsDataProps> = ({ insightsData }) => {
  if (!insightsData || !insightsData.insights) {
    return null;
  }

  const { totalEntries, uniqueAuthors, averageEntriesPerAuthor, stdDevEntriesPerAuthor, byAuthor } = insightsData.insights;

  const authorData = byAuthor.map((author: any) => ({
    name: author.name,
    entries: author.entries,
  }));

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c'];

  return (
    <>
      <div className="mb-6">
        <Heading>Insights Overview</Heading>
        <Divider className="my-3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <p className="text-sm text-gray-600">Total Entries</p>
            <p className="text-2xl font-bold">{totalEntries}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-sm text-gray-600">Unique Authors</p>
            <p className="text-2xl font-bold">{uniqueAuthors}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-sm text-gray-600">Avg Entries/Author</p>
            <p className="text-2xl font-bold">{averageEntriesPerAuthor.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-sm text-gray-600">Std Dev Entries/Author</p>
            <p className="text-2xl font-bold">{stdDevEntriesPerAuthor.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <Heading>Entries by Author</Heading>
        <Divider className="my-3" />
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={authorData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="entries" fill={colors[0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default InsightsData;
