# Folient Builder

Folient Builder is a premium, AI-assisted visual web layout and web application builder designed for modern developers. It combines the ease of drag-and-drop visual design with the power of a pro-grade code editing workspace, secure file vaults, real-time collaboration, and automated cloud deployments.

---

## 🚀 Key Features

### 🎨 1. Premium Visual Canvas & Layouts
* **Fluid Layout Editing**: Live layout editing with a weightless, spatial design style.
* **Modern Design Tokens**: Configured with a tailwind-powered glassmorphism design system, supportingHarmonious color palettes and responsive layouts.
* **Bento Grid & Bento Cards**: Interactive dashboard systems styled for readability.

### 💻 2. Integrated Code Workspace
* **Monaco Editor Panel**: Write, inspect, and adjust component configurations with an embedded, full-featured Monaco Code Editor.
* **Bi-directional Sync**: Changes in the visual canvas instantly propagate to the code view, and vice versa.

### 🔒 3. Supabase Asset Vault & Media Library
* **Secure Storage Hub**: Upload and store files directly inside Supabase buckets.
* **Multiformat Preview Lightbox**: Support for inline previews of image formats (PNG, JPG, SVG), videos (MP4), audio (MP3/WAV with custom visualizer), and document formats (PDFs, text files).
* **Local Saves**: Easily clone assets from other users directly into your local database.

### 👥 4. Real-time Community Collaboration Hub
* **Social Feed & Templates Showcase**: Share your layout configurations, custom prompt scripts, and design components.
* **Bubble-Chat Replies & Deletion Rules**: A conversational speech-bubble reply drawer portalled directly to the DOM body (`z-[100]`) to prevent layout boundary clipping.
  * *Commenters* can delete their own replies.
  * *Post Creators* can delete any comment on their post to keep their feed clean.
* **Top Contributors Leaderboard**: Real-time scoring and ranking based on aggregate posts, templates, and shared assets.
* **Creator Profile Cards**: Clicking on any developer displays their full portfolio, biographic details, and dynamically increments profile visits.
* **Relative Timestamps**: All posts and replies render dynamically calculated relative times (e.g. `"2m ago"`, `"3h ago"`) using stored epoch timestamps.

### ⚙️ 5. AI & Cloud Deployer Status Panel
* **Live System Overview Grid**: Displays connection status (Active/Offline) for your integrated AI engines and cloud deployers, including:
  * **Google Gemini API** & **Groq AI Engine** (for intelligent layout generation)
  * **OpenRouter API** (for broad model routing)
  * **Supabase Storage Vault** (for asset databases)
  * **Vercel Deployer** & **Netlify Deployer** (for single-click publishing)

---

## 🛠️ Technology Stack

* **Frontend Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build Tool**: [Vite 8](https://vite.dev/)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
* **State Management**: [Zustand 5](https://github.com/pmndrs/zustand)
* **Databases & Backends**:
  * [Firebase v12](https://firebase.google.com/) (Real-time Community subscriptions, social feed, comments, and profile tracking)
  * [Supabase](https://supabase.com/) (Cloud file storage and vault asset management)
  * [Dexie.js / IndexedDB](https://dexie.org/) (Offline local caching of canvas project files)
* **Animations**: [GSAP](https://gsap.com/) (Tab transitions & floaters) & [Lenis](https://lenis.darkroom.engineering/) (Smooth scrolling)
* **Analytics Charts**: [Recharts](https://recharts.org/)

---

## 📦 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18 or higher recommended) and `npm` installed.

### 2. Installation
Clone this repository to your local directory and install the dependencies:
```bash
npm install
```

### 3. Environment Setup
Copy the sample environment file to create your own configuration:
```bash
cp .env.example .env
```
Open the `.env` file and populate it with your API keys and credentials:
* **Firebase configuration** (API Key, Auth Domain, Project ID, Storage Bucket, Messaging Sender ID, App ID)
* **Supabase configuration** (Project URL, Anon Key)
* **Third-party integrations** (Vercel Client ID, Netlify Client ID, Gemini/Groq keys)

### 4. Running Locally
Launch the development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 5. Production Build
To build and compile the production bundle:
```bash
npm run build
```
You can preview the production bundle locally with:
```bash
npm run preview
```

---

## 📄 License
This project is private and proprietary.
