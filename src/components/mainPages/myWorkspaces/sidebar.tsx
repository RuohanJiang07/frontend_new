import {
  HomeIcon,
  FolderIcon,
  BookOpenIcon,
  UsersIcon,
  HardDriveIcon,
  FileTextIcon,
  SearchIcon,
  BrainCircuitIcon,
  SettingsIcon,
  CreditCardIcon,
  PhoneIcon,
  Share2Icon
} from 'lucide-react';
import { Button } from '../../ui/button';

function Sidebar() {
  // Data for sidebar navigation items
  const mainNavItems = [
    { icon: <HomeIcon className="w-4 h-4" />, label: "Home" },
    { icon: <FolderIcon className="w-4 h-4" />, label: "My Workspace" },
    { icon: <BookOpenIcon className="w-4 h-4" />, label: "Tutorials" },
    { icon: <UsersIcon className="w-4 h-4" />, label: "Community" },
    { icon: <HardDriveIcon className="w-4 h-4" />, label: "My Hyper Drive" },
  ];

  // Data for quick action buttons
  const quickActions = [
    { label: "Start new note", icon: <FileTextIcon className="w-4 h-4" /> },
    { label: "Open File Assistant", icon: <SearchIcon className="w-4 h-4" /> },
    { label: "Start Deep Research", icon: <BrainCircuitIcon className="w-4 h-4" /> },
  ];

  // Data for bottom navigation items
  const bottomNavItems = [
    { icon: <SettingsIcon className="w-4 h-4" />, label: "Account Settings" },
    { icon: <CreditCardIcon className="w-4 h-4" />, label: "Subscriptions" },
    { icon: <PhoneIcon className="w-4 h-4" />, label: "Contact Us" },
    { icon: <Share2Icon className="w-4 h-4" />, label: "Social Media" },
  ];

  return (
    <div className="w-[190px] flex flex-col pt-[23px] px-[8px] pb-[30px]">
      {/* Logo - 只保留图标，移除文字 */}
      <div className="flex items-center gap-2 px-2">
        <img
          className="w-[34px] h-[29px]"
          alt="Hyperknow logo"
          src="/main/landing_page/hyperknow_logo 1.svg"
        />
      </div>

      {/* Main navigation - 添加 mt-8 来向下移动 */}
      <nav className="flex flex-col space-y-1 mt-8">
        {mainNavItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 hover:bg-white transition-colors px-2 py-[0.3rem] rounded-md cursor-pointer mx-2"
          >
            {item.icon}
            <span className="font-['IBM_Plex_Sans',Helvetica] text-[14px] font-normal">
              {item.label}
            </span>
          </div>
        ))}
      </nav>

      {/* Quick Actions - 增加更多的 margin-top 来向下移动更多 */}
      <div className="mt-12">
        <h3 className="font-['IBM_Plex_Sans',Helvetica] font-medium text-xs ml-4">
          Quick Actions
        </h3>
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="p-0 px-2 w-[152px] justify-start h-[28px] text-[#898989] border-dashed border-[#898989] bg-white mt-2 ml-4 font-normal"
          >
            {action.icon}
            <span className="ml-[2px] font-['IBM_Plex_Sans',Helvetica] font-normal text-[12px]">
              {action.label}
            </span>
          </Button>
        ))}
      </div>

      {/* Bottom navigation - pushed to bottom with flex-grow */}
      <div className="flex-grow"></div>
      <nav className="flex flex-col space-y-1">
        {bottomNavItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 hover:bg-white transition-colors px-2 py-[0.3rem] rounded-md cursor-pointer mx-2"
          >
            {item.icon}
            <span className="font-['IBM_Plex_Sans',Helvetica] text-[14px] font-normal">
              {item.label}
            </span>
          </div>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar