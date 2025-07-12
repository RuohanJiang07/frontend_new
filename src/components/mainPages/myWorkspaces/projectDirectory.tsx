import { useNavigate } from 'react-router-dom';
import { Card } from './card';
import { useEffect, useState } from 'react';
import { getAllWorkspaces, WorkspaceData } from '../../../api/mainPages/workspaces';
import { useToast } from '../../../hooks/useToast';

interface ProjectDirectoryProps {
  selectedProject: string;
  selectedTime: string;
  searchQuery: string;
  activeTab: string;
}

function ProjectDirectory({ selectedProject, selectedTime, searchQuery, activeTab }: ProjectDirectoryProps) {
  const navigate = useNavigate();
  const { error } = useToast();
  const [workspaces, setWorkspaces] = useState<WorkspaceData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch workspaces on component mount
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setLoading(true);
        const response = await getAllWorkspaces();
        
        if (response.success) {
          setWorkspaces(response.workspaces);
        } else {
          error('Failed to load workspaces. Please try again.');
        }
      } catch (err) {
        console.error('Error fetching workspaces:', err);
        error('Failed to load workspaces. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [error]);

  // Filter workspaces based on current filters
  const filteredWorkspaces = workspaces.filter(workspace => {
    // Filter by project name
    if (selectedProject !== "All Projects" && workspace.workspace_name !== selectedProject) {
      return false;
    }

    // Filter by search query
    if (searchQuery && !workspace.workspace_name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Filter by time
    if (selectedTime !== "All Time") {
      const now = new Date();
      const workspaceDate = new Date(workspace.created_at);
      const diffTime = now.getTime() - workspaceDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

      switch (selectedTime) {
        case "Last 24 Hours":
          return diffHours <= 24;
        case "Last 7 Days":
          return diffDays <= 7;
        case "Last 30 Days":
          return diffDays <= 30;
        case "Last 90 Days":
          return diffDays <= 90;
        default:
          return true;
      }
    }

    return true;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle workspace click - save workspace_id to localStorage
  const handleWorkspaceClick = (workspace: WorkspaceData) => {
    // Save workspace_id to localStorage for future API calls
    localStorage.setItem('current_workspace_id', workspace.workspace_id);
    
    // Navigate to workspace page
    navigate(`/workspace?title=${encodeURIComponent(workspace.workspace_name)}`);
  };

  if (loading) {
    return (
      <section className="w-full py-[4px] px-8">
        <div className="grid grid-cols-4 gap-7">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="w-full h-[230px]">
              <Card className="relative w-full h-full p-0 overflow-hidden border-0 bg-gray-100 animate-pulse">
                <div className="w-full h-full bg-gray-200">
                  <div className="absolute bottom-0 left-0 w-full">
                    <div className="w-full h-[53px] bg-white">
                    </div>
                    <div className="absolute bottom-[25px] left-[18px] w-24 h-4 bg-gray-300 rounded"></div>
                    <div className="absolute bottom-[6px] left-[18px] w-32 h-3 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-[4px] px-8">
      <div className="grid grid-cols-4 gap-7">
        {filteredWorkspaces.map((workspace) => (
          <div key={workspace.workspace_id} className="w-full h-[230px]">
            <Card className="relative w-full h-full p-0 overflow-hidden border-0 transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:shadow-md shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(${workspace.cover_url})`,
                  cursor: 'pointer' 
                }}
                onClick={() => handleWorkspaceClick(workspace)}
              >
                <div className="absolute bottom-0 left-0 w-full">
                  <div className="w-full h-[53px] bg-white">
                  </div>
                  <div className="absolute bottom-[25px] left-[18px] font-normal text-black text-sm">
                    {workspace.workspace_name}
                  </div>
                  <div className="absolute bottom-[6px] left-[18px] font-normal text-black text-xs">
                    {formatDate(workspace.created_at)}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
        
        {/* Show message if no workspaces found */}
        {filteredWorkspaces.length === 0 && !loading && (
          <div className="col-span-4 flex flex-col items-center justify-center py-12">
            <div className="text-gray-500 text-lg mb-2">No workspaces found</div>
            <div className="text-gray-400 text-sm">
              {searchQuery ? 'Try adjusting your search criteria' : 'Create your first workspace to get started'}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default ProjectDirectory