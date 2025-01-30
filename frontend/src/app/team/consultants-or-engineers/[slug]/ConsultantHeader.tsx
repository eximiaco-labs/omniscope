import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQueryBuilder } from "@/lib/graphql/QueryBuilderContext";
import { usePageQuery } from "@/lib/graphql/usePageQuery";

type ConsultantHeaderData = {
  team: {
    consultantOrEngineer: {
      name: string;
      position: string;
      photoUrl: string;
      ontologyUrl: string;
    };
  };
};

export function ConsultantHeader() {
  const { addFragment, previewQuery } = useQueryBuilder();
  const [showQuery, setShowQuery] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    addFragment({
      id: 'consultantHeader',
      fragment: `
        team {
          consultantOrEngineer(slug: $slug) {
            name
            position
            photoUrl
            ontologyUrl
          }
        }
      `,
    });
  }, [addFragment]);

  const handleCopy = async () => {
    const query = previewQuery();
    await navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { data, loading } = usePageQuery<ConsultantHeaderData>();

  if (loading || !data?.team?.consultantOrEngineer) return null;

  const { name, position, photoUrl, ontologyUrl } = data.team.consultantOrEngineer;

  return (
    <div className="bg-white mb-8">
      <div className="relative h-24 bg-gradient-to-r from-gray-500 to-gray-600 rounded-t-lg">
        <div className="absolute top-2 right-2">
          {ontologyUrl && (
            <a
              href={ontologyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white/90 backdrop-blur-sm text-blue-700 rounded hover:bg-white transition-colors text-[10px]"
            >
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="font-medium">Ontology</span>
            </a>
          )}
        </div>

        <button 
          onClick={() => setShowQuery(!showQuery)}
          className="absolute top-2 left-2 text-[10px] text-white/80 hover:text-white transition-colors flex items-center gap-0.5"
        >
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span>Preview Query</span>
        </button>

        {showQuery && (
          <div className="absolute top-12 right-2 z-50 w-[800px] bg-white rounded-lg shadow-xl border p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Current Page Query</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button 
                  onClick={() => setShowQuery(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm whitespace-pre overflow-x-auto">
              {previewQuery()}
            </pre>
          </div>
        )}

        <div className="absolute -bottom-16 left-8">
          <Avatar className="w-32 h-32 rounded-xl border-4 border-white shadow-lg">
            <AvatarImage src={photoUrl} alt={name} className="object-cover" />
            <AvatarFallback className="text-3xl bg-blue-100">{name[0]}</AvatarFallback>
          </Avatar>
        </div>
        <div className="absolute bottom-0 ml-[180px]">
          <h1 className="text-2xl font-bold mb-3 text-white">{name}</h1>
        </div>
      </div>
      
      <div className="pt-2 px-8 pb-8">
        <div className="flex justify-between items-start">
          <div className="ml-[150px] text-gray-600 text-base">{position}</div>
        </div>
      </div>
    </div>
  );
} 