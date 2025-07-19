
import { TabProvider } from './TabContext';
import WorkspaceFrame from './workspaceFrame';

function BookWorkspaces() {
  // Fetch workspace names for the project filter dropdown
  // 分屏弹窗控制
  return (
    <TabProvider>
      <WorkspaceFrame />
    </TabProvider>
  );
}

export default BookWorkspaces;