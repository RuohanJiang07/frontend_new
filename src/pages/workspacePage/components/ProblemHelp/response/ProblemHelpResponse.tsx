import React, { useState } from 'react';
import { Button } from '../../../../../components/ui/button';
import { ArrowLeftIcon, ShareIcon, PrinterIcon, MoreHorizontalIcon, CheckIcon, ThumbsUpIcon, ThumbsDownIcon, CopyIcon, PaperclipIcon, FolderIcon } from 'lucide-react';

interface ProblemHelpResponseProps {
  onBack: () => void;
}

function ProblemHelpResponse({ onBack }: ProblemHelpResponseProps) {
  const [followUpQuestion, setFollowUpQuestion] = useState('');

  return (
    <div className=" flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <h1 className="font-medium text-base text-black font-['Inter',Helvetica]">
            Learning Journey: Exploration of Black Hole and its Related Concepts
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button className="bg-[#6B94E4] hover:bg-[#5a82d1] text-white rounded-lg px-4 py-2 flex items-center gap-2 font-['Inter',Helvetica] text-sm">
            Publish to Community
            <ShareIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="p-2"
          >
            <ShareIcon className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="p-2"
          >
            <PrinterIcon className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="p-2"
          >
            <MoreHorizontalIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content Area - Remove scrollbar styling, use white background */}
      <div className="flex flex-col h-[calc(100vh-320px)] bg-white">
        <div className=" flex-1 overflow-y-auto max-w-6xl mx-auto px-8 py-6">
          {/* User Question - Full Width */}
          <div className="flex flex-col items-end mb-6">
            <span className="text-xs text-gray-500 font-['Inter',Helvetica] mb-2">
              Me, Jun 1, 9:50 PM
            </span>
            <div className="bg-[#E8F4FD] rounded-lg p-4 w-full max-w-4xl border border-[#B3D9FF]">
              <div className="text-sm text-black font-['Inter',Helvetica] mb-3">
                <strong>Problem 2.2:</strong>
              </div>
              <p className="text-sm text-black font-['Inter',Helvetica] mb-3">
                A 5.0 kg box is initially at rest on a horizontal surface. A horizontal force of 30 N is applied to it. The coefficient of kinetic friction between the box and the surface is 0.2.
              </p>
              <div className="text-sm text-black font-['Inter',Helvetica]">
                <p>(a) Will the box move?</p>
                <p>(b) If it moves, what is its acceleration?</p>
              </div>
            </div>
          </div>

          {/* GPT Response + Concept Cards Container - Same width as user message */}
          <div className="w-full max-w-4xl ml-auto mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-600 font-['Inter',Helvetica]">
                Answer, GPT-4o
              </span>
            </div>

            {/* Main Response Container - 65% left, 35% right */}
            <div className="flex gap-6">
              {/* GPT Response - 65% */}
              <div className="w-[65%]">
                {/* Step 1 */}
                <div className="mb-6">
                  <h3 className="font-semibold text-base text-black font-['Inter',Helvetica] mb-3">
                    Step 1: Identify all known values
                  </h3>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-black font-['Inter',Helvetica]">
                    <li>Mass of the box: <em>m</em> = 5.0 kg</li>
                    <li>Applied force: <em>F</em><sub>applied</sub> = 30 N</li>
                    <li>Coefficient of kinetic friction: μ<sub>k</sub> = 0.2</li>
                    <li>Gravity: <em>g</em> = 9.8 m/s²</li>
                  </ul>
                </div>

                {/* Step 2 */}
                <div className="mb-6">
                  <h3 className="font-semibold text-base text-black font-['Inter',Helvetica] mb-3">
                    Step 2: Draw a <span className="text-blue-600 underline cursor-pointer">free-body diagram (FBD)</span>
                  </h3>
                  <p className="text-sm text-black font-['Inter',Helvetica] mb-3">
                    For the box on a flat surface:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-black font-['Inter',Helvetica] mb-3">
                    <li><strong>Vertical forces:</strong></li>
                    <li className="ml-4">Weight: <em>F</em><sub>g</sub> = <em>mg</em> = 5.0 × 9.8 = 49.0 N</li>
                    <li className="ml-4">Normal force: <em>N</em>, which balances the weight → <em>N</em> = 49.0 N</li>
                    <li><strong>Horizontal forces:</strong></li>
                    <li className="ml-4">Applied force: <em>F</em><sub>applied</sub> = 30 N</li>
                    <li className="ml-4">Kinetic friction: <em>f</em><sub>k</sub> = μ<sub>k</sub><em>N</em> = 0.2 × 49.0 = 9.8 N</li>
                  </ul>
                </div>

                {/* Step 3 */}
                <div className="mb-6">
                  <h3 className="font-semibold text-base text-black font-['Inter',Helvetica] mb-3">
                    Step 3: Compare applied force and friction
                  </h3>
                  <p className="text-sm text-black font-['Inter',Helvetica] mb-3">
                    To check if the box moves, compare the applied force with maximum static friction (but since the problem gives us μ<sub>k</sub>, we'll assume it's already moving or meant to calculate kinetic friction—let's explicitly add this check to be thorough):
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-black font-['Inter',Helvetica] mb-3">
                    <li>Let's estimate static friction threshold:</li>
                    <li className="ml-4">We'll assume the static coefficient is slightly higher, say μ<sub>s</sub> ≈ 0.25</li>
                    <li className="ml-4">Max static friction: <em>f</em><sub>s,max</sub> = μ<sub>s</sub><em>N</em> = 0.25 × 49.0 = 12.25 N</li>
                  </ul>
                </div>

                {/* Action Buttons - Moved to the right side */}
                <div className="flex justify-end mt-6">
                  <div className="flex items-center gap-2">
                    {/* Check Answer and Regenerate as separate buttons with ECF1F6 background */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 bg-[#ECF1F6] text-xs text-gray-600 hover:bg-[#e2e8f0] font-['Inter',Helvetica] rounded-lg"
                    >
                      <CheckIcon className="w-3 h-3 mr-1" />
                      Check Answer
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 bg-[#ECF1F6] text-xs text-gray-600 hover:bg-[#e2e8f0] font-['Inter',Helvetica] rounded-lg"
                    >
                      <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Regenerate
                    </Button>

                    {/* Thumbs up/down/copy buttons */}
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-gray-600 hover:text-gray-800"
                      >
                        <ThumbsUpIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-gray-600 hover:text-gray-800"
                      >
                        <ThumbsDownIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-gray-600 hover:text-gray-800"
                      >
                        <CopyIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Concept Cards - 35% */}
              <div className="w-[35%] space-y-4">
                {/* Kinetic Friction Card */}
                <div className="bg-[#f2f7ff] rounded-lg p-4 border-l-4 border-[#90BBFF]">
                  <h4 className="font-semibold text-sm text-black font-['Inter',Helvetica] mb-2">
                    Kinetic Friction
                  </h4>
                  <p className="text-xs text-black font-['Inter',Helvetica] leading-relaxed">
                    Kinetic friction is the resistive force that acts against the motion of two surfaces that are already in relative motion. When an object is sliding or moving, kinetic friction tries to slow it down or oppose its motion along the surface.
                  </p>
                </div>

                {/* Free-body Diagram Card */}
                <div className="bg-[#f2f7ff] rounded-lg p-4 border-l-4 border-[#90BBFF]">
                  <h4 className="font-semibold text-sm text-black font-['Inter',Helvetica] mb-2">
                    Free-body Diagram (FBD)
                  </h4>
                  <p className="text-xs text-black font-['Inter',Helvetica] leading-relaxed">
                    A free-body diagram (FBD) is a simple, essential tool in physics used to analyze the forces acting on an object. It is a diagram that shows all the external forces acting on one object, isolated from everything else.
                  </p>
                </div>

                {/* Applied Force Card */}
                <div className="bg-[#f2f7ff] rounded-lg p-4 border-l-4 border-[#90BBFF]">
                  <h4 className="font-semibold text-sm text-black font-['Inter',Helvetica] mb-2">
                    Applied Force
                  </h4>
                  <p className="text-xs text-black font-['Inter',Helvetica] leading-relaxed">
                    An applied force is any force that is deliberately exerted on an object by a person, machine, or another object to move it, hold it, or change its motion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Input Area - Redesigned to match the image, NO TOP BORDER */}
      <div className=" bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Input container with proper height and styling */}
          <div className="relative bg-white border border-gray-300 rounded-2xl h-32 p-4">
            <textarea
              className="w-full h-full border-0 resize-none outline-none bg-transparent font-['Inter',Helvetica] text-sm placeholder:text-gray-500 pr-16 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              placeholder="Continue to ask; provide more details for step 2..."
              value={followUpQuestion}
              onChange={(e) => setFollowUpQuestion(e.target.value)}
            />

            {/* Icons positioned in bottom right corner */}
            <div className="absolute bottom-4 right-4 flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 p-0 text-gray-400 hover:text-gray-600"
              >
                <PaperclipIcon className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 p-0 text-gray-400 hover:text-gray-600"
              >
                <FolderIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProblemHelpResponse;