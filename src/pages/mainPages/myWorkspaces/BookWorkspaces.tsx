import './myWorkspaces.css';
import { TabProvider, useTabContext } from './TabContext';
import WorkspaceHeader from './WorkspaceHeader';
import VerticalTabsCard from './VerticalTabsCard';
import { useState } from 'react';
import SplitScreenPanel from './SplitScreenPanel';


function BookWorkspaces() {



  const {
    pages,
    activePage,
  } = useTabContext();


  // Fetch workspace names for the project filter dropdown

  console.log(pages);

  // 分屏弹窗控制
  const [showSplitModal, setShowSplitModal] = useState(false);

  return (
    <TabProvider>
      <div className="flex bg-[#f7f6f6] min-h-screen relative">
        <div className="flex-1 flex flex-col">
          <WorkspaceHeader />
          <main className="flex-1 flex flex-col py-4 px-4">
            <SplitScreenPanel />
          </main>
        </div>
      </div>
    </TabProvider>
  );
}

export default BookWorkspaces;