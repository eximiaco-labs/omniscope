import React from "react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import { getChangelogEntries } from "@/utils/mdx";
import SectionHeader from "@/components/SectionHeader";
import Link from "next/link";

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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Changelog</h1>
      <div className="space-y-12">
        {entries.map((entry, index) => {
          const date = new Date(entry.data.date).getTime() + (3 * 60 * 60 * 1000);
          const formattedDate = format(date, 'yyyy-MM-dd');
          const linkId = `changelog-${formattedDate}`;
          
          return (
            <div key={index} id={linkId} className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <Link href={`#${linkId}`} className="block hover:no-underline">
                <SectionHeader
                  title={entry.data.title}
                  subtitle={format(date, 'MMMM d, yyyy', { locale: enUS })}
                />
              </Link>
              <div className="mt-6 prose prose-blue max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-8 mb-4 text-gray-900" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-6 mb-3 text-gray-800" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-700" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                    li: ({node, ...props}) => <li className="text-gray-600" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4 text-gray-600 leading-relaxed" {...props} />,
                    a: ({node, ...props}) => (
                      <a 
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium" 
                        {...props}
                      />
                    )
                  }}
                >
                  {entry.content}
                </ReactMarkdown>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
