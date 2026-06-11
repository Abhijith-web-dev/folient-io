import { useState, useEffect, useRef } from 'react';
import { FileCode, ExternalLink, Copy, Check, X, Sparkles } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useEditorStore, type AstNode } from '../store/useEditorStore';

export function parseHtmlToAst(html: string, rootId = 'root-viewport'): AstNode {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const rootEl = doc.body.firstElementChild || doc.body;
  
  let nodeCount = 0;
  const generateId = (tagName: string) => {
    nodeCount++;
    return `${rootId}-${tagName.toLowerCase()}-${nodeCount}-${Math.random().toString(36).substring(2, 6)}`;
  };

  const mapElementToAst = (el: Element): AstNode => {
    const tag = el.tagName.toLowerCase();
    let type = 'div';
    if (['section', 'button', 'header', 'footer', 'nav', 'p', 'h1', 'h2', 'h3'].includes(tag)) {
      type = tag;
    } else if (tag === 'img') {
      type = 'image';
    } else if (el.classList.contains('grid')) {
      type = 'grid';
    }

    const classes = el.getAttribute('class') || '';
    const children = Array.from(el.children);
    
    const node: AstNode = {
      id: el.getAttribute('data-node-id') || el.getAttribute('id') || generateId(tag),
      type,
      classes
    };

    if (children.length === 0) {
      node.content = el.textContent?.trim() || undefined;
    } else {
      node.children = children.map(child => mapElementToAst(child));
    }

    return node;
  };

  return mapElementToAst(rootEl);
}

export const formatHtml = (html: string): string => {
  let formatted = '';
  let pad = '';
  html.split(/>\s*</).forEach(chunk => {
    if (chunk.match(/^\/\w/)) {
      pad = pad.substring(2);
    }
    formatted += pad + '<' + chunk + '>\r\n';
    if (chunk.match(/^<?\w[^>]*[^\/]$/) && !chunk.startsWith('input') && !chunk.startsWith('img') && !chunk.startsWith('br') && !chunk.startsWith('hr')) {
      pad += '  ';
    }
  });
  return formatted.substring(1, formatted.length - 3).trim();
};

