import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { BookOpen, Briefcase, Lightbulb, ListTodo, AlertTriangle, Mail } from "lucide-react";

interface TimesheetSummary {
  totalHours: number;
  totalConsultingHours: number;
  totalHandsOnHours: number;
  totalSquadHours: number;
  totalInternalHours: number;
}

interface WorkerCardProps {
  worker: {
    slug: string;
    name: string;
    email: string;
    position: string;
    photoUrl: string;
    errors: string[];
    isRecognized: boolean;
    isOntologyAuthor: boolean;
    isInsightsAuthor: boolean;
    isTimeTrackerWorker: boolean;
    isSpecialProjectsWorker: boolean;
  };
  workerData?: TimesheetSummary;
}

export function WorkerCard({ worker, workerData }: WorkerCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link 
      href={`/about-us/consultants-and-engineers/${encodeURIComponent(worker.slug)}`}
      className="block transition-all duration-300 ease-in-out"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className={`h-full ${isHovered ? 'shadow-lg scale-105' : 'shadow'} transition-all duration-300 relative`}>
        {(!worker.isRecognized || !worker.email || (worker.email && !worker.email.endsWith('@elemarjr.com') && !worker.email.endsWith('@eximia.co') && !worker.email.endsWith('@duocom.com.br'))) && (
          <div className="absolute -top-2 -left-2 z-10">
            <div className="bg-red-500 rounded-full p-1">
              <AlertTriangle className="text-white" size={20} />
            </div>
          </div>
        )}
        <CardContent className="flex flex-col items-center p-4">
          <Avatar className="size-16 mb-2">
            <AvatarImage src={worker.photoUrl} alt={worker.name} />
          </Avatar>
          <CardHeader className="p-0 mt-2">
            <CardTitle className={`text-center text-sm ${isHovered ? 'font-semibold' : ''} transition-all duration-300`}>
              {worker.name}
            </CardTitle>
          </CardHeader>
          <div className="text-xs text-center text-zinc-700 mt-1 flex items-center justify-center">
            {worker.email ? (
              <>
                <Mail className="mr-1" size={12} />
                <span className={
                  worker.email.endsWith('@eximia.co') || worker.email.endsWith('@elemarjr.com') || worker.email.endsWith('@duocom.com.br')
                    ? 'text-zinc-700'
                    : 'text-red-500'
                }>
                  {worker.email}
                </span>
              </>
            ) : (
              <Mail className="text-red-500" size={12} />
            )}
          </div>
          <div className="text-xs text-center text-zinc-500 mt-1">
            {worker.position.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')}
          </div>
          <div className="flex justify-center mt-2 space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <BookOpen className={worker.isOntologyAuthor ? "text-green-500" : "text-gray-300"} size={16} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ontology Author</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Lightbulb className={worker.isInsightsAuthor ? "text-green-500" : "text-gray-300"} size={16} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Insights Author</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Briefcase className={worker.isTimeTrackerWorker ? "text-green-500" : "text-gray-300"} size={16} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Time Tracker Worker</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <ListTodo className={worker.isSpecialProjectsWorker ? "text-green-500" : "text-gray-300"} size={16} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Special Projects Worker</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {workerData && (
            <div className="flex flex-wrap justify-center gap-1 mt-2">
              {workerData.totalConsultingHours > 0 && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                  {workerData.totalConsultingHours.toFixed(1).replace(/\.0$/, '')}h
                </Badge>
              )}
              {workerData.totalHandsOnHours > 0 && (
                <Badge variant="outline" className="bg-violet-500/10 text-violet-500 border-violet-500/20">
                  {workerData.totalHandsOnHours.toFixed(1).replace(/\.0$/, '')}h
                </Badge>
              )}
              {workerData.totalSquadHours > 0 && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  {workerData.totalSquadHours.toFixed(1).replace(/\.0$/, '')}h
                </Badge>
              )}
              {workerData.totalInternalHours > 0 && (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  {workerData.totalInternalHours.toFixed(1).replace(/\.0$/, '')}h
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
