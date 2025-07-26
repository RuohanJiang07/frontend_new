import { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon, Languages, PlusIcon, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import './myWorkspaces.css';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { Button } from '../../../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import { Card } from '../../../components/mainPages/myWorkspaces/card';
import ProjectDirectory from '../../../components/mainPages/myWorkspaces/projectDirectory';
import { ShiftingDropDown } from '../../../components/mainPages/myWorkspaces/shiftingDropdown';
import CreateWorkspaceModal from '../../../components/mainPages/myWorkspaces/createWorkspaceModal/createWorkspaceModal';
import ProfileManagementModal from '../../../components/mainPages/myWorkspaces/ProfileManagementModal';
import { ToastContainer } from '../../../components/ui/ToastContainer';
import { useToast } from '../../../hooks/useToast';
import { getAllWorkspaces } from '../../../api/mainPages/workspaces';

function MyWorkspaces() {
  const navigate = useNavigate();
  const { toasts, removeToast, success, error } = useToast();

  const allTabs = [
    {
      id: "project-directory",
      name: "Project Directory",
    },
    {
      id: "shared-projects",
      name: "Shared Projects",
    },
    {
      id: "published-projects",
      name: "Published Projects",
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileManagementModalOpen, setIsProfileManagementModalOpen] = useState(false);
  const tabsRef = useRef<(HTMLElement | null)[]>([]);
  const [activeTabIndex, setActiveTabIndex] = useState<number | null>(0);
  const [tabUnderlineWidth, setTabUnderlineWidth] = useState(0);
  const [tabUnderlineLeft, setTabUnderlineLeft] = useState(0);
  const [selectedProject, setSelectedProject] = useState<string>("All Projects");
  const [selectedTime, setSelectedTime] = useState<string>("All Time");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [projectNames, setProjectNames] = useState<string[]>(["All Projects"]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const timeFilters = [
    "All Time",
    "Last 24 Hours",
    "Last 7 Days",
    "Last 30 Days",
    "Last 90 Days"
  ];

  // Fetch workspace names for the project filter dropdown
  useEffect(() => {
    const fetchWorkspaceNames = async () => {
      try {
        const response = await getAllWorkspaces();
        if (response.success) {
          const names = response.workspaces.map(workspace => workspace.workspace_name);
          const uniqueNames = Array.from(new Set(names));
          setProjectNames(["All Projects", ...uniqueNames]);
        }
      } catch (err) {
        console.error('Error fetching workspace names:', err);
        error('Failed to load workspace names for filter');
      }
    };

    fetchWorkspaceNames();
  }, [error, refreshTrigger]);

  useEffect(() => {
    if (activeTabIndex === null) {
      return;
    }

    const setTabPosition = () => {
      const currentTab = tabsRef.current[activeTabIndex] as HTMLElement;
      setTabUnderlineLeft(currentTab?.offsetLeft ?? 0);
      setTabUnderlineWidth(currentTab?.clientWidth ?? 0);
    };

    setTabPosition();
  }, [activeTabIndex]);

  const handleCreateWorkspace = (data: any) => {
    console.log('Creating workspace with data:', data);
    success(`Workspace "${data.name}" created successfully!`);
    setIsModalOpen(false);

    // Refresh the workspace list by triggering a re-fetch
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <>
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <header className="h-14 px-6 flex items-center justify-between border-b border-gray-100">
        <p className="font-['IBM_Plex_Sans'] text-lg ml-4">My Workspaces</p>
        <div className='flex items-center gap-3'>
          <button className="p-1.5 hover:scale-105 transition-transform">
            <Languages className="w-5 h-5" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="rounded-[20px] border-[#bcbcbc] h-9 px-2"
                onClick={handleLoginClick}
              >
                <div className="flex items-center gap-2 bg-transparent">
                  <Avatar className="w-6 h-6">
                    <AvatarImage
                      src="/main/landing_page/avatars.png"
                      alt="John Doe"
                    />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <span className="font-['IBM_Plex_Sans'] text-sm">
                    John Doe
                  </span>
                  <ChevronDownIcon className="w-3.5 h-3.5" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='dropdown-content'>
              <DropdownMenuItem className='dropdown-item'>Profile</DropdownMenuItem>
              <DropdownMenuItem className='dropdown-item'>Settings</DropdownMenuItem>
              <DropdownMenuItem className='dropdown-item' onClick={handleLoginClick}>Login</DropdownMenuItem>
              <DropdownMenuItem className='dropdown-item'>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <Card className="flex-1 rounded-tl-[20px] rounded-tr-none rounded-br-none rounded-bl-none shadow-none border-none">
        <div className="flex justify-between p-4">
          <div className="flew-row relative flex h-auto p-3 rounded-3xl bg-transparent px-2 backdrop-blur-sm">
            <span
              className="absolute bottom-0 top-0 -z-10 flex overflow-hidden rounded-3xl py-2 transition-all duration-300"
              style={{ left: tabUnderlineLeft, width: tabUnderlineWidth }}
            >
              <span className="h-full w-full rounded-3xl bg-[#ECF1F6]" />
            </span>
            {allTabs.map((tab, index) => {
              return (
                <button
                  key={index}
                  ref={(el) => (tabsRef.current[index] = el)}
                  className={`my-auto cursor-pointer select-none rounded-full px-4 text-center font-['IBM_Plex_Sans'] text-black text-sm`}
                  onClick={() => setActiveTabIndex(index)}
                >
                  {tab.name}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-[29px] min-w-[113px] max-w-[200px] bg-white border-[#949494] rounded-lg flex items-center justify-between px-2 hover:bg-gray-50"
              onClick={() => setIsProfileManagementModalOpen(true)}
            >
              <div className="flex items-center gap-2">
                <img 
                  src="/workspace/deepLearn/contacts-line.svg" 
                  alt="Profile" 
                  className="w-4 h-4"
                  style={{ filter: 'brightness(0) saturate(100%) invert(39%) sepia(0%) saturate(0%) hue-rotate(147deg) brightness(94%) contrast(87%)' }}
                />
                <span className="text-sm text-gray-600 truncate">Profile Manager</span>
              </div>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-[29px] min-w-[113px] max-w-[200px] bg-white border-[#949494] rounded-lg flex items-center justify-between px-2"
                >
                  <span className="text-sm text-gray-600 truncate">{selectedProject}</span>
                  <ChevronDownIcon className="w-4 h-4 flex-shrink-0 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="dropdown-content">
                {projectNames.map((name, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => setSelectedProject(name)}
                    className="dropdown-item"
                  >
                    {name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-[29px] min-w-[113px] max-w-[200px] bg-white border-[#949494] rounded-lg flex items-center justify-between px-2"
                >
                  <span className="text-sm text-gray-600 truncate">{selectedTime}</span>
                  <ChevronDownIcon className="w-4 h-4 flex-shrink-0 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="dropdown-content">
                {timeFilters.map((time, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => setSelectedTime(time)}
                    className="dropdown-item"
                  >
                    {time}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="relative h-[29px] w-[219px]">
              <input
                type="text"
                placeholder="Search projects..."
                className="h-full w-full bg-white border-[#949494] rounded-lg pl-8 pr-2 text-sm text-gray-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            <ShiftingDropDown
              trigger={
                <>
                  <PlusIcon className="w-[17px] h-[18px] mr-1" />
                  Create
                </>
              }
              items={[
                { title: "New Project", onClick: () => setIsModalOpen(true) },
                { title: "New Folder", onClick: () => console.log("New Folder") },
                { title: "New Document", onClick: () => console.log("New Document") }
              ]}
            />
          </div>
        </div>

        <ProjectDirectory
          selectedProject={selectedProject}
          selectedTime={selectedTime}
          searchQuery={searchQuery}
          activeTab={activeTabIndex !== null ? allTabs[activeTabIndex].id : "project-directory"}
          key={refreshTrigger} // Force re-render when refreshTrigger changes
        />
      </Card>

      <CreateWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateWorkspace}
      />

      <ProfileManagementModal
        isOpen={isProfileManagementModalOpen}
        onClose={() => setIsProfileManagementModalOpen(false)}
      />
    </>
  );
}

export default MyWorkspaces;