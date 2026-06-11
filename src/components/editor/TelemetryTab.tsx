import { useEffect, useRef } from 'react';
import { useEditorStore } from '../../store/useEditorStore';

export default function TelemetryTab() {
  const { telemetryLogs } = useEditorStore();
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [telemetryLogs]);

  return (
    <div className="flex-1 p-4 font-mono text-[10px] text-[#6B7280] leading-relaxed overflow-y-auto space-y-1.5 scrollbar-thin bg-[#F8F9FB]">
      {telemetryLogs.map((log) => {
        const logTypeClass = 
          log.type === 'success' ? 'text-[#22C55E] font-semibold' :
          log.type === 'warn' ? 'text-[#D97706] font-semibold' :
          log.type === 'error' ? 'text-[#EF4444] font-semibold' :
          'text-[#6B7280]';

        return (
          <div key={log.id} className="flex items-start gap-2 border-b border-[#ECEEF2]/40 pb-1">
            <span className="text-[#9CA3AF] shrink-0 select-none">[{log.timestamp}]</span>
            <span className={`${logTypeClass} break-all flex-1`}>{log.message}</span>
          </div>
        );
      })}
      <div ref={logsEndRef} />
    </div>
  );
}
