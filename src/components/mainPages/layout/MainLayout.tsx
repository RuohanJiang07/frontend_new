import { ReactNode } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HomeIcon,
  FolderIcon,
  BookOpenIcon,
  UsersIcon,
  HardDriveIcon,
  SettingsIcon,
  CreditCardIcon,
  PhoneIcon,
  Share2Icon
} from 'lucide-react';

interface MainLayoutProps {
  children?: ReactNode;
}

// Move SidebarCardStack outside of MainLayout to prevent re-creation
const SIDEBAR_CARD_SIZE = 165;

const SIDEBAR_CARDS = [
  {
    id: 0,
    title: `New Version Release:\nHyperknow 3.0\nYour all-in-one study workspace`,
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    content: null,
  },
  {
    id: 1,
    title: "Placeholder Card 2",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    content: null,
  },
  {
    id: 2,
    title: "Placeholder Card 3",
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    content: null,
  },
];

function SidebarCardStack() {
  const CARD_OFFSET = 8;
  const SCALE_FACTOR = 0.05;
  const [cards, setCards] = useState(SIDEBAR_CARDS);
  useEffect(() => {
    const interval = setInterval(() => {
      setCards((prevCards) => {
        const newArray = [...prevCards];
        const lastCard = newArray.pop();
        if (lastCard) {
          newArray.unshift(lastCard);
        }
        return newArray;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="relative" style={{ height: SIDEBAR_CARD_SIZE, width: SIDEBAR_CARD_SIZE }}>
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          className="absolute dark:bg-black bg-white rounded-2xl p-3 shadow-xl border border-neutral-200 dark:border-white/[0.1] shadow-black/[0.1] dark:shadow-white/[0.05] flex flex-col justify-between"
          style={{
            height: SIDEBAR_CARD_SIZE,
            width: SIDEBAR_CARD_SIZE,
            transformOrigin: "top center",
          }}
          animate={{
            top: index * -CARD_OFFSET,
            scale: 1 - index * SCALE_FACTOR,
            zIndex: cards.length - index,
          }}
        >
          <div className="font-normal text-neutral-700 dark:text-neutral-200 flex flex-col gap-2 h-full">
            <div className="text-xs font-medium whitespace-pre-line leading-tight mb-2">{card.title}</div>
            <div className="flex justify-center items-end flex-1 relative" style={{height: '100%'}}>
              <img src={card.image} alt="card visual" className="rounded-xl object-cover" style={{width:150, height:70, position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)'}} />
            </div>
            {card.content && <div>{card.content}</div>}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Data for sidebar navigation items
  const mainNavItems = [
    { icon: <HomeIcon className="w-4 h-4" />, label: "Home", path: "/" },
    { icon: <FolderIcon className="w-4 h-4" />, label: "My Workspace", path: "/workspaces" },
    { icon: <BookOpenIcon className="w-4 h-4" />, label: "Tutorials", path: "/tutorials" },
    { icon: <UsersIcon className="w-4 h-4" />, label: "Community", path: "/community" },
    { icon: <HardDriveIcon className="w-4 h-4" />, label: "My Hyper Drive", path: "/drive" },
  ];

  // Data for bottom navigation items
  const bottomNavItems = [
    { icon: <SettingsIcon className="w-4 h-4" />, label: "Account Settings" },
    { icon: <CreditCardIcon className="w-4 h-4" />, label: "Subscriptions" },
    { icon: <PhoneIcon className="w-4 h-4" />, label: "Contact Us" },
    { icon: <Share2Icon className="w-4 h-4" />, label: "Social Media" },
  ];

  return (
    <div className="flex bg-[#f7f6f6] min-h-screen">
      {/* Sidebar */}
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
          {mainNavItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <div
                key={index}
                className={`flex items-center gap-2 hover:bg-white transition-colors px-2 py-[0.3rem] rounded-md cursor-pointer mx-2 ${
                  isActive ? 'bg-white' : ''
                }`}
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                <span className="font-['IBM_Plex_Sans',Helvetica] text-[14px] font-normal">
                  {item.label}
                </span>
              </div>
            );
          })}
        </nav>

        {/* Bottom navigation - pushed to bottom with flex-grow */}
        <div className="flex-grow"></div>
        
        {/* SidebarCardStack - 20px above account settings */}
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
          <SidebarCardStack />
        </div>
        
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children || <Outlet />}
      </main>
    </div>
  );
}

export default MainLayout; 