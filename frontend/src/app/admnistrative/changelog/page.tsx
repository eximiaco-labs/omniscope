import React from "react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import { getChangelogEntries } from "@/utils/mdx";
import SectionHeader from "@/components/SectionHeader";

interface ChangelogEntry {
  content: string;
  data: {
    date: string;
    version: string;
    title: string;
  };
}

export default async function Changelog() {
  const entries = await getChangelogEntries();

  return (
      <div className="mt-10 space-y-8">
        {entries.map((entry, index) => (
          <div key={index}>
            <SectionHeader
              title={entry.data.title}
              subtitle={format(new Date(entry.data.date).getTime() + (3 * 60 * 60 * 1000), 'MMM dd, yyyy', { locale: enUS })}
            />
            <div className="mt-4 prose prose-blue max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  p: ({node, ...props}) => <p className="mb-4" {...props} />,
                  a: ({node, ...props}) => <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
                }}
              >
                {entry.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
  );
}
