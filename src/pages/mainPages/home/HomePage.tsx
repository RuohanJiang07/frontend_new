import { useState } from 'react';
import { ChevronDownIcon, Languages, Bell, Settings, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { Button } from '../../../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import { Card } from '../../../components/mainPages/myWorkspaces/card';
import ProfileManagementModal from '../../../components/mainPages/myWorkspaces/profileManagementModal';
import { ToastContainer } from '../../../components/ui/ToastContainer';
import { useToast } from '../../../hooks/useToast';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const { toasts, removeToast, success, error } = useToast();
  const [isProfileManagementModalOpen, setIsProfileManagementModalOpen] = useState(false);

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <>
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <header className="h-14 px-6 flex items-center justify-between border-b border-gray-100">
        <p className="font-['IBM_Plex_Sans'] text-lg ml-4">Home</p>
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
        <div className="p-8">
          {/* Greeting Section */}
          <div className="mb-12" style={{ marginTop: '60px', marginLeft: '122px' }}>
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
            
            <div className="flex gap-8" style={{ gap: '30px' }}>
                              {/* Card 1: Lecture */}
              <div className="flex flex-col" style={{ width: '300px' }}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow card-hover relative group">
                  <img 
                    src="https://nutcracker-hyperknow-public.s3.us-east-2.amazonaws.com/public_assets/other_images/sample_quicksearch.png"
                    alt="Lecture Interface"
                    className="w-full h-36 object-cover transition-all duration-300 group-hover:brightness-50"
                  />
                  <div className="absolute inset-0 bg-gray-600 bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                    <button 
                      className="px-4 py-2 bg-[#DDE9FF] text-[#00276C] rounded-[5px] text-[15px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      onClick={() => navigate('/my-workspaces')}
                    >
                      Start in My Workspace
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <h3 
                    className="font-['IBM_Plex_Sans']"
                    style={{
                      fontSize: '15px',
                      fontStyle: 'normal',
                      fontWeight: '510',
                      color: '#1a1a1a',
                      marginBottom: '6px'
                    }}
                  >
                    Lecture: Taking notes + Asking Questions
                  </h3>
                  <div className="flex items-center" style={{ gap: '5.6px' }}>
                    <span 
                      className="rounded px-2"
                      style={{
                        height: '16px',
                        backgroundColor: '#D4E1F7',
                        color: '#23427A',
                        fontSize: '9px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 6px'
                      }}
                    >
                      Deep Learn
                    </span>
                    <span 
                      style={{
                        color: '#23427A',
                        fontSize: '9px',
                        fontWeight: 'bold'
                      }}
                    >
                      +
                    </span>
                    <span 
                      className="rounded px-2"
                      style={{
                        height: '16px',
                        backgroundColor: '#D4E1F7',
                        color: '#23427A',
                        fontSize: '9px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 6px'
                      }}
                    >
                      Smart Note
                    </span>
                  </div>
                </div>
              </div>

                              {/* Card 2: Homework */}
              <div className="flex flex-col" style={{ width: '300px' }}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow card-hover relative group">
                  <img 
                    src="https://nutcracker-hyperknow-public.s3.us-east-2.amazonaws.com/public_assets/other_images/sample_quicksearch.png"
                    alt="Homework Interface"
                    className="w-full h-36 object-cover transition-all duration-300 group-hover:brightness-50"
                  />
                  <div className="absolute inset-0 bg-gray-600 bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                    <button 
                      className="px-4 py-2 bg-[#DDE9FF] text-[#00276C] rounded-[5px] text-[15px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      onClick={() => navigate('/my-workspaces')}
                    >
                      Start in My Workspace
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <h3 
                    className="font-['IBM_Plex_Sans']"
                    style={{
                      fontSize: '15px',
                      fontStyle: 'normal',
                      fontWeight: '510',
                      color: '#1a1a1a',
                      marginBottom: '6px'
                    }}
                  >
                    Homework: Viewing Notes + Problem Help
                  </h3>
                  <div className="flex items-center" style={{ gap: '5.6px' }}>
                    <span 
                      className="rounded px-2"
                      style={{
                        height: '16px',
                        backgroundColor: '#D4E1F7',
                        color: '#23427A',
                        fontSize: '9px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 6px'
                      }}
                    >
                      Smart Note
                    </span>
                    <span 
                      style={{
                        color: '#23427A',
                        fontSize: '9px',
                        fontWeight: 'bold'
                      }}
                    >
                      +
                    </span>
                    <span 
                      className="rounded px-2"
                      style={{
                        height: '16px',
                        backgroundColor: '#D4E1F7',
                        color: '#23427A',
                        fontSize: '9px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 6px'
                      }}
                    >
                      Problem Help
                    </span>
                  </div>
                </div>
              </div>

                              {/* Card 3: Lecture (Duplicate) */}
              <div className="flex flex-col" style={{ width: '300px' }}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow card-hover relative group">
                  <img 
                    src="https://nutcracker-hyperknow-public.s3.us-east-2.amazonaws.com/public_assets/other_images/sample_quicksearch.png"
                    alt="Lecture Interface"
                    className="w-full h-36 object-cover transition-all duration-300 group-hover:brightness-50"
                  />
                  <div className="absolute inset-0 bg-gray-600 bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                    <button 
                      className="px-4 py-2 bg-[#DDE9FF] text-[#00276C] rounded-[5px] text-[15px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      onClick={() => navigate('/my-workspaces')}
                    >
                      Start in My Workspace
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <h3 
                    className="font-['IBM_Plex_Sans']"
                    style={{
                      fontSize: '15px',
                      fontStyle: 'normal',
                      fontWeight: '510',
                      color: '#1a1a1a',
                      marginBottom: '6px'
                    }}
                  >
                    Lecture: Taking notes + Asking Questions
                  </h3>
                  <div className="flex items-center" style={{ gap: '5.6px' }}>
                    <span 
                      className="rounded px-2"
                      style={{
                        height: '16px',
                        backgroundColor: '#D4E1F7',
                        color: '#23427A',
                        fontSize: '9px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 6px'
                      }}
                    >
                      Deep Learn
                    </span>
                    <span 
                      style={{
                        color: '#23427A',
                        fontSize: '9px',
                        fontWeight: 'bold'
                      }}
                    >
                      +
                    </span>
                    <span 
                      className="rounded px-2"
                      style={{
                        height: '16px',
                        backgroundColor: '#D4E1F7',
                        color: '#23427A',
                        fontSize: '9px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 6px'
                      }}
                    >
                      Smart Note
                    </span>
                  </div>
                </div>
              </div>

                              {/* Card 4: Homework (Duplicate) */}
              <div className="flex flex-col" style={{ width: '300px' }}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow card-hover relative group">
                  <img 
                    src="https://nutcracker-hyperknow-public.s3.us-east-2.amazonaws.com/public_assets/other_images/sample_quicksearch.png"
                    alt="Homework Interface"
                    className="w-full h-36 object-cover transition-all duration-300 group-hover:brightness-50"
                  />
                  <div className="absolute inset-0 bg-gray-600 bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                    <button 
                      className="px-4 py-2 bg-[#DDE9FF] text-[#00276C] rounded-[5px] text-[15px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      onClick={() => navigate('/my-workspaces')}
                    >
                      Start in My Workspace
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <h3 
                    className="font-['IBM_Plex_Sans']"
                    style={{
                      fontSize: '15px',
                      fontStyle: 'normal',
                      fontWeight: '510',
                      color: '#1a1a1a',
                      marginBottom: '6px'
                    }}
                  >
                    Homework: Viewing Notes + Problem Help
                  </h3>
                  <div className="flex items-center" style={{ gap: '5.6px' }}>
                    <span 
                      className="rounded px-2"
                      style={{
                        height: '16px',
                        backgroundColor: '#D4E1F7',
                        color: '#23427A',
                        fontSize: '9px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 6px'
                      }}
                    >
                      Smart Note
                    </span>
                    <span 
                      style={{
                        color: '#23427A',
                        fontSize: '9px',
                        fontWeight: 'bold'
                      }}
                    >
                      +
                    </span>
                    <span 
                      className="rounded px-2"
                      style={{
                        height: '16px',
                        backgroundColor: '#D4E1F7',
                        color: '#23427A',
                        fontSize: '9px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 6px'
                      }}
                    >
                      Problem Help
                    </span>
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
            
            <div className="flex gap-8" style={{ gap: '30px' }}>
              {/* News Card 1: Fundraising */}
              <div className="flex flex-col" style={{ width: '300px' }}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow card-hover">
                  <img 
                    src="https://nutcracker-hyperknow-public.s3.us-east-2.amazonaws.com/public_assets/other_images/sample_news.jpg"
                    alt="Fundraising Announcement"
                    className="w-full h-36 object-cover rounded-t-xl"
                  />
                  <div className="p-3">
                    <h3 
                      className="font-['IBM_Plex_Sans']"
                      style={{
                        fontSize: '15px',
                        fontStyle: 'normal',
                        fontWeight: '510',
                        color: '#1a1a1a',
                        marginBottom: '8px',
                        lineHeight: '1.3'
                      }}
                    >
                      Hyperknow closed Seed Round Fund raising
                    </h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span 
                        style={{
                          color: '#666666',
                          fontSize: '12px',
                          fontFamily: 'IBM Plex Sans'
                        }}
                      >
                        Jul, 12th 2025
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* News Card 2: Free Pro Mode */}
              <div className="flex flex-col" style={{ width: '300px' }}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow card-hover">
                  <img 
                    src="https://nutcracker-hyperknow-public.s3.us-east-2.amazonaws.com/public_assets/other_images/sample_news.jpg"
                    alt="Free Pro Mode"
                    className="w-full h-36 object-cover rounded-t-xl"
                  />
                  <div className="p-3">
                    <h3 
                      className="font-['IBM_Plex_Sans']"
                      style={{
                        fontSize: '15px',
                        fontStyle: 'normal',
                        fontWeight: '510',
                        color: '#1a1a1a',
                        marginBottom: '8px',
                        lineHeight: '1.3'
                      }}
                    >
                      Hyperknow gives all college students Free Pro mode for a month
                    </h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span 
                        style={{
                          color: '#666666',
                          fontSize: '12px',
                          fontFamily: 'IBM Plex Sans'
                        }}
                      >
                        Jul, 10th 2025
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* News Card 3: Ed Tech Week */}
              <div className="flex flex-col" style={{ width: '300px' }}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow card-hover">
                  <img 
                    src="https://nutcracker-hyperknow-public.s3.us-east-2.amazonaws.com/public_assets/other_images/sample_news.jpg"
                    alt="Ed Tech Week"
                    className="w-full h-36 object-cover rounded-t-xl"
                  />
                  <div className="p-3">
                    <h3 
                      className="font-['IBM_Plex_Sans']"
                      style={{
                        fontSize: '15px',
                        fontStyle: 'normal',
                        fontWeight: '510',
                        color: '#1a1a1a',
                        marginBottom: '8px',
                        lineHeight: '1.3'
                      }}
                    >
                      Hyperknow at New York Ed Tech Week
                    </h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span 
                        style={{
                          color: '#666666',
                          fontSize: '12px',
                          fontFamily: 'IBM Plex Sans'
                        }}
                      >
                        Jul, 8th 2025
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* News Card 4: Product Hunt */}
              <div className="flex flex-col" style={{ width: '300px' }}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow card-hover">
                  <img 
                    src="https://nutcracker-hyperknow-public.s3.us-east-2.amazonaws.com/public_assets/other_images/sample_news.jpg"
                    alt="Product Hunt Ranking"
                    className="w-full h-36 object-cover rounded-t-xl"
                  />
                  <div className="p-3">
                    <h3 
                      className="font-['IBM_Plex_Sans']"
                      style={{
                        fontSize: '15px',
                        fontStyle: 'normal',
                        fontWeight: '510',
                        color: '#1a1a1a',
                        marginBottom: '8px',
                        lineHeight: '1.3'
                      }}
                    >
                      Hyperknow Ranked #1 on Product Hunt
                    </h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span 
                        style={{
                          color: '#666666',
                          fontSize: '12px',
                          fontFamily: 'IBM Plex Sans'
                        }}
                      >
                        Jul, 5th 2025
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <ProfileManagementModal
        isOpen={isProfileManagementModalOpen}
        onClose={() => setIsProfileManagementModalOpen(false)}
      />
    </>
  );
}

export default HomePage; 