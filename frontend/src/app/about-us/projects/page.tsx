"use client";

import { Heading } from "@/components/catalyst/heading";
import { gql, useQuery } from "@apollo/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/catalyst/badge";
import { CalendarIcon, ListIcon, StarIcon, AlertCircle, AlertTriangle } from "lucide-react";
import { format, isPast, parseISO } from 'date-fns';
import { useState, useMemo } from 'react';
import SelectComponent from "react-tailwindcss-select";
import { Option } from "react-tailwindcss-select/dist/components/type";

const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      isFavorite
      folder
      name
      expectedDueDate
      numberOfTasks
      tasks {
        due
        content
      }
      errors
    }
  }
`;

export default function Projects() {
  const { loading, error, data } = useQuery(GET_PROJECTS);
  const [selectedFolders, setSelectedFolders] = useState<Option[]>([]);

  const folders = useMemo(() => {
    if (!data) return [];
    const folderSet = new Set(data.projects.map((project: any) => project.folder).filter(Boolean));
    return Array.from(folderSet) as string[];
  }, [data]);

  const folderOptions = useMemo(() => folders.map((folder: string) => ({
    value: folder,
    label: folder,
  })), [folders]);

  const filteredProjects = useMemo(() => {
    if (!data) return [];
    return data.projects.filter((project: any) => 
      selectedFolders.length === 0 || selectedFolders.some(sf => sf && sf.value === project.folder)
    );
  }, [data, selectedFolders]);

  const spotlightProjects = useMemo(() => filteredProjects.filter((project: any) => project.isFavorite), [filteredProjects]);
  const otherProjects = useMemo(() => filteredProjects.filter((project: any) => !project.isFavorite), [filteredProjects]);

  const handleFolderChange = (value: Option | Option[] | null) => {
    setSelectedFolders(Array.isArray(value) ? value : value ? [value] : []);
  };

  const getNextTask = (tasks: any[]) => {
    if (!tasks || tasks.length === 0) return null;
    const sortedTasks = tasks
      .filter(task => task.due)
      .sort((a, b) => parseISO(a.due).getTime() - parseISO(b.due).getTime());
    return sortedTasks[0];
  };

  const renderProjectCard = (project: any) => {
    const isLate = project.expectedDueDate && isPast(new Date(project.expectedDueDate));
    const nextTask = getNextTask(project.tasks);
    const isNextTaskLate = nextTask && isPast(parseISO(nextTask.due));
    const hasProblems = !project.expectedDueDate || project.numberOfTasks === 0 || isLate;

    return (
      <a 
        href={`https://todoist.com/showProject?id=${project.id}`}
        target="_blank"
        rel="noopener noreferrer"
        key={project.id}
        className="block"
      >
        <Card 
          className={`hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${hasProblems ? 'bg-rose-100' : ''} relative`}
        >
          {hasProblems && (
            <div className="absolute -top-2 -left-2 z-10">
              <div className="bg-red-500 rounded-full p-1">
                <AlertTriangle className="text-white" size={20} />
              </div>
            </div>
          )}
          <CardHeader className="flex flex-col items-start pb-2">
            {project.folder && (
              <Badge color="zinc" className="mb-2">
                {project.folder}
              </Badge>
            )}
            <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {project.expectedDueDate
                ? format(new Date(project.expectedDueDate), 'MMM dd')
                : "No due date"}
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <ListIcon className="mr-2 h-4 w-4" />
              {project.numberOfTasks} tasks
            </div>
            {nextTask && (
              <div className={`mt-4 p-2 rounded-md border ${isNextTaskLate ? 'border-amber-500 bg-amber-50' : 'border-blue-200 bg-blue-50'}`}>
                <div className="flex items-center mb-1">
                  <AlertCircle className={`mr-2 h-4 w-4 ${isNextTaskLate ? 'text-amber-500' : 'text-blue-500'}`} />
                  <span className="font-semibold text-sm text-gray-700">Next Task</span>
                </div>
                <p className="text-sm text-gray-600">{nextTask.content}</p>
                <p className={`text-xs mt-1 ${isNextTaskLate ? 'text-amber-600' : 'text-blue-600'}`}>
                  Due: {format(parseISO(nextTask.due), 'MMM dd, yyyy')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </a>
    );
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="container mx-auto py-8">
      <SelectComponent
        value={selectedFolders}
        options={folderOptions}
        onChange={handleFolderChange}
        placeholder="Select folders"
        primaryColor={""}
        isMultiple={true}
        isSearchable={true}
        isClearable={true}
        classNames={{
          menuButton: () => 'flex text-sm text-gray-500 border border-gray-300 rounded shadow-sm transition-all duration-300 focus:outline-none',
        }}
      />

      <div className="flex justify-between items-center mb-4 mt-4">
        <Heading className="text-3xl font-bold text-gray-800">Spotlight</Heading>
        <span className="text-xl font-semibold text-gray-600">{spotlightProjects.length}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {spotlightProjects.map(renderProjectCard)}
      </div>

      <div className="flex justify-between items-center mb-4">
        <Heading className="text-3xl font-bold text-gray-800">Other Projects</Heading>
        <span className="text-xl font-semibold text-gray-600">{otherProjects.length}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {otherProjects.map(renderProjectCard)}
      </div>
    </div>
  );
}
