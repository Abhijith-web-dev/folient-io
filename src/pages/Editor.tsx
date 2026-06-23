import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEditorStore } from '../store/useEditorStore';
import TopNavigationBar from '../components/TopNavigationBar';
import LeftTelemetryPanel from '../components/LeftTelemetryPanel';
import VisualCanvas from '../components/VisualCanvas';
import PropertyPanel from '../components/PropertyPanel';
import CodePanel from '../components/CodePanel';
import AiChatbox from '../components/AiChatbox';
import { gsap } from 'gsap';

export default function Editor() {
  const [searchParams] = useSearchParams();
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const projectId = searchParams.get('projectId');
  const loadProjectFromDb = useEditorStore(state => state.loadProjectFromDb);
  const codeViewOpen = useEditorStore(state => state.codeViewOpen);
  const setCodeViewOpen = useEditorStore(state => state.setCodeViewOpen);
  const editMode = useEditorStore(state => state.editMode);
  const setEditMode = useEditorStore(state => state.setEditMode);
  const selectedNodeId = useEditorStore(state => state.selectedNodeId);
  const setSelectedNodeId = useEditorStore(state => state.setSelectedNodeId);
  const undo = useEditorStore(state => state.undo);
  const redo = useEditorStore(state => state.redo);
  const saveProjectToDb = useEditorStore(state => state.saveProjectToDb);
  const deleteNode = useEditorStore(state => state.deleteNode);

  useEffect(() => {
    if (projectId) {
      loadProjectFromDb(Number(projectId));
    }
  }, [projectId, loadProjectFromDb]);

  // Entrance animations for panels
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Initial state to avoid flash of content
    gsap.set(['.editor-header', '.editor-left-panel', '.editor-canvas', '.editor-right-panel'], {
      opacity: 0
    });

    // Animate header sliding down
    tl.fromTo('.editor-header', 
      { y: -30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8 }
    );

    // Stagger animate left & right panels sliding inward
    tl.fromTo('.editor-left-panel', 
      { x: -50, opacity: 0 }, 
      { x: 0, opacity: 1, duration: 0.7 }, 
      '-=0.5'
    );
    tl.fromTo('.editor-right-panel', 
      { x: 50, opacity: 0 }, 
      { x: 0, opacity: 1, duration: 0.7 }, 
      '-=0.7'
    );

    // Animate visual canvas scaling and lifting up with elastic feel
    tl.fromTo('.editor-canvas', 
      { scale: 0.96, opacity: 0 }, 
      { scale: 1, opacity: 1, duration: 0.9, ease: 'back.out(1.1)' }, 
      '-=0.5'
    );
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check active input
      const activeEl = document.activeElement;
      const insideInput = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.getAttribute('contenteditable') === 'true'
      );
      if (insideInput) {
        return;
      }

      const key = e.key.toLowerCase();

      // Ctrl+Z / Ctrl+Shift+Z (Undo / Redo)
      if ((e.ctrlKey || e.metaKey) && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }

      // Ctrl+S (Save)
      if ((e.ctrlKey || e.metaKey) && key === 's') {
        e.preventDefault();
        saveProjectToDb();
      }

      // Ctrl+E (Toggle Edit Mode)
      if ((e.ctrlKey || e.metaKey) && key === 'e') {
        e.preventDefault();
        setEditMode(!editMode);
      }

      // Ctrl+Shift+C (Toggle Code View)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && key === 'c') {
        e.preventDefault();
        setCodeViewOpen(!codeViewOpen);
      }

      // Escape (Deselect Node)
      if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedNodeId(null);
      }

      // Delete (Delete Node)
      if (e.key === 'Delete') {
        if (selectedNodeId) {
          e.preventDefault();
          deleteNode(selectedNodeId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    editMode, 
    codeViewOpen, 
    selectedNodeId, 
    undo, 
    redo, 
    saveProjectToDb, 
    setEditMode, 
    setCodeViewOpen, 
    setSelectedNodeId, 
    deleteNode
  ]);

  return (
    <main className="w-screen h-screen bg-[#F3F4F6] flex flex-col text-[#111111] overflow-hidden font-sans select-none p-4 gap-4">
      <div className="editor-header w-full shrink-0 relative z-50">
        <TopNavigationBar />
      </div>
      <div className="flex-1 flex overflow-hidden relative gap-4">
        {/* Left Sidebar wrapper */}
        <div 
          className={`editor-left-panel h-full flex flex-col transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
            leftOpen ? 'w-80 opacity-100 mr-0' : 'w-0 opacity-0 -translate-x-12 pointer-events-none -mr-4'
          }`}
        >
          <LeftTelemetryPanel />
        </div>

        {/* Toggle Left Button */}
        <button
          onClick={() => setLeftOpen(!leftOpen)}
          className="absolute top-1/2 -translate-y-1/2 z-40 w-5 h-14 bg-white hover:bg-[#F8F9FB] border border-[#ECEEF2] border-l-0 rounded-r-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] flex items-center justify-center cursor-pointer transition-all hover:scale-y-105 active:scale-95"
          style={{ 
            left: leftOpen ? '320px' : '0px',
            transition: 'left 300ms cubic-bezier(0.25, 0.1, 0.25, 1)'
          }}
          title={leftOpen ? "Collapse Left Panel" : "Expand Left Panel"}
        >
          <span className="material-symbols-outlined text-xs text-[#6B7280]">
            {leftOpen ? 'chevron_left' : 'chevron_right'}
          </span>
        </button>

        <div className="editor-canvas flex-1 h-full flex flex-col">
          <VisualCanvas />
        </div>

        {/* Toggle Right Button */}
        <button
          onClick={() => setRightOpen(!rightOpen)}
          className="absolute top-1/2 -translate-y-1/2 z-40 w-5 h-14 bg-white hover:bg-[#F8F9FB] border border-[#ECEEF2] border-r-0 rounded-l-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] flex items-center justify-center cursor-pointer transition-all hover:scale-y-105 active:scale-95"
          style={{ 
            right: rightOpen ? '320px' : '0px',
            transition: 'right 300ms cubic-bezier(0.25, 0.1, 0.25, 1)'
          }}
          title={rightOpen ? "Collapse Right Panel" : "Expand Right Panel"}
        >
          <span className="material-symbols-outlined text-xs text-[#6B7280]">
            {rightOpen ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>

        {/* Right Sidebar wrapper */}
        <div 
          className={`editor-right-panel h-full flex flex-col transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
            rightOpen ? 'w-80 opacity-100 ml-0' : 'w-0 opacity-0 translate-x-12 pointer-events-none -ml-4'
          }`}
        >
          {codeViewOpen ? <CodePanel /> : <PropertyPanel />}
        </div>
      </div>
      <AiChatbox />
    </main>
  );
}
