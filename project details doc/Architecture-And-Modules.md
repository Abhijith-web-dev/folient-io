# Folient — Architecture Diagram and Main Modules

This document outlines the detailed system structure, system interactions, and core service modules of the **Folient** portfolio compilation framework.

---

## 4. ARCHITECTURE DIAGRAM AND MAIN MODULES

### 4.1. ARCHITECTURE OVERVIEW
The system utilizes a serverless, local-first topology where all main engines run directly inside the user's browser, communicating with cloud databases, file vaults, AI orchestrators, and deploy pipelines.

```
+-----------------------------------------------------------------------+
|                             USER BROWSER                              |
|                                                                       |
|  [ 4.3.1. Auth Module ]   [ 4.3.2. Security Module ]                  |
|     - Firebase SDK           - Iframe Sandbox                         |
|     - Google OAuth           - HTML Sanitizer                         |
|                                                                       |
|  [ 4.3.3. Encryption ]    [ 4.3.4. Multi-Authority ]                  |
|     - PBKDF2 Key Deriv       - AI Orchestration (Gemini/Groq)         |
|     - AES-GCM 128-bit        - Deploy Engine (Netlify/Vercel)         |
|                                                                       |
|  +--------------------+   +----------------------------------------+  |
|  | Zustand Store      |   | Local IndexedDB (Dexie)                |  |
|  +--------------------+   +----------------------------------------+  |
+-------------------┬───────────────────────────┬-----------------------+
                    │                           │
                    ▼                           ▼
          [ Firestore & Auth ]         [ Supabase Backup Vault ]
          - User Profile Sync          - File Storage JSONs
          - Encrypted Credentials      - Shared Media Assets
```

---

### 4.2. MAIN SYSTEM SEQUENCE
1. **Authentication**: The user logs in via the Social Authentication Module (Google SSO or Firebase Email Auth).
2. **Session Mount & Decryption**: Key derivation parameters are retrieved to enable the Security & Encryption Modules.
3. **Local Compilation**: The UI interacts with IndexedDB (Dexie) to fetch projects. The user uses the Multi-Authority module to run AI generation or surgical edits.
4. **Cloud Sync**: Structural components are synced to Firestore (meta) and Supabase Storage (full layout JSONs).
5. **Deployment**: Compiled code is zipped and pushed to Netlify/Vercel edge hosting.

---

### 4.3. SERVICE MODULE SPECIFICATIONS

#### 4.3.1. REGISTRATION-BASED SOCIAL AUTHENTICATION MODULE
The authentication engine is built on the **Google Firebase Authentication SDK**, implementing a registration-based secure access portal:
- **Provider Integrations**: Handles Google Workspace OAuth credentials alongside standard password-based sign-up flows.
- **Session Protection**: Encapsulates login tokens and user metrics. When a user authenticates, a real-time listener initializes their profile state.
- **Access Guarding**: Protects editor workspaces, database sync routines, and private storage assets from unauthenticated sessions.

#### 4.3.2. SECURITY MODULE
The Security Module prevents Cross-Site Scripting (XSS) and code injection vulnerabilities within the client compilation environment:
- **Iframe Sandboxing**: Renders compiled HTML outputs inside a sandboxed `<iframe>` wrapper with `sandbox="allow-scripts allow-same-origin"` parameters, preventing code from escaping the canvas.
- **HTML Sanitization**: Scrubs unsafe external references, whitelisting only designated styles, libraries (e.g. Tailwind runtime), and icons (e.g. Google Material Symbols).
- **Transient Memory Isolation**: Retains credential properties in-memory only, immediately clearing sensitive values on logout.

#### 4.3.3. CLIENT-SIDE CREDENTIALS ENCRYPTION MODULE
To secure external developer API keys in the cloud, Folient implements a client-side encryption framework using the native **Web Crypto API**:
- **PBKDF2 Key Derivation**: Generates a cryptographic key using 100,000 iterations of SHA-256 using the authenticated Firebase User ID as the seed.
- **AES-GCM 128-bit Encryption**: Ciphertext is generated client-side with a unique Initialization Vector (IV).
- **Secure Cloud Sync**: Cyphertexts are written to the cloud database. No raw or decrypted API key is ever uploaded or handled by intermediate systems.

#### 4.3.4. MULTI-AUTHORITY AI AND DEPLOY MODULE
The Multi-Authority module governs integrations with external third-party API providers:
- **Multi-Model AI Orchestrator**: Adapts prompt variables and code generation targets dynamically to Google Gemini, Groq, or OpenRouter APIs.
- **Multi-Hosting Deploy Engine**: Integrates Netlify and Vercel REST APIs, creating in-memory ZIP files for Netlify and deploying structured file-tree JSON payloads directly to Vercel.
- **Storage Authority (Supabase Integration)**: Coordinates metadata synchronization with Firestore and packages full project backups into JSON objects for Supabase Storage vaults.
