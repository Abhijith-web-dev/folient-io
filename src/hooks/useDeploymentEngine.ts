import { useState } from 'react';
import JSZip from 'jszip';
import { createClient } from '@supabase/supabase-js';
import { useEditorStore, compileAstToHtml as compileAstToHtmlStandalone } from '../store/useEditorStore';

// ─── Supabase Client (lazy-init to avoid localStorage access during SSR) ───────
function getSupabaseClient() {
  const url = localStorage.getItem('supabase_url') || '';
  const anon = localStorage.getItem('supabase_anon_key') || '';
  if (!url || !anon) return null;
  return createClient(url, anon);
}

async function recordDeployment(record: any) {
  const client = getSupabaseClient();
  if (!client) {
    console.warn('Supabase not configured — skipping deployment record.');
    return { ...record, id: Math.random().toString(36).substring(7), created_at: new Date().toISOString() };
  }
  const { data, error } = await client.from('deployments').insert([record]).select();
  if (error) {
    console.error('Supabase deployment record error:', error);
    return { ...record, id: Math.random().toString(36).substring(7), created_at: new Date().toISOString() };
  }
  return data?.[0];
}

// ─── Routing helper — use Vite proxy in dev, direct in prod ─────────────────
function netlifyUrl(path: string): string {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return `/api/netlify${path}`;
  }
  return `https://api.netlify.com/api/v1${path}`;
}

function vercelUrl(path: string): string {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return `/api/vercel${path}`;
  }
  return `https://api.vercel.com${path}`;
}

// ─── Retry helper with exponential backoff ───────────────────────────────────
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
  baseDelay = 1000
): Promise<Response> {
  let lastError: Error = new Error('Unknown error');
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok || (res.status >= 400 && res.status < 500)) {
        return res;
      }
      lastError = new Error(`HTTP ${res.status}`);
    } catch (e: any) {
      lastError = e;
    }
    if (attempt < maxRetries - 1) {
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastError;
}

// ─── Parse API error response body ───────────────────────────────────────────
async function parseErrorBody(res: Response): Promise<string> {
  try {
    const json = await res.json();
    return json.message || json.error || json.errors?.[0]?.message || JSON.stringify(json);
  } catch {
    try {
      return await res.text();
    } catch {
      return `HTTP ${res.status} ${res.statusText}`;
    }
  }
}

// ─── Poll Netlify deploy status until ready or timeout ───────────────────────
async function pollNetlifyDeployReady(
  deployId: string,
  token: string,
  onLog: (msg: string) => void,
  maxWaitMs = 120_000
): Promise<string> {
  const start = Date.now();
  let dots = 0;
  while (Date.now() - start < maxWaitMs) {
    await new Promise(r => setTimeout(r, 3000));
    const res = await fetch(netlifyUrl(`/deploys/${deployId}`), {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) continue;
    const data = await res.json();
    const state: string = data.state || 'unknown';
    dots = (dots + 1) % 4;
    onLog(`Deploy state: [${state.toUpperCase()}]${'.'.repeat(dots)}`);
    if (state === 'ready') {
      return data.ssl_url || data.url || '';
    }
    if (state === 'error') {
      throw new Error(`Netlify deploy failed: ${data.error_message || 'Unknown deploy error'}`);
    }
  }
  throw new Error('Deploy timed out after 2 minutes. Check your Netlify dashboard.');
}

export function useDeploymentEngine() {
  const [deploying, setDeploying] = useState(false);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const compileAstToHtml = useEditorStore(state => state.compileAstToHtml);
  const addTelemetryLog = useEditorStore(state => state.addTelemetryLog);
  const projectName = useEditorStore(state => state.projectName) || 'Folient Portfolio';

  const log = (msg: string) => {
    setDeployLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    addTelemetryLog(msg, 'info');
  };

  const packageFiles = async (title: string, customAst?: any, customCss?: string) => {
    log('Packaging project files...');
    const zip = new JSZip();
    
    const activeAst = customAst || useEditorStore.getState().ast;
    const activeCss = customCss !== undefined ? customCss : useEditorStore.getState().projectCss;
    const html = customAst ? compileAstToHtmlStandalone(customAst) : compileAstToHtml();
    
    const safeAstData = JSON.stringify({ ast: activeAst, css: activeCss }).replace(/</g, '\\u003c');
    const embeddedScript = `<script id="folient-ast-data" type="application/json">${safeAstData}</script>`;

    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${title} — Built with Folient Visual Builder">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: { sans: ['Inter', 'sans-serif'] }
        }
      }
    }
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    ${activeCss || ''}
  </style>
  ${embeddedScript}
