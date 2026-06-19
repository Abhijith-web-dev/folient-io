# Folient — Project Abstraction

This document provides a detailed text-based system abstraction and architectural overview of **Folient**, an open-source, client-side, AI-powered portfolio builder. It serves as a description of the project's design philosophy, data flows, and technical processes.

---

## 1. Executive Summary & Core Design Philosophy

Folient is a modern, open-source portfolio builder designed specifically for developers, designers, and creatives. It operates entirely on a client-side paradigm, meaning all operations—from AI-driven page generation to data encryption and hosting deployments—are executed directly within the user's web browser. 

By eliminating the need for a dedicated middle-tier application server, Folient guarantees maximum privacy, cost-efficiency, and user control. Users supply their own API keys for artificial intelligence (such as Google Gemini, Groq, or OpenRouter) and cloud services, ensuring that their credentials, content, and personal configurations remain strictly in their possession.

---

## 2. Core Architecture & Storage Layers

The system relies on a local-first storage design coupled with real-time cloud synchronization to provide zero-latency local operations and robust data backups.

### 2.1 Local-First Database
Every user project, layout draft, raw HTML section, and custom configuration is saved locally using IndexedDB. This client-side database serves as the primary data store, allowing instant loading, creation, editing, and preview rendering without any network delays or dependencies.

### 2.2 User Sessions & Public Identity
Authentication is handled client-side using external credentials, mapping each user to a unique session profile. Profile metadata, active daily streaks, and public showcase parameters are stored in a real-time cloud database, allowing users to showcase their work in public directories and interact with other community members.

### 2.3 Double-Tiered Cloud Synchronization
Whenever a project is modified or saved locally in the browser, a synchronization background service performs two concurrent actions:
- First, it syncs light project metadata (such as project names, creation timestamps, and deployment details) to a real-time cloud database table for rapid retrieval.
- Second, it packages the complete layout schema, structural details, and styling properties into a comprehensive configuration backup file, which is uploaded directly to a secure, private bucket in a cloud storage vault.

---

## 3. Dynamic Security & Encryption

To store external API keys for hosting providers, databases, and AI models in the cloud database without exposing them to database administrators or third parties, Folient implements a robust client-side encryption framework:
- On session initialization, the browser derives a strong cryptographic key using a password-based key derivation function (utilizing SHA-256 and a user-specific unique identifier salt).
- Plaintext API keys and access tokens are encrypted locally in the browser using the Advanced Encryption Standard in Galois/Counter Mode (AES-GCM).
- Decrypted keys are strictly retained in transient, in-memory JavaScript variables during active sessions and are completely purged from the client's cache upon logging out.

---

## 4. AI Orchestration & Section Isolation

The AI compilation layer translates natural language prompts into responsive layouts. Rather than generating an entire webpage from scratch on every change—which is computationally expensive and prone to syntax errors—Folient uses a surgical section isolation technique:
- The editor parses the target page layout into separate, isolated HTML segments.
- When a user requests an edit to a specific component, the prompt is enriched with strict bounding constraints, directing the selected AI model (Gemini, Groq, or OpenRouter) to only return modified code for that isolated section.
- The browser patches the local layout dynamically, updating only the modified segment inside the editor's sandboxed canvas.

---

## 5. Automated Edge Deployment

Folient contains an integrated deployment engine that compiles and publishes user portfolios directly to global edge networks:
- For Netlify, the application bundles the compiled HTML, style sheets, and scripts into a zip archive completely in-memory, uploading it directly via API endpoints.
- For Vercel, it translates the directory structures into a deployment payload, triggers the Vercel REST deployment endpoint, and polls the deployment state until compilation is complete.
- Once successfully deployed, hosting target project identifiers and live URLs are synced back to the user's project profile.

---

## 6. Daily Engagement Streak Model

To encourage daily contributions and building, Folient runs an automated streak tracking model. Upon accessing the workspace, the system compares the user's last active date against the current date:
- If the user was active on the preceding day, the streak increments by one.
- If the user is active on the current day, the streak count is preserved.
- If a gap of more than one day is detected, the streak count resets to one.
The updated active status and date are immediately saved to the user's profile and displayed as a metric overview on the main dashboard.

---

## 7. Global Visual System & Design Aesthetics

The user interface is modeled after clean, high-contrast financial dashboards and modern SaaS platforms.
- **Aesthetic Tone**: Clean, spacious, and professional. It avoids visual clutter, heavy gradients, neon colors, and excessive shadows.
- **Colors**: The layout relies on a light-gray page background paired with white rounded containers. Accent items utilize solid primary black and emerald green details for success indicators.
- **Typography**: The primary typeface is Inter, chosen for readability across dashboard analytics, code editors, and portfolio structures.
- **Semantic Structure**: Outermost page containers are wrapped in semantic landmarks like `<main>` tags, and all pages feature optimized SEO metadata.
