import React from 'react';
import { Calendar, SquareStack, Languages, Bell, Settings } from 'lucide-react';
import { ChevronDownIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { Button } from '../../../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import { Card } from '../../../components/mainPages/myWorkspaces/card';
import Sidebar from '../../../components/mainPages/myWorkspaces/sidebar';
import './HomePage.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="flex bg-[#f7f6f6] min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <header className="h-14 px-6 flex items-center justify-between border-b border-gray-100">
          <p className="font-['IBM_Plex_Sans'] text-lg ml-4">Home</p>
          <div className='flex items-center gap-3'>
            <button className="p-1.5 hover:scale-105 transition-transform">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-1.5 hover:scale-105 transition-transform">
              <Settings className="w-5 h-5" />
            </button>
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
          <div className="p-8">
            {/* Greeting Section */}
            <div className="mb-12" style={{ marginTop: '104px', marginLeft: '122px' }}>
              <h1 className="text-[#00276C] font-['IBM_Plex_Sans'] text-2xl font-semibold leading-tight">
                Hope it's been a great day for you,<br />
                John Doe!
              </h1>
            </div>

            {/* Quickstart Section */}
            <div className="mb-12" style={{ marginTop: '51px', marginLeft: '120px' }}>
              <div className="flex items-center gap-3 mb-6">
                <img 
                  src="/main/home_page/quickstart.svg" 
                  alt="Quickstart" 
                  className="w-6 h-6"
                />
                <h2 
                  className="text-[#00276C] font-['IBM_Plex_Sans']"
                  style={{
                    fontSize: '20px',
                    fontWeight: '510'
                  }}
                >
                  Quickstart
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" style={{ gap: '32px' }}>
                {/* Card 1: Lecture */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-32 bg-gray-100 flex items-center justify-center">
                    <div className="text-center p-4">
                      <div className="text-gray-600 mb-4">📝</div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
                        Start in My Workspace
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#1a1a1a] mb-3 font-['IBM_Plex_Sans']">
                      Lecture: Taking notes + Asking Questions
                    </h3>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full">Deep Learn</span>
                      <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">Smart Note</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Homework */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-32 bg-gray-100 flex items-center justify-center">
                    <div className="text-center p-4">
                      <div className="text-gray-600 mb-4">📚</div>
                      <div className="text-sm text-gray-600">AI-Powered Tools</div>
                      <div className="text-sm text-gray-600">Workspace Drive</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#1a1a1a] mb-3 font-['IBM_Plex_Sans']">
                      Homework: Viewing Notes + Problem Help
                    </h3>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">Smart Note</span>
                      <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">Problem Help</span>
                    </div>
                  </div>
                </div>

                {/* Card 3: Lecture (Duplicate) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-32 bg-gray-100 flex items-center justify-center">
                    <div className="text-center p-4">
                      <div className="text-gray-600 mb-4">📝</div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
                        Start in My Workspace
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#1a1a1a] mb-3 font-['IBM_Plex_Sans']">
                      Lecture: Taking notes + Asking Questions
                    </h3>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full">Deep Learn</span>
                      <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">Smart Note</span>
                    </div>
                  </div>
                </div>

                {/* Card 4: Homework (Duplicate) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-32 bg-gray-100 flex items-center justify-center">
                    <div className="text-center p-4">
                      <div className="text-gray-600 mb-4">📚</div>
                      <div className="text-sm text-gray-600">AI-Powered Tools</div>
                      <div className="text-sm text-gray-600">Workspace Drive</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#1a1a1a] mb-3 font-['IBM_Plex_Sans']">
                      Homework: Viewing Notes + Problem Help
                    </h3>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">Smart Note</span>
                      <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">Problem Help</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hyperknow News Section */}
            <div className="mb-12" style={{ marginLeft: '120px' }}>
              <div className="flex items-center gap-3 mb-6">
                <img 
                  src="/main/home_page/hyperknow-news.svg" 
                  alt="Hyperknow News" 
                  className="w-6 h-6"
                />
                <h2 className="text-[#00276C] font-['IBM_Plex_Sans'] text-xl font-semibold">Hyperknow News</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* News Card 1 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <div className="text-center p-4">
                      <div className="text-4xl mb-2">🎓</div>
                      <div className="text-sm text-gray-600">Students & Learning</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#1a1a1a] mb-2 font-['IBM_Plex_Sans'] text-sm">
                      Hyperknow closed Seed Round Fund raising
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>Jul, 12th 2025</span>
                    </div>
                  </div>
                </div>

                {/* News Card 2 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-32 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                    <div className="text-center p-4">
                      <div className="text-4xl mb-2">🎁</div>
                      <div className="text-sm text-gray-600">Free Pro Mode</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#1a1a1a] mb-2 font-['IBM_Plex_Sans'] text-sm">
                      Hyperknow gives all college students Free Pro mode for a month
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>Jul, 12th 2025</span>
                    </div>
                  </div>
                </div>

                {/* News Card 3 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-32 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center relative">
                    <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-semibold text-orange-600">
                      EDTECHWEEK
                    </div>
                    <div className="text-center p-4">
                      <div className="text-4xl mb-2">🏢</div>
                      <div className="text-sm text-gray-600">New York Event</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#1a1a1a] mb-2 font-['IBM_Plex_Sans'] text-sm">
                      Hyperknow at New York Ed Tech Week
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>Jul, 12th 2025</span>
                    </div>
                  </div>
                </div>

                {/* News Card 4 */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-32 bg-orange-500 flex items-center justify-center">
                    <div className="text-center p-4 text-white">
                      <div className="text-4xl mb-2 font-bold">P</div>
                      <div className="text-sm font-semibold">PRODUCT HUNT</div>
                      <div className="text-xs mt-1">#1 RANKED</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#1a1a1a] mb-2 font-['IBM_Plex_Sans'] text-sm">
                      Hyperknow Ranked #1 on Product Hunt
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>Jul, 12th 2025</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default HomePage; 