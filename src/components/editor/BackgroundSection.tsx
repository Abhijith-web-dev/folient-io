interface BackgroundSectionProps {
  bgType: 'solid' | 'gradient' | 'image';
  setBgType: (type: 'solid' | 'gradient' | 'image') => void;
  bgHex: string;
  setBgHex: (hex: string) => void;
  gradientDirection: string;
  setGradientDirection: (dir: string) => void;
  gradientStartHex: string;
  setGradientStartHex: (hex: string) => void;
  gradientEndHex: string;
  setGradientEndHex: (hex: string) => void;
  bgImageUrl: string;
  setBgImageUrl: (url: string) => void;
  applyClassOverride: (regex: RegExp, replacement: string) => void;
}

export default function BackgroundSection({
  bgType,
  setBgType,
  bgHex,
  setBgHex,
  gradientDirection,
  setGradientDirection,
  gradientStartHex,
  setGradientStartHex,
  gradientEndHex,
  setGradientEndHex,
  bgImageUrl,
  setBgImageUrl,
  applyClassOverride
}: BackgroundSectionProps) {
  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="space-y-1.5">
        <label className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">BG Type</label>
        <div className="grid grid-cols-3 gap-1 bg-[#F8F9FB] p-0.5 rounded-lg border border-[#ECEEF2]">
          {(['solid', 'gradient', 'image'] as const).map(type => (
            <button
              key={type}
              onClick={() => setBgType(type)}
              className={`h-7 rounded text-[10px] font-mono font-bold capitalize transition-all border-none cursor-pointer ${
                bgType === type ? 'bg-[#111111] text-white' : 'bg-transparent text-[#6B7280]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {bgType === 'solid' && (
        <div className="space-y-1.5">
          <label className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">Solid HEX</label>
          <input 
            type="text" 
            value={bgHex}
            onChange={e => { setBgHex(e.target.value); applyClassOverride(/bg-\[[^\]]+\]/g, e.target.value ? `bg-[${e.target.value}]` : ''); }}
            placeholder="#111111"
            className="w-full h-8 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg px-2 text-xs text-[#111111] focus:outline-none focus:border-[#FF5733] font-mono"
          />
        </div>
      )}

      {bgType === 'gradient' && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">Gradient Direction</label>
            <select 
              value={gradientDirection}
              onChange={e => { setGradientDirection(e.target.value); applyClassOverride(/\bbg-gradient-to-(r|l|t|b|tr|tl|br|bl)\b/g, e.target.value); }}
              className="w-full h-8 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg px-2 text-xs text-[#111111] focus:outline-none focus:border-[#FF5733] cursor-pointer"
            >
              <option value="bg-gradient-to-r">To Right</option>
              <option value="bg-gradient-to-l">To Left</option>
              <option value="bg-gradient-to-b">To Bottom</option>
              <option value="bg-gradient-to-tr">To Top Right</option>
              <option value="bg-gradient-to-br">To Bottom Right</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">Start HEX</label>
              <input 
                type="text" 
                value={gradientStartHex}
                onChange={e => { setGradientStartHex(e.target.value); applyClassOverride(/from-\[[^\]]+\]/g, e.target.value ? `from-[${e.target.value}]` : ''); }}
                placeholder="#FF5733"
                className="w-full h-8 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg px-2 text-xs text-[#111111] focus:outline-none focus:border-[#FF5733] font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">End HEX</label>
              <input 
                type="text" 
                value={gradientEndHex}
                onChange={e => { setGradientEndHex(e.target.value); applyClassOverride(/to-\[[^\]]+\]/g, e.target.value ? `to-[${e.target.value}]` : ''); }}
                placeholder="#000000"
                className="w-full h-8 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg px-2 text-xs text-[#111111] focus:outline-none focus:border-[#FF5733] font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {bgType === 'image' && (
        <div className="space-y-1.5">
          <label className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">Image URL Source</label>
          <input 
            type="text" 
            value={bgImageUrl}
            onChange={e => { setBgImageUrl(e.target.value); applyClassOverride(/bg-\[url\('[^']+'\)\]/g, e.target.value ? `bg-[url('${e.target.value}')] bg-cover bg-center` : ''); }}
            placeholder="https://..."
            className="w-full h-8 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg px-2 text-xs text-[#111111] focus:outline-none focus:border-[#FF5733]"
          />
        </div>
      )}
    </div>
  );
}
