
import { TabProvider } from './TabContext';
import WorkspaceHeader from './WorkspaceHeader';

import SplitScreenPanel from './SplitScreenPanel';


function BookWorkspaces() {
  // Fetch workspace names for the project filter dropdown
  // 分屏弹窗控制
  return (
    <TabProvider>
      <div className="flex bg-[#f7f6f6]  relative">
        <div className="flex-1 flex flex-col">
          <WorkspaceHeader />
          <main className="flex-1 flex flex-col max-w-full pt-2 pb-4 px-4">
            <SplitScreenPanel />
          </main>
        </div>
      </div>
    </TabProvider>
  );
}

export default BookWorkspaces;