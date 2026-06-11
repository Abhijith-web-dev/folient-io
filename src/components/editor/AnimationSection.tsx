interface AnimationSectionProps {
  entryAnim: string;
  setEntryAnim: (anim: string) => void;
  animDuration: string;
  setAnimDuration: (duration: string) => void;
  animDelay: string;
  setAnimDelay: (delay: string) => void;
  applyClassOverride: (regex: RegExp, replacement: string) => void;
}

export default function AnimationSection({
  entryAnim,
  setEntryAnim,
  animDuration,
  setAnimDuration,
  animDelay,
  setAnimDelay,
  applyClassOverride
}: AnimationSectionProps) {
  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="space-y-1.5">
        <label className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">Preset Motion</label>
        <select 
          value={entryAnim}
          onChange={e => { setEntryAnim(e.target.value); applyClassOverride(/\b(transition-all|animate-pulse|animate-bounce)\b/g, e.target.value); }}
          className="w-full h-8 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg px-2 text-xs text-[#111111] focus:outline-none focus:border-[#FF5733] cursor-pointer"
        >
          <option value="transition-all">None (Static)</option>
          <option value="animate-pulse">Glow Pulse</option>
          <option value="animate-bounce">Bounce Loop</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">Duration</label>
          <select 
            value={animDuration}
            onChange={e => { setAnimDuration(e.target.value); applyClassOverride(/\bduration-\d+\b/g, e.target.value); }}
            className="w-full h-8 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg px-2 text-xs text-[#111111] focus:outline-none focus:border-[#FF5733] cursor-pointer"
          >
            {['duration-100', 'duration-200', 'duration-300', 'duration-500', 'duration-700', 'duration-1000'].map(dur => (
              <option key={dur} value={dur}>{dur.replace('duration-', '') + 'ms'}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] uppercase font-mono text-[#6B7280] font-bold">Delay</label>
          <select 
            value={animDelay}
            onChange={e => { setAnimDelay(e.target.value); applyClassOverride(/\bdelay-\d+\b/g, e.target.value); }}
            className="w-full h-8 bg-[#F8F9FB] border border-[#ECEEF2] rounded-lg px-2 text-xs text-[#111111] focus:outline-none focus:border-[#FF5733] cursor-pointer"
          >
            {['delay-0', 'delay-75', 'delay-100', 'delay-150', 'delay-200', 'delay-300', 'delay-500'].map(del => (
              <option key={del} value={del}>{del.replace('delay-', '') + 'ms'}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
