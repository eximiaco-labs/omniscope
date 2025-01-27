import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ConsultantHeaderProps {
  name: string;
  position: string;
  photoUrl: string;
  ontologyUrl?: string;
}

export const ConsultantHeader = ({ name, position, photoUrl, ontologyUrl }: ConsultantHeaderProps) => (
  <div className="bg-white rounded-lg shadow-sm mb-8">
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