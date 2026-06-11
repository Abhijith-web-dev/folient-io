export function useCloudAuth() {
  const loginNetlify = () => {
    const clientId = import.meta.env.VITE_NETLIFY_CLIENT_ID || 'placeholder_client_id';
    const redirectUri = `${window.location.origin}/auth/callback`;
    const activeProject = new URLSearchParams(window.location.search).get('projectId') || '';
    
    // Package token state + optional projectId redirect parameters inside state to avoid mismatch
    const statePayload = {
      csrf: Math.random().toString(36).substring(2, 15),
      projectId: activeProject
    };
    const stateString = btoa(JSON.stringify(statePayload));
    localStorage.setItem('oauth_state_netlify_payload', JSON.stringify(statePayload));
    
    const url = `https://app.netlify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&state=${stateString}`;
    window.location.href = url;
  };

  const loginVercel = () => {
    const clientId = import.meta.env.VITE_VERCEL_CLIENT_ID || 'placeholder_client_id';
    const redirectUri = `${window.location.origin}/auth/vercel`;
    const activeProject = new URLSearchParams(window.location.search).get('projectId') || '';

    const statePayload = {
      csrf: Math.random().toString(36).substring(2, 15),
      projectId: activeProject
    };
    const stateString = btoa(JSON.stringify(statePayload));
    localStorage.setItem('oauth_state_vercel_payload', JSON.stringify(statePayload));

    const url = `https://vercel.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${stateString}&response_type=code`;
    window.location.href = url;
  };

  return {
    loginNetlify,
    loginVercel
  };
}
