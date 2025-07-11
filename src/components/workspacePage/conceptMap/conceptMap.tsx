import React, { useState } from 'react';
import ForceGraph2D, { LinkObject, NodeObject } from 'react-force-graph-2d';

interface CustomNode extends NodeObject {
  id: string;
  x?: number;
  y?: number;
  color?: string;
  __bckgDimensions?: [number, number];
}

interface ConceptMapProps {
  className?: string;
}

const myData: { nodes: CustomNode[]; links: LinkObject[] } = {
  nodes: [
    { id: 'Black Hole' },
    { id: 'White dwarf' },
    { id: 'Type I Supernova' },
    { id: 'Gravity Wave' },
    { id: 'Stretched Horizon' },
    { id: 'Cosmology' },
  ],
  links: [
    { source: 'Black Hole', target: 'White dwarf' },
    { source: 'Black Hole', target: 'Type I Supernova' },
    { source: 'Type I Supernova', target: 'White dwarf' },
    { source: 'Type I Supernova', target: 'Gravity Wave' },
    { source: 'Black Hole', target: 'Stretched Horizon' },
    { source: 'Black Hole', target: 'Cosmology' },
  ],
};

function ConceptMap({ className = '' }: ConceptMapProps) {
  const [hoverNode, setHoverNode] = useState<CustomNode | null>(null);

  return (
    <div className={`flex flex-col max-w-[220px] h-[228.464px] flex-shrink-0 rounded-[13px] border border-[rgba(157,155,179,0.30)] bg-white shadow-[0px_1px_30px_2px_rgba(242,242,242,0.63)] overflow-hidden ${className}`}>
      {/* Header Section */}
      <div className="flex-shrink-0 w-full h-[59.736px] bg-[rgba(228,231,239,0.62)] rounded-t-[13px] p-3 flex flex-col justify-between">
        {/* First row - Icon and "Concept Map" text */}
        <div className="flex items-center">
          <img
            src="/workspace/concept_map_icon.svg"
            alt="Concept Map Icon"
            className="mr-2 w-[17px] h-[17px]"
          />
          <span className="text-[#63626B] font-['Inter'] text-[12px] font-medium leading-normal">
            Concept Map
          </span>
        </div>

        {/* Second row - "Your Learning Roadmap" text */}
        <div className="ml-1">
          <span className="text-black font-['Inter'] text-[14px] font-semibold leading-normal">
            Your Learning Roadmap
          </span>
        </div>
      </div>

      {/* Content Section - Scaled Concept Map */}
      <div className="flex-1 overflow-hidden">
        <div className="w-full h-full bg-white">
          <ForceGraph2D
            graphData={myData}
            width={256}
            height={168}
            nodeAutoColorBy="group"
            onNodeHover={(node: NodeObject | null) => {
              setHoverNode(node as CustomNode | null);
            }}
            nodeCanvasObject={(node: CustomNode, ctx, globalScale) => {
              const label = node.id;
              const fontSize = 10 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;

              const textWidth = ctx.measureText(label).width;
              const bckgDimensions: [number, number] = [
                textWidth + fontSize * 0.2,
                fontSize + fontSize * 0.2,
              ];
              const x = node.x ?? 0;
              const y = node.y ?? 0;

              if (hoverNode?.id === node.id) {
                ctx.save();
                ctx.shadowColor = node.color || '#4f46e5';
                ctx.shadowBlur = 15;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.fillRect(x - bckgDimensions[0] / 2, y - bckgDimensions[1] / 2, ...bckgDimensions);
                ctx.restore();
              } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0)';
                ctx.fillRect(x - bckgDimensions[0] / 2, y - bckgDimensions[1] / 2, ...bckgDimensions);
              }

              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = node.color ?? '#000';
              ctx.fillText(label, x, y);

              node.__bckgDimensions = bckgDimensions;
            }}
            linkPointerAreaPaint={(node: CustomNode, color, ctx) => {
              const bckg = node.__bckgDimensions;
              if (bckg) {
                ctx.fillStyle = color;
                ctx.fillRect(
                  (node.x ?? 0) - bckg[0] / 2,
                  (node.y ?? 0) - bckg[1] / 2,
                  ...bckg
                );
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ConceptMap;