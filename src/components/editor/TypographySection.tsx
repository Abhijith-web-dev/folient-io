import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

const GOOGLE_FONTS = [
  'Inter',
  'Outfit',
  'Playfair Display',
  'Fira Code',
  'Cabinet Grotesk',
  'Clash Display',
  'Satoshi',
  'DM Sans'
];

interface TypographySectionProps {
  activeFont: string;
  setActiveFont: (font: string) => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  fontWeight: string;
  setFontWeight: (weight: string) => void;
  textHex: string;
  setTextHex: (hex: string) => void;
  textDecor: string;
  setTextDecor: (decor: string) => void;
  textAlignClass: string;
  setTextAlignClass: (align: string) => void;
  applyClassOverride: (regex: RegExp, replacement: string) => void;
}

export default function TypographySection({
  activeFont,
  setActiveFont,
  fontSize,
  setFontSize,
  fontWeight,
  setFontWeight,
  textHex,
  setTextHex,
  textDecor,
  setTextDecor,
  textAlignClass,
  setTextAlignClass,
  applyClassOverride
}: TypographySectionProps) {
  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="space-y-1.5">
        <label className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">Font Family</label>
        <select 
          value={activeFont}
          onChange={e => { setActiveFont(e.target.value); applyClassOverride(/font-\[[^\]]+\]/g, e.target.value ? `font-[${e.target.value}]` : ''); }}
          className="w-full h-8 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg px-2 text-xs text-[#111111] focus:outline-none focus:border-[#FF5733] cursor-pointer"
        >
          {GOOGLE_FONTS.map(font => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">Size</label>
          <select 
            value={fontSize}
            onChange={e => { setFontSize(e.target.value); applyClassOverride(/\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)\b/g, e.target.value); }}
            className="w-full h-8 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg px-2 text-xs text-[#111111] focus:outline-none focus:border-[#FF5733] cursor-pointer"
          >
            {['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl'].map(size => (
              <option key={size} value={size}>{size.replace('text-', '')}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">Weight</label>
          <select 
            value={fontWeight}
            onChange={e => { setFontWeight(e.target.value); applyClassOverride(/\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/g, e.target.value); }}
            className="w-full h-8 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg px-2 text-xs text-[#111111] focus:outline-none focus:border-[#FF5733] cursor-pointer"
          >
            {['font-thin', 'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-black'].map(weight => (
              <option key={weight} value={weight}>{weight.replace('font-', '')}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">Color HEX</label>
          <input 
            type="text" 
            value={textHex}
            onChange={e => { setTextHex(e.target.value); applyClassOverride(/text-\[[^\]]+\]/g, e.target.value ? `text-[${e.target.value}]` : ''); }}
            placeholder="#ffffff"
            className="w-full h-8 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg px-2 text-xs text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:border-[#FF5733] font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">Text Decor</label>
          <div className="flex gap-1 bg-[#F8F9FB] p-0.5 rounded-lg border border-[#ECEEF2]">
            {[
              { id: 'underline', label: 'U' },
              { id: 'line-through', label: 'S' },
              { id: 'no-underline', label: 'Clear' }
            ].map(dec => (
              <button
                key={dec.id}
                onClick={() => { setTextDecor(dec.id); applyClassOverride(/\b(underline|line-through|no-underline)\b/g, dec.id); }}
                className={`flex-1 h-7 rounded text-[10px] font-bold transition-all border-none cursor-pointer ${
                  textDecor === dec.id ? 'bg-[#111111] text-white' : 'bg-transparent text-[#6B7280]'
                }`}
              >
                {dec.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">Text Alignment</label>
        <div className="grid grid-cols-3 gap-1 bg-[#F8F9FB] p-0.5 rounded-lg border border-[#ECEEF2]">
          {[
            { id: 'text-left', icon: AlignLeft },
            { id: 'text-center', icon: AlignCenter },
            { id: 'text-right', icon: AlignRight }
          ].map(item => {
            const Icon = item.icon;
            return (
              <button 
                key={item.id}
                onClick={() => { setTextAlignClass(item.id); applyClassOverride(/\btext-(left|center|right|justify)\b/g, item.id); }}
                className={`h-7 rounded flex items-center justify-center cursor-pointer transition-colors border-none ${
                  textAlignClass === item.id ? 'bg-[#111111] text-white' : 'bg-transparent text-[#6B7280]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
