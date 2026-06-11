import JSZip from 'jszip';

interface NetlifyDeployResponse {
  url: string;
  deployUrl: string;
  siteName: string;
}

/**
 * Deploys the portfolio HTML content directly to Netlify as a single-page app.
 */
export async function deployToNetlify(
  htmlContent: string,
  projectName: string,
  accessToken: string
): Promise<NetlifyDeployResponse> {
  const normalizedName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .substring(0, 63);

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };

  try {
    // 1. Check if the site already exists under this account
    let siteId = '';
    let siteUrl = '';
    let siteName = normalizedName;

    interface NetlifySite {
      id: string;
      name: string;
      url: string;
      ssl_url?: string;
    }

    const listRes = await fetch('https://api.netlify.com/api/v1/sites', { headers });
    if (listRes.ok) {
      const sites = await listRes.json() as NetlifySite[];
      const existing = sites.find((s) => s.name === normalizedName);
      if (existing) {
        siteId = existing.id;
        siteUrl = existing.ssl_url || existing.url;
        siteName = existing.name;
      }
    }

    // 2. If it does not exist, create it
    if (!siteId) {
      const createRes = await fetch('https://api.netlify.com/api/v1/sites', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: normalizedName,
          custom_domain: ''
        })
      });

      if (!createRes.ok) {
        // Fallback to random name site creation if requested name is taken
        const fallbackRes = await fetch('https://api.netlify.com/api/v1/sites', {
          method: 'POST',
          headers,
          body: JSON.stringify({})
        });
        if (!fallbackRes.ok) {
          throw new Error('Failed to create site instance on Netlify.');
        }
        const fallbackSite = await fallbackRes.json();
        siteId = fallbackSite.id;
        siteUrl = fallbackSite.ssl_url || fallbackSite.url;
        siteName = fallbackSite.name;
      } else {
        const site = await createRes.json();
        siteId = site.id;
        siteUrl = site.ssl_url || site.url;
        siteName = site.name;
      }
    }

    // 3. Package the HTML inside a zip archive in-memory using JSZip
    const zip = new JSZip();
    zip.file('index.html', htmlContent);
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // 4. Post the zip archive binary to Netlify deploy endpoint
    const deployHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/zip'
    };

    const deployRes = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
      method: 'POST',
      headers: deployHeaders,
      body: zipBlob
    });

    if (!deployRes.ok) {
      const errText = await deployRes.text();
      throw new Error(`Deployment payload post failed: ${errText}`);
    }

    const deployData = await deployRes.json();
    return {
      url: siteUrl,
      deployUrl: deployData.ssl_url || deployData.url || siteUrl,
      siteName
    };
  } catch (error: unknown) {
    console.error('Netlify deploy error:', error);
    throw error;
  }
}

interface VercelDeployResponse {
  url: string;
  deployUrl: string;
  siteName: string;
}

/**
 * Deploys the portfolio HTML content directly to Vercel.
 */
export async function deployToVercel(
  htmlContent: string,
  projectName: string,
  accessToken: string
): Promise<VercelDeployResponse> {
  const normalizedName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .substring(0, 63);

  try {
    const res = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: normalizedName,
        files: [
          {
            file: 'index.html',
            data: htmlContent
          }
        ],
        projectSettings: {
          framework: null
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Vercel deployment failed: ${errText}`);
    }

    const data = await res.json();
    const liveUrl = `https://${data.url}`;
    
    return {
      url: liveUrl,
      deployUrl: liveUrl,
      siteName: normalizedName
    };
  } catch (error: unknown) {
    console.error('Vercel deploy error:', error);
    throw error;
  }
}

