import { useState, useEffect } from 'react';
import { 
  Settings, 
  Sparkles, 
  Trash2, 
  Loader2, 
  Type, 
  Maximize, 
  Layout, 
  Paintbrush, 
  Sparkle, 
  Play 
} from 'lucide-react';
import { useEditorStore, type AstNode } from '../store/useEditorStore';
import { orchestrateNodeReStyle } from '../lib/aiInferenceRouter';

import TypographySection from './editor/TypographySection';
import BoxModelSection from './editor/BoxModelSection';
import FlexboxSection from './editor/FlexboxSection';
import BackgroundSection from './editor/BackgroundSection';
import AnimationSection from './editor/AnimationSection';

export default function PropertyPanel() {
  const { 
    ast, 
    selectedNodeId, 
    updateNodeClass, 
    updateNodeContent, 
    deleteNode, 
    activeProjectId, 
    updateNodeClassAndContent, 
    addTelemetryLog 
  } = useEditorStore();

  const [activeNode, setActiveNode] = useState<AstNode | null>(null);
  
  // Tab Expand states
  const [expandedSection, setExpandedSection] = useState<'content' | 'typo' | 'box' | 'layout' | 'bg' | 'anim' | 'ai'>('content');

  // Value states
  const [bgHex, setBgHex] = useState('');
  const [textHex, setTextHex] = useState('');
  const [contentVal, setContentVal] = useState('');
  const [paddingClass, setPaddingClass] = useState('p-0');
  const [marginClass, setMarginClass] = useState('m-0');
  const [textAlignClass, setTextAlignClass] = useState('text-left');
  
  // Typo details
  const [activeFont, setActiveFont] = useState('Inter');
  const [fontSize, setFontSize] = useState('text-base');
  const [fontWeight, setFontWeight] = useState('font-normal');
  const [textDecor, setTextDecor] = useState('');

  // Box model / border
  const [borderRadius, setBorderRadius] = useState('rounded-none');
  const [borderWidth, setBorderWidth] = useState('border-0');
  const [borderHex, setBorderHex] = useState('');

  // Layout / Flexbox
  const [displayClass, setDisplayClass] = useState('block');
  const [flexDirection, setFlexDirection] = useState('flex-row');
  const [justifyContent, setJustifyContent] = useState('justify-start');
  const [alignItems, setAlignItems] = useState('items-stretch');
  const [gapClass, setGapClass] = useState('gap-0');

  // BG Gradient & image
  const [bgType, setBgType] = useState<'solid' | 'gradient' | 'image'>('solid');
  const [gradientDirection, setGradientDirection] = useState('bg-gradient-to-r');
  const [gradientStartHex, setGradientStartHex] = useState('');
  const [gradientEndHex, setGradientEndHex] = useState('');
  const [bgImageUrl, setBgImageUrl] = useState('');

  // Animation CSS Transitions
  const [entryAnim, setEntryAnim] = useState('transition-all');
  const [animDuration, setAnimDuration] = useState('duration-300');
  const [animDelay, setAnimDelay] = useState('delay-0');

  // AI
  const [aiPrompt, setAiPrompt] = useState('');
  const [isRestyling, setIsRestyling] = useState(false);

  const findNodeById = (node: AstNode, id: string): AstNode | null => {
    if (node.id === id) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNodeById(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  const updateClassesRegex = (currentClasses: string, regex: RegExp, replacement: string) => {
    return `${currentClasses.replace(regex, ' ').replace(/\s+/g, ' ').trim()} ${replacement}`.replace(/\s+/g, ' ').trim();
  };

  // Sync state values on selection
  useEffect(() => {
    if (selectedNodeId) {
      const node = findNodeById(ast, selectedNodeId);
      setActiveNode(node);

      if (node) {
        setContentVal(node.content || '');
        
        // 1. BG Solid HEX
        const bgMatch = node.classes.match(/bg-\[([^\]]+)\]/);
        setBgHex(bgMatch ? bgMatch[1] : '');

        // 2. Text Solid HEX
        const textMatch = node.classes.match(/text-\[([^\]]+)\]/);
        setTextHex(textMatch ? textMatch[1] : '');

        // 3. Spacing
        const padMatch = node.classes.match(/\bp[xy]?-\d+\b/);
        setPaddingClass(padMatch ? padMatch[0] : 'p-0');

        const marMatch = node.classes.match(/\bm[xy]?-\d+\b/);
        setMarginClass(marMatch ? marMatch[0] : 'm-0');

        // 4. Alignment
        const alignMatch = node.classes.match(/\btext-(left|center|right|justify)\b/);
        setTextAlignClass(alignMatch ? alignMatch[0] : 'text-left');

        // 5. Typo
        const fontMatch = node.classes.match(/font-\[([^\]]+)\]/);
        setActiveFont(fontMatch ? fontMatch[1] : 'Inter');

        const sizeMatch = node.classes.match(/\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)\b/);
        setFontSize(sizeMatch ? sizeMatch[0] : 'text-base');

        const weightMatch = node.classes.match(/\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/);
        setFontWeight(weightMatch ? weightMatch[0] : 'font-normal');

        const decorMatch = node.classes.match(/\b(underline|line-through|no-underline)\b/);
        setTextDecor(decorMatch ? decorMatch[0] : '');

        // 6. Border details
        const radiusMatch = node.classes.match(/\brounded-(none|sm|md|lg|xl|2xl|3xl|full)\b/);
        setBorderRadius(radiusMatch ? radiusMatch[0] : 'rounded-none');

        const borderWidthMatch = node.classes.match(/\bborder-(0|2|4|8)\b/);
        setBorderWidth(borderWidthMatch ? borderWidthMatch[0] : 'border-0');

        const borderHexMatch = node.classes.match(/border-\[([^\]]+)\]/);
        setBorderHex(borderHexMatch ? borderHexMatch[1] : '');

        // 7. Layout display
        const displayMatch = node.classes.match(/\b(block|flex|grid|inline-block|hidden)\b/);
        setDisplayClass(displayMatch ? displayMatch[0] : 'block');

        const dirMatch = node.classes.match(/\bflex-(row|col|row-reverse|col-reverse)\b/);
        setFlexDirection(dirMatch ? dirMatch[0] : 'flex-row');

        const justifyMatch = node.classes.match(/\bjustify-(start|center|end|between|around|evenly)\b/);
        setJustifyContent(justifyMatch ? justifyMatch[0] : 'justify-start');

        const itemsMatch = node.classes.match(/\bitems-(start|center|end|stretch|baseline)\b/);
        setAlignItems(itemsMatch ? itemsMatch[0] : 'items-stretch');

        const gapMatch = node.classes.match(/\bgap-\d+\b/);
        setGapClass(gapMatch ? gapMatch[0] : 'gap-0');

        // 8. Gradient backgrounds
        const gradDirMatch = node.classes.match(/\bbg-gradient-to-(r|l|t|b|tr|tl|br|bl)\b/);
        if (gradDirMatch) {
          setBgType('gradient');
          setGradientDirection(gradDirMatch[0]);
          const fromMatch = node.classes.match(/from-\[([^\]]+)\]/);
          setGradientStartHex(fromMatch ? fromMatch[1] : '');
          const toMatch = node.classes.match(/to-\[([^\]]+)\]/);
          setGradientEndHex(toMatch ? toMatch[1] : '');
        } else if (node.classes.includes('bg-cover') || node.classes.includes('bg-[url')) {
          setBgType('image');
          const imgUrlMatch = node.classes.match(/bg-\[url\('([^']+)'\)\]/);
          setBgImageUrl(imgUrlMatch ? imgUrlMatch[1] : '');
        } else {
          setBgType('solid');
        }

        // 9. Animations
        const durationMatch = node.classes.match(/\bduration-\d+\b/);
        setAnimDuration(durationMatch ? durationMatch[0] : 'duration-300');
        const delayMatch = node.classes.match(/\bdelay-\d+\b/);
        setAnimDelay(delayMatch ? delayMatch[0] : 'delay-0');
        const animMatch = node.classes.match(/\b(transition-all|animate-pulse|animate-bounce)\b/);
        setEntryAnim(animMatch ? animMatch[0] : 'transition-all');
      }
    } else {
      setActiveNode(null);
    }
  }, [selectedNodeId, ast]);

  if (!selectedNodeId || !activeNode) {
    return (
      <aside className="w-full h-full bg-white border border-[#ECEEF2] rounded-[24px] flex flex-col items-center justify-center p-6 text-center select-none z-30 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
        <div className="w-12 h-12 rounded-2xl bg-[#F8F9FB] border border-[#ECEEF2] flex items-center justify-center text-[#6B7280] mb-4 animate-pulse">
          <Settings className="w-5 h-5 text-[#6366F1]" />
        </div>
        <h4 className="text-xs font-bold text-[#111111] font-mono uppercase tracking-widest">Property Inspector</h4>
        <p className="text-[10px] text-[#6B7280] max-w-[160px] leading-relaxed mt-2">
          Select any layer node in the viewport or tree view to override styles manually.
        </p>
      </aside>
    );
  }

  const applyClassOverride = (regex: RegExp, replacement: string) => {
    const newClasses = updateClassesRegex(activeNode.classes, regex, replacement);
    updateNodeClass(activeNode.id, newClasses);
  };

  // Spacing Presets
  const applyPresetSpacing = (preset: 'none' | 'compact' | 'comfortable' | 'spacious') => {
    let pVal = 'p-0';
    let mVal = 'm-0';
    if (preset === 'compact') {
      pVal = 'p-4';
      mVal = 'm-2';
    } else if (preset === 'comfortable') {
      pVal = 'p-8';
      mVal = 'm-4';
    } else if (preset === 'spacious') {
      pVal = 'p-16';
      mVal = 'm-8';
    }
    setPaddingClass(pVal);
    setMarginClass(mVal);
    
    let cls = activeNode.classes;
    cls = updateClassesRegex(cls, /\bp[xy]?-\d+\b/g, pVal);
    cls = updateClassesRegex(cls, /\bm[xy]?-\d+\b/g, mVal);
    updateNodeClass(activeNode.id, cls);
  };

  const handleAiRestyle = async () => {
    if (!aiPrompt.trim()) return;

    let apiKey = localStorage.getItem('gemini_api_key') || '';
    let model = 'gemini-1.5-flash';

    if (!apiKey) {
      if (localStorage.getItem('groq_api_key')) {
        apiKey = localStorage.getItem('groq_api_key') || '';
        model = 'llama-3.3-70b-versatile';
      } else if (localStorage.getItem('openrouter_api_key')) {
        apiKey = localStorage.getItem('openrouter_api_key') || '';
        model = 'google/gemini-2.5-flash';
      }
    }

    if (!apiKey) {
      addTelemetryLog('AI Restyle Error: Setup an API key under top settings menu first.', 'error');
      alert('Please configure at least one API key in the Setup Keys bar at the top first.');
      return;
    }

    setIsRestyling(true);
    addTelemetryLog(`Requesting AI design suggestion for node [${activeNode.id}]...`, 'info');

    try {
      const res = await orchestrateNodeReStyle({
        apiKey,
        projectId: activeProjectId || undefined,
        nodeId: activeNode.id,
        nodeType: activeNode.type,
        currentClasses: activeNode.classes,
        currentContent: activeNode.content,
        stylePrompt: aiPrompt,
        model
      });

      if (res.status === 'success') {
        updateNodeClassAndContent(activeNode.id, res.classes, res.content || '');
        addTelemetryLog(`AI restyling suggestion applied to node [${activeNode.id}].`, 'success');
        setAiPrompt('');
      } else {
        alert(res.errorMsg || 'Failed to suggest restyling.');
      }
    } catch (e: any) {
      console.error(e);
      addTelemetryLog(`AI Re-style failed: ${e.message || e}`, 'error');
      alert(`AI Re-style failed: ${e.message || e}`);
    } finally {
      setIsRestyling(false);
    }
  };

  return (
    <aside className="w-full h-full bg-white border border-[#ECEEF2] rounded-[24px] flex flex-col select-none overflow-y-auto z-30 text-left scrollbar-thin shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
      <div className="h-12 bg-white px-4 border-b border-[#ECEEF2] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#6366F1]" />
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#111111]">Properties</span>
        </div>
        <span className="text-[9px] font-mono text-[#6B7280] uppercase tracking-widest font-bold">
          [ID: {activeNode.id}]
        </span>
      </div>

      <div className="p-4 flex flex-col gap-2.5">
        
        {/* Content & Presets */}
        <div className="border border-[#ECEEF2] rounded-2xl overflow-hidden bg-white">
          <button 
            onClick={() => setExpandedSection('content')}
            className="w-full px-4 py-3 bg-[#F8F9FB] hover:bg-[#ECEEF2] border-none text-xs font-bold text-[#111111] font-mono flex items-center gap-2 text-left cursor-pointer"
          >
            <Maximize className="w-3.5 h-3.5 text-[#6366F1]" />
            <span>Content & Presets</span>
          </button>
          
          {expandedSection === 'content' && (
            <div className="p-4 flex flex-col gap-3">
              {activeNode.content !== undefined && (
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">Text Content</label>
                  <textarea 
                    value={contentVal}
                    onChange={e => { setContentVal(e.target.value); updateNodeContent(activeNode.id, e.target.value); }}
                    className="w-full h-16 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg p-2.5 text-xs text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:border-[#6366F1] transition-colors"
                    placeholder="Insert text content payload..."
                  />
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">Quick Spacing Presets</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['none', 'compact', 'comfortable', 'spacious'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => applyPresetSpacing(p)}
                      className="py-1.5 bg-[#F8F9FB] hover:bg-[#ECEEF2] border border-[#ECEEF2] rounded-[10px] text-[8px] font-mono font-bold uppercase text-zinc-650 cursor-pointer transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Typography Settings */}
        <div className="border border-[#ECEEF2] rounded-2xl overflow-hidden bg-white">
          <button 
            onClick={() => setExpandedSection(expandedSection === 'typo' ? 'content' : 'typo')}
            className="w-full px-4 py-3 bg-[#F8F9FB] hover:bg-[#ECEEF2] border-none text-xs font-bold text-[#111111] font-mono flex items-center gap-2 text-left cursor-pointer"
          >
            <Type className="w-3.5 h-3.5 text-[#6366F1]" />
            <span>Typography Settings</span>
          </button>
          
          {expandedSection === 'typo' && (
            <TypographySection 
              activeFont={activeFont}
              setActiveFont={setActiveFont}
              fontSize={fontSize}
              setFontSize={setFontSize}
              fontWeight={fontWeight}
              setFontWeight={setFontWeight}
              textHex={textHex}
              setTextHex={setTextHex}
              textDecor={textDecor}
              setTextDecor={setTextDecor}
              textAlignClass={textAlignClass}
              setTextAlignClass={setTextAlignClass}
              applyClassOverride={applyClassOverride}
            />
          )}
        </div>

        {/* Spacing & Borders */}
        <div className="border border-[#ECEEF2] rounded-2xl overflow-hidden bg-white">
          <button 
            onClick={() => setExpandedSection(expandedSection === 'box' ? 'content' : 'box')}
            className="w-full px-4 py-3 bg-[#F8F9FB] hover:bg-[#ECEEF2] border-none text-xs font-bold text-[#111111] font-mono flex items-center gap-2 text-left cursor-pointer"
          >
            <Maximize className="w-3.5 h-3.5 text-[#6366F1]" />
            <span>Spacing & Borders</span>
          </button>
          
          {expandedSection === 'box' && (
            <BoxModelSection 
              paddingClass={paddingClass}
              setPaddingClass={setPaddingClass}
              marginClass={marginClass}
              setMarginClass={setMarginClass}
              borderRadius={borderRadius}
              setBorderRadius={setBorderRadius}
              borderWidth={borderWidth}
              setBorderWidth={setBorderWidth}
              borderHex={borderHex}
              setBorderHex={setBorderHex}
              applyClassOverride={applyClassOverride}
            />
          )}
        </div>

        {/* Layout & Flexbox */}
        <div className="border border-[#ECEEF2] rounded-2xl overflow-hidden bg-white">
          <button 
            onClick={() => setExpandedSection(expandedSection === 'layout' ? 'content' : 'layout')}
            className="w-full px-4 py-3 bg-[#F8F9FB] hover:bg-[#ECEEF2] border-none text-xs font-bold text-[#111111] font-mono flex items-center gap-2 text-left cursor-pointer"
          >
            <Layout className="w-3.5 h-3.5 text-[#6366F1]" />
            <span>Layout & Flexbox</span>
          </button>
          
          {expandedSection === 'layout' && (
            <FlexboxSection 
              displayClass={displayClass}
              setDisplayClass={setDisplayClass}
              flexDirection={flexDirection}
              setFlexDirection={setFlexDirection}
              justifyContent={justifyContent}
              setJustifyContent={setJustifyContent}
              alignItems={alignItems}
              setAlignItems={setAlignItems}
              gapClass={gapClass}
              setGapClass={setGapClass}
              applyClassOverride={applyClassOverride}
            />
          )}
        </div>

        {/* Background settings */}
        <div className="border border-[#ECEEF2] rounded-2xl overflow-hidden bg-white">
          <button 
            onClick={() => setExpandedSection(expandedSection === 'bg' ? 'content' : 'bg')}
            className="w-full px-4 py-3 bg-[#F8F9FB] hover:bg-[#ECEEF2] border-none text-xs font-bold text-[#111111] font-mono flex items-center gap-2 text-left cursor-pointer"
          >
            <Paintbrush className="w-3.5 h-3.5 text-[#6366F1]" />
            <span>Background settings</span>
          </button>
          
          {expandedSection === 'bg' && (
            <BackgroundSection 
              bgType={bgType}
              setBgType={setBgType}
              bgHex={bgHex}
              setBgHex={setBgHex}
              gradientDirection={gradientDirection}
              setGradientDirection={setGradientDirection}
              gradientStartHex={gradientStartHex}
              setGradientStartHex={setGradientStartHex}
              gradientEndHex={gradientEndHex}
              setGradientEndHex={setGradientEndHex}
              bgImageUrl={bgImageUrl}
              setBgImageUrl={setBgImageUrl}
              applyClassOverride={applyClassOverride}
            />
          )}
        </div>

        {/* Entry Animations */}
        <div className="border border-[#ECEEF2] rounded-2xl overflow-hidden bg-white">
          <button 
            onClick={() => setExpandedSection(expandedSection === 'anim' ? 'content' : 'anim')}
            className="w-full px-4 py-3 bg-[#F8F9FB] hover:bg-[#ECEEF2] border-none text-xs font-bold text-[#111111] font-mono flex items-center gap-2 text-left cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-[#6366F1]" />
            <span>Entry Animations</span>
          </button>
          
          {expandedSection === 'anim' && (
            <AnimationSection 
              entryAnim={entryAnim}
              setEntryAnim={setEntryAnim}
              animDuration={animDuration}
              setAnimDuration={setAnimDuration}
              animDelay={animDelay}
              setAnimDelay={setAnimDelay}
              applyClassOverride={applyClassOverride}
            />
          )}
        </div>

        {/* AI Design Suggestions */}
        <div className="border border-[#ECEEF2] rounded-2xl overflow-hidden bg-white">
          <button 
            onClick={() => setExpandedSection(expandedSection === 'ai' ? 'content' : 'ai')}
            className="w-full px-4 py-3 bg-[#F8F9FB] hover:bg-[#ECEEF2] border-none text-xs font-bold text-[#111111] font-mono flex items-center gap-2 text-left cursor-pointer"
          >
            <Sparkle className="w-3.5 h-3.5 text-[#6366F1]" />
            <span>AI Design suggestions</span>
          </button>
          
          {expandedSection === 'ai' && (
            <div className="p-4 flex flex-col gap-3">
              <textarea 
                value={aiPrompt}
                disabled={isRestyling}
                onChange={e => setAiPrompt(e.target.value)}
                className="w-full h-16 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg p-2.5 text-xs text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:border-[#6366F1] transition-colors"
                placeholder="e.g. make this more modern, glassmorphic card style, glowing borders..."
              />
              <button 
                onClick={handleAiRestyle}
                disabled={isRestyling || !aiPrompt.trim()}
                className="w-full h-[40px] bg-[#111111] hover:bg-black disabled:bg-[#F8F9FB] text-white disabled:text-[#9CA3AF] border-none rounded-[14px] text-xs font-bold font-mono uppercase transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {isRestyling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#6366F1]" />
                    <span>Restyling...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#6366F1]" />
                    <span>AI Re-style Element</span>
                  </>
                )
                }
              </button>
            </div>
          )}
        </div>

        <button 
          onClick={() => deleteNode(activeNode.id)}
          className="w-full h-[40px] bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/20 text-[#EF4444] rounded-[14px] text-xs font-bold font-mono uppercase transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Node</span>
        </button>

      </div>
    </aside>
  );
}