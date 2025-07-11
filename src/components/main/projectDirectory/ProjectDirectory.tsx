import { useNavigate } from 'react-router-dom';
import { Card } from '../../ui/card';

interface ProjectDirectoryProps {
  selectedProject: string;
  selectedTime: string;
  searchQuery: string;
  activeTab: string;
}

function ProjectDirectory({ selectedProject, selectedTime, searchQuery, activeTab }: ProjectDirectoryProps) {
  const navigate = useNavigate();
  // Project data for mapping
  const projects = [
    {
      id: 1,
      backgroundImage: "/main/landing_page/projectRectangle/rectangle-1.png",
      title: "Computer Science",
      editTime: "2025-03-20 14:30",
      type: "published-projects"
    },
    {
      id: 2,
      backgroundImage: "/main/landing_page/projectRectangle/rectangle-2.png",
      title: "Mathematics",
      editTime: "2025-03-19 09:15",
      type: "shared-projects"
    },
    {
      id: 3,
      backgroundImage: "/main/landing_page/projectRectangle/rectangle-3.png",
      title: "Physics",
      editTime: "2025-03-17 16:45",
      type: "published-projects"
    },
    {
      id: 4,
      backgroundImage: "/main/landing_page/projectRectangle/rectangle-4.png",
      title: "Chemistry",
      editTime: "2025-03-13 11:20",
      type: "published-projects"
    },
    {
      id: 5,
      backgroundImage: "/main/landing_page/projectRectangle/rectangle-5.png",
      title: "Biology",
      editTime: "2025-03-06 15:40",
      type: "shared-projects"
    },
    {
      id: 6,
      backgroundImage: "/main/landing_page/projectRectangle/rectangle-6.png",
      title: "Literature",
      editTime: "2025-02-28 10:25",
      type: "published-projects"
    },
    {
      id: 7,
      backgroundImage: "/main/landing_page/projectRectangle/rectangle-7.png",
      title: "History",
      editTime: "2025-02-20 13:50",
      type: "shared-projects"
    },
    {
      id: 8,
      backgroundImage: "/main/landing_page/projectRectangle/rectangle-8.png",
      title: "Philosophy",
      editTime: "2025-01-20 08:35",
      type: "shared-projects"
    },
  ];

  const filteredProjects = projects.filter(project => {
    // Filter by tab type
    if (activeTab !== "project-directory" && project.type !== activeTab) {
      return false;
    }

    // Filter by project name
    if (selectedProject !== "All Projects" && project.title !== selectedProject) {
      return false;
    }

    // Filter by search query
    if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Filter by time
    if (selectedTime !== "All Time") {
      const now = new Date();
      const projectDate = new Date(project.editTime);
      const diffTime = now.getTime() - projectDate.getTime();
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

  return (
    <section className="w-full py-[4px] px-8">
      <div className="grid grid-cols-4 gap-7">
        {filteredProjects.map((project) => (
          <div key={project.id} className="w-full h-[230px]">
            <Card className="relative w-full h-full p-0 overflow-hidden border-0 transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:shadow-md shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${project.backgroundImage})`, cursor: 'pointer' }}
                onClick={() => navigate(`/workspace?title=${encodeURIComponent(project.title)}`)}
              >
                <div className="absolute bottom-0 left-0 w-full">
                  <div className="w-full h-[53px] bg-white">
                  </div>
                  <div className="absolute bottom-[25px] left-[18px] font-normal text-black text-sm">
                    {project.title}
                  </div>
                  <div className="absolute bottom-[6px] left-[18px] font-normal text-black text-xs">
                    {project.editTime}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ProjectDirectory