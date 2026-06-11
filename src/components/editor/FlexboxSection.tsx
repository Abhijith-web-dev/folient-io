interface FlexboxSectionProps {
  displayClass: string;
  setDisplayClass: (display: string) => void;
  flexDirection: string;
  setFlexDirection: (dir: string) => void;
  justifyContent: string;
  setJustifyContent: (justify: string) => void;
  alignItems: string;
  setAlignItems: (align: string) => void;
  gapClass: string;
  setGapClass: (gap: string) => void;
  applyClassOverride: (regex: RegExp, replacement: string) => void;
}

export default function FlexboxSection({
  displayClass,
  setDisplayClass,
  flexDirection,
  setFlexDirection,
  justifyContent,
  setJustifyContent,
  alignItems,
  setAlignItems,
  gapClass,
  setGapClass,
  applyClassOverride
}: FlexboxSectionProps) {
  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="space-y-1.5">
        <label className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">Display Layout</label>
        <select 
          value={displayClass}
          onChange={e => { setDisplayClass(e.target.value); applyClassOverride(/\b(block|flex|grid|inline-block|hidden)\b/g, e.target.value); }}
          className="w-full h-8 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg px-2 text-xs text-[#111111] focus:outline-none focus:border-[#FF5733] cursor-pointer"
        >
          {['block', 'flex', 'grid', 'inline-block', 'hidden'].map(disp => (
            <option key={disp} value={disp}>{disp}</option>
          ))}
        </select>
      </div>

      {displayClass === 'flex' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">Direction</label>
              <select 
                value={flexDirection}
                onChange={e => { setFlexDirection(e.target.value); applyClassOverride(/\bflex-(row|col|row-reverse|col-reverse)\b/g, e.target.value); }}
                className="w-full h-8 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg px-2 text-xs text-[#111111] focus:outline-none focus:border-[#FF5733] cursor-pointer"
              >
                <option value="flex-row">Row</option>
                <option value="flex-col">Column</option>
                <option value="flex-row-reverse">Row Reverse</option>
                <option value="flex-col-reverse">Col Reverse</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">Gap</label>
              <select 
                value={gapClass}
                onChange={e => { setGapClass(e.target.value); applyClassOverride(/\bgap-\d+\b/g, e.target.value); }}
                className="w-full h-8 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg px-2 text-xs text-[#111111] focus:outline-none focus:border-[#FF5733] cursor-pointer"
              >
                {['gap-0', 'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-6', 'gap-8', 'gap-12'].map(gp => (
                  <option key={gp} value={gp}>{gp}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">Justify Content</label>
            <select 
              value={justifyContent}
              onChange={e => { setJustifyContent(e.target.value); applyClassOverride(/\bjustify-(start|center|end|between|around|evenly)\b/g, e.target.value); }}
              className="w-full h-8 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg px-2 text-xs text-[#111111] focus:outline-none focus:border-[#FF5733] cursor-pointer"
            >
              <option value="justify-start">Start</option>
              <option value="justify-center">Center</option>
              <option value="justify-end">End</option>
              <option value="justify-between">Space Between</option>
              <option value="justify-around">Space Around</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">Align Items</label>
            <select 
              value={alignItems}
              onChange={e => { setAlignItems(e.target.value); applyClassOverride(/\bitems-(start|center|end|stretch|baseline)\b/g, e.target.value); }}
              className="w-full h-8 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg px-2 text-xs text-[#111111] focus:outline-none focus:border-[#FF5733] cursor-pointer"
            >
              <option value="items-start">Start</option>
              <option value="items-center">Center</option>
              <option value="items-end">End</option>
              <option value="items-stretch">Stretch</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
}