export default function CodePanel() {
  const { compileAstToHtml, setAst, codeViewOpen, setCodeViewOpen, addTelemetryLog } = useEditorStore();
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const detachedWindowRef = useRef<Window | null>(null);

  useEffect(() => {
    if (codeViewOpen) {
      const html = compileAstToHtml();
      try {
        setCode(formatHtml(html));
      } catch {
        setCode(html);
      }
    }
  }, [compileAstToHtml, codeViewOpen]);

  // Sync detached window message callbacks
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'FOLIENT_DETACHED_CODE_APPLY') {
        try {
          const ast = parseHtmlToAst(e.data.code);
          setAst(ast);
          setCode(e.data.code);
          addTelemetryLog('Sync changes applied from detached code window.', 'success');
        } catch (err: any) {
          console.error(err);
          addTelemetryLog(`Detached code apply failed: ${err.message || err}`, 'error');
          alert(`Failed to apply detached changes: ${err.message}`);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      if (detachedWindowRef.current && !detachedWindowRef.current.closed) {
        detachedWindowRef.current.close();
      }
    };
  }, [setAst, addTelemetryLog]);

  // Push updates to detached window
  useEffect(() => {
    if (detachedWindowRef.current && !detachedWindowRef.current.closed) {
      detachedWindowRef.current.postMessage({ type: 'FOLIENT_PARENT_CODE_UPDATE', code }, '*');
    }
  }, [code]);

  // Debounced auto-sync to visual AST canvas
  useEffect(() => {
    if (!code) return;
    const timeout = setTimeout(() => {
      try {
        const parsed = parseHtmlToAst(code);
        const currentHtml = compileAstToHtml();
        if (code.replace(/\s+/g, '') !== currentHtml.replace(/\s+/g, '')) {
          setAst(parsed);
          addTelemetryLog('Code editor updates parsed and auto-applied to AST.', 'success');
        }
      } catch {}
    }, 1200);
    return () => clearTimeout(timeout);
  }, [code, setAst, compileAstToHtml, addTelemetryLog]);

  const handleDetach = () => {
    if (detachedWindowRef.current && !detachedWindowRef.current.closed) {
      detachedWindowRef.current.focus();
      return;
    }
    const width = 800;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open('', 'FolientCodeDetached', `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`);
    if (popup) {
      detachedWindowRef.current = popup;
      addTelemetryLog('Code panel detached into standalone viewport window.', 'info');
      
      popup.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Folient Visual IDE - Detached HTML Code View</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { font-family: 'Inter', sans-serif; }
            textarea { font-family: 'Fira Code', monospace; }
          </style>
        </head>
        <body class="bg-[#F3F4F6] text-[#111111] h-screen flex flex-col p-4">
          <div class="flex justify-between items-center mb-3">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-[#FF5733]"></span>
              <h1 class="text-sm font-bold text-[#111111] uppercase tracking-wider">Detached Editor View</h1>
            </div>
            <div class="flex items-center gap-2">
              <button id="btn-copy" class="h-8 px-3.5 bg-white border border-[#ECEEF2] text-xs font-semibold rounded-lg hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer">
                Copy
              </button>
              <button id="btn-apply" class="h-8 px-4 bg-[#111111] text-white text-xs font-bold rounded-lg hover:bg-black flex items-center gap-1.5 cursor-pointer">
                Apply to Parent
              </button>
            </div>
          </div>
          <textarea id="code-box" class="flex-1 w-full bg-white border border-[#ECEEF2] rounded-xl p-4 text-xs leading-relaxed focus:outline-none focus:border-[#FF5733] resize-none outline-none font-mono">${code}</textarea>
          
          <script>
            // Communication handler
            document.getElementById('btn-apply').addEventListener('click', () => {
              const codeVal = document.getElementById('code-box').value;
              window.opener.postMessage({ type: 'FOLIENT_DETACHED_CODE_APPLY', code: codeVal }, '*');
            });
            document.getElementById('btn-copy').addEventListener('click', () => {
              const codeVal = document.getElementById('code-box').value;
              navigator.clipboard.writeText(codeVal);
              const btn = document.getElementById('btn-copy');
              btn.innerText = 'Copied!';
              setTimeout(() => { btn.innerText = 'Copy'; }, 2000);
            });
            window.addEventListener('message', (e) => {
              if (e.data && e.data.type === 'FOLIENT_PARENT_CODE_UPDATE') {
                document.getElementById('code-box').value = e.data.code;
              }
            });
          </script>
        </body>
        </html>
      `);
      popup.document.close();
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addTelemetryLog('Copied full HTML code to clipboard.', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyCode = () => {
    try {
      const parsedAst = parseHtmlToAst(code);
      setAst(parsedAst);
      addTelemetryLog('Sync code editor modifications successfully compiled to AST.', 'success');
      alert('Changes successfully compiled and applied to visual workspace!');
    } catch (err: any) {
      console.error(err);
      addTelemetryLog(`Failed to parse edited code: ${err.message || err}`, 'error');
      alert(`Parsing Error: Please ensure you have valid semantic HTML syntax.\nDetail: ${err.message || err}`);
    }
  };

  if (!codeViewOpen) return null;

  return (
    <aside className="w-full h-full bg-white border border-[#ECEEF2] rounded-[24px] flex flex-col select-none overflow-hidden z-30 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
      <div className="h-12 bg-white px-4 border-b border-[#ECEEF2] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-[#FF5733]" />
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#111111]">HTML Code Editor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={handleDetach}
            className="p-1.5 hover:bg-[#F8F9FB] rounded-[10px] text-[#6B7280] hover:text-[#111111] border-none bg-transparent cursor-pointer flex items-center justify-center"
            title="Detach Window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setCodeViewOpen(false)}
            className="p-1.5 hover:bg-[#F8F9FB] rounded-[10px] text-[#6B7280] hover:text-[#111111] border-none bg-transparent cursor-pointer flex items-center justify-center"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col min-h-0 relative">
        <div className="flex-1 w-full bg-[#F8F9FB] border border-[#ECEEF2] rounded-xl overflow-hidden p-2">
          <Editor 
            height="100%"
            language="html"
            theme="vs-light"
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 11,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true
            }}
          />
        </div>
      </div>

      <div className="p-4 bg-white border-t border-[#ECEEF2] flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              try {
                setCode(formatHtml(code));
                addTelemetryLog('Code formatted using client-side pre-formatter.', 'info');
              } catch (e) {
                console.error(e);
              }
            }}
            className="h-9 px-3.5 bg-[#F8F9FB] border border-[#ECEEF2] hover:bg-[#ECEEF2] rounded-[12px] text-[#111111] text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer"
            title="Pre-format syntax"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF5733]" />
            <span>Format</span>
          </button>
          <button 
            onClick={handleCopyCode}
            className="h-9 px-3.5 bg-[#F8F9FB] border border-[#ECEEF2] hover:bg-[#ECEEF2] rounded-[12px] text-[#111111] text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
        
        <button 
          onClick={handleApplyCode}
          className="h-9 px-4 bg-[#111111] hover:bg-black text-white text-[11px] font-bold rounded-[12px] flex items-center gap-1.5 cursor-pointer border-none shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          title="Apply modifications to visual canvas"
        >
          <Check className="w-3.5 h-3.5 text-[#FF5733]" />
          <span>Apply Workspace</span>
        </button>
      </div>
    </aside>
  );
}