</head>
<body>
  ${html}
</body>
</html>`;

    zip.file('index.html', indexHtml);
    zip.file('_redirects', '/*  /index.html  200');

    log('Compiled index.html with Inter + Outfit fonts and Tailwind CDN.');
    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    log(`Package ready (${(blob.size / 1024).toFixed(1)} KB compressed).`);
    return blob;
  };

  // ─── Subdomain / Site Name Availability Checks ───────────────────────────
  const validateNetlifySubdomain = async (token: string, name: string): Promise<{ available: boolean; reason?: string }> => {
    try {
      const sanitized = name.toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (sanitized.length < 3 || sanitized.length > 63) {
        return { available: false, reason: 'Subdomain must be between 3 and 63 alphanumeric/hyphen characters.' };
      }
      log(`Checking Netlify subdomain availability for '${sanitized}'...`);
      
      // Netlify requires checking if a site with the name exists
      const res = await fetch(netlifyUrl(`/sites/${sanitized}`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // If 444 or 404, it means it doesn't exist under this account and is likely available.
      // Netlify returns 404 if site name is not claimed yet.
      if (res.status === 404) {
        log(`Netlify subdomain '${sanitized}' is AVAILABLE!`);
        return { available: true };
      } else if (res.ok) {
        log(`Netlify subdomain '${sanitized}' is ALREADY CLAIMED.`);
        return { available: false, reason: 'Subdomain is already claimed.' };
      } else {
        const err = await parseErrorBody(res);
        if (err.includes('not found') || err.includes('Not Found')) {
          log(`Netlify subdomain '${sanitized}' is AVAILABLE!`);
          return { available: true };
        }
        return { available: false, reason: `Netlify API error: ${err}` };
      }
    } catch (e: any) {
      return { available: false, reason: e.message || String(e) };
    }
  };

  const validateVercelSubdomain = async (token: string, name: string): Promise<{ available: boolean; reason?: string }> => {
    try {
      const sanitized = name.toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (sanitized.length < 3 || sanitized.length > 63) {
        return { available: false, reason: 'Subdomain must be between 3 and 63 alphanumeric/hyphen characters.' };
      }
      log(`Checking Vercel project name availability for '${sanitized}'...`);
      
      // Vercel checks project name availability by fetching the specific project endpoint
      const res = await fetch(vercelUrl(`/v9/projects/${sanitized}`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.status === 404) {
        log(`Vercel project name '${sanitized}' is AVAILABLE!`);
        return { available: true };
      } else if (res.ok) {
        log(`Vercel project name '${sanitized}' is ALREADY CLAIMED.`);
        return { available: false, reason: 'Project name is already claimed by another project in your scope.' };
      } else {
        const err = await parseErrorBody(res);
        if (err.includes('not_found') || err.includes('Not Found')) {
          log(`Vercel project name '${sanitized}' is AVAILABLE!`);
          return { available: true };
        }
        return { available: false, reason: `Vercel API error: ${err}` };
      }
    } catch (e: any) {
      return { available: false, reason: e.message || String(e) };
    }
  };

  // ─── Deploy to Netlify ────────────────────────────────────────────────────
  const deployToNetlify = async (token: string, existingSiteId?: string, customName?: string, customAst?: any, customCss?: string) => {
    setDeploying(true);
    setDeployLogs([]);
    log('Starting Netlify deployment...');

    try {
      if (!token) throw new Error('Netlify token is required. Add it in Settings > Netlify Token.');

      const zipBlob = await packageFiles(projectName, customAst, customCss);
      let siteId = existingSiteId;

      const jsonHeaders = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Check for existing Netlify site by name if no siteId was specified
      if (!siteId && customName) {
        const checkName = customName.toLowerCase().replace(/[^a-z0-9-]/g, '');
        log(`Checking if site name '${checkName}' already exists in your Netlify account...`);
        try {
          const listRes = await fetch(netlifyUrl('/sites'), {
            headers: jsonHeaders
          });
          if (listRes.ok) {
            const sites = await listRes.json();
            const existing = sites.find((s: any) => s.name === checkName);
            if (existing) {
              siteId = existing.id;
              log(`Found existing Netlify site: [${siteId}] — ${existing.name}.netlify.app. Rehosting to this site.`);
            }
          }
        } catch (checkErr) {
          console.warn('Failed to query existing Netlify sites, proceeding to create site...', checkErr);
        }
      }

      // Create site with custom subdomain if specified and not deploying to existing site
      if (!siteId) {
        const siteName = customName ? customName.toLowerCase().replace(/[^a-z0-9-]/g, '') : `folient-${Math.random().toString(36).substring(2, 8)}`;
        log(`Creating Netlify site with subdomain name '${siteName}'...`);
        const siteRes = await fetchWithRetry(
          netlifyUrl('/sites'),
          {
            method: 'POST',
            headers: jsonHeaders,
            body: JSON.stringify({ name: siteName })
          }
        );
        if (!siteRes.ok) {
          const msg = await parseErrorBody(siteRes);
          throw new Error(`Could not create Netlify site: ${msg}`);
        }
        const siteData = await siteRes.json();
        siteId = siteData.id;
        log(`Site created: [${siteId}] — ${siteData.name}.netlify.app`);
      } else {
        log(`Redeploying to existing site [${siteId}]...`);
      }

      log('Uploading build package...');
      const deployRes = await fetchWithRetry(
        netlifyUrl(`/sites/${siteId}/deploys`),
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/zip'
          },
          body: zipBlob
        }
      );

      if (!deployRes.ok) {
        const msg = await parseErrorBody(deployRes);
        throw new Error(`Upload failed: ${msg}`);
      }

      const deployData = await deployRes.json();
      const deployId = deployData.id;
      log(`Upload accepted. Deploy ID: [${deployId}]`);

      log('Waiting for deploy to go live...');
      const liveUrl = await pollNetlifyDeployReady(deployId, token, log);

      log(`🎉 Live! ${liveUrl}`);

      await recordDeployment({
        user_id: localStorage.getItem('folient_user_uid') || 'anonymous',
        site_id: siteId,
        provider: 'netlify',
        status: 'ready',
        url: liveUrl
      });

      setDeploying(false);
      return { url: liveUrl, siteId };

    } catch (e: any) {
      const errMsg = e?.message || String(e);
      log(`❌ Deploy failed: ${errMsg}`);
      addTelemetryLog(`Netlify deploy error: ${errMsg}`, 'error');
      setDeploying(false);
      throw e;
    }
  };

  // ─── Deploy to Vercel ─────────────────────────────────────────────────────
  const deployToVercel = async (token: string, teamId?: string, customName?: string, customAst?: any, customCss?: string) => {
    setDeploying(true);
    setDeployLogs([]);
    log('Starting Vercel deployment...');

    try {
      if (!token) throw new Error('Vercel token is required. Add it in Settings > Vercel Token.');

      const activeAst = customAst || useEditorStore.getState().ast;
      const activeCss = customCss !== undefined ? customCss : useEditorStore.getState().projectCss;
      const html = customAst ? compileAstToHtmlStandalone(customAst) : compileAstToHtml();
      
      const safeAstData = JSON.stringify({ ast: activeAst, css: activeCss }).replace(/</g, '\\u003c');
      const embeddedScript = `<script id="folient-ast-data" type="application/json">${safeAstData}</script>`;

      const vercelHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${projectName} — Built with Folient Visual Builder">
  <title>${projectName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    ${activeCss || ''}
  </style>
  ${embeddedScript}
</head>
<body>
  ${html}
</body>
</html>`;

      log('Building Vercel deployment payload...');

      const vercelProjectName = customName ? customName.toLowerCase().replace(/[^a-z0-9-]/g, '') : `folient-${Math.random().toString(36).substring(2, 8)}`;
      const payload = {
        name: vercelProjectName,
        files: [{ file: 'index.html', data: vercelHtml }],
        projectSettings: { framework: null },
        target: 'production'
      };

      let endpoint = vercelUrl('/v13/deployments');
      if (teamId) endpoint += `?teamId=${encodeURIComponent(teamId)}`;

      log('Sending to Vercel Deployments API...');
      const response = await fetchWithRetry(
        endpoint,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const msg = await parseErrorBody(response);
        throw new Error(`Vercel deployment rejected: ${msg}`);
      }

      const data = await response.json();
      const liveUrl = data.url?.startsWith('http') ? data.url : `https://${data.url}`;
      log(`🎉 Vercel deploy queued! URL: ${liveUrl}`);
      log('Note: Vercel may take 30-60 seconds to build. Check the URL shortly.');

      await recordDeployment({
        user_id: localStorage.getItem('folient_user_uid') || 'anonymous',
        site_id: data.id || vercelProjectName,
        provider: 'vercel',
        status: 'building',
        url: liveUrl
      });

      setDeploying(false);
      return { url: liveUrl, projectId: data.id || vercelProjectName };

    } catch (e: any) {
      const errMsg = e?.message || String(e);
      log(`❌ Deploy failed: ${errMsg}`);
      addTelemetryLog(`Vercel deploy error: ${errMsg}`, 'error');
      setDeploying(false);
      throw e;
    }
  };

  const extractAstFromLiveUrl = async (url: string): Promise<{ ast: any; css: string }> => {
    log(`Attempting to extract AST from live website: ${url}`);
    
    // Ensure URL has protocol
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }
    
    let htmlText = '';
    const proxies = [
      // 1. Direct fetch
      async () => {
        log('Attempting direct fetch...');
        const res = await fetch(targetUrl);
        if (!res.ok) throw new Error(`Direct fetch HTTP status ${res.status}`);
        return await res.text();
      },
      // 2. corsproxy.io
      async () => {
        log('Attempting CORS bypass via corsproxy.io...');
        const res = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`);
        if (!res.ok) throw new Error(`corsproxy.io HTTP status ${res.status}`);
        return await res.text();
      },
      // 3. codetabs proxy
      async () => {
        log('Attempting CORS bypass via api.codetabs.com...');
        const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`);
        if (!res.ok) throw new Error(`codetabs proxy HTTP status ${res.status}`);
        return await res.text();
      },
      // 4. allorigins.win (JSON wrapped)
      async () => {
        log('Attempting CORS bypass via api.allorigins.win...');
        const cacheBuster = `&_=${Date.now()}`;
        const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}${cacheBuster}`);
        if (!res.ok) throw new Error(`allorigins.win HTTP status ${res.status}`);
        const data = await res.json();
        if (!data.contents) throw new Error('allorigins.win empty contents response');
        return data.contents;
      }
    ];

    let lastError: any = null;
    for (const proxyFn of proxies) {
      try {
        htmlText = await proxyFn();
        if (htmlText && htmlText.trim()) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        log(`Bypass method failed: ${err.message || String(err)}`);
      }
    }
    
    if (!htmlText) {
      throw new Error(`Failed to retrieve live site HTML. Last attempted method error: ${lastError?.message || lastError || 'Unknown error'}`);
    }
    
    // Parse the HTML text using DOMParser
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      const scriptEl = doc.getElementById('folient-ast-data');
      if (scriptEl && scriptEl.textContent) {
        const parsed = JSON.parse(scriptEl.textContent);
        if (parsed && parsed.ast) {
          log('Successfully extracted AST and CSS from live website!');
          return { ast: parsed.ast, css: parsed.css || '' };
        }
      }
    } catch (parseErr) {
      console.warn('DOMParser failed, trying regex extraction...', parseErr);
    }
    
    // Regex fallback
    const match = htmlText.match(/<script\s+id="folient-ast-data"\s+type="application\/json">([\s\S]*?)<\/script>/);
    if (match && match[1]) {
      const parsed = JSON.parse(match[1]);
      if (parsed && parsed.ast) {
        log('Successfully extracted AST and CSS from live website via regex!');
        return { ast: parsed.ast, css: parsed.css || '' };
      }
    }
    
    throw new Error('No valid Folient AST block found in the target website.');
  };

  const generatePackagedHtml = () => {
    const activeAst = useEditorStore.getState().ast;
    const activeCss = useEditorStore.getState().projectCss;
    const html = compileAstToHtml();
    
    const safeAstData = JSON.stringify({ ast: activeAst, css: activeCss }).replace(/</g, '\\u003c');
    const embeddedScript = `<script id="folient-ast-data" type="application/json">${safeAstData}</script>`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${projectName} — Built with Folient Visual Builder">
  <title>${projectName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: { sans: ['Inter', 'sans-serif'] }
        }
      }
    }
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    ${activeCss || ''}
  </style>
  ${embeddedScript}
</head>
<body>
  ${html}
</body>
</html>`;
  };

  return {
    deploying,
    deployLogs,
    validateNetlifySubdomain,
    validateVercelSubdomain,
    deployToNetlify,
    deployToVercel,
    extractAstFromLiveUrl,
    generatePackagedHtml
  };
}
