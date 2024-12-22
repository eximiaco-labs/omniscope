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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-32 top-0 bottom-0 w-px bg-gray-200" />
        
        <div className="space-y-20">
          {entries.map((entry, index) => {
            const date = new Date(entry.data.date);
            const formattedDate = format(date, 'yyyy-MM-dd');
            const linkId = `changelog-${formattedDate}`;
            
            return (
              <div key={index} className="relative flex gap-12" id={linkId}>
                {/* Date column */}
                <div className="w-32 flex-shrink-0">
                  <time className="text-sm text-gray-500 font-medium tracking-wide block mb-2">
                    {format(date, 'MMM d, yyyy', { locale: enUS })}
                  </time>
                  <Link href={`#${linkId}`} className="block hover:no-underline">
                    <h2 className="text-xl font-bold text-gray-900 leading-snug hover:text-blue-600 transition-colors">
                      {entry.data.title}
                    </h2>
                  </Link>
                </div>
                
                {/* Timeline dot */}
                <div className="absolute left-32 -translate-x-1/2 top-3">
                  <div className="w-4 h-4 rounded-full bg-blue-500 ring-4 ring-white shadow-sm" />
                </div>
                
                {/* Content */}
                <div className="flex-grow">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <div className="prose prose-blue max-w-none">
                      <ReactMarkdown
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-8 mb-6 text-gray-900" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-8 mb-4 text-gray-800" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-700" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-3" {...props} />,
                          li: ({node, ...props}) => <li className="text-gray-600 leading-relaxed" {...props} />,
                          p: ({node, ...props}) => <p className="mb-6 text-gray-600 leading-relaxed" {...props} />,
                          a: ({node, ...props}) => (
                            <a 
                              className="text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium underline decoration-blue-200 hover:decoration-blue-500" 
                              {...props}
                            />
                          )
                        }}
                      >
                        {entry.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
