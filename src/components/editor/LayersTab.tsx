import { ChevronRight, FileCode } from 'lucide-react';
import { useEditorStore, type AstNode } from '../../store/useEditorStore';

export default function LayersTab() {
  const { ast, selectedNodeId, setSelectedNodeId } = useEditorStore();

  const renderAstNodeTree = (node: AstNode, level = 0): React.ReactNode => {
    const isSelected = selectedNodeId === node.id;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="flex flex-col">
        <button
          onClick={() => setSelectedNodeId(node.id)}
          style={{ paddingLeft: `${Math.max(8, level * 12)}px` }}
          className={`h-7 w-full flex items-center justify-between text-[11px] font-mono rounded-md cursor-pointer border-none transition-all ${
            isSelected 
              ? 'bg-[#FF5733]/10 text-[#FF5733] font-semibold' 
              : 'bg-transparent text-[#6B7280] hover:bg-[#F8F9FB] hover:text-[#111111]'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {hasChildren ? (
              <ChevronRight className={`w-3 h-3 shrink-0 text-[#9CA3AF] transition-transform ${isSelected ? 'rotate-90 text-[#FF5733]' : ''}`} />
            ) : (
              <span className="w-3 h-3 shrink-0" />
            )}
            <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#FF5733]' : 'text-[#9CA3AF]'}`} />
            <span className="truncate">{node.id}</span>
          </div>
          <span className="text-[8px] uppercase bg-[#F8F9FB] border border-[#ECEEF2] text-[#6B7280] px-1 rounded-sm shrink-0 mr-1 font-bold scale-90">
            {node.type}
          </span>
        </button>
        {node.children && node.children.map(child => <div key={child.id}>{renderAstNodeTree(child, level + 1)}</div>)}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-0.5 scrollbar-thin">
      {renderAstNodeTree(ast)}
    </div>
  );
}
