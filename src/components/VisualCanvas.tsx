import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';

export default function VisualCanvas() {
  const { 
    compileAstToHtml, 
    selectedNodeId, 
    setSelectedNodeId, 
    devicePreview, 
    zoom, 
    isGenerating,
    editMode,
    updateNodeContent,
    projectCss,
    structureVersion
  } = useEditorStore();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isCanvasLoading, setIsCanvasLoading] = useState(true);

  const getSandboxHtml = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
  
  <style>
    /* Scoped CSS from template selection */
    ${projectCss}

    body {
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 0;
    }

    body.edit-mode {
      cursor: pointer;
    }

    /* Selected border ring */
    body.edit-mode [data-node-id] {
      position: relative;
      transition: outline 0.15s ease-in-out;
    }
    
    body.edit-mode [data-node-id]:hover {
      outline: 1.5px dashed rgba(99, 102, 241, 0.4);
      outline-offset: 1px;
    }

    body.edit-mode .selected-node {
      outline: 2px solid #6366F1 !important;
      outline-offset: 2px;
      box-shadow: 0 0 12px rgba(99, 102, 241, 0.15);
    }

    /* Tooltip overlay styling */
    .folient-hover-label {
      position: absolute;
      background: #6366F1;
      color: white;
      font-family: monospace;
      font-size: 8px;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 4px;
      pointer-events: none;
      z-index: 99999;
      white-space: nowrap;
      text-transform: uppercase;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body class="bg-zinc-950 text-zinc-100 overflow-x-hidden p-6 min-h-screen ${editMode ? 'edit-mode' : ''}">
  ${compileAstToHtml()}

  <script>
    (() => {
      // Highlight tooltip tracker
      const tooltip = document.createElement('div');
      tooltip.className = 'folient-hover-label';
      tooltip.style.display = 'none';
      document.body.appendChild(tooltip);

      document.addEventListener('mouseover', (e) => {
        if (!document.body.classList.contains('edit-mode')) return;
        let target = e.target;
        while (target && target !== document.body) {
          if (target.hasAttribute && target.hasAttribute('data-node-id')) {
            const tag = target.tagName.toLowerCase();
            const nodeId = target.getAttribute('data-node-id');
            tooltip.innerText = tag + (target.hasAttribute('data-folient-label') ? ' (' + target.getAttribute('data-folient-label') + ')' : ' #' + nodeId.slice(-4));
            const rect = target.getBoundingClientRect();
            tooltip.style.left = (rect.left + window.scrollX) + 'px';
            tooltip.style.top = (rect.top + window.scrollY - 18) + 'px';
            tooltip.style.display = 'block';
            return;
          }
          target = target.parentElement;
        }
      });

      document.addEventListener('mouseout', (e) => {
        tooltip.style.display = 'none';
      });

      // Trap element clicks and pipe data-node-id back to parent editor canvas
      document.addEventListener('click', (e) => {
        if (!document.body.classList.contains('edit-mode')) return;
        let target = e.target;
        while (target && target !== document.body) {
          if (target.hasAttribute && target.hasAttribute('data-node-id')) {
            const nodeId = target.getAttribute('data-node-id');
            if (nodeId) {
              e.preventDefault();
              e.stopPropagation();
              window.parent.postMessage({ type: 'FOLIENT_NODE_SELECTED', id: nodeId }, '*');
              return;
            }
          }
          target = target.parentElement;
        }
      }, true);

      // Double-click inline text editing
      document.addEventListener('dblclick', (e) => {
        if (!document.body.classList.contains('edit-mode')) return;
        let target = e.target;
        while (target && target !== document.body) {
          if (target.hasAttribute && target.hasAttribute('data-node-id')) {
            const tag = target.tagName.toLowerCase();
            // Text elements or leaf nodes
            if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'button', 'a'].includes(tag) || target.children.length === 0) {
              e.preventDefault();
              e.stopPropagation();
              target.contentEditable = 'true';
              target.focus();
              
              // Highlight text selection on double-click
              const range = document.createRange();
              range.selectNodeContents(target);
              const sel = window.getSelection();
              sel.removeAllRanges();
              sel.addRange(range);

              const handleFinishEdit = () => {
                target.contentEditable = 'false';
                const nodeId = target.getAttribute('data-node-id');
                const newText = target.innerText.trim();
                window.parent.postMessage({ type: 'FOLIENT_NODE_TEXT_UPDATED', id: nodeId, content: newText }, '*');
                target.removeEventListener('blur', handleFinishEdit);
                target.removeEventListener('keydown', handleKeydown);
              };

              const handleKeydown = (evt) => {
                if (evt.key === 'Enter' && !evt.shiftKey) {
                  evt.preventDefault();
                  target.blur();
                }
              };

              target.addEventListener('blur', handleFinishEdit);
              target.addEventListener('keydown', handleKeydown);
            }
            return;
          }
          target = target.parentElement;
        }
      });

      // Listen for real-time DOM mutations, selection shifts, and edit mode updates from parent editor
      window.addEventListener('message', (e) => {
        if (!e.data) return;

        if (e.data.type === 'FOLIENT_DOM_MUTATE') {
          const el = document.querySelector('[data-node-id="' + e.data.id + '"]');
          if (el) {
            if (e.data.content !== undefined) {
              el.innerText = e.data.content;
            }
            if (e.data.classes !== undefined) {
              el.className = e.data.classes;
            }
          }
        } else if (e.data.type === 'FOLIENT_SELECT_NODE') {
          const prev = document.querySelector('.selected-node');
          if (prev) prev.classList.remove('selected-node');
          
          if (e.data.id) {
            const current = document.querySelector('[data-node-id="' + e.data.id + '"]');
            if (current) current.classList.add('selected-node');
          }
        } else if (e.data.type === 'FOLIENT_SET_EDIT_MODE') {
          if (e.data.editMode) {
            document.body.classList.add('edit-mode');
          } else {
            document.body.classList.remove('edit-mode');
            const prev = document.querySelector('.selected-node');
            if (prev) prev.classList.remove('selected-node');
          }
        }
      });
    })();
  </script>
