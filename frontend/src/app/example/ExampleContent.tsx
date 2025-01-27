import { useEffect } from 'react';
import { useQueryBuilder } from '@/lib/graphql/QueryBuilderContext';
import { usePageQuery } from '@/lib/graphql/usePageQuery';

// Child component that adds a fragment to the query
function UserInfoSection() {
  const { addFragment } = useQueryBuilder();

  useEffect(() => {
    addFragment({
      id: 'userInfo',
      fragment: `
        user {
          name
          email
          role
        }
      `,
    });
  }, [addFragment]);

  return null;
}

// Another child component that adds its own fragment
function ProjectsSection() {
  const { addFragment } = useQueryBuilder();

  useEffect(() => {
    addFragment({
      id: 'projects',
      fragment: `
        projects {
          id
          title
          status
        }
      `,
    });
  }, [addFragment]);

  return null;
}

// Component that adds a fragment with variables
function TasksSection() {
  const { addFragment } = useQueryBuilder();

  useEffect(() => {
    addFragment({
      id: 'tasks',
      fragment: `
        tasks(status: $status) {
          id
          title
          dueDate
        }
      `,
      variables: {
        status: 'ACTIVE',
      },
    });
  }, [addFragment]);

  return null;
}

// Main content component that uses the combined query
export function ExampleContent() {
  const { data, loading, error } = usePageQuery<{
    user: { name: string; email: string; role: string };
    projects: Array<{ id: string; title: string; status: string }>;
    tasks: Array<{ id: string; title: string; dueDate: string }>;
  }>();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {/* These components will contribute their fragments to the query */}
      <UserInfoSection />
      <ProjectsSection />
      <TasksSection />

      {/* Display the data */}
      {data && (
        <div className="space-y-8">
          {/* User Info */}
          <div>
            <h2 className="text-2xl font-bold mb-4">User Info</h2>
            <div>
              <p>Name: {data.user.name}</p>
              <p>Email: {data.user.email}</p>
              <p>Role: {data.user.role}</p>
            </div>
          </div>

          {/* Projects */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Projects</h2>
            <div className="space-y-2">
              {data.projects.map(project => (
                <div key={project.id} className="p-4 bg-gray-100 rounded">
                  <h3 className="font-semibold">{project.title}</h3>
                  <p>Status: {project.status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Active Tasks</h2>
            <div className="space-y-2">
              {data.tasks.map(task => (
                <div key={task.id} className="p-4 bg-gray-100 rounded">
                  <h3 className="font-semibold">{task.title}</h3>
                  <p>Due: {task.dueDate}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 