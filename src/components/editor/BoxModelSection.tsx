interface BoxModelSectionProps {
  paddingClass: string;
  setPaddingClass: (padding: string) => void;
  marginClass: string;
  setMarginClass: (margin: string) => void;
  borderRadius: string;
  setBorderRadius: (radius: string) => void;
  borderWidth: string;
  setBorderWidth: (width: string) => void;
  borderHex: string;
  setBorderHex: (hex: string) => void;
  applyClassOverride: (regex: RegExp, replacement: string) => void;
}

export default function BoxModelSection({
  paddingClass,
  setPaddingClass,
  marginClass,
  setMarginClass,
  borderRadius,
  setBorderRadius,
  borderWidth,
  setBorderWidth,
  borderHex,
  setBorderHex,
  applyClassOverride
}: BoxModelSectionProps) {
  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">Padding Value</label>
          <select 
            value={paddingClass}
            onChange={e => { setPaddingClass(e.target.value); applyClassOverride(/\bp[xy]?-\d+\b/g, e.target.value); }}
            className="w-full h-8 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg px-2 text-xs text-[#111111] focus:outline-none focus:border-[#FF5733] cursor-pointer"
          >
            {['p-0', 'p-1', 'p-2', 'p-3', 'p-4', 'p-6', 'p-8', 'p-12', 'p-16'].map(pad => (
              <option key={pad} value={pad}>{pad}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">Margin Value</label>
          <select 
            value={marginClass}
            onChange={e => { setMarginClass(e.target.value); applyClassOverride(/\bm[xy]?-\d+\b/g, e.target.value); }}
            className="w-full h-8 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg px-2 text-xs text-[#111111] focus:outline-none focus:border-[#FF5733] cursor-pointer"
          >
            {['m-0', 'm-1', 'm-2', 'm-3', 'm-4', 'm-6', 'm-8', 'm-12'].map(mar => (
              <option key={mar} value={mar}>{mar}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">Border Radius</label>
          <select 
            value={borderRadius}
            onChange={e => { setBorderRadius(e.target.value); applyClassOverride(/\brounded-(none|sm|md|lg|xl|2xl|3xl|full)\b/g, e.target.value); }}
            className="w-full h-8 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg px-2 text-xs text-[#111111] focus:outline-none focus:border-[#FF5733] cursor-pointer"
          >
            {['rounded-none', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-full'].map(rad => (
              <option key={rad} value={rad}>{rad.replace('rounded-', '')}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">Border Width</label>
          <select 
            value={borderWidth}
            onChange={e => { setBorderWidth(e.target.value); applyClassOverride(/\bborder-(0|2|4|8)\b/g, e.target.value); }}
            className="w-full h-8 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg px-2 text-xs text-[#111111] focus:outline-none focus:border-[#FF5733] cursor-pointer"
          >
            {['border-0', 'border-2', 'border-4', 'border-8'].map(bw => (
              <option key={bw} value={bw}>{bw.replace('border-', '') + 'px'}</option>
            ))}
          </select>
        </div>
      </div>

      {borderWidth !== 'border-0' && (
        <div className="space-y-1.5">
          <label className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">Border Color HEX</label>
          <input 
            type="text" 
            value={borderHex}
            onChange={e => { setBorderHex(e.target.value); applyClassOverride(/border-\[[^\]]+\]/g, e.target.value ? `border-[${e.target.value}]` : ''); }}
            placeholder="#ECEEF2"
            className="w-full h-8 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg px-2 text-xs text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:border-[#FF5733] font-mono"
          />
        </div>
      )}
    </div>
  );
}
