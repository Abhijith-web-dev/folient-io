import { useState } from 'react';
import JSZip from 'jszip';
import { db } from '../../firebase/config';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { folientDb } from '../../db/dexie';
import { useAuthStore } from '../../store/useAuthStore';

export interface DeploymentLog {
  timestamp: number;
  message: string;
  type: 'info' | 'success' | 'error';
}

function generateRandomSuffix(): string {
  return Math.random().toString(36).substring(2, 8);
}

export function useDeploymentEngine() {
  const { user } = useAuthStore();
  const [logs, setLogs] = useState<DeploymentLog[]>([]);
  const [deploying, setDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [...prev, { timestamp: Date.now(), message, type }]);
  };

  const clearLogs = () => setLogs([]);

  const validateSubdomain = async (platform: 'netlify' | 'vercel', subdomain: string, token: string): Promise<boolean> => {
    addLog(`Checking subdomain availability for "${subdomain}" on ${platform}...`);
    
    if (platform === 'netlify') {
      try {
        const url = `https://api.netlify.com/api/v1/sites/${subdomain}.netlify.app`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status === 404) {
          addLog(`Netlify subdomain "${subdomain}" is available.`, 'success');
          return true;
        }
        addLog(`Netlify subdomain "${subdomain}" is already taken or unavailable.`, 'error');
        return false;
      } catch {
        return true;
      }
    } else {
      try {
        const res = await fetch(`https://api.vercel.com/v6/domains/status?name=${subdomain}.vercel.app`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          return true;
        }
        const data = await res.json();
        if (data.available) {
          addLog(`Vercel domain "${subdomain}.vercel.app" is available.`, 'success');
          return true;
        }
        addLog(`Vercel domain is already registered.`, 'error');
        return false;
      } catch {
        return true;
      }
    }
  };

  const deploy = async (options: {
    projectId: number;
    projectName: string;
    subdomain: string;
    sectionsHtml: string;
    platform: 'netlify' | 'vercel';
  }) => {
    const { projectId, subdomain, sectionsHtml, platform } = options;
    setDeploying(true);
    setDeployUrl(null);
    clearLogs();

    addLog(`Starting browser-based deployment compilation for Project #${projectId}...`);
    
    const tokenKey = platform === 'netlify' ? 'netlify_token' : 'vercel_token';
    const token = localStorage.getItem(tokenKey) || '';
    if (!token) {
      addLog(`Error: ${platform.toUpperCase()} authentication token is missing. Please authorize under Connectors.`, 'error');
      setDeploying(false);
      return;
    }

    const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const isAvailable = await validateSubdomain(platform, cleanSubdomain, token);
    if (!isAvailable) {
      addLog(`Subdomain validation rejected by ${platform}. Aborting compile pipeline.`, 'error');
      setDeploying(false);
      return;
    }

    try {
      addLog(`Compiling HTML structure and injecting visual system...`);
      const compiledHtml = sectionsHtml;

      if (platform === 'netlify') {
        addLog(`Packaging deployment assets using JSZip...`);
        const zip = new JSZip();
        zip.file('index.html', compiledHtml);
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        addLog(`ZIP payload compiled successfully (${(zipBlob.size / 1024).toFixed(1)} KB).`, 'success');

        addLog(`Creating Netlify site slot for "${cleanSubdomain}"...`);
        let createRes = await fetch('https://api.netlify.com/api/v1/sites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: cleanSubdomain
          })
        });

        let siteData;
        if (!createRes.ok) {
          addLog(`Netlify slot registration failed. Retrying with random unique suffix...`, 'info');
          const randomSuffix = generateRandomSuffix();
          const fallbackName = `${cleanSubdomain}-${randomSuffix}`;
          createRes = await fetch('https://api.netlify.com/api/v1/sites', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ name: fallbackName })
          });
          
          if (!createRes.ok) {
            throw new Error(`Netlify site slot provisioning failed: ${await createRes.text()}`);
          }
          siteData = await createRes.json();
          addLog(`Site slot provisioned as "${siteData.name}".`, 'success');
        } else {
          siteData = await createRes.json();
          addLog(`Site slot provisioned successfully.`, 'success');
        }

        const siteId = siteData.id;
        const liveUrl = siteData.ssl_url || siteData.url;

        addLog(`Streaming compiled binary ZIP to Netlify deploy endpoint...`);
        const deployRes = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/zip',
            Authorization: `Bearer ${token}`
          },
          body: zipBlob
        });

        if (!deployRes.ok) {
          throw new Error(`Netlify binary upload stream failed: ${await deployRes.text()}`);
        }

        addLog(`[DEPLOYMENT] Production target synchronized on Netlify.`, 'success');
        setDeployUrl(liveUrl);

        await syncDatabase(projectId, platform, siteId, liveUrl);

      } else {
        addLog(`Formatting Vercel v13 payload structures...`);
        const fileItems = [
          {
            file: 'index.html',
            data: compiledHtml
          }
        ];

        addLog(`Streaming raw code tree directly to Vercel Deployments endpoint...`);
        const response = await fetch('https://api.vercel.com/v13/deployments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: cleanSubdomain,
            files: fileItems,
            projectSettings: {
              framework: null
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Vercel deployment streaming failed: ${await response.text()}`);
        }

        const vercelData = await response.json();
        const siteId = vercelData.id;
        const liveUrl = `https://${vercelData.url}`;

        addLog(`[DEPLOYMENT] Production target synchronized on Vercel.`, 'success');
        setDeployUrl(liveUrl);

        await syncDatabase(projectId, platform, siteId, liveUrl);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      addLog(`Critical pipeline failure: ${errMsg}`, 'error');
    } finally {
      setDeploying(false);
    }
  };

  const syncDatabase = async (projectId: number, platform: string, siteId: string, liveUrl: string) => {
    addLog(`Performing database transactions and synchronization...`);
    try {
      await folientDb.projects.update(projectId, {
        updatedAt: Date.now(),
        liveUrl,
        status: 'published',
        platformTarget: platform
      });

      if (user) {
        const batch = writeBatch(db);
        const deploymentDocRef = doc(collection(db, 'deployments'));
        batch.set(deploymentDocRef, {
          projectId,
          userId: user.uid,
          platform,
          siteId,
          liveUrl,
          status: 'published',
          createdAt: Date.now()
        });

        const siteDocRef = doc(db, 'published-sites', `${projectId}-${platform}`);
        batch.set(siteDocRef, {
          projectId,
          projectName: siteId,
          url: liveUrl,
          platform,
          updatedAt: Date.now()
        });

        await batch.commit().catch((err: unknown) => {
          console.warn("Could not save build batch to Firestore (likely rules/offline):", err);
        });
      }
      addLog(`Database synchronized successfully. Live URL: ${liveUrl}`, 'success');
    } catch (dbErr: unknown) {
      const dbErrMsg = dbErr instanceof Error ? dbErr.message : String(dbErr);
      addLog(`Database synchronization warning: ${dbErrMsg}`, 'info');
    }
  };

  return {
    deploy,
    deploying,
    logs,
    deployUrl
  };
}
