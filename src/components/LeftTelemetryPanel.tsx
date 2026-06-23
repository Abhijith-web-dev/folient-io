import { useState } from 'react';
import { Layers, FileCode, Image, Activity } from 'lucide-react';
import SectionsTab from './editor/SectionsTab';
import LayersTab from './editor/LayersTab';
import AssetsTab from './editor/AssetsTab';
import TelemetryTab from './editor/TelemetryTab';

export default function LeftTelemetryPanel() {
  const [activeTab, setActiveTab] = useState<'sections' | 'layers' | 'assets' | 'telemetry'>('sections');

  return (
    <aside className="w-full h-full bg-white border border-[#ECEEF2] rounded-[24px] flex flex-col select-none overflow-hidden z-30 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
      {/* Dynamic Tab Switcher */}
      <div className="flex border-b border-[#ECEEF2] bg-[#F8F9FB] p-1 gap-1 shrink-0">
        {(['sections', 'layers', 'assets', 'telemetry'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-[10px] text-[10px] uppercase font-mono font-bold border-none transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === tab 
                ? 'bg-white text-[#111111] shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-[#ECEEF2]' 
                : 'text-[#6B7280] hover:text-[#111111] bg-transparent'
            }`}
          >
            {tab === 'sections' && <Layers className="w-3 h-3 text-[#6366F1]" />}
            {tab === 'layers' && <FileCode className="w-3 h-3 text-[#6366F1]" />}
            {tab === 'assets' && <Image className="w-3 h-3 text-[#6366F1]" />}
            {tab === 'telemetry' && <Activity className="w-3 h-3 text-[#22C55E]" />}
            <span>{tab}</span>
          </button>
        ))}
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'sections' && <SectionsTab />}
        {activeTab === 'layers' && <LayersTab />}
        {activeTab === 'assets' && <AssetsTab />}
        {activeTab === 'telemetry' && <TelemetryTab />}
      </div>
    </aside>
  );
}