// the workspace shell (split screen, tabs, windows)

import React from 'react'
import {
  ArrowLeftIcon,
  ColumnsIcon,
  MoreHorizontalIcon,
  Plus,
  SearchIcon,
  Share2Icon,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Tab } from '../../components/ui/tab';

import { DefaultContent } from '../../components/workspacePage/DefaultContent';


interface TabData {
  id: string;
  title: string;
  activeView?: string | null; // Track which view is active for this tab
}

interface PanelData {
  id: string;
  tabs: TabData[];
  activeTabId: string;
}

interface WindowData {
  id: string;
  panels: PanelData[];
  isActive: boolean;
}

// Data migration function to ensure all tabs have activeView field
const migrateWorkspaceData = (data: WindowData[]): WindowData[] => {
  return data.map(window => ({
    ...window,
    panels: window.panels.map(panel => ({
      ...panel,
      tabs: panel.tabs.map(tab => ({
        ...tab,
        activeView: tab.activeView ?? null
      }))
    }))
  }));
};

// Helper function to generate unique IDs
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to get default workspace state
const getDefaultWorkspaceState = (): WindowData[] => {
  const tabId = generateId();
  return [{
    id: generateId(),
    panels: [{
      id: generateId(),
      tabs: [{ id: tabId, title: "New tab", activeView: null }],
      activeTabId: tabId
    }],
    isActive: true
  }];
};

function WorkspacePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [workspaceTitle, setWorkspaceTitle] = useState("WORKSPACE NAME");
  const [dragOverPanelId, setDragOverPanelId] = useState<string | null>(null);

  // Get localStorage key based on title
  const getStorageKey = (title: string) => `workspaceState_${title}`;

  const [windows, setWindows] = useState<WindowData[]>(() => {
    // Load from localStorage on initial render
    const title = searchParams.get('title') || "WORKSPACE NAME";
    const storageKey = getStorageKey(title);
    const saved = localStorage.getItem(storageKey);
    console.log(`Attempting to load workspace state for title "${title}" from localStorage...`);

    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        console.log('Parsed data from localStorage:', parsedData);

        // Validate the parsed data structure
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          // Migrate data to ensure all tabs have activeView field
          const migratedData = migrateWorkspaceData(parsedData);
          console.log(`Successfully loaded and migrated workspace state for "${title}" from localStorage:`, {
            windowsCount: migratedData.length,
            totalTabs: migratedData.reduce((acc, window) =>
              acc + window.panels.reduce((panelAcc, panel) =>
                panelAcc + panel.tabs.length, 0), 0)
          });
          return migratedData;
        } else {
          console.warn(`Invalid workspace state structure for "${title}", using default state`);
          localStorage.removeItem(storageKey); // Clean up invalid data
          return getDefaultWorkspaceState();
        }
      } catch (e) {
        console.error(`Failed to parse saved workspace state for "${title}":`, e);
        localStorage.removeItem(storageKey); // Clean up corrupted data
        return getDefaultWorkspaceState();
      }
    }
    console.log(`No saved workspace state found for "${title}", using default state`);
    return getDefaultWorkspaceState();
  });

  // Save to localStorage whenever windows state changes
  useEffect(() => {
    try {
      const stateToSave = JSON.stringify(windows);
      localStorage.setItem(getStorageKey(workspaceTitle), stateToSave);
      console.log('Successfully saved workspace state to localStorage:', {
        windowsCount: windows.length,
        totalTabs: windows.reduce((acc, window) =>
          acc + window.panels.reduce((panelAcc, panel) =>
            panelAcc + panel.tabs.length, 0), 0),
        stateSize: stateToSave.length
      });
    } catch (e) {
      console.error('Failed to save workspace state to localStorage:', e);
      // Try to clear localStorage if it's full
      try {
        localStorage.clear();
        localStorage.setItem(getStorageKey(workspaceTitle), JSON.stringify(windows));
        console.log('Cleared localStorage and retried saving');
      } catch (retryError) {
        console.error('Failed to save even after clearing localStorage:', retryError);
      }
    }
  }, [windows, workspaceTitle]);

  useEffect(() => {
    const title = searchParams.get('title');
    if (title) {
      setWorkspaceTitle(title);
    }
  }, [searchParams]);

  // Handle title change - reload workspace state for new title
  useEffect(() => {
    const storageKey = getStorageKey(workspaceTitle);
    const saved = localStorage.getItem(storageKey);
    console.log(`Title changed to "${workspaceTitle}", loading corresponding workspace state...`);

    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          const migratedData = migrateWorkspaceData(parsedData);
          setWindows(migratedData);
          console.log(`Successfully loaded workspace state for "${workspaceTitle}"`);
        } else {
          console.warn(`Invalid workspace state for "${workspaceTitle}", using default state`);
          setWindows(getDefaultWorkspaceState());
        }
      } catch (e) {
        console.error(`Failed to parse workspace state for "${workspaceTitle}":`, e);
        setWindows(getDefaultWorkspaceState());
      }
    } else {
      console.log(`No saved workspace state for "${workspaceTitle}", using default state`);
      setWindows(getDefaultWorkspaceState());
    }
  }, [workspaceTitle]);

  // Debug: Check localStorage on mount
  useEffect(() => {
    console.log('WorkspacePage mounted, checking localStorage...');
    const saved = localStorage.getItem(getStorageKey(workspaceTitle));
    if (saved) {
      console.log('localStorage contains data:', saved.substring(0, 200) + '...');
    } else {
      console.log('localStorage is empty');
    }
  }, [workspaceTitle]);

  const addWindow = () => {
    const newTabId = generateId();
    const newWindow = {
      id: generateId(),
      panels: [{
        id: generateId(),
        tabs: [{ id: newTabId, title: "New tab", activeView: null }],
        activeTabId: newTabId
      }],
      isActive: true
    };
    setWindows(windows.map(w => ({ ...w, isActive: false })).concat(newWindow));
  };

  const activateWindow = (windowId: string) => {
    setWindows(windows.map(window => ({
      ...window,
      isActive: window.id === windowId
    })));
  };

  const addTab = (windowId: string, panelId: string) => {
    setWindows(windows.map(window => {
      if (window.id === windowId) {
        return {
          ...window,
          panels: window.panels.map(panel => {
            if (panel.id === panelId) {
              const newTab = {
                id: generateId(),
                title: "New tab",
                activeView: null,
              };
              return {
                ...panel,
                tabs: [...panel.tabs, newTab],
                activeTabId: newTab.id
              };
            }
            return panel;
          })
        };
      }
      return window;
    }));
  };

  const closeTab = (windowId: string, panelId: string, tabId: string) => {
    setWindows(windows.map(window => {
      if (window.id === windowId) {
        return {
          ...window,
          panels: window.panels.map(panel => {
            if (panel.id === panelId) {
              if (panel.tabs.length === 1) {
                if (window.panels.length > 1) {
                  return null;
                }
                return panel;
              }
              const newTabs = panel.tabs.filter((tab) => tab.id !== tabId);
              return {
                ...panel,
                tabs: newTabs,
                activeTabId: tabId === panel.activeTabId ? newTabs[newTabs.length - 1].id : panel.activeTabId
              };
            }
            return panel;
          }).filter(Boolean) as PanelData[]
        };
      }
      return window;
    }));
  };

  const selectTab = (windowId: string, panelId: string, tabId: string) => {
    setWindows(windows.map(window => {
      if (window.id === windowId) {
        return {
          ...window,
          panels: window.panels.map(panel => {
            if (panel.id === panelId) {
              return {
                ...panel,
                activeTabId: tabId
              };
            }
            return panel;
          })
        };
      }
      return window;
    }));
  };

  const toggleSplitScreen = (windowId: string) => {
    setWindows(windows.map(window => {
      if (window.id === windowId) {
        if (window.panels.length === 1) {
          const newTabId = generateId();
          return {
            ...window,
            panels: [
              window.panels[0],
              {
                id: generateId(),
                tabs: [{ id: newTabId, title: "New tab", activeView: null }],
                activeTabId: newTabId
              }
            ]
          };
        } else {
          return {
            ...window,
            panels: [window.panels[0]]
          };
        }
      }
      return window;
    }));
  };

  const closePanel = (windowId: string, panelId: string) => {
    setWindows(windows.map(window => {
      if (window.id === windowId) {
        if (window.panels.length === 1) return window;

        // find the panel to close and the remaining panel
        const panelToClose = window.panels.find(p => p.id === panelId);
        const remainingPanel = window.panels.find(p => p.id !== panelId);

        if (!panelToClose || !remainingPanel) return window;

        // merge tabs
        return {
          ...window,
          panels: [{
            ...remainingPanel,
            tabs: [...remainingPanel.tabs, ...panelToClose.tabs],
            activeTabId: remainingPanel.activeTabId
          }]
        };
      }
      return window;
    }));
  };

  const handleDragStart = (e: React.DragEvent, panelId: string, tabId: string) => {
    e.dataTransfer.setData('panelId', panelId);
    e.dataTransfer.setData('tabId', tabId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, panelId?: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (panelId) {
      setDragOverPanelId(panelId);
    }
  };

  const handleDragLeave = () => {
    setDragOverPanelId(null);
  };

  const handleDrop = (e: React.DragEvent, targetPanelId: string, targetTabId: string) => {
    e.preventDefault();
    setDragOverPanelId(null);
    const sourcePanelId = e.dataTransfer.getData('panelId');
    const sourceTabId = e.dataTransfer.getData('tabId');

    if (sourcePanelId === targetPanelId && sourceTabId === targetTabId) return;

    setWindows(windows.map(window => {
      if (window.isActive) {
        const sourcePanel = window.panels.find(p => p.id === sourcePanelId);
        const targetPanel = window.panels.find(p => p.id === targetPanelId);

        if (!sourcePanel || !targetPanel) return window;

        if (sourcePanel.tabs.length === 1) {
          return {
            ...window,
            panels: [{
              ...targetPanel,
              tabs: [...targetPanel.tabs, ...sourcePanel.tabs],
              activeTabId: targetPanel.activeTabId
            }]
          };
        }

        const isDroppingOnPanel = !targetPanel.tabs.some(tab => tab.id === targetTabId);
        const targetTabIndex = isDroppingOnPanel
          ? targetPanel.tabs.length
          : targetPanel.tabs.findIndex(tab => tab.id === targetTabId);

        return {
          ...window,
          panels: window.panels.map(panel => {
            if (panel.id === sourcePanelId) {
              if (panel.id === targetPanelId) return panel;
              const sourceTab = panel.tabs.find(tab => tab.id === sourceTabId);
              if (!sourceTab) return panel;
              return {
                ...panel,
                tabs: panel.tabs.filter(tab => tab.id !== sourceTabId)
              };
            }
            if (panel.id === targetPanelId) {
              const sourceTab = sourcePanel.tabs.find(tab => tab.id === sourceTabId);
              if (!sourceTab) return panel;
              const newTabs = [...panel.tabs];
              newTabs.splice(targetTabIndex, 0, sourceTab);
              return {
                ...panel,
                tabs: newTabs,
                activeTabId: sourceTab.id
              };
            }
            return panel;
          })
        };
      }
      return window;
    }));
  };

  const updateTabView = (windowId: string, panelId: string, tabId: string, activeView: string | null) => {
    setWindows(windows.map(window => {
      if (window.id === windowId) {
        return {
          ...window,
          panels: window.panels.map(panel => {
            if (panel.id === panelId) {
              return {
                ...panel,
                tabs: panel.tabs.map(tab => {
                  if (tab.id === tabId) {
                    return {
                      ...tab,
                      activeView
                    };
                  }
                  return tab;
                })
              };
            }
            return panel;
          })
        };
      }
      return window;
    }));
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white overflow-hidden w-[calc(100%-38px)] h-auto">
        <div className="flex flex-row justify-between items-center align-middle mt-[11px]">
          <Button
            variant="ghost"
            size="icon"
            className="ml-8"
            onClick={() => navigate('/')}
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </Button>
          <div className="justify-center flex items-center ml-[400px]">
            <h1 className="font-normal text-xl text-black font-['Outfit',Helvetica]">
              {workspaceTitle}
            </h1>
            <div className="ml-[15px] bg-[#ecf1f6] rounded-[5px] px-2 py-1">
              <span className="font-medium text-[11px] text-[#6b6b6b] font-['Inter',Helvetica] flex items-center">
                Workspace
              </span>
            </div>
          </div>
          <div className="flex flex-row justify-center items-center align-middle mr-8">
            <Button
              variant="ghost"
              size="icon"
              className="p-0 h-auto mr-4"
              onClick={() => {
                console.log('Current windows state:', windows);
                console.log(`localStorage content for "${workspaceTitle}":`, localStorage.getItem(getStorageKey(workspaceTitle)));
                console.log('All localStorage keys:', Object.keys(localStorage).filter(key => key.startsWith('workspaceState_')));
              }}
              title="Debug: Log current state"
            >
              <SearchIcon className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="p-0 h-auto mr-4"
              onClick={() => {
                const keys = Object.keys(localStorage).filter(key => key.startsWith('workspaceState_'));
                keys.forEach(key => localStorage.removeItem(key));
                console.log(`Cleared all workspace states: ${keys.join(', ')}`);
                window.location.reload();
              }}
              title="Debug: Clear all workspace states"
            >
              <X className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="p-0 h-auto mr-4"
              onClick={() => {
                // Test: Set activeView to deep-learn-response for the first tab
                const firstWindow = windows[0];
                const firstPanel = firstWindow.panels[0];
                const firstTab = firstPanel.tabs[0];
                updateTabView(firstWindow.id, firstPanel.id, firstTab.id, 'deep-learn-response');
                console.log('Test: Set activeView to deep-learn-response');
              }}
              title="Debug: Test set activeView"
            >
              <Plus className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="p-0 h-auto mr-4"
              onClick={() => {
                // Test: Cycle through different view states
                const firstWindow = windows[0];
                const firstPanel = firstWindow.panels[0];
                const firstTab = firstPanel.tabs[0];
                const currentView = firstTab.activeView || null;
                const views = [
                  'deep-learn-response',
                  'document-chat-response',
                  'problem-help-response',
                  'smart-note-editor',
                  null
                ];
                const currentIndex = views.indexOf(currentView);
                const nextView = views[(currentIndex + 1) % views.length];
                updateTabView(firstWindow.id, firstPanel.id, firstTab.id, nextView);
                console.log(`Test: Set activeView to ${nextView}`);
              }}
              title="Debug: Cycle through view states"
            >
              <SearchIcon className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="icon" className="p-0 h-auto mr-4">
              <Share2Icon className="w-8 h-8" />
            </Button>
            <div className="w-[300px] h-8 bg-[#ecf1f6] rounded-md flex items-center px-2.5">
              <SearchIcon className="w-6 h-6" />
              <span className="ml-[11px] font-normal text-xs text-[#6f6f6f] font-['Inter',Helvetica]">
                Spotlight Search
              </span>
            </div>
          </div>
        </div>

        <div className="absolute w-full top-[53px] left-1.5">
          <div className="absolute w-full h-auto  top-0 left-0">
            <div className="absolute w-[calc(100%-38px)]  h-auto top-0 left-9 bg-white rounded-[8px_0px_0px_0px] border border-solid border-[#e2e2e2] border-b-0">
              {windows.map((window) => (
                <div key={window.id} className={`${window.isActive ? 'block' : 'hidden'}`}>
                  <div className={`flex h-full ${window.panels.length === 2 ? 'divide-x divide-[#e2e2e2]' : ''}`}>
                    {window.panels.map((panel) => (
                      <div key={panel.id} className={`flex flex-col ${window.panels.length === 2 ? 'w-1/2' : 'w-full'}`}>
                        <div className="flex h-8 border-b border-[#e2e2e2] rounded-[8px_0px_0px_0px]">
                          <div className="flex h-8 border-b border-[#e2e2e2] rounded-[8px_0px_0px_0px] grow w-[calc(100%-100px)] overflow-hidden">
                            <div className="flex h-8 overflow-x-auto w-full scrollbar-hide">
                              {panel.tabs.map((tab) => (
                                <Tab
                                  key={tab.id}
                                  title={tab.title}
                                  tabId={tab.id}
                                  isActive={tab.id === panel.activeTabId}
                                  onClose={() => closeTab(window.id, panel.id, tab.id)}
                                  onClick={() => selectTab(window.id, panel.id, tab.id)}
                                  onDragStart={(e) => handleDragStart(e, panel.id, tab.id)}
                                  onDragOver={(e) => handleDragOver(e, panel.id)}
                                  onDragLeave={handleDragLeave}
                                  onDrop={(e) => handleDrop(e, panel.id, tab.id)}
                                />
                              ))}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="p-1 h-7 self-center ml-1 flex-shrink-0"
                                onClick={() => addTab(window.id, panel.id)}
                              >
                                <Plus />
                              </Button>
                            </div>
                          </div>
                          <div className="flex self-center w-[100px] mr-2 flex-shrink-0">
                            {window.panels.length === 2 ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 text-white bg-[#F87D7D] ml-[60px] rounded-full p-0 flex items-center justify-center hover:bg-white hover:text-[#F87D7D]"
                                onClick={() => closePanel(window.id, panel.id)}
                              >
                                <X className="w-2 h-2" />
                              </Button>
                            ) : (
                              <div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="p-0 h-7"
                                  onClick={() => toggleSplitScreen(window.id)}
                                >
                                  <ColumnsIcon className="w-6 h-6" />
                                </Button>
                                <Button variant="ghost" size="icon" className="p-0 h-7">
                                  <MoreHorizontalIcon className="w-6 h-6" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div
                          className="flex-1 relative"
                          onDragOver={(e) => handleDragOver(e, panel.id)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, panel.id, panel.activeTabId)}
                        >
                          {dragOverPanelId === panel.id && (
                            <div className="absolute inset-0 bg-black/10 z-10 flex items-center justify-center">
                              <div className="bg-white/90 px-4 py-2 rounded-md shadow-lg">
                                <span className="text-sm text-gray-700">Drop tab here</span>
                              </div>
                            </div>
                          )}
                          <DefaultContent
                            tabId={panel.activeTabId}
                            isSplit={window.panels.length === 2}
                            activeView={panel.tabs.find(tab => tab.id === panel.activeTabId)?.activeView || null}
                            onViewChange={(view) => updateTabView(window.id, panel.id, panel.activeTabId, view)}
                          />

                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute left-0 top-12 flex flex-col gap-1">
              {windows.map((window) => (
                <div
                  key={window.id}
                  className={`w-9 min-h-[95px] ${window.isActive ? 'bg-white w-[38px] border-r-2 border-r-white' : 'bg-[#e8e8e8]'} rounded-[6px_0px_0px_6px] border-t-[0.5px] border-b-[0.5px] border-l-[0.5px] border-[#e2e2e2] flex items-center justify-center cursor-pointer`}
                  onClick={() => activateWindow(window.id)}
                >
                  <div className="w-[100px] rotate-[-90.46deg] font-normal text-black text-[13px] font-['Inter',Helvetica] whitespace-nowrap">
                    New Window
                  </div>
                </div>
              ))}
              <Button
                variant="ghost"
                size="icon"
                className=" w-[17px] h-[17px]  p-0 self-center mt-[10px]"
                onClick={addWindow}
              >
                <Plus />
              </Button>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkspacePage