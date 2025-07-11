import React, { useState, useEffect } from 'react';
import { Button } from '../../../../../components/ui/button';
import { Card, CardContent } from '../../../../../components/ui/card';
import {
  UploadIcon,
  X,
  PlusIcon,
  LightbulbIcon
} from 'lucide-react';
import DocumentChatResponse from '../response/DocumentChatResponse';

interface DocumentTag {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'txt' | 'other';
}

interface HistoryItem {
  id: string;
  title: string;
  date: string;
  fileCount: number;
}

interface DocumentChatProps {
  isSplit?: boolean;
  onBack?: () => void;
  onViewChange?: (view: string | null) => void;
}

function DocumentChat({ isSplit = false, onBack, onViewChange }: DocumentChatProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<DocumentTag[]>([
    { id: '1', name: 'Introduction to Me...', type: 'pdf' },
    { id: '2', name: 'Cosmology and Its...', type: 'pdf' },
    { id: '3', name: 'NASA ADS Library...', type: 'txt' }
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<HistoryItem[]>([]);
  const itemsPerPage = 8;

  const historyItems: HistoryItem[] = Array.from({ length: 24 }, (_, i) => ({
    id: (i + 1).toString(),
    title: 'Cosmological Coupling and Black Holes',
    date: 'Jun 1, 9:50 PM',
    fileCount: 8
  }));

  useEffect(() => {
    const filtered = historyItems.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredItems(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  };

  const removeDocument = (id: string) => {
    setSelectedDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return (
          <div className="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">PDF</span>
          </div>
        );
      case 'doc':
        return (
          <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">DOC</span>
          </div>
        );
      case 'txt':
        return (
          <div className="w-4 h-4 bg-gray-500 rounded-sm flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">TXT</span>
          </div>
        );
      default:
        return (
          <div className="w-4 h-4 bg-gray-500 rounded-sm flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">FILE</span>
          </div>
        );
    }
  };

  const getCardBackgroundColor = (index: number) => {
    const colors = ['#E5F6FF', '#ECF4F4', '#ECF1F6', '#DEEEFF'];
    return colors[index % 4];
  };

  const handleCreateNewChat = () => {
    // Notify parent component to change view to response
    onViewChange?.('document-chat-response');
  };

  const handleBackToEntry = () => {
    // Notify parent component to go back to default view
    onViewChange?.(null);
  };

  // If we're in response view, render the response component
  // This will be handled by the parent component based on activeView
  return (
    <div className=" overflow-y-auto h-[calc(100vh-88px)]">
      <main className="flex-1 p-12 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-center mb-[55px]">
          <div className="flex items-center gap-4">
            <img className="w-12 h-10" alt="Hyperknow logo" src="/main/landing_page/hyperknow_logo 1.svg" />
            <div>
              <h2 className="font-['Outfit',Helvetica] font-medium text-black text-2xl">Document Chat</h2>
              <p className="font-['Outfit',Helvetica] font-medium text-black text-[13px]">answer questions based on your documents</p>
            </div>
          </div>
        </div>

        {/* Upload + Input Section */}
        <div className="w-full max-w-5xl mx-auto mb-6">
          <div className="flex gap-[25px] justify-center">
            <div className="w-[300px]">
              <Card className="w-full h-[154px] border-2 border-[#0064A2] bg-[rgba(226,238,252,0.60)] rounded-lg shadow-[0px_3px_30px_0px_rgba(72,112,208,0.05)] border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-full p-6">
                  <div className="w-10 h-10 flex-shrink-0 mb-4">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none">
                      <path d="M26.6671 26.6667L20.0004 20.0001M20.0004 20.0001L13.3338 26.6667M20.0004 20.0001L20.0004 35.0001M33.9838 30.6501C35.6093 29.7638 36.8935 28.3615 37.6335 26.6644C38.3736 24.9673 38.5274 23.0721 38.0708 21.2779C37.6141 19.4836 36.5729 17.8926 35.1115 16.7558C33.6502 15.619 31.8519 15.0013 30.0004 15.0001H27.9004C27.3959 13.0488 26.4557 11.2373 25.1503 9.70171C23.845 8.16614 22.2085 6.94647 20.3639 6.1344C18.5193 5.32233 16.5147 4.93899 14.5006 5.01319C12.4866 5.0874 10.5155 5.61722 8.73572 6.56283C6.9559 7.50844 5.41361 8.84523 4.22479 10.4727C3.03598 12.1002 2.23157 13.9759 1.87206 15.959C1.51254 17.9421 1.60726 19.9809 2.14911 21.9222C2.69096 23.8634 3.66583 25.6565 5.00042 27.1667" stroke="#B3B3B3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="w-[224px] text-[#6D6D6D] text-center font-['Inter'] text-sm font-normal leading-5 tracking-normal">
                    Upload or choose your sources to start chat
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="w-[505px]">
              <Card className="w-full h-[154px] bg-white rounded-lg border border-[#B3B3B3] shadow-[0px_3px_60px_1px_rgba(2,119,189,0.05)]">
                <CardContent className="p-4 h-full flex flex-col">
                  <div className="flex flex-wrap gap-[9px] mb-4">
                    {selectedDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="h-[25px] max-w-[160px] bg-[#ECF1F6] border border-[#88ABFF] rounded-[8px] flex items-center px-2"
                      >
                        <img
                          src={`/workspace/fileIcons/${doc.type}.svg`}
                          alt={`${doc.type} icon`}
                          className="w-[18px] h-[17.721px] flex-shrink-0"
                        />
                        <span className="ml-1 font-['Inter'] text-[12px] font-normal text-black leading-normal truncate">
                          {doc.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-3 h-3 p-0 hover:bg-gray-200 rounded-full ml-auto"
                          onClick={() => removeDocument(doc.id)}
                        >
                          <X className="w-3 h-3 text-black" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-end">
                    <Button variant="outline" size="sm" className="w-[81px] h-[26px] bg-[#ECF1F6] border-none rounded-lg flex items-center px-[8px] gap-[4px] hover:bg-[#e2e8f0]">
                      <svg className="w-[18px] h-[19px] flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 19" fill="none">
                        <path d="M9 9.50008C8.175 9.50008 7.46875 9.19001 6.88125 8.56987C6.29375 7.94973 6 7.20425 6 6.33341C6 5.46258 6.29375 4.7171 6.88125 4.09696C7.46875 3.47682 8.175 3.16675 9 3.16675C9.825 3.16675 10.5312 3.47682 11.1187 4.09696C11.7062 4.7171 12 5.46258 12 6.33341C12 7.20425 11.7062 7.94973 11.1187 8.56987C10.5312 9.19001 9.825 9.50008 9 9.50008ZM3 15.8334V13.6167C3 13.1681 3.10937 12.7558 3.32812 12.3798C3.54688 12.0037 3.8375 11.7167 4.2 11.5188C4.975 11.1098 5.7625 10.803 6.5625 10.5985C7.3625 10.394 8.175 10.2917 9 10.2917C9.825 10.2917 10.6375 10.394 11.4375 10.5985C12.2375 10.803 13.025 11.1098 13.8 11.5188C14.1625 11.7167 14.4531 12.0037 14.6719 12.3798C14.8906 12.7558 15 13.1681 15 13.6167V15.8334H3ZM4.5 14.2501H13.5V13.6167C13.5 13.4716 13.4656 13.3397 13.3969 13.2209C13.3281 13.1022 13.2375 13.0098 13.125 12.9438C12.45 12.5876 11.7688 12.3204 11.0813 12.1423C10.3938 11.9641 9.7 11.8751 9 11.8751C8.3 11.8751 7.60625 11.9641 6.91875 12.1423C6.23125 12.3204 5.55 12.5876 4.875 12.9438C4.7625 13.0098 4.67188 13.1022 4.60313 13.2209C4.53438 13.3397 4.5 13.4716 4.5 13.6167V14.2501ZM9 7.91675C9.4125 7.91675 9.76563 7.76171 10.0594 7.45164C10.3531 7.14157 10.5 6.76883 10.5 6.33341C10.5 5.898 10.3531 5.52525 10.0594 5.21519C9.76563 4.90512 9.4125 4.75008 9 4.75008C8.5875 4.75008 8.23438 4.90512 7.94063 5.21519C7.64688 5.52525 7.5 5.898 7.5 6.33341C7.5 6.76883 7.64688 7.14157 7.94063 7.45164C8.23438 7.76171 8.5875 7.91675 9 7.91675Z" fill="#79747E" />
                      </svg>
                      <span className="text-[#6B6B6B] font-['Inter'] text-[12px] font-medium leading-normal">Profile</span>
                      <svg className="w-[9px] h-[10px] flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 10" fill="none">
                        <g opacity="0.3">
                          <path d="M2.25 3.75L4.5 6.25L6.75 3.75" stroke="#757575" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                      </svg>
                    </Button>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
          {/* Create New Chat */}
          <div className="w-full mx-auto mt-[15px] mb-4">
            <div className="flex justify-end">
              <Button className="w-[132px] h-[28px] mr-[11px] bg-[#80A5E4] hover:bg-[#6b94d6] text-white rounded-[8px] flex items-center justify-center font-['Inter'] text-[13px] font-semibold leading-normal" onClick={handleCreateNewChat}>
                + Create New Chat
              </Button>
            </div>
          </div>
        </div>



        {/* History Section */}
        <div className="w-full max-w-5xl mx-auto mt-[40px]">
          <div className="flex justify-between items-center">
            <h2 className="text-[20px] font-medium text-black font-['Inter']">History</h2>
            <div className="flex items-center gap-[8px]">
              <Button variant="outline" className="w-[30px] h-[29px] rounded-[8px] bg-[#ECF1F6] border-none flex items-center justify-center font-['Inter'] text-[12px] font-medium text-[#6B6B6B]">D/A</Button>
              <Button variant="outline" className="w-[120px] h-[29px] rounded-[8px] bg-[#ECF1F6] border-none flex items-center justify-center font-['Inter'] text-[12px] font-medium text-[#6B6B6B]">Sort by Date/Type</Button>
              <div className="w-[172px] h-[29px] rounded-[8px] bg-[#ECF1F6] flex items-center px-3 transition-colors duration-200 hover:bg-[#e2e8f0] focus-within:bg-[#e2e8f0]">
                <svg className="w-4 h-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
                  <path d="M13.0667 14L8.86667 9.8C8.53333 10.0667 8.15 10.2778 7.71667 10.4333C7.28333 10.5889 6.82222 10.6667 6.33333 10.6667C5.12222 10.6667 4.09722 10.2472 3.25833 9.40833C2.41944 8.56944 2 7.54444 2 6.33333C2 5.12222 2.41944 4.09722 3.25833 3.25833C4.09722 2.41944 5.12222 2 6.33333 2C7.54444 2 8.56944 2.41944 9.40833 3.25833C10.2472 4.09722 10.6667 5.12222 10.6667 6.33333C10.6667 6.82222 10.5889 7.28333 10.4333 7.71667C10.2778 8.15 10.0667 8.53333 9.8 8.86667L14 13.0667L13.0667 14ZM6.33333 9.33333C7.16667 9.33333 7.875 9.04167 8.45833 8.45833C9.04167 7.875 9.33333 7.16667 9.33333 6.33333C9.33333 5.5 9.04167 4.79167 8.45833 4.20833C7.875 3.625 7.16667 3.33333 6.33333 3.33333C5.5 3.33333 4.79167 3.625 4.20833 4.20833C3.625 4.79167 3.33333 5.5 3.33333 6.33333C3.33333 7.16667 3.625 7.875 4.20833 8.45833C4.79167 9.04167 5.5 9.33333 6.33333 9.33333Z" fill="#6B6B6B" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ml-2 bg-transparent outline-none text-[#6B6B6B] text-[12px] font-['Inter'] font-medium w-full border-0 ring-0 focus:ring-0 focus:border-0 rounded-none appearance-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-x-6 gap-y-[36px] mt-[41px] mb-8">
            {getCurrentPageItems().map((item, index) => {
              const colors = ['#E5F6FF', '#ECF4F4', '#ECF1F6', '#DEEEFF'];
              const bgColor = colors[index % 4];
              return (
                <Card
                  key={item.id}
                  className="w-[90%] h-[154px] rounded-[8px] shadow-[0px_3px_20px_1px_rgba(2,119,189,0.13),0px_2px_4px_0px_rgba(0,0,0,0.25)] hover:shadow-md transition-shadow cursor-pointer mx-auto"
                  style={{ backgroundColor: bgColor }}
                  onClick={handleCreateNewChat}
                >
                  <CardContent className="p-4 h-full flex flex-col justify-between relative">
                    <div>
                      <svg className="w-[40px] h-[39px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 39" fill="none">
                        <path d="M28.2875 5.86219C27.2128 4.77789 25.9251 3.91582 24.5013 3.32742C23.0774 2.73902 21.5465 2.43636 20 2.4375C17.0163 2.4375 14.1548 3.59314 12.045 5.65018C9.93526 7.70721 8.75 10.4972 8.75 13.4063C8.86256 15.4541 9.46165 17.4484 10.5 19.2319C10.8258 19.8626 11.1179 20.5094 11.375 21.1697L13.875 27.2634C13.9652 27.4845 14.1198 27.675 14.3197 27.8115C14.5196 27.9479 14.7561 28.0243 15 28.0313H25C25.2503 28.0315 25.495 27.9584 25.7023 27.8215C25.9095 27.6846 26.0699 27.4902 26.1625 27.2634L28.6625 21.1697C28.95 20.475 29.25 19.8291 29.5375 19.1953C30.5142 17.4024 31.0975 15.4309 31.25 13.4063C31.3025 12.0191 31.0671 10.6359 30.5581 9.33957C30.049 8.04324 29.2767 6.86048 28.2875 5.86219Z" fill="#FBC02D" />
                        <path d="M25 29.25H15C14.6685 29.25 14.3506 29.3784 14.1161 29.607C13.8817 29.8355 13.75 30.1455 13.75 30.4688V34.125C13.7484 34.3521 13.8119 34.5752 13.9334 34.769C14.0549 34.9628 14.2295 35.1197 14.4375 35.2219L16.9375 36.4406C17.1127 36.5234 17.3054 36.5651 17.5 36.5625H22.5C22.6947 36.5651 22.8873 36.5234 23.0625 36.4406L25.5625 35.2219C25.7706 35.1197 25.9452 34.9628 26.0667 34.769C26.1881 34.5752 26.2517 34.3521 26.25 34.125V30.4688C26.25 30.1455 26.1183 29.8355 25.8839 29.607C25.6495 29.3784 25.3316 29.25 25 29.25Z" fill="#FF6F00" />
                        <path d="M25.0005 17.0625H15.0005C14.788 17.0629 14.579 17.0105 14.3931 16.9103C14.2072 16.8101 14.0506 16.6653 13.938 16.4897C13.8283 16.3044 13.7705 16.0942 13.7705 15.8803C13.7705 15.6664 13.8283 15.4562 13.938 15.2709L16.438 10.3959C16.5412 10.2067 16.6937 10.0473 16.8803 9.93391C17.0668 9.8205 17.2808 9.75706 17.5005 9.75H22.5005C22.832 9.75 23.1499 9.8784 23.3844 10.107C23.6188 10.3355 23.7505 10.6455 23.7505 10.9688C23.7505 11.292 23.6188 11.602 23.3844 11.8305C23.1499 12.0591 22.832 12.1875 22.5005 12.1875H18.3255L17.0755 14.625H25.0005C25.332 14.625 25.6499 14.7534 25.8844 14.982C26.1188 15.2105 26.2505 15.5205 26.2505 15.8438C26.2505 16.167 26.1188 16.477 25.8844 16.7055C25.6499 16.9341 25.332 17.0625 25.0005 17.0625Z" fill="#FAFAFA" />
                        <path d="M20 21.9375C19.6685 21.9375 19.3505 21.8091 19.1161 21.5805C18.8817 21.352 18.75 21.042 18.75 20.7188V15.8438C18.75 15.5205 18.8817 15.2105 19.1161 14.982C19.3505 14.7534 19.6685 14.625 20 14.625C20.3315 14.625 20.6495 14.7534 20.8839 14.982C21.1183 15.2105 21.25 15.5205 21.25 15.8438V20.7188C21.25 21.042 21.1183 21.352 20.8839 21.5805C20.6495 21.8091 20.3315 21.9375 20 21.9375Z" fill="#FAFAFA" />
                        <path d="M20 2.4375C17.0163 2.4375 14.1548 3.59313 12.045 5.65017C9.93526 7.70721 8.75 10.4972 8.75 13.4062C8.85088 15.4489 9.4417 17.44 10.475 19.2197C10.8 19.89 11.1 20.5116 11.35 21.1697L13.85 27.2634C13.9418 27.4883 14.1002 27.6814 14.3051 27.8181C14.5099 27.9549 14.7518 28.0291 15 28.0312H20V2.4375Z" fill="#FFEE58" />
                        <path d="M15 29.25C14.6685 29.25 14.3505 29.3784 14.1161 29.607C13.8817 29.8355 13.75 30.1455 13.75 30.4688V34.125C13.7519 34.3513 13.8183 34.5727 13.942 34.7643C14.0656 34.9559 14.2415 35.1101 14.45 35.2097L16.95 36.4284C17.1204 36.5136 17.3086 36.5595 17.5 36.5625H20V29.25H15Z" fill="#FF8F00" />
                        <path d="M22.5 12.1875C22.8315 12.1875 23.1495 12.0591 23.3839 11.8305C23.6183 11.602 23.75 11.292 23.75 10.9688C23.75 10.6455 23.6183 10.3355 23.3839 10.107C23.1495 9.8784 22.8315 9.75 22.5 9.75H20V12.1875H22.5Z" fill="#FF6F00" />
                        <path d="M25 14.625H20V17.0625H25C25.3315 17.0625 25.6495 16.9341 25.8839 16.7055C26.1183 16.477 26.25 16.167 26.25 15.8438C26.25 15.5205 26.1183 15.2105 25.8839 14.982C25.6495 14.7534 25.3315 14.625 25 14.625Z" fill="#FF6F00" />
                        <path d="M16.9997 14.625L18.2497 12.1875H19.9997V9.75H17.4997C17.2689 9.75068 17.0427 9.81367 16.8464 9.93199C16.65 10.0503 16.4911 10.2193 16.3872 10.4203L13.8872 15.2953C13.7775 15.4806 13.7197 15.6908 13.7197 15.9047C13.7197 16.1186 13.7775 16.3288 13.8872 16.5141C14.0072 16.6924 14.1731 16.8369 14.3683 16.9331C14.5635 17.0294 14.7813 17.074 14.9997 17.0625H19.9997V14.625H16.9997Z" fill="#FF8F00" />
                        <path d="M18.75 15.8438V20.7188C18.75 21.042 18.8817 21.352 19.1161 21.5805C19.3505 21.8091 19.6685 21.9375 20 21.9375V14.625C19.6685 14.625 19.3505 14.7534 19.1161 14.982C18.8817 15.2105 18.75 15.5205 18.75 15.8438Z" fill="#FF8F00" />
                        <path d="M20 14.625V21.9375C20.3315 21.9375 20.6495 21.8091 20.8839 21.5805C21.1183 21.352 21.25 21.042 21.25 20.7188V15.8438C21.25 15.5205 21.1183 15.2105 20.8839 14.982C20.6495 14.7534 20.3315 14.625 20 14.625Z" fill="#FF6F00" />
                        <path d="M25 28.0312H15C14.7518 28.0291 14.5099 27.9549 14.3051 27.8181C14.1002 27.6814 13.9418 27.4883 13.85 27.2634L11.35 21.1697C11.1 20.5116 10.8 19.89 10.475 19.2197C9.4417 17.44 8.85088 15.4489 8.75 13.4062C8.75 10.4972 9.93526 7.70721 12.045 5.65017C14.1548 3.59313 17.0163 2.4375 20 2.4375C21.5425 2.43824 23.0691 2.74185 24.4886 3.33024C25.9082 3.91862 27.1916 4.77973 28.2625 5.86219C29.2592 6.85639 30.038 8.03788 30.5516 9.33481C31.0652 10.6317 31.3028 12.017 31.25 13.4062C31.0928 15.4092 30.5141 17.3591 29.55 19.1344C29.25 19.7559 28.95 20.3531 28.675 21.1087L26.175 27.2025C26.0918 27.4426 25.934 27.6515 25.7234 27.8C25.5128 27.9485 25.2599 28.0294 25 28.0312ZM15.85 25.5938H24.1625L26.25 20.2678C26.5375 19.5244 26.8625 18.8419 27.175 18.1716C28.0251 16.7033 28.5609 15.0822 28.75 13.4062C28.7894 12.3349 28.6047 11.267 28.2071 10.2676C27.8095 9.26814 27.2074 8.35807 26.4375 7.59281C25.6057 6.74268 24.6073 6.06405 23.5015 5.5972C22.3957 5.13034 21.205 4.88475 20 4.875C17.6794 4.875 15.4538 5.77383 13.8128 7.37374C12.1719 8.97366 11.25 11.1436 11.25 13.4062C11.3633 15.0834 11.8677 16.7133 12.725 18.1716C13.0798 18.8657 13.3969 19.5777 13.675 20.3044L15.85 25.5938Z" fill="#263238" />
                        <path d="M22.5 36.5625H17.5C17.3086 36.5595 17.1204 36.5136 16.95 36.4284L14.45 35.2097C14.2415 35.1101 14.0656 34.9559 13.942 34.7643C13.8183 34.5727 13.7519 34.3513 13.75 34.125V30.4688C13.75 30.1455 13.8817 29.8355 14.1161 29.607C14.3505 29.3784 14.6685 29.25 15 29.25H25C25.3315 29.25 25.6495 29.3784 25.8839 29.607C26.1183 29.8355 26.25 30.1455 26.25 30.4688V34.125C26.2493 34.3501 26.1847 34.5705 26.0633 34.762C25.942 34.9535 25.7686 35.1084 25.5625 35.2097L23.0625 36.4284C22.8883 36.5154 22.6957 36.5614 22.5 36.5625ZM17.8 34.125H22.2125L23.75 33.3694V31.6875H16.25V33.3694L17.8 34.125Z" fill="#263238" />
                      </svg>
                    </div>

                    <div className="flex flex-col">
                      <h3 className="font-['Inter'] text-[12px] font-medium text-[#1C1C1C] leading-normal line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="font-['Inter'] text-[10px] font-medium text-[#636363] leading-normal mt-2">
                        {item.date}
                      </p>
                    </div>

                    <span className="absolute top-4 right-4 text-xs font-['Inter'] text-gray-600">
                      {item.fileCount} Files
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-[9px] mt-[60px]">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-[19px] h-[20px] font-['Inter'] text-[14px] font-medium text-black leading-normal ${currentPage === pageNum ? 'bg-[#ECF1F6] rounded-[6px]' : ''
                  }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="w-[45px] h-[23px] bg-[#ECF1F6] rounded-[6px] font-['Inter'] text-[14px] font-medium text-black leading-normal ml-[9px]"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DocumentChat;