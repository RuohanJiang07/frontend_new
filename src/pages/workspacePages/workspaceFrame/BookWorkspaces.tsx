
import { TabProvider } from './TabContext';
import WorkspaceHeader from './WorkspaceHeader';

import SplitScreenPanel from './SplitScreenPanel';


function BookWorkspaces() {
  // Fetch workspace names for the project filter dropdown
  // 分屏弹窗控制
  return (
    <TabProvider>
      <div className="flex bg-[#f7f6f6]  relative w-full ">
        <div className="flex flex-col w-full ">
          <WorkspaceHeader />
          <main className="flex flex-col max-w-full py-4 px-4 overflow-auto scrollbar-hide">
            <SplitScreenPanel />
          </main>
        </div>
      </div>
    </TabProvider>
  );
}

export default BookWorkspaces;