</body>
</html>`;
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        setIsCanvasLoading(true);
        doc.open();
        doc.write(getSandboxHtml());
        doc.close();
        
        // Iframe content loaded handler to fade out the transition loading screen and sync states
        const handleIframeLoad = () => {
          setIsCanvasLoading(false);
          if (iframe.contentWindow) {
            iframe.contentWindow.postMessage({ type: 'FOLIENT_SELECT_NODE', id: selectedNodeId }, '*');
            iframe.contentWindow.postMessage({ type: 'FOLIENT_SET_EDIT_MODE', editMode }, '*');
          }
        };
        iframe.addEventListener('load', handleIframeLoad);
        // Fallback for instant loads
        setTimeout(() => {
          setIsCanvasLoading(false);
          if (iframe.contentWindow) {
            iframe.contentWindow.postMessage({ type: 'FOLIENT_SELECT_NODE', id: selectedNodeId }, '*');
            iframe.contentWindow.postMessage({ type: 'FOLIENT_SET_EDIT_MODE', editMode }, '*');
          }
        }, 800);
        return () => iframe.removeEventListener('load', handleIframeLoad);
      }
    }
  }, [structureVersion, projectCss]); // Only reload when layout structure or page styles change!

  // Sync selection shifts to the iframe dynamically without reloading
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow && !isCanvasLoading) {
      iframe.contentWindow.postMessage({
        type: 'FOLIENT_SELECT_NODE',
        id: selectedNodeId
      }, '*');
    }
  }, [selectedNodeId, isCanvasLoading]);

  // Sync edit mode toggles to the iframe dynamically without reloading
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow && !isCanvasLoading) {
      iframe.contentWindow.postMessage({
        type: 'FOLIENT_SET_EDIT_MODE',
        editMode
      }, '*');
    }
  }, [editMode, isCanvasLoading]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'FOLIENT_NODE_SELECTED') {
        if (editMode) {
          setSelectedNodeId(e.data.id);
        }
      } else if (e.data && e.data.type === 'FOLIENT_NODE_TEXT_UPDATED') {
        if (editMode) {
          updateNodeContent(e.data.id, e.data.content);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setSelectedNodeId, updateNodeContent, editMode]);

  return (
    <div className="flex-1 h-full bg-[#F8F9FB] border border-[#ECEEF2] rounded-[24px] flex flex-col relative select-none shadow-[0_8px_24px_rgba(0,0,0,0.03)] overflow-hidden">
      
      {/* 1. Horizontal Ruler Guide */}
      <div className="h-6 w-full bg-[#F8F9FB] border-b border-[#ECEEF2] flex items-center relative select-none shrink-0 overflow-hidden text-[8px] font-mono text-[#9CA3AF]">
        <div className="w-6 h-6 border-r border-[#ECEEF2] shrink-0 bg-[#F3F4F6]" />
        <div className="flex-1 h-full relative" style={{ minWidth: '1000px' }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute top-0 bottom-0 border-l border-[#ECEEF2]/60 flex items-end pb-1 pl-1" style={{ left: `${i * 100 + 12}px` }}>
              <span>{i * 100}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-1 flex relative overflow-hidden">
        {/* 2. Vertical Ruler Guide */}
        <div className="w-6 h-full bg-[#F8F9FB] border-r border-[#ECEEF2] flex flex-col relative select-none shrink-0 overflow-hidden text-[8px] font-mono text-[#9CA3AF]">
          <div className="flex-1 w-full relative" style={{ minHeight: '1000px' }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="absolute left-0 right-0 border-t border-[#ECEEF2]/60 flex items-start pt-1 pl-0.5" style={{ top: `${i * 100}px` }}>
                <span className="origin-top-left rotate-90 translate-x-3">{i * 100}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Dot-grid Viewport Workspace */}
        <div className="flex-1 h-full p-6 flex items-center justify-center relative overflow-hidden bg-[radial-gradient(#ECEEF2_1px,transparent_1px)] [background-size:16px_16px]">
          <div 
            className={`h-full border border-[#ECEEF2] rounded-[24px] bg-zinc-950 shadow-[0_8px_24px_rgba(0,0,0,0.04)] relative overflow-hidden flex items-center justify-center transition-all duration-300 ${
              devicePreview === 'mobile' ? 'w-[375px] max-w-full' : 
              devicePreview === 'tablet' ? 'w-[768px] max-w-full' : 
              'w-full h-full'
            }`}
            style={{ transform: `scale(${zoom / 100})` }}
          >
            <iframe 
              ref={iframeRef}
              title="Sandbox AST Sandbox Canvas"
              className="w-full h-full border-none bg-transparent"
              sandbox="allow-scripts allow-same-origin"
            />

            {isCanvasLoading && (
              <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-3 z-30 transition-all duration-300">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-zinc-800 border-t-[#6366F1] rounded-full animate-spin"></div>
                  <span className="text-[9px] font-mono tracking-widest uppercase text-zinc-500 animate-pulse">
                    Syncing layout
                  </span>
                </div>
              </div>
            )}
 
            {isGenerating && (
              <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-4 z-20 pointer-events-auto">
                <div className="w-64 h-32 rounded-2xl border-2 border-dashed border-[#6366F1] bg-zinc-900/50 p-4 flex flex-col justify-between items-center relative overflow-hidden animate-[pulse_2s_infinite]">
                  <div className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-[#6366F1]/5 to-transparent h-full animate-[shimmer_1.5s_infinite] -skew-x-12" />
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Inference Stream Active</div>
                  <div className="w-8 h-8 rounded-full border-2 border-[#6366F1] border-t-transparent animate-spin" />
                  <div className="text-[10px] font-mono text-[#6366F1] uppercase tracking-widest font-bold animate-pulse">Mutating AST Nodes...</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}