# Folient — System Design Documentation

This document outlines the system design specifications, security guidelines, platform requirements, and cloud architectural patterns for the **Folient** portfolio building system.

---

## 3. SYSTEM DESIGN

### 3.1. GUIDELINES FOR PRIVACY AND SECURITY IN CLOUD
Folient operates on a **Zero-Backend (Client-First)** security model. To protect developer data and credentials, the following guidelines are enforced:
- **Zero Raw Data Stored on Intermediate Servers**: The platform does not host middleware servers to process request data. AI prompts, compiled HTML layouts, and hosting API keys are managed directly within the user's sandboxed browser context.
- **Client-Side Encryption (BYOK)**: User access tokens and keys are encrypted client-side using native browser cryptography before being stored in the cloud. Raw plaintext credentials never touch the wire unencrypted.
- **Iframe Isolation (Sandbox)**: Rendered portfolios and generated code previews run inside an isolated `<iframe>` environment with restricted permissions to prevent Cross-Site Scripting (XSS) and DOM injection attacks.

---

### 3.2. SOFTWARE REQUIREMENTS
To build, test, compile, and run the Folient application, the following software environment is required:
- **Runtime Environment**: Node.js (v18.0.0 or higher)
- **Development Tooling & Bundler**: Vite (v8.0.0+) / Rolldown
- **Programming Languages**: TypeScript (v5.0+), HTML5, CSS3 / TailwindCSS (v4.0)
- **Database Wrapper**: Dexie.js (v4.0+) for local IndexedDB management
- **Cloud SDKs**: Google Firebase Web SDK (v10+), Supabase JS Client (v2+)
- **Animation Framework**: GreenSock Animation Platform (GSAP v3+)

---

### 3.3. HARDWARE REQUIREMENTS
Since compilation, encryption, and local storage operations are executed client-side, the hardware requirements are client-centric:

#### Client-Side (Developer Workspace)
- **Processor**: Dual-Core 2.0 GHz CPU or higher (quad-core recommended for smooth IDE rendering)
- **Memory (RAM)**: Minimum 4 GB RAM (8 GB recommended for loading heavy Monaco Editor instances and large bundles)
- **Storage**: 500 MB free space (for browser local cache and IndexedDB storage)
- **Network**: Broadband internet connection for real-time AI API queries and deployment push requests

#### Target Hosting Environment (Edge Servers)
- **Distribution Nodes**: CDN edge environments (Netlify Edge, Vercel Serverless Functions) with global caching configurations.

---

### 3.4. SECURE PERSONAL PORTFOLIOS AND CREDENTIALS (PPCs) IN CLOUD AND ITS IMPORTANCE
In modern web development, personal portfolios and developer credentials function as a developer's digital identity. Securing these files and API keys in the cloud is critical:
- **API Key Theft Prevention**: Developers routinely configure high-limit access keys for Google Gemini or Netlify. Storing these in plaintext in public databases is a massive risk. Folient mitigates this by applying local cryptographic encryption before syncing.
- **Data Integrity**: Portfolios showcase professional work. Storing backups of complete project configurations as secure JSON structures in Supabase guarantees that work can be restored instantly if local browser cache is cleared.
- **Zero-Trust Collaboration**: When users share assets in the Community Feed, Firestore rules validate that only the authenticated creator has write and delete permissions for their posts and comments.

---

### 3.5. OBJECT-ORIENTED PROGRAMMING CONCEPTS
While built on React (which favors functional components and hooks), Folient implements Object-Oriented Programming (OOP) paradigms for system operations:
- **Encapsulation**: State managers (Zustand stores like `useProjectStore` and `useAuthStore`) encapsulate local variables and expose specific getter/setter methods, protecting project models from direct, external modification.
- **Adapter Pattern (Polymorphism)**: The AI Orchestrator layer defines a unified interface for code generation. Specific model adapters (Gemini, Groq, OpenRouter) implement this interface, allowing the editor to swap AI backends polymorphically without changing the frontend logic.
- **Data Modeling**: Project records and page sections are treated as objects with strict schemas enforced by the Dexie IndexedDB system.

---

### 3.6. LOGGING FRAMEWORK
Folient implements a dual-layer logging system:
- **Client-Side Telemetry Log**: Monitors model queries, response latency, token consumption, and estimated monetary cost. These logs are saved to IndexedDB and rendered on the Dashboard System Overview chart.
- **Build Console Logging**: The Editor canvas captures build warnings, styles processing events, and compilation milestones, displaying them inside a Monaco-rendered logs console.

#### 3.6.1. ELEMENTS OF PERSONAL PORTFOLIO RECORDS (PPRs) CLOUD
A Personal Portfolio Record (PPR) in the cloud contains three primary elements:
1. **Metadata Document (Firestore)**: Tracks index markers (creation time, modification time, project name, deployment IDs, and target platform).
2. **Structural Content File (Supabase Storage JSON)**: Contains the full Page AST, CSS variables, and layout sections.
3. **Encrypted Key Record (Firestore)**: Houses the encrypted API connector configurations required to deploy and maintain the project.

---

### 3.7. KEY MANAGEMENT IN THE CLOUD
Credential security is established using the browser's native **Web Crypto API**:
- **Derivation Function**: The PBKDF2 algorithm is run on the authenticated Firebase User ID with a salt value unique to the account.
- **Encryption Algorithm**: The derived key encrypts plain text API inputs using 128-bit AES-GCM.
- **Initialization Vector**: A unique initialization vector (IV) is generated for every credential write operation and stored alongside the ciphertext. Decryption is performed entirely in memory.

---

### 3.8. TYPES OF CLOUD
Folient integrates with three primary cloud models:
- **Public Cloud (Firebase/Supabase Backend)**: Serves as the central serverless database and auth provider, managing global community structures, profiles, and asset storage.
- **Private Cloud (BYOK Storage)**: Individual developer buckets configured by the user inside their personal Supabase instances.
- **Distributed Edge CDN Cloud (Vercel & Netlify)**: Target deployment networks that host the static compiled HTML portfolios globally.

---

### 3.9. SERVICE MODELS FOR CLOUD COMPUTING
The platform leverages all three primary service models:
- **Software as a Service (SaaS)**: Folient is accessed via a web browser as an end-user application to configure and publish pages.
- **Platform as a Service (PaaS)**: Portfolios are deployed directly onto Netlify or Vercel platforms, which handle hosting, global CDNs, SSL certificates, and custom domains automatically.
- **Infrastructure as a Service (IaaS)**: Storage assets and backups utilize virtualized cloud storage nodes managed by Supabase.

---

### 3.10. SUMMARY
By utilizing a client-side architecture, Folient provides developers with a highly secure environment to compile, store, and deploy portfolios. Encrypted key management, IndexedDB storage, and edge server integration create a robust system design that prioritizes privacy and performance.
