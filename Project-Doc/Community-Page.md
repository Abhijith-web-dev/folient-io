# Folient — Community Page Specification

This document defines the functional requirements, user interface design, visual styling guidelines, and interactions for the **Folient Community Page**.

For the general architecture plan, refer to [Project-Data.md](file:///c:/Project/project%20backup/folient-builder/Project-Data.md).

---

## 1. Page Metadata
- **Route Path:** `/community` (Public Root / Authenticated Write Actions)
- **Title Tag:** `Folient — Community Hub`
- **Meta Description:** `Explore public portfolios built with Folient, share custom HTML templates, download community assets, and participate in web design discussions.`
- **SEO Elements:** OpenGraph tags for social sharing, dynamic metadata compilation, and indexing guidelines.

---

## 2. Visual Style & Design System
- **Theme:** Default Light Mode with dark mode overrides.
- **Glassmorphism Panels:**
  - Card surfaces use `.glass-panel` styling: `background: rgba(255, 255, 255, 0.7)`, `backdrop-filter: blur(12px)`, and a subtle semi-transparent white border.
- **Card Hover Animations:**
  - Standard cards use smooth transitions: `transform translateY(-4px)` with soft shadows (`box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.05)`) over 200ms duration.
- **Scrollbar Styling:** Minimal vertical scrollbars (`width: 8px`) with rounded, low-opacity gray thumbs changing color to Primary on hover.

---

## 3. Sections & Layout Details

The Community page features a sticky top navbar, a landing hero header, and a split content section (main tab frame on the left, trending panels on the right):

### 3.1 Top Navbar (Shared Component)
- Displays "Folient" brand logo.
- Left-aligned navigation links: Explore, Community (Active tab with thick border underline), Resources.
- **Local Context Search:**
  - Rounded search input with a search icon prefix. Filters directory records in real time.
- **Navbar Controls:** Contains Notifications bell, Settings toggle, "Create New" quick editor launcher, and user profile avatar.

### 3.2 Hero Header & Contributor Showcase
- **Headline Title:** "Built by the Community" (renders in `text-display-xl` font size).
- **Sub-heading:** Teaser copy outlining template, asset, and design sharing.
- **Statistics Counter Badges:**
  - Floating card badges displaying real-time metrics synced from Firebase metadata:
    - **Portfolios count:** e.g. 12k+ items.
    - **Templates count:** e.g. 8.5k items.
    - **Assets count:** e.g. 45k items.
    - **Discussions count:** e.g. 2.1k items.
- **Organic Contributors Mosaic:**
  - Right-aligned grid displaying overlapping circular avatar profiles of top contributors. Hovering avatars displays active ranking badges (e.g. "Top", "Trending").

### 3.3 Sub-Navigation Tabs
- Sticky tab bar anchored below the hero section.
- Tabs display icon prefixes, labels, and count indicator badges:
  - **Portfolios:** Default active view.
  - **Templates:** Community layouts view.
  - **Assets:** Vector media and resources view.
  - **Discussions:** Threaded support forum view.

### 3.4 Main Content Area (Portfolios Directory)
- **Search & Categories Bar:**
  - Fuzzy-search input filtering current tab records.
  - Scrollable category buttons (`All`, `SaaS`, `E-Commerce`, etc.) with configuration drawer triggers.
- **Asymmetrical Portfolios Grid:**
  - Responsive masonry grid displaying portfolio cards.
  - Hovering a portfolio card reveals a dark mask layer with action triggers: "Visit Site" (opens URL in a new window) and "Use as Inspiration" (launches the workspace editor pre-loaded with a style inspiration prompt).
  - Floating heart icon triggers "Like" actions (stored in Firestore, limited to one per authenticated user).
  - **Load More Button:** Bottom grid action initiating database query offsets with active spinning loaders.

### 3.5 Right-Hand Utility Sidebar
- **Join Collective Banner (Unauthenticated State):**
  - Prompt container displaying "Create Free Account" and "Sign In" anchors to capture traffic.
- **Trending Panel:**
  - Rank list showing the top 3 trending community items with thumbnails, authors, and trend growth vectors.
- **Leaderboard Board:**
  - Ranking list of the top 3 community contributors displaying display avatars, user handles, item creations total, and rank badges.

### 3.6 Custom Sub-Tab Workflows

#### 3.6.1 Templates Tab
- Shows community-contributed layouts.
- **Submit Template Dialog:** Authenticated action displaying a modal form: Name, Category, Tags list, Live URL, and a multi-line HTML code paste field. Submitting writes a document to `community/templates` collection.

#### 3.6.2 Assets Tab
- Displays SVG icons, isometric illustrations, and visual layout assets.
- **Add to Vault Action:** Authenticated trigger copying the target file URL as a reference document directly inside the user's personal Supabase Media database.
- **Community Upload:** Opens a local file picker. Restricts uploads to SVG/PNG images (< 5MB) and routes files to the shared, moderated Folient project Supabase storage bucket.

#### 3.6.3 Discussions Tab
- Threaded message boards categorized under: Help & Support, Show & Tell, Feature Requests, Template Feedback, General.
- Thread list displays Author, Title, Markdown Body summary, timestamp, Likes, and Reply counts.
- **New Thread Composer:** Simple markdown text editor with a live preview mode tab.
- **Moderation Reporting:** Flag button on each card posting reference details directly to a Firestore moderation queue reviewable by community administrators.
