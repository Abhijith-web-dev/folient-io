import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuthStore } from '../../store/useAuthStore';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export default function CloudCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const [status, setStatus] = useState<'exchanging' | 'success' | 'error'>('exchanging');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      // 1. Check for Vercel callback (auth code flow)
      const windowParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code') || windowParams.get('code');
      const stateParam = searchParams.get('state') || windowParams.get('state');
      
      // 2. Check for Netlify callback (implicit grant returns token in hash)
      const hash = window.location.hash;
      const hashParams = new URLSearchParams(hash.replace('#', '?'));
      const netlifyAccessToken = hashParams.get('access_token') || hashParams.get('token');
      const netlifyStateParam = hashParams.get('state');

      try {
        if (code && stateParam) {
          // Vercel Callback Flow
          const savedStateStr = localStorage.getItem('oauth_state_vercel_payload');
          if (!savedStateStr) {
            throw new Error('CSRF State missing in client store.');
          }
          const savedState = JSON.parse(savedStateStr);

          // Decode and parse stateParam
          let decodedState: any = {};
          try {
            decodedState = JSON.parse(atob(stateParam));
          } catch {
            throw new Error('Invalid state payload parameter format.');
          }

          if (decodedState.csrf !== savedState.csrf) {
            throw new Error('CSRF State validation failed for Vercel OAuth.');
          }

          // Swap code for access token entirely on client side using CORS gateway
          const clientId = import.meta.env.VITE_VERCEL_CLIENT_ID || '';
          const clientSecret = import.meta.env.VITE_VERCEL_CLIENT_SECRET || '';
          const redirectUri = `${window.location.origin}/auth/vercel`;

          const bodyParams = new URLSearchParams();
          bodyParams.append('code', code);
          bodyParams.append('client_id', clientId);
          bodyParams.append('client_secret', clientSecret);
          bodyParams.append('redirect_uri', redirectUri);

          // Bypass CORS using a public CORS gateway
          const targetUrl = 'https://api.vercel.com/v2/oauth/access_token';
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;

          const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: bodyParams.toString()
          });

          if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`Failed to exchange Vercel code: ${errBody}`);
          }

          const data = await response.json();
          const token = data.access_token;
          if (!token) {
            throw new Error('No access token received from Vercel.');
          }

          // Save token
          localStorage.setItem('vercel_token', token);
          if (user) {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { vercelToken: token }).catch(err => {
              console.warn("Could not save token to Firestore (likely offline rules):", err);
            });
          }
          setStatus('success');
          const returnProject = decodedState.projectId || searchParams.get('projectId') || windowParams.get('projectId');
          if (returnProject) {
            setTimeout(() => navigate(`/editor?projectId=${returnProject}`), 1500);
          } else {
            setTimeout(() => navigate('/dashboard/hosting'), 1500);
          }
        } else if (netlifyAccessToken && netlifyStateParam) {
          // Netlify Callback Flow
          const savedStateStr = localStorage.getItem('oauth_state_netlify_payload');
          if (!savedStateStr) {
            throw new Error('CSRF State missing in client store.');
          }
          const savedState = JSON.parse(savedStateStr);

          // Decode and parse stateParam
          let decodedState: any = {};
          try {
            decodedState = JSON.parse(atob(netlifyStateParam));
          } catch {
            throw new Error('Invalid state payload parameter format.');
          }

          if (decodedState.csrf !== savedState.csrf) {
            throw new Error('CSRF State validation failed for Netlify OAuth.');
          }

          // Save token
          localStorage.setItem('netlify_token', netlifyAccessToken);
          if (user) {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { netlifyToken: netlifyAccessToken }).catch(err => {
              console.warn("Could not save token to Firestore (likely offline rules):", err);
            });
          }
          setStatus('success');
          const returnProject = decodedState.projectId || searchParams.get('projectId') || hashParams.get('projectId') || windowParams.get('projectId');
          if (returnProject) {
            setTimeout(() => navigate(`/editor?projectId=${returnProject}`), 1500);
          } else {
            setTimeout(() => navigate('/dashboard/hosting'), 1500);
          }
        } else {
          throw new Error('Callback parameters missing. Code or Token not parsed.');
        }
      } catch (err: unknown) {
        console.error(err);
        setStatus('error');
        const errMsg = err instanceof Error ? err.message : 'OAuth callback processing failed.';
        setErrorMsg(errMsg);
      }
    };

    handleCallback();
  }, [searchParams, user, navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 flex flex-col items-center justify-center font-sans p-6">
      <div className="max-w-md w-full bg-[#111115] border border-slate-800 rounded-3xl p-8 flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

        {status === 'exchanging' && (
          <>
            <RefreshCw className="w-12 h-12 text-violet-500 animate-spin" />
            <div className="text-center">
              <h2 className="text-lg font-bold">Exchanging Authorization Code</h2>
              <p className="text-xs text-slate-400 mt-2">Connecting hosting provider securely to your browser thread...</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-emerald-500" />
            <div className="text-center">
              <h2 className="text-lg font-bold text-emerald-400">Connection Successful!</h2>
              <p className="text-xs text-slate-400 mt-2">Token saved securely. Redirecting to your dashboard...</p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-rose-500" />
            <div className="text-center">
              <h2 className="text-lg font-bold text-rose-400">Authentication Failed</h2>
              <p className="text-xs text-slate-400 mt-2">{errorMsg}</p>
            </div>
            <button 
              onClick={() => navigate('/dashboard/hosting')}
              className="mt-4 w-full bg-[#1e1e24] hover:bg-[#25252f] text-white rounded-xl h-10 px-5 text-xs font-semibold cursor-pointer border-none transition-all"
            >
              Back to Hosting
            </button>
          </>
        )}
      </div>
    </div>
  );
}
