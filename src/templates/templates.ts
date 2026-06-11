export interface TemplateSection {
  sectionId: string;
  html: string;
  order: number;
  isVisible: boolean;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  sections: TemplateSection[];
}

export const OFFICIAL_TEMPLATES: Template[] = [
  {
    id: 'horizon',
    name: 'Horizon',
    category: 'Minimal',
    description: 'Spacious, elegant serif design with clean borders and light background surfaces.',
    sections: [
      {
        sectionId: 'hero',
        order: 0,
        isVisible: true,
        html: `<section data-folient-section-id="hero" class="relative min-h-screen flex flex-col justify-end pb-24 px-5 md:px-20 overflow-hidden bg-[#EFEFEF]">
  <style>
    .shader-bg {
        background: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(239,239,239,0.2) 100%);
        backdrop-filter: blur(50px);
    }
    .text-roll-hover {
        position: relative;
        overflow: hidden;
        display: inline-block;
    }
    .text-roll-hover span {
        display: inline-block;
        transition: transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
    }
    .text-roll-hover::after {
        content: attr(data-text);
        position: absolute;
        top: 100%;
        left: 0;
        display: inline-block;
        transition: transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
    }
    .group:hover .text-roll-hover span { transform: translateY(-100%); }
    .group:hover .text-roll-hover::after { transform: translateY(-100%); }
    .btn-liquid {
        transition: transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1), background-color 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
    }
    .btn-liquid:hover { transform: scale(1.02); }
  </style>

  <div class="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay">
    <svg class="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"></feTurbulence>
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)"></rect>
    </svg>
  </div>

  <!-- TopNavBar (Desktop) -->
  <nav class="hidden md:flex absolute top-8 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[1440px] rounded-full h-16 z-[100] bg-white/10 dark:bg-white/5 backdrop-blur-[50px] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] shadow-sm justify-between items-center px-8">
    <a class="font-bold text-[24px] tracking-[-0.01em] text-[#1b1b1d] dark:text-[#fcf8fb]" href="#">Axion Studio</a>
    <ul class="flex items-center gap-8">
      <li><a class="text-[14px] font-semibold text-[#a63b00] dark:text-[#ffb599] hover:scale-[1.02] transition-all duration-500" href="#">Studio</a></li>
      <li><a class="text-[14px] font-semibold text-[#594138] dark:text-[#454747] hover:scale-[1.02] transition-all duration-500" href="#about">Projects</a></li>
      <li><a class="text-[14px] font-semibold text-[#594138] dark:text-[#454747] hover:scale-[1.02] transition-all duration-500" href="#projects">Journal</a></li>
      <li><a class="text-[14px] font-semibold text-[#594138] dark:text-[#454747] hover:scale-[1.02] transition-all duration-500" href="#contact">Connect</a></li>
    </ul>
    <div class="flex items-center gap-6">
      <span class="text-[14px] font-semibold text-[#594138] hidden lg:block">12:00 PM GMT</span>
      <a class="btn-liquid bg-[#f26522] text-white px-6 py-3 rounded-full text-[14px] font-semibold flex items-center gap-2 group" href="#contact">
        <span class="text-roll-hover" data-text="Book a strategy call"><span>Book a strategy call</span></span>
      </a>
    </div>
  </nav>

  <!-- Mobile Nav Trigger -->
  <button class="md:hidden absolute top-6 right-6 z-[100] w-12 h-12 bg-white/20 backdrop-blur-[50px] rounded-full border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-center text-[#1b1b1d] hover:scale-[1.02] transition-transform duration-500" onclick="const nav = document.getElementById('mobile-nav'); if (nav) nav.classList.remove('translate-y-full');">
    <span class="material-symbols-outlined">menu</span>
  </button>

  <!-- SideNavBar (Mobile) -->
  <div class="fixed inset-0 z-[110] rounded-t-3xl bg-white/5 dark:bg-white/1 backdrop-blur-[50px] border-t border-white/10 shadow-xl flex flex-col w-full h-full p-6 translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] md:hidden" id="mobile-nav">
    <div class="flex justify-between items-center mb-12">
      <div>
        <h2 class="text-[24px] font-bold text-[#1b1b1d] dark:text-[#fcf8fb]">Axion Studio</h2>
        <p class="text-[14px] font-semibold text-[#594138] mt-1">Creative Excellence</p>
      </div>
      <button class="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors" onclick="const nav = document.getElementById('mobile-nav'); if (nav) nav.classList.add('translate-y-full');">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <nav class="flex-1">
      <ul class="flex flex-col gap-4">
        <li>
          <a class="bg-[#f26522] text-[#4f1800] rounded-full px-6 py-4 flex items-center gap-4 hover:bg-white/10 transition-colors duration-500" href="#">
            <span class="material-symbols-outlined">business_center</span>
            <span class="text-[36px] font-bold tracking-[-0.02em]">Studio</span>
          </a>
        </li>
        <li>
          <a class="text-[#1b1b1d] dark:text-[#fcf8fb] flex items-center gap-4 px-6 py-4 hover:bg-white/10 transition-colors duration-500 rounded-full" href="#about" onclick="const nav = document.getElementById('mobile-nav'); if (nav) nav.classList.add('translate-y-full');">
            <span class="material-symbols-outlined">work</span>
            <span class="text-[36px] font-bold tracking-[-0.02em]">Projects</span>
          </a>
        </li>
        <li>
          <a class="text-[#1b1b1d] dark:text-[#fcf8fb] flex items-center gap-4 px-6 py-4 hover:bg-white/10 transition-colors duration-500 rounded-full" href="#projects" onclick="const nav = document.getElementById('mobile-nav'); if (nav) nav.classList.add('translate-y-full');">
            <span class="material-symbols-outlined">menu_book</span>
            <span class="text-[36px] font-bold tracking-[-0.02em]">Journal</span>
          </a>
        </li>
        <li>
          <a class="text-[#1b1b1d] dark:text-[#fcf8fb] flex items-center gap-4 px-6 py-4 hover:bg-white/10 transition-colors duration-500 rounded-full" href="#contact" onclick="const nav = document.getElementById('mobile-nav'); if (nav) nav.classList.add('translate-y-full');">
            <span class="material-symbols-outlined">contact_support</span>
            <span class="text-[36px] font-bold tracking-[-0.02em]">Connect</span>
          </a>
        </li>
      </ul>
    </nav>
    <a class="w-full bg-[#f26522] text-white py-4 rounded-full flex justify-center items-center text-[14px] font-semibold mt-auto hover:scale-[1.02] transition-transform duration-500" href="#contact" onclick="const nav = document.getElementById('mobile-nav'); if (nav) nav.classList.add('translate-y-full');">
      Start a project
    </a>
  </div>

  <div class="relative z-10 w-full max-w-[1440px] mx-auto flex flex-col gap-12 mt-32 text-left">
    <h1 class="text-[44px] md:text-[80px] font-extrabold max-w-4xl tracking-tight leading-[1.1] text-[#1b1b1d]">
      We craft digital experiences for brands ready to dominate their category online.
    </h1>
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-6">
      <a class="btn-liquid bg-[#f26522] text-white px-8 py-4 rounded-full text-[14px] font-semibold flex items-center gap-2 group" href="#about">
        <span class="text-roll-hover" data-text="Start a project"><span>Start a project</span></span>
        <span class="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform duration-500">arrow_forward</span>
      </a>
      <div class="flex items-center gap-3 bg-white/20 backdrop-blur-md px-5 py-3 rounded-full border border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
        <span class="material-symbols-outlined text-[#f26522]">handshake</span>
        <span class="text-[14px] font-semibold text-[#1b1b1d]">Certified Partner</span>
      </div>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'about',
        order: 1,
        isVisible: true,
        html: `<section data-folient-section-id="about" id="about" class="bg-white py-[120px] px-5 md:px-20">
  <div class="max-w-[1440px] mx-auto flex flex-col gap-16 text-left">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[#e4e2e4] pb-8">
      <div class="flex flex-col gap-4 max-w-2xl">
        <div class="flex items-center gap-3">
          <span class="w-8 h-8 rounded-full bg-[#f26522]/10 text-[#f26522] flex items-center justify-center text-[14px] font-semibold">1</span>
          <span class="text-[14px] font-semibold text-[#594138] uppercase tracking-widest">Introducing Axion</span>
        </div>
        <h2 class="text-[32px] md:text-[48px] font-bold tracking-[-0.02em] leading-[1.2] text-[#1b1b1d]">
          Strategy-led creatives, delivering results in digital and beyond.
        </h2>
      </div>
    </div>
    <!-- Asymmetric Grid -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
      <!-- Col 1: Portrait Image -->
      <div class="md:col-span-3 rounded-2xl overflow-hidden h-[400px] md:h-full group">
        <div class="w-full h-full bg-[#dcd9dc] bg-cover bg-center transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-105 min-h-[350px]" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDgm9jlXRZi44zVVDWto5cUAquQRTmh_baToFR0r6Il29jO-Bppwac82JdVt6Ycy_fJZDtqNH4nV2CoXvLIBjyvrHAbqjJ4Xi_uuEO3L6tI5estsDOVOd9-zYCHdyvz7DsnOf3mnI8e55jazYXSvYWC1P0nqbWqYjw0ZBB_hsNQgLZx6bD8ZjVeHBFLzmW3jIfFhwnfDuEjmb5-E6Oi6wHLwDwjVRb9EdrrQaGy_P2qmv2GMH_kOX-8eecneEOs_DwkPEbIHrzN-es');">
        </div>
      </div>
      <!-- Col 2: Text + CTA -->
      <div class="md:col-span-4 flex flex-col justify-center px-0 md:px-8 py-8 gap-8">
        <p class="text-[18px] text-[#594138] leading-relaxed font-normal">
          Through research, creative thinking and iteration we help growing brands realize their digital full potential. Our approach combines deep strategic insight with flawless execution to build platforms that perform.
        </p>
        <a class="w-fit btn-liquid bg-transparent border border-[#8d7166] text-[#1b1b1d] px-6 py-3 rounded-full text-[14px] font-semibold flex items-center gap-2 group hover:bg-[#e4e2e4]" href="#">
          <span class="text-roll-hover" data-text="Our methodology"><span>Our methodology</span></span>
        </a>
      </div>
      <!-- Col 3: Landscape Image -->
      <div class="md:col-span-5 rounded-2xl overflow-hidden h-[300px] md:h-full group">
        <div class="w-full h-full bg-[#dcd9dc] bg-cover bg-center transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-105 min-h-[350px]" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBR6-_sZFRk0yUu_Ul1CoRG5ZF2NnwAY_D-QEhEV11LdWI0QhuwjnpjWOTYmCcMiFyX9fee7Pxr_IvVhlqiGR_-ZDXHpfCkbw7PZXtyaGmYDaAJJ627PLfZ5oL4VV6k3-gO8UUWxqj9DGp0lcBWAj-yF8InhjAr05WQUDEHnnrfgBcwWE-5G1-TtgquEt1EhV-t2Kjg1_PPqacQ1YTiKYgcOCi0ana0DWodcc43e6OqCzaafTcBTNZdq6h_bc0uyHtOK-O7EpbMCVg');">
        </div>
      </div>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'projects',
        order: 2,
        isVisible: true,
        html: `<section data-folient-section-id="projects" id="projects" class="bg-[#F5F5F5] py-[120px] px-5 md:px-20">
  <style>
    .case-card-btn {
        transition: all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
    }
    .case-card:hover .case-card-btn {
        transform: scale(1.1);
        background-color: #f26522;
        color: white;
    }
    .case-card:hover .case-card-btn span {
        transform: rotate(-45deg);
    }
  </style>
  <div class="max-w-[1440px] mx-auto flex flex-col gap-12 text-left">
    <div class="flex flex-col gap-4 max-w-2xl">
      <div class="flex items-center gap-3">
        <span class="w-8 h-8 rounded-full bg-[#f26522]/10 text-[#f26522] flex items-center justify-center text-[14px] font-semibold">2</span>
        <span class="text-[14px] font-semibold text-[#594138] uppercase tracking-widest">Featured client work</span>
      </div>
      <h2 class="text-[32px] md:text-[48px] font-bold tracking-[-0.02em] text-[#1b1b1d]">
        Our projects
      </h2>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Case Card 1 -->
      <a class="group case-card block relative rounded-2xl overflow-hidden bg-white aspect-[4/3] lg:aspect-[16/10]" href="#">
        <div class="absolute inset-0 bg-[#dcd9dc] bg-cover bg-center transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-105" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBX8Kr6gidNy6u8OJcmTzge3nLY0M5K7wpexaA7W1QSsm6l9HO_EhxQm4xa7FKaXkmiYWTnWv-fq48gX01vhGtn4U2h3ys84fKfoJczr0Bybqf_ibti6P8YOihK5iCbQ2PU46v-bQV4dDUFyG5SAHIJOXnF0ypB29maLlPtbfO9Cz55Ktw_oIoHSnPVTqAOjg0GMvHU7xEZ2ozjEyvz6qsFj8-oQ_vggwWylDG_sJvccWfCgdv8QwjwnT3qgqxnktM3fx6tr3nCjxA');">
        </div>
        <!-- Glass Overlay -->
        <div class="absolute inset-x-4 bottom-4 p-6 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 shadow-xs flex justify-between items-center z-10">
          <div>
            <h3 class="text-[24px] font-bold text-[#1b1b1d]">Narrativ</h3>
            <p class="text-[14px] font-semibold text-[#594138] mt-1">Brand Identity & Digital Platform</p>
          </div>
          <div class="case-card-btn w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#1b1b1d] shadow-sm border-none cursor-pointer">
            <span class="material-symbols-outlined transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]">arrow_outward</span>
          </div>
        </div>
      </a>
      <!-- Case Card 2 -->
      <a class="group case-card block relative rounded-2xl overflow-hidden bg-white aspect-[4/3] lg:aspect-[16/10]" href="#">
        <div class="absolute inset-0 bg-[#dcd9dc] bg-cover bg-center transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-105" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBySmeJKyNAQRS6r0Z2OYO0LRVbOIIgs2aCTGi3btCIGXK-JZY13AaqWBbtR_NML-rySMCxZp1EBgOsVVrr_NBt1shwyGlUsg2SpQTeuM5sH-jLy_MIeUi-DPzP366-tl2BM6bvYZEJjp-gPjRbYpCnSlk6skX3nNVALEWGAlj5Mkaf3qnU_aeXGSwwMIqZylplpENQTYhyrm3Za-PybhMcE3NkLkC4IKJ227Vfedsm_TpT3QAZK7XbVNywbtF-aCESuK-PMDFeXfQ');">
        </div>
        <!-- Glass Overlay -->
        <div class="absolute inset-x-4 bottom-4 p-6 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 shadow-xs flex justify-between items-center z-10">
          <div>
            <h3 class="text-[24px] font-bold text-[#1b1b1d]">Luminar</h3>
            <p class="text-[14px] font-semibold text-[#594138] mt-1">E-Commerce Experience</p>
          </div>
          <div class="case-card-btn w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#1b1b1d] shadow-sm border-none cursor-pointer">
            <span class="material-symbols-outlined transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]">arrow_outward</span>
          </div>
        </div>
      </a>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'contact',
        order: 3,
        isVisible: true,
        html: `<footer data-folient-section-id="contact" id="contact" class="w-full py-20 bg-[#fcf8fb] border-t border-[#e4e2e4]">
  <div class="max-w-[1440px] mx-auto px-5 md:px-20 flex flex-col md:flex-row justify-between items-center gap-8 text-left">
    <div class="text-[24px] font-bold text-[#1b1b1d]">
      Axion Studio
    </div>
    <ul class="flex flex-wrap items-center justify-center gap-6 md:gap-8">
      <li><a class="text-[14px] font-semibold text-[#594138] hover:text-[#a63b00] transition-colors" href="#">Privacy</a></li>
      <li><a class="text-[14px] font-semibold text-[#594138] hover:text-[#a63b00] transition-colors" href="#">Terms</a></li>
      <li><a class="text-[14px] font-semibold text-[#594138] hover:text-[#a63b00] transition-colors" href="#">Twitter</a></li>
      <li><a class="text-[14px] font-semibold text-[#594138] hover:text-[#a63b00] transition-colors" href="#">LinkedIn</a></li>
    </ul>
    <div class="text-[16px] text-[#594138]">
      © 2026 Axion Studio. All rights reserved.
    </div>
  </div>
</footer>`
      }
    ]
  },
  {
    id: 'carbon',
    name: 'Carbon',
    category: 'Technical',
    description: 'Console font styling, dark grey backgrounds, and bright emerald neon accents.',
    sections: [
      {
        sectionId: 'hero',
        order: 0,
        isVisible: true,
        html: `<section data-folient-section-id="hero" class="relative min-h-screen pt-[120px] pb-20 md:pb-30 flex items-center px-10 overflow-hidden bg-[#050505] text-[#e5e2e1]">
  <style>
    body {
      background-color: #050505;
      color: #e5e2e1;
      background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      background-size: 40px 40px;
      position: relative;
    }
    .noise-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9999;
      opacity: 0.03;
      background-image: url(https://lh3.googleusercontent.com/aida-public/AB6AXuBknkC-N1HCilhKun7vYVQ79pB_l8OVrjX4l3ijaX_Y1zmdiPhJ77DfOghZQiQukTRgunjeGDxxUUEOUmlV4bt-j1CXumoEUnyw10PFK0jfefK2BgbSgPyZgiL9HE90iq1yczys3eweihzp-7dITsS09zzIuCtDkh0x8vlEB6DjpSdp-x4Jp9wBQ0cYJ8yqXaI3UAyqhy65KIbPS3GKVAVCZiifw-uRFTD6K7xUoMQ2xuOSZ0GcvnUdq282BxCHytizMtrLkMgQXl4);
    }
    @keyframes scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(calc(-250px * 7)); }
    }
    .marquee-track {
      display: flex;
      width: calc(250px * 14);
      animation: scroll 40s linear infinite;
    }
    .glass-card {
      background: #101010;
      border: 1px solid rgba(255, 255, 255, 0.05);
      background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%);
    }
    .hover-glow:hover {
      box-shadow: 0 0 30px rgba(57, 255, 20, 0.15);
      border-color: rgba(57, 255, 20, 0.3);
    }
    .text-watermark {
      -webkit-text-fill-color: transparent;
      -webkit-text-stroke: 1px rgba(255, 255, 255, 0.05);
    }
  </style>

  <div class="noise-overlay"></div>

  <!-- TopNavBar Component -->
  <nav class="fixed top-0 left-0 w-full h-[80px] bg-[#131313]/70 backdrop-blur-xl border-b border-white/5 z-50 flex justify-between items-center px-10">
    <div class="max-w-[1440px] mx-auto w-full flex justify-between items-center">
      <a class="font-['Manrope'] text-[32px] font-extrabold tracking-tighter text-[#e5e2e1]" href="#">
        ABHIJITH.
      </a>
      <div class="hidden md:flex gap-8 items-center">
        <a class="text-[#efffe3] relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[2px] after:bg-[#efffe3] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase hover:text-[#efffe3] transition-all duration-300" href="#home">Home</a>
        <a class="text-[#baccb0] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase hover:text-[#efffe3] transition-all duration-300" href="#about">About</a>
        <a class="text-[#baccb0] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase hover:text-[#efffe3] transition-all duration-300" href="#services">Services</a>
        <a class="text-[#baccb0] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase hover:text-[#efffe3] transition-all duration-300" href="#projects">Projects</a>
        <a class="text-[#baccb0] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase hover:text-[#efffe3] transition-all duration-300" href="#experience">Experience</a>
        <a class="text-[#baccb0] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase hover:text-[#efffe3] transition-all duration-300" href="#blog">Blog</a>
      </div>
      <a class="hidden md:flex items-center justify-center px-6 py-3 bg-[#39ff14] text-[#050505] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase rounded hover:shadow-[0_0_30px_rgba(57,255,20,0.2)] transition-all duration-300" href="#contact">
        Let's Talk
      </a>
    </div>
  </nav>

  <div class="max-w-[1440px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-center relative z-10">
    <!-- Left Content -->
    <div class="flex flex-col items-start gap-8">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(57,255,20,0.1)] text-[#39ff14] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase border border-[#39ff14]/20">
        <span class="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse"></span>
        Hello There!
      </div>
      <h1 class="font-['Manrope'] text-[48px] md:text-[80px] font-extrabold tracking-[-0.04em] leading-[1.1] text-[#e5e2e1]">
        I'm Abhijith S,<br/>
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#39ff14] to-[#79ff5b]">Full Stack Developer</span><br/>
        Based in India.
      </h1>
      <p class="font-['Inter'] text-[18px] font-normal leading-[1.6] text-[#baccb0] max-w-lg">
        I engineer elegant, high-performance digital experiences that merge cutting-edge technology with award-winning design aesthetics.
      </p>
      <div class="flex flex-wrap gap-4 mt-4">
        <a class="px-8 py-4 bg-[#39ff14] text-[#050505] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase rounded hover:shadow-[0_0_30px_rgba(57,255,20,0.2)] transition-all duration-300" href="#projects">
          View Portfolio
        </a>
        <a class="px-8 py-4 bg-transparent border border-white/10 text-[#e5e2e1] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase rounded hover:bg-white/5 transition-all duration-300" href="#">
          Download Resume
        </a>
      </div>
    </div>
    <!-- Right Visual -->
    <div class="relative h-[600px] w-full flex justify-center items-center mt-12 md:mt-0">
      <!-- Neon Glow Behind -->
      <div class="absolute w-[400px] h-[400px] bg-[#39ff14]/20 rounded-full blur-[100px] -z-10"></div>
      <div class="relative w-full max-w-[450px] h-full rounded-2xl overflow-hidden glass-card p-2 transform rotate-2 hover:rotate-0 transition-transform duration-500">
        <img alt="Professional portrait" class="w-full h-full object-cover rounded-xl filter grayscale contrast-125" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoKU8COwxINd7l4iR1c-qHcF77CXGXMhRypM2-U9Wqb8Snd_AKOAQDd7HujesPsPOShiHVR7DEdpN-H_-3a1kx753PL2DFwFdNNVUjfclPvdS5TxpEeth3rTJTME50_70Gm6ugtgbzvjSXo8qIzBW0P897WN46usBxIz65x9LaTMH8QrSyPhdry9txioJ3SQ8HpCYDcR8SvPMSj-u3znQEyJQq1bX4tUDTbc7ifwVhb1wAkPkHU3gzqAaxmAXXk_T_6sc0AcZfaZg"/>
        <!-- Floating Tags -->
        <div class="absolute top-10 -left-6 px-4 py-2 glass-card rounded-lg backdrop-blur-md text-[#39ff14] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] border-[#39ff14]/30">
          Developer
        </div>
        <div class="absolute bottom-20 -right-6 px-4 py-2 glass-card rounded-lg backdrop-blur-md text-[#39ff14] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] border-[#39ff14]/30">
          AI Engineer
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Marquee Section -->
<div class="w-full bg-[#39ff14] py-4 overflow-hidden border-y border-[#39ff14]/50">
  <div class="marquee-track flex items-center">
    <div class="flex items-center space-x-12 px-6 text-[#050505] font-['Manrope'] text-[32px] font-semibold leading-[1.3] uppercase whitespace-nowrap">
      <span>Web Design</span>
      <span>•</span>
      <span>App Design</span>
      <span>•</span>
      <span>AI Development</span>
      <span>•</span>
      <span>Marketing</span>
      <span>•</span>
      <span>Consulting</span>
      <span>•</span>
      <span>Branding</span>
      <span>•</span>
      <span>Strategy</span>
      <span>•</span>
      <span>Web Design</span>
      <span>•</span>
      <span>App Design</span>
      <span>•</span>
      <span>AI Development</span>
      <span>•</span>
      <span>Marketing</span>
      <span>•</span>
      <span>Consulting</span>
      <span>•</span>
      <span>Branding</span>
      <span>•</span>
      <span>Strategy</span>
    </div>
  </div>
</div>`
      },
      {
        sectionId: 'about',
        order: 1,
        isVisible: true,
        html: `<section data-folient-section-id="about" id="about" class="relative py-20 md:py-30 px-10 overflow-hidden bg-[#050505] text-[#e5e2e1]">
  <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center -z-10 pointer-events-none opacity-50">
    <span class="text-[200px] md:text-[300px] font-black tracking-tighter text-watermark select-none">ABOUT</span>
  </div>
  <div class="max-w-[1440px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
    <div>
      <h2 class="font-['Manrope'] text-[48px] font-bold tracking-[-0.02em] leading-[1.2] text-[#e5e2e1] mb-4">Crafting Digital <br/><span class="text-[#39ff14]">Excellence.</span></h2>
      <p class="font-['Inter'] text-[18px] font-normal leading-[1.6] text-[#baccb0] mb-4">
        With a passion for clean code and intuitive design, I build scalable applications that solve real-world problems. My approach combines technical expertise with a keen eye for aesthetics, ensuring every project is both functional and beautiful.
      </p>
      <p class="font-['Inter'] text-[18px] font-normal leading-[1.6] text-[#baccb0]">
        Whether it's an interactive web application, an AI-powered tool, or a robust backend architecture, I bring dedication and innovation to every line of code.
      </p>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div class="glass-card p-8 rounded-xl flex flex-col gap-2 hover-glow transition-all duration-300">
        <span class="text-[48px] font-extrabold tracking-[-0.02em] leading-[1.2] text-[#39ff14] font-['Manrope']">5+</span>
        <span class="font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase text-[#baccb0]">Years Experience</span>
      </div>
      <div class="glass-card p-8 rounded-xl flex flex-col gap-2 hover-glow transition-all duration-300">
        <span class="text-[48px] font-extrabold tracking-[-0.02em] leading-[1.2] text-[#39ff14] font-['Manrope']">50+</span>
        <span class="font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase text-[#baccb0]">Projects Done</span>
      </div>
      <div class="glass-card p-8 rounded-xl flex flex-col gap-2 hover-glow transition-all duration-300">
        <span class="text-[48px] font-extrabold tracking-[-0.02em] leading-[1.2] text-[#39ff14] font-['Manrope']">100%</span>
        <span class="font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase text-[#baccb0]">Client Satisfaction</span>
      </div>
      <div class="glass-card p-8 rounded-xl flex flex-col gap-2 hover-glow transition-all duration-300">
        <span class="text-[48px] font-extrabold tracking-[-0.02em] leading-[1.2] text-[#39ff14] font-['Manrope']">10+</span>
        <span class="font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase text-[#baccb0]">Awards Won</span>
      </div>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'services',
        order: 2,
        isVisible: true,
        html: `<section data-folient-section-id="services" id="services" class="relative py-20 md:py-30 px-10 bg-[#0e0e0e] border-y border-white/5 text-[#e5e2e1]">
  <div class="max-w-[1440px] mx-auto w-full">
    <div class="text-center mb-20">
      <h2 class="font-['Manrope'] text-[48px] font-bold tracking-[-0.02em] leading-[1.2] text-[#e5e2e1] mb-2">My <span class="text-[#39ff14]">Specialization</span></h2>
      <p class="font-['Inter'] text-[18px] font-normal leading-[1.6] text-[#baccb0]">Tailored solutions to elevate your digital presence.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Service Card 1 -->
      <div class="glass-card p-8 rounded-2xl flex flex-col gap-6 hover-glow transition-all duration-300 group">
        <div class="w-16 h-16 rounded-full bg-[#39ff14]/10 flex items-center justify-center text-[#39ff14] group-hover:scale-110 transition-transform duration-300">
          <span class="material-symbols-outlined text-4xl">design_services</span>
        </div>
        <h3 class="font-['Manrope'] text-[32px] font-semibold leading-[1.3] text-[#e5e2e1]">UI/UX Design</h3>
        <p class="font-['Inter'] text-[16px] font-normal leading-[1.6] text-[#baccb0]">Creating intuitive, user-centric interfaces that engage and delight users across all devices and platforms.</p>
      </div>
      <!-- Service Card 2 -->
      <div class="glass-card p-8 rounded-2xl flex flex-col gap-6 hover-glow transition-all duration-300 group">
        <div class="w-16 h-16 rounded-full bg-[#39ff14]/10 flex items-center justify-center text-[#39ff14] group-hover:scale-110 transition-transform duration-300">
          <span class="material-symbols-outlined text-4xl">code</span>
        </div>
        <h3 class="font-['Manrope'] text-[32px] font-semibold leading-[1.3] text-[#e5e2e1]">Web Development</h3>
        <p class="font-['Inter'] text-[16px] font-normal leading-[1.6] text-[#baccb0]">Building robust, scalable, and lightning-fast web applications using modern frameworks and best practices.</p>
      </div>
      <!-- Service Card 3 -->
      <div class="glass-card p-8 rounded-2xl flex flex-col gap-6 hover-glow transition-all duration-300 group">
        <div class="w-16 h-16 rounded-full bg-[#39ff14]/10 flex items-center justify-center text-[#39ff14] group-hover:scale-110 transition-transform duration-300">
          <span class="material-symbols-outlined text-4xl">smart_toy</span>
        </div>
        <h3 class="font-['Manrope'] text-[32px] font-semibold leading-[1.3] text-[#e5e2e1]">AI Automation</h3>
        <p class="font-['Inter'] text-[16px] font-normal leading-[1.6] text-[#baccb0]">Integrating artificial intelligence to streamline processes, enhance user experiences, and drive innovation.</p>
      </div>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'projects',
        order: 3,
        isVisible: true,
        html: `<section data-folient-section-id="projects" id="projects" class="relative py-20 md:py-30 px-10 text-[#e5e2e1]">
  <div class="max-w-[1440px] mx-auto w-full">
    <div class="flex flex-col md:flex-row justify-between items-end mb-20 gap-4">
      <div>
        <h2 class="font-['Manrope'] text-[48px] font-bold tracking-[-0.02em] leading-[1.2] text-[#e5e2e1] mb-2">Featured <span class="text-[#39ff14]">Projects</span></h2>
        <p class="font-['Inter'] text-[18px] font-normal leading-[1.6] text-[#baccb0] max-w-lg">A curated selection of my latest work across design, development, and AI.</p>
      </div>
      <a class="text-[#39ff14] hover:text-white transition-colors font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase flex items-center gap-2" href="#">
        View All Projects <span class="material-symbols-outlined">arrow_forward</span>
      </a>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Project 1 -->
      <div class="glass-card rounded-2xl overflow-hidden group relative aspect-[4/5] lg:col-span-2">
        <img alt="SaaS Dashboard" class="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRxUiY7lLcZ-ACdKrSN2sDF3GIf1oCZDjD1V1jbfTX9RtB6RzqSo7uYlHZqT07Kv-aIEQ-9-V0e9wsWr8bRLUOm-EYQ42yqcZdFgVIwQcH4BVzcD2t8PUUwTr-0Hdo9vZUS4yS08EGfu59TTANP2vnQvNAwDLWxxgBamwYCsyVPh3u_w6jZ7xbTnkrklN4irHC_RhD4B9ZedSxmrsOC2ahqyEyE66YiPOwbLL2Xf66qq5PMHzxiFcwUegKLrUBGSCpAOYUfm3jYNo"/>
        <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
          <div class="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <span class="text-[#39ff14] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase mb-2 block">Web Application</span>
            <h3 class="font-['Manrope'] text-[32px] font-semibold leading-[1.3] text-white mb-2">FinTech SaaS Dashboard</h3>
            <p class="font-['Inter'] text-[16px] font-normal leading-[1.6] text-gray-300">A comprehensive financial analytics platform with real-time data visualization.</p>
          </div>
        </div>
      </div>
      <!-- Project 2 -->
      <div class="glass-card rounded-2xl overflow-hidden group relative aspect-[4/5]">
        <img alt="AI Assistant" class="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwW-bG82DyQZy3cogfeOk9O3-6r8UgAjBClIX_uPuOfIY70Vpgw-BYjifvYXMbkM5aNo9x1fRXr3urSvyolMzR8q_1EKNBbqmFAesEtVj0VV0dxJflDKKQtLlY4dtUzlhHEccagh1YbcNqbYKlY1Qdzd2sMk8QyAE6YjJ-VDSdabvXx2dKelVS7o-4f5mVQvp1L1ToXF63Rc94a3VyBXSvyKiRAImN-vn76JcFoeEz_V8GPBqagxs3liynzJYghuOrOt9qSqzdpwQ"/>
        <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
          <div class="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <span class="text-[#39ff14] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase mb-2 block">AI Integration</span>
            <h3 class="font-['Manrope'] text-[32px] font-semibold leading-[1.3] text-white mb-2">Nexus AI Assistant</h3>
            <p class="font-['Inter'] text-[16px] font-normal leading-[1.6] text-gray-300">Smart conversational agent for enterprise workflow automation.</p>
          </div>
        </div>
      </div>
      <!-- Project 3 -->
      <div class="glass-card rounded-2xl overflow-hidden group relative aspect-[4/5]">
        <img alt="E-Commerce" class="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvGpUv61mxCodh2hwstwsseWt1Sx0xqhu3x68882-trHbS61D8lqX5il9Cig_dUS07ROihI6dizTKUTqsgfXLzKbmuSmQveqDpMRyopDbdlGdad_1LhBJPkFYrkKu70iuMAurnvjENhabdguOiLg39k1llc9KmqJVbmoSKjuA185FYrEZUZbucl8EXij9lZWkqq-q1By2S8etYFTaJq1c-SsgiGSUq1vPp5IedST_JT4YPLuwgQdz20lYEC-2Fr6IiM77rteY2r-s"/>
        <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
          <div class="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <span class="text-[#39ff14] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase mb-2 block">E-Commerce</span>
            <h3 class="font-['Manrope'] text-[32px] font-semibold leading-[1.3] text-white mb-2">Aura Lifestyle</h3>
            <p class="font-['Inter'] text-[16px] font-normal leading-[1.6] text-gray-300">Premium headless e-commerce experience built with Next.js.</p>
          </div>
        </div>
      </div>
      <!-- Project 4 -->
      <div class="glass-card rounded-2xl overflow-hidden group relative aspect-[4/5] lg:col-span-2">
        <img alt="Portfolio Concept" class="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUE6ZDO7kz2SP7hf6TV1IZzReIzlh9cjv5XGMRgPBUaiaKiSSSBcrZgM6SNZBmmqespL8bc2yPEuUqOjxwved-f4RtUE_wvQmqxFq-90u4eB0bPaX2t4ZmJAldqIVyk0AQft_ftSoBB9KahaTGiF8B9E3-7ikSOV4WcBUt2cMsZbGDBApxIiSyLRZ85m3tutPfMndKYXSFeKQptOXo_avJgMVpbWfcklFfbtDhh4ftIYXtY0RmVfHg-M_p2EbyTECLNnO9hnj0ryI"/>
        <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
          <div class="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <span class="text-[#39ff14] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase mb-2 block">UI/UX Design</span>
            <h3 class="font-['Manrope'] text-[32px] font-semibold leading-[1.3] text-white mb-2">Immersive Portfolio Concept</h3>
            <p class="font-['Inter'] text-[16px] font-normal leading-[1.6] text-gray-300">Award-winning WebGL experiential website for a creative agency.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'experience',
        order: 4,
        isVisible: true,
        html: `<section data-folient-section-id="experience" id="experience" class="relative py-20 md:py-30 px-10 bg-[#0e0e0e] border-y border-white/5 text-[#e5e2e1]">
  <div class="max-w-[1000px] mx-auto w-full">
    <h2 class="font-['Manrope'] text-[48px] font-bold tracking-[-0.02em] leading-[1.2] text-[#e5e2e1] mb-20 text-center">Professional <span class="text-[#39ff14]">Journey</span></h2>
    <div class="relative border-l border-white/10 ml-4 md:ml-0 md:pl-0">
      <!-- Timeline Item 1 -->
      <div class="mb-12 relative pl-8 md:pl-0 md:grid md:grid-cols-2 md:gap-12 md:items-center">
        <div class="absolute w-4 h-4 bg-[#39ff14] rounded-full left-[-8.5px] top-2 md:left-1/2 md:-ml-2 shadow-[0_0_15px_rgba(57,255,20,0.5)]"></div>
        <div class="md:text-right md:pr-12 hidden md:block">
          <span class="text-[#39ff14] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase">2022 - Present</span>
          <h3 class="font-['Manrope'] text-[32px] font-semibold leading-[1.3] text-[#e5e2e1] mt-2">Senior Full Stack Engineer</h3>
          <p class="text-[#baccb0] mt-2">TechNova Solutions</p>
        </div>
        <div class="glass-card p-6 rounded-xl md:ml-12 hover-glow transition-all duration-300">
          <div class="md:hidden mb-4">
            <span class="text-[#39ff14] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase">2022 - Present</span>
            <h3 class="font-['Manrope'] text-[32px] font-semibold leading-[1.3] text-[#e5e2e1] mt-1">Senior Full Stack Engineer</h3>
            <p class="text-[#baccb0] mt-1">TechNova Solutions</p>
          </div>
          <p class="font-['Inter'] text-[16px] font-normal leading-[1.6] text-[#baccb0]">Leading a team of developers in building scalable microservices and implementing AI-driven features for enterprise SaaS products.</p>
        </div>
      </div>
      <!-- Timeline Item 2 -->
      <div class="mb-12 relative pl-8 md:pl-0 md:grid md:grid-cols-2 md:gap-12 md:items-center">
        <div class="absolute w-4 h-4 bg-white/20 rounded-full left-[-8.5px] top-2 md:left-1/2 md:-ml-2 border border-white/50"></div>
        <div class="glass-card p-6 rounded-xl md:mr-12 hover-glow transition-all duration-300 md:text-right">
          <div class="md:hidden mb-4 text-left">
            <span class="text-[#39ff14] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase">2020 - 2022</span>
            <h3 class="font-['Manrope'] text-[32px] font-semibold leading-[1.3] text-[#e5e2e1] mt-1">Frontend Developer</h3>
            <p class="text-[#baccb0] mt-1">Creative Digital Agency</p>
          </div>
          <p class="font-['Inter'] text-[16px] font-normal leading-[1.6] text-[#baccb0] text-left md:text-right">Developed award-winning experiential websites using React, Three.js, and GSAP for global brands.</p>
        </div>
        <div class="hidden md:block md:pl-12">
          <span class="text-[#39ff14] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase">2020 - 2022</span>
          <h3 class="font-['Manrope'] text-[32px] font-semibold leading-[1.3] text-[#e5e2e1] mt-2">Frontend Developer</h3>
          <p class="text-[#baccb0] mt-2">Creative Digital Agency</p>
        </div>
      </div>
      <!-- Timeline Item 3 -->
      <div class="relative pl-8 md:pl-0 md:grid md:grid-cols-2 md:gap-12 md:items-center">
        <div class="absolute w-4 h-4 bg-white/20 rounded-full left-[-8.5px] top-2 md:left-1/2 md:-ml-2 border border-white/50"></div>
        <div class="md:text-right md:pr-12 hidden md:block">
          <span class="text-[#39ff14] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase">2018 - 2020</span>
          <h3 class="font-['Manrope'] text-[32px] font-semibold leading-[1.3] text-[#e5e2e1] mt-2">Junior Web Developer</h3>
          <p class="text-[#baccb0] mt-2">Startup Inc.</p>
        </div>
        <div class="glass-card p-6 rounded-xl md:ml-12 hover-glow transition-all duration-300">
          <div class="md:hidden mb-4">
            <span class="text-[#39ff14] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase">2018 - 2020</span>
            <h3 class="font-['Manrope'] text-[32px] font-semibold leading-[1.3] text-[#e5e2e1] mt-1">Junior Web Developer</h3>
            <p class="text-[#baccb0] mt-1">Startup Inc.</p>
          </div>
          <p class="font-['Inter'] text-[16px] font-normal leading-[1.6] text-[#baccb0]">Built and maintained responsive landing pages and internal dashboards, collaborating closely with design teams.</p>
        </div>
      </div>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'blog',
        order: 5,
        isVisible: true,
        html: `<section data-folient-section-id="blog" id="blog" class="relative py-20 md:py-30 px-10 text-[#e5e2e1]">
  <div class="max-w-[1440px] mx-auto w-full">
    <h2 class="font-['Manrope'] text-[48px] font-bold tracking-[-0.02em] leading-[1.2] text-[#e5e2e1] mb-20">Latest <span class="text-[#39ff14]">Insights</span></h2>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Featured Post -->
      <a class="group glass-card rounded-2xl overflow-hidden flex flex-col h-full hover-glow transition-all duration-300" href="#">
        <div class="aspect-video overflow-hidden">
          <img alt="Code on screen" class="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBm1J3CY7EQdxsYpEKETMUCravu-CYv5DM1kspqK6iYjQ1N7OZ2Xo285GxorCDtUt4mRATyVj62ihrCN6Z967MTZTiG-VvA1PkXMYQJK7V48zjdlAb_6-82LzUhdBYS5akYygo2n9mxvxW4G3vvSV8jM9DYErakbG4Y7uvkfwUqHDsjYGIy7iXDQAsgxte79bTXmHSmMkdwbvzxJN1RW08wEnRHJM4hVSb8mofDI2EfYWjgqhnLMSutsZuCkGp8wt_d72M_CISkA_Q"/>
        </div>
        <div class="p-8 flex flex-col flex-grow justify-center">
          <div class="flex gap-4 mb-4">
            <span class="text-[#39ff14] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase">Development</span>
            <span class="text-[#baccb0] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase">Oct 24, 2023</span>
          </div>
          <h3 class="text-[32px] font-bold leading-[1.2] font-['Manrope'] text-[#e5e2e1] mb-4 group-hover:text-[#39ff14] transition-colors">The Future of Web Development: AI Integration Strategies</h3>
          <p class="font-['Inter'] text-[18px] font-normal leading-[1.6] text-[#baccb0] mb-6 line-clamp-3">Explore how artificial intelligence is reshaping the landscape of frontend development and how developers can adapt to stay ahead of the curve.</p>
          <span class="inline-flex items-center text-[#39ff14] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase mt-auto">
            Read Article <span class="material-symbols-outlined ml-2">arrow_forward</span>
          </span>
        </div>
      </a>
      <!-- Secondary Posts -->
      <div class="flex flex-col gap-8">
        <!-- Post 2 -->
        <a class="group glass-card rounded-xl overflow-hidden flex flex-col sm:flex-row hover-glow transition-all duration-300" href="#">
          <div class="sm:w-2/5 aspect-video sm:aspect-auto overflow-hidden">
            <img alt="Design concept" class="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6pjBinVFF4TpGGGR5tBKiL3PmsKlEpzBKK1z8rJQXLrF3HlUrNtMeeAmKP7fvlZmzpLjXN4jzVvQ3m3M2Aq9yM9SDSzgceKsWmZ2cnXJy-q2It1UHnTIcAq5abFrXfnJJzaAmz2nxG_cWiLz73IhwRm7vkNsnhADmI3SJaPn0hKXoz0oo_Kqy2MHK8cyK12TtPDYMAfO9X6jwEbQrKt172o9zQoiVxQpuSkkkA3Hj7PnfZnjlJ-xCz28T1RRRwzeKavZxqN5UXPg"/>
          </div>
          <div class="p-6 sm:w-3/5 flex flex-col justify-center">
            <div class="flex gap-4 mb-3">
              <span class="text-[#39ff14] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase">Design</span>
              <span class="text-[#baccb0] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase">Sep 12, 2023</span>
            </div>
            <h4 class="font-['Manrope'] text-[32px] font-semibold leading-[1.3] text-[#e5e2e1] mb-2 group-hover:text-[#39ff14] transition-colors">Mastering Minimalist UI/UX Design</h4>
            <p class="font-['Inter'] text-[16px] font-normal leading-[1.6] text-[#baccb0] line-clamp-2">Why less is often more when it comes to creating high-converting user interfaces.</p>
          </div>
        </a>
        <!-- Post 3 -->
        <a class="group glass-card rounded-xl overflow-hidden flex flex-col sm:flex-row hover-glow transition-all duration-300" href="#">
          <div class="sm:w-2/5 aspect-video sm:aspect-auto overflow-hidden">
            <img alt="Server room" class="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEOS6UNVrBgMdwbk0kBQFLiP4AgLh3ZPgkGCtd8binLsizKxf4Rx7FGr2297rZX_1DEpo3jPFJFYUmxb6LkmSPtLGJZAmiQY-iJEsrDiVYML9FKLQ-UkP4OI1hdfsMBAqfTP2hvYVxuq-LQmb7LloTMY6ZWomsQRgG5s6AhtipbiPJKSHML7Y5DV1hrkgvwgRWoxFG3xhZwvRtt9u39ELMlkLF4zQZNMB5bDyJo1AbS9GFw8QkAqel-DA5q3hJNY7ZzTeqG_WwCpg"/>
          </div>
          <div class="p-6 sm:w-3/5 flex flex-col justify-center">
            <div class="flex gap-4 mb-3">
              <span class="text-[#39ff14] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase">Backend</span>
              <span class="text-[#baccb0] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase">Aug 05, 2023</span>
            </div>
            <h4 class="font-['Manrope'] text-[32px] font-semibold leading-[1.3] text-[#e5e2e1] mb-2 group-hover:text-[#39ff14] transition-colors">Building Scalable Microservices Architecture</h4>
            <p class="font-['Inter'] text-[16px] font-normal leading-[1.6] text-[#baccb0] line-clamp-2">A practical guide to transitioning from monolithic to microservices architecture in modern web apps.</p>
          </div>
        </a>
      </div>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'contact',
        order: 6,
        isVisible: true,
        html: `<section data-folient-section-id="contact" id="contact" class="relative py-20 md:py-30 px-10 bg-[#0e0e0e] border-y border-white/5 text-[#e5e2e1]">
  <div class="absolute w-[600px] h-[600px] bg-[#39ff14]/10 rounded-full blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 pointer-events-none"></div>
  <div class="max-w-[1000px] mx-auto w-full text-center">
    <h2 class="text-[48px] md:text-[80px] font-extrabold tracking-[-0.04em] leading-[1.1] font-['Manrope'] text-[#e5e2e1] mb-8">
      Let's Build Something <br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-[#39ff14] to-[#79ff5b]">Amazing Together</span>
    </h2>
    <p class="font-['Inter'] text-[18px] font-normal leading-[1.6] text-[#baccb0] mb-12 max-w-2xl mx-auto">
      Ready to turn your vision into reality? Whether you have a project in mind or just want to say hi, I'm always open to discussing new opportunities.
    </p>
    <div class="flex flex-col sm:flex-row justify-center gap-6 mb-16">
      <a class="px-8 py-5 bg-[#39ff14] text-[#050505] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase rounded-lg hover:shadow-[0_0_40px_rgba(57,255,20,0.3)] transition-all duration-300 flex items-center justify-center gap-2 font-bold" href="mailto:hello@example.com">
        <span class="material-symbols-outlined">mail</span> Email Me
      </a>
      <a class="px-8 py-5 glass-card text-[#e5e2e1] font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase rounded-lg hover:bg-white/5 hover:border-[#39ff14]/50 transition-all duration-300 flex items-center justify-center gap-2" href="#">
        <span class="material-symbols-outlined">calendar_month</span> Schedule a Call
      </a>
    </div>
    <div class="flex justify-center gap-8">
      <a class="text-[#baccb0] hover:text-[#39ff14] transition-colors p-3 glass-card rounded-full hover-glow" href="#">
        <svg aria-hidden="true" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path clip-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" fill-rule="evenodd"></path>
        </svg>
      </a>
      <a class="text-[#baccb0] hover:text-[#39ff14] transition-colors p-3 glass-card rounded-full hover-glow" href="#">
        <svg aria-hidden="true" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
        </svg>
      </a>
      <a class="text-[#baccb0] hover:text-[#39ff14] transition-colors p-3 glass-card rounded-full hover-glow" href="#">
        <svg aria-hidden="true" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fill-rule="evenodd"></path>
        </svg>
      </a>
      <a class="text-[#baccb0] hover:text-[#39ff14] transition-colors p-3 glass-card rounded-full hover-glow" href="#">
        <svg aria-hidden="true" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path clip-rule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fill-rule="evenodd"></path>
        </svg>
      </a>
    </div>
  </div>
</section>

<!-- Footer Component -->
<footer class="bg-[#020202] w-full py-8 border-t border-white/5 relative z-10 text-[#e5e2e1]">
  <div class="max-w-[1440px] mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-4">
    <div class="font-['Manrope'] text-[32px] font-bold text-[#e5e2e1]">
      ABHIJITH.
    </div>
    <div class="flex gap-6">
      <a class="text-[#baccb0] hover:text-[#efffe3] transition-colors font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase" href="#">Privacy Policy</a>
      <a class="text-[#baccb0] hover:text-[#efffe3] transition-colors font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase" href="#">Terms of Service</a>
      <a class="text-[#baccb0] hover:text-[#efffe3] transition-colors font-['Inter'] text-[12px] font-semibold tracking-[0.1em] uppercase" href="#">Cookies</a>
    </div>
    <div class="font-['Inter'] text-[16px] font-normal leading-[1.6] text-[#baccb0]">
      © 2026 ABHIJITH. ALL RIGHTS RESERVED.
    </div>
  </div>
</footer>`
      }
    ]
  },
  {
    id: 'lumina',
    name: 'Lumina',
    category: 'Creative',
    description: 'Dark mode styling with smooth purple/indigo gradients and floating bento cards.',
    sections: [
      {
        sectionId: 'hero',
        order: 0,
        isVisible: true,
        html: `<section data-folient-section-id="hero" class="py-24 px-8 max-w-4xl mx-auto text-center bg-slate-950 text-slate-100 rounded-3xl shadow-xl border border-slate-800 my-8 relative overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/10 pointer-events-none"></div>
  <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight font-display mb-6">Creating with <span class="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Light & Motion</span></h1>
  <p class="text-lg text-slate-400 mb-8 max-w-lg mx-auto font-sans">Hello, I'm Taylor. Creative Developer specialized in interactive 3D elements, animations, and premium web design.</p>
  <a href="#projects" class="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-full font-medium hover:opacity-90 shadow-lg shadow-purple-500/20 transition-all hover:scale-95 duration-150">Explore Works</a>
</section>`
      },
      {
        sectionId: 'about',
        order: 1,
        isVisible: true,
        html: `<section data-folient-section-id="about" class="py-16 px-8 max-w-4xl mx-auto bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 my-8">
  <h2 class="text-2xl font-bold font-display mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Creative Focus</h2>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
    <div class="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
      <span class="material-symbols-outlined text-purple-400 text-3xl mb-3">deployed_code</span>
      <h3 class="font-bold text-base mb-2">3D Environments</h3>
      <p class="text-slate-400">Building immersive WebGL experiences using Three.js and custom shaders.</p>
    </div>
    <div class="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
      <span class="material-symbols-outlined text-purple-400 text-3xl mb-3">animation</span>
      <h3 class="font-bold text-base mb-2">Micro-interactions</h3>
      <p class="text-slate-400">Crafting responsive, physics-based user interface animations.</p>
    </div>
    <div class="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
      <span class="material-symbols-outlined text-purple-400 text-3xl mb-3">responsive_layout</span>
      <h3 class="font-bold text-base mb-2">Premium Styling</h3>
      <p class="text-slate-400">Implementing dynamic layout frames and rich bento configurations.</p>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'projects',
        order: 2,
        isVisible: true,
        html: `<section data-folient-section-id="projects" id="projects" class="py-16 px-8 max-w-4xl mx-auto bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 my-8">
  <h2 class="text-2xl font-bold font-display mb-8">Selected Projects</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 hover:border-purple-500/50 transition-colors">
      <div class="aspect-video w-full bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-xl mb-4 flex items-center justify-center text-slate-300">
        <span class="material-symbols-outlined text-3xl">motion_photos_on</span>
      </div>
      <h3 class="text-lg font-bold mb-2">Aether Interactive</h3>
      <p class="text-slate-400 text-sm mb-4">A lightweight physics-based website built using Canvas and custom shaders.</p>
      <span class="text-xs text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full">Three.js / React</span>
    </div>
    <div class="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 hover:border-purple-500/50 transition-colors">
      <div class="aspect-video w-full bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl mb-4 flex items-center justify-center text-slate-300">
        <span class="material-symbols-outlined text-3xl">token</span>
      </div>
      <h3 class="text-lg font-bold mb-2">Vapor Design</h3>
      <p class="text-slate-400 text-sm mb-4">A digital token showcase featuring rich liquid glassmorphism visuals.</p>
      <span class="text-xs text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full">Tailwind / GSAP</span>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'contact',
        order: 3,
        isVisible: true,
        html: `<section data-folient-section-id="contact" class="py-16 px-8 max-w-4xl mx-auto bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 my-8 text-center relative overflow-hidden">
  <h2 class="text-3xl font-bold font-display mb-4">Create Magic Together</h2>
  <p class="text-slate-400 mb-8 max-w-sm mx-auto text-sm">Drop a note if you are looking for design-driven interactive engineering support.</p>
  <a href="mailto:taylor@example.com" class="inline-block bg-white text-slate-950 px-8 py-3 rounded-full font-medium hover:bg-slate-100 transition-all">Send Message</a>
</section>`
      }
    ]
  },
  {
    id: 'slate',
    name: 'Slate',
    category: 'Corporate',
    description: 'Corporate business light mode featuring blue accents and clean layouts.',
    sections: [
      {
        sectionId: 'hero',
        order: 0,
        isVisible: true,
        html: `<section data-folient-section-id="hero" class="py-20 px-8 max-w-4xl mx-auto bg-slate-50 text-slate-800 rounded-3xl border border-slate-200 my-8">
  <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight font-display text-slate-900 mb-4">Folient Slate Theme</h1>
  <p class="text-lg text-slate-600 mb-8 max-w-xl leading-relaxed">We design and integrate software solutions that streamline core operations for mid-market product organizations.</p>
  <a href="#services" class="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">Our Services</a>
</section>`
      },
      {
        sectionId: 'about',
        order: 1,
        isVisible: true,
        html: `<section data-folient-section-id="about" id="services" class="py-16 px-8 max-w-4xl mx-auto bg-white text-slate-800 rounded-3xl border border-slate-100 my-8">
  <h2 class="text-2xl font-bold text-slate-950 mb-8 font-display">Services Portfolio</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
    <div class="p-6 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors">
      <h3 class="font-bold text-slate-900 text-base mb-2">Systems Integration</h3>
      <p class="text-slate-600">Securely connecting legacy workflows with modern cloud REST frameworks.</p>
    </div>
    <div class="p-6 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors">
      <h3 class="font-bold text-slate-900 text-base mb-2">Data Operations</h3>
      <p class="text-slate-600">Building scalable ETL data pipelines and structured PostgreSQL storage networks.</p>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'contact',
        order: 2,
        isVisible: true,
        html: `<section data-folient-section-id="contact" class="py-16 px-8 max-w-4xl mx-auto bg-slate-900 text-white rounded-3xl my-8 text-center">
  <h2 class="text-2xl font-bold font-display mb-4">Request a Consultation</h2>
  <p class="text-slate-400 mb-8 max-w-sm mx-auto text-sm">Get in touch to learn how our systems can support your operation goals.</p>
  <a href="mailto:corp@example.com" class="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">Consult Today</a>
</section>`
      }
    ]
  },
  {
    id: 'prism',
    name: 'Prism',
    category: 'Photography',
    description: 'Masonry image grids, light borderless frames, and minimal sidebar descriptions.',
    sections: [
      {
        sectionId: 'hero',
        order: 0,
        isVisible: true,
        html: `<section data-folient-section-id="hero" class="py-16 px-8 max-w-4xl mx-auto bg-white text-gray-950 rounded-3xl border border-gray-100 my-8">
  <h1 class="text-4xl font-extrabold tracking-tight font-display mb-4">Visual Reflections</h1>
  <p class="text-base text-gray-600 max-w-md">Hi, I'm Robin. Editorial photographer capturing landscape structures and urban geometry.</p>
</section>`
      },
      {
        sectionId: 'gallery',
        order: 1,
        isVisible: true,
        html: `<section data-folient-section-id="gallery" class="py-16 px-8 max-w-4xl mx-auto bg-white text-gray-950 rounded-3xl border border-gray-100 my-8">
  <h2 class="text-2xl font-bold font-display mb-8">Featured Shots</h2>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="aspect-[3/4] bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100 relative overflow-hidden group">
      <span class="material-symbols-outlined text-4xl">photo_camera</span>
      <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 text-white text-xs">
        <span>Urban Architecture - NY</span>
      </div>
    </div>
    <div class="aspect-[3/4] bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100 relative overflow-hidden group">
      <span class="material-symbols-outlined text-4xl">photo_camera</span>
      <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 text-white text-xs">
        <span>Symmetrical Facades - Berlin</span>
      </div>
    </div>
    <div class="aspect-[3/4] bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100 relative overflow-hidden group">
      <span class="material-symbols-outlined text-4xl">photo_camera</span>
      <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 text-white text-xs">
        <span>Mountain Geometry - Swiss</span>
      </div>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'contact',
        order: 2,
        isVisible: true,
        html: `<section data-folient-section-id="contact" class="py-12 px-8 max-w-4xl mx-auto bg-white text-gray-950 rounded-3xl border border-gray-100 my-8 text-center">
  <h2 class="text-xl font-bold font-display mb-4">Booking & Editorial Queries</h2>
  <a href="mailto:photos@example.com" class="text-gray-800 hover:text-black font-semibold underline">robin@example.com</a>
</section>`
      }
    ]
  },
  {
    id: 'focus',
    name: 'Focus',
    category: 'Academic',
    description: 'Clean serif, publication lists, and educational milestones for academic and research profiles.',
    sections: [
      {
        sectionId: 'hero',
        order: 0,
        isVisible: true,
        html: `<section data-folient-section-id="hero" class="py-20 px-8 max-w-4xl mx-auto bg-stone-50 text-stone-900 border-b border-stone-200">
  <div class="flex flex-col md:flex-row md:items-center gap-8">
    <div class="flex-1">
      <h1 class="text-4xl font-serif font-normal tracking-tight mb-4">Dr. Arthur Vance</h1>
      <p class="text-lg text-stone-600 font-serif italic mb-6">Associate Professor of Computer Science & Human-Computer Interaction</p>
      <div class="flex gap-4 text-xs font-semibold uppercase tracking-wider text-stone-500">
        <span>Stanford University</span>
        <span>•</span>
        <span>Vance Lab</span>
      </div>
    </div>
    <div class="w-32 h-32 bg-stone-200 rounded-full shrink-0 flex items-center justify-center text-stone-400">
      <span class="material-symbols-outlined text-5xl">account_circle</span>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'education',
        order: 1,
        isVisible: true,
        html: `<section data-folient-section-id="education" class="py-16 px-8 max-w-4xl mx-auto bg-stone-50 text-stone-900 border-b border-stone-200">
  <h2 class="text-2xl font-serif mb-8 border-l-2 border-stone-900 pl-3">Education</h2>
  <div class="space-y-6">
    <div class="flex justify-between items-start gap-4">
      <div>
        <h3 class="font-semibold text-sm">Ph.D. in Computer Science</h3>
        <p class="text-xs text-stone-500">Massachusetts Institute of Technology</p>
      </div>
      <span class="text-xs font-mono bg-stone-200/50 px-2 py-0.5 rounded">2016 - 2020</span>
    </div>
    <div class="flex justify-between items-start gap-4">
      <div>
        <h3 class="font-semibold text-sm">M.S. in Computer Science</h3>
        <p class="text-xs text-stone-500">Stanford University</p>
      </div>
      <span class="text-xs font-mono bg-stone-200/50 px-2 py-0.5 rounded">2014 - 2016</span>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'publications',
        order: 2,
        isVisible: true,
        html: `<section data-folient-section-id="publications" class="py-16 px-8 max-w-4xl mx-auto bg-stone-50 text-stone-900 border-b border-stone-200">
  <h2 class="text-2xl font-serif mb-8 border-l-2 border-stone-900 pl-3">Selected Publications</h2>
  <ul class="space-y-6 list-none p-0">
    <li class="relative pl-6">
      <span class="absolute left-0 top-1.5 w-1.5 h-1.5 bg-stone-900 rounded-full"></span>
      <h3 class="font-semibold text-sm">Adaptive Latency Thresholds in Collaborative Web Apps</h3>
      <p class="text-xs text-stone-600 mt-1">Vance, A., & Thorne, L. • <span class="italic">ACM Transactions on CHI (2025)</span></p>
    </li>
    <li class="relative pl-6">
      <span class="absolute left-0 top-1.5 w-1.5 h-1.5 bg-stone-900 rounded-full"></span>
      <h3 class="font-semibold text-sm">Security Models in Zero-Server Context Frameworks</h3>
      <p class="text-xs text-stone-600 mt-1">Vance, A. • <span class="italic">IEEE Security & Privacy (2023)</span></p>
    </li>
  </ul>
</section>`
      },
      {
        sectionId: 'research',
        order: 3,
        isVisible: true,
        html: `<section data-folient-section-id="research" class="py-16 px-8 max-w-4xl mx-auto bg-stone-50 text-stone-900 border-b border-stone-200">
  <h2 class="text-2xl font-serif mb-8 border-l-2 border-stone-900 pl-3">Research Areas</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="p-5 bg-white border border-stone-200 rounded-xl">
      <h3 class="font-semibold text-sm mb-2">Decentralized Web Frameworks</h3>
      <p class="text-xs text-stone-600 leading-relaxed">Investigating client-side compilation systems and edge-based delivery networks for static sites.</p>
    </div>
    <div class="p-5 bg-white border border-stone-200 rounded-xl">
      <h3 class="font-semibold text-sm mb-2">Collaborative Interfaces</h3>
      <p class="text-xs text-stone-600 leading-relaxed">Designing UI algorithms that balance state-sync latency and user cognitive load in real time.</p>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'contact',
        order: 4,
        isVisible: true,
        html: `<section data-folient-section-id="contact" class="py-16 px-8 max-w-4xl mx-auto bg-stone-50 text-stone-900 text-center">
  <h2 class="text-2xl font-serif mb-4">Academic Correspondence</h2>
  <p class="text-stone-500 text-xs mb-6 max-w-sm mx-auto">Feel free to reach out for research collaboration, guest speaking, or student advisory.</p>
  <a href="mailto:vance@stanford.edu" class="inline-block bg-stone-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-stone-800 transition-colors text-xs font-mono">vance@stanford.edu</a>
</section>`
      }
    ]
  },
  {
    id: 'pulse',
    name: 'Pulse',
    category: 'Freelancer',
    description: 'Vibrant, high-converting design with services grid, client testimonials, and tier pricing.',
    sections: [
      {
        sectionId: 'hero',
        order: 0,
        isVisible: true,
        html: `<section data-folient-section-id="hero" class="py-24 px-6 md:px-16 bg-slate-900 text-white text-center relative overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 pointer-events-none" />
  <h1 class="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Turning Ideas Into Digital Products</h1>
  <p class="text-base text-slate-300 max-w-lg mx-auto mb-8 leading-relaxed">Hi, I'm Alex. Freelance full-stack developer and UI designer helping startups ship beautiful websites in days.</p>
  <a href="#contact" class="inline-block bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-transform hover:scale-[1.02] text-sm shadow-lg shadow-indigo-600/30">Book a Discovery Call</a>
</section>`
      },
      {
        sectionId: 'services',
        order: 1,
        isVisible: true,
        html: `<section data-folient-section-id="services" class="py-20 px-6 md:px-16 bg-slate-950 text-white">
  <h2 class="text-3xl font-bold text-center mb-12">Expert Capabilities</h2>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
    <div class="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500/40 transition-colors">
      <span class="material-symbols-outlined text-indigo-400 text-4xl mb-4">web</span>
      <h3 class="text-lg font-bold mb-2">Web Application Development</h3>
      <p class="text-xs text-slate-400 leading-relaxed">Full-stack React development, fast API integration, and headless CMS connections.</p>
    </div>
    <div class="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500/40 transition-colors">
      <span class="material-symbols-outlined text-indigo-400 text-4xl mb-4">phone_iphone</span>
      <h3 class="text-lg font-bold mb-2">Mobile Interface Design</h3>
      <p class="text-xs text-slate-400 leading-relaxed">Touch-first, premium mockups and interactive native layouts built inside Figma.</p>
    </div>
    <div class="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500/40 transition-colors">
      <span class="material-symbols-outlined text-indigo-400 text-4xl mb-4">bolt</span>
      <h3 class="text-lg font-bold mb-2">Performance Optimization</h3>
      <p class="text-xs text-slate-400 leading-relaxed">Audit page assets, optimize bundle sizes, and compile lightweight static codes.</p>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'portfolio',
        order: 2,
        isVisible: true,
        html: `<section data-folient-section-id="portfolio" class="py-20 px-6 md:px-16 bg-slate-900 text-white">
  <h2 class="text-3xl font-bold text-center mb-12">Latest Shipments</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
    <div class="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden group hover:scale-[1.01] transition-transform">
      <div class="h-48 bg-slate-800 flex items-center justify-center text-slate-500">
        <span class="material-symbols-outlined text-5xl">dashboard</span>
      </div>
      <div class="p-6">
        <h3 class="text-lg font-bold mb-2">SaaS Workspace Platform</h3>
        <p class="text-xs text-slate-400 mb-4">Full-stack product design & code compilation for modern operations.</p>
        <span class="text-xs font-semibold text-indigo-400">Design & Code</span>
      </div>
    </div>
    <div class="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden group hover:scale-[1.01] transition-transform">
      <div class="h-48 bg-slate-800 flex items-center justify-center text-slate-500">
        <span class="material-symbols-outlined text-5xl">shopping_bag</span>
      </div>
      <div class="p-6">
        <h3 class="text-lg font-bold mb-2">E-commerce Edge Pipeline</h3>
        <p class="text-xs text-slate-400 mb-4">Fast-loading shopping interface with localized catalog routing.</p>
        <span class="text-xs font-semibold text-indigo-400">Next.js Development</span>
      </div>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'pricing',
        order: 3,
        isVisible: true,
        html: `<section data-folient-section-id="pricing" class="py-20 px-6 md:px-16 bg-slate-950 text-white">
  <h2 class="text-3xl font-bold text-center mb-12">Transparent Packages</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
    <div class="p-8 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col justify-between">
      <div>
        <h3 class="text-xl font-bold mb-2">Product MVP Launch</h3>
        <p class="text-xs text-slate-400 mb-6">Perfect for startups looking to launch a complete landing page & mockup in days.</p>
        <span class="text-4xl font-extrabold">$2,450</span>
      </div>
      <ul class="space-y-3 my-6 text-xs text-slate-300 list-none p-0">
        <li>✓ Single-page UI Interface</li>
        <li>✓ Fully Responsive Coding</li>
        <li>✓ 3 Business Days Delivery</li>
      </ul>
      <a href="#contact" class="w-full bg-slate-800 hover:bg-slate-700 text-center py-3 rounded-xl font-semibold text-xs transition-colors">Select Plan</a>
    </div>
    <div class="p-8 bg-slate-900 border-2 border-indigo-500 rounded-3xl flex flex-col justify-between relative">
      <span class="absolute top-0 right-8 -translate-y-1/2 bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Most Popular</span>
      <div>
        <h3 class="text-xl font-bold mb-2">Custom SaaS App</h3>
        <p class="text-xs text-slate-400 mb-6">Complete client-side dashboard integration, customized styles, and deployments.</p>
        <span class="text-4xl font-extrabold">$4,850</span>
      </div>
      <ul class="space-y-3 my-6 text-xs text-slate-300 list-none p-0">
        <li>✓ Multi-page Dashboard Layout</li>
        <li>✓ User Auth & Databases Integration</li>
        <li>✓ 7 Business Days Delivery</li>
      </ul>
      <a href="#contact" class="w-full bg-indigo-600 hover:bg-indigo-700 text-center py-3 rounded-xl font-bold text-xs transition-colors">Select Plan</a>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'testimonials',
        order: 4,
        isVisible: true,
        html: `<section data-folient-section-id="testimonials" class="py-20 px-6 md:px-16 bg-slate-900 text-white">
  <h2 class="text-3xl font-bold text-center mb-12">Client Feedback</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
    <div class="p-6 bg-slate-950 border border-slate-850 rounded-2xl">
      <p class="text-xs text-slate-300 leading-relaxed italic mb-4">"Alex shipped our entire portfolio landing page in 4 days. The page loads instantly, and we've already closed two clients using it."</p>
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400">J</div>
        <div>
          <h4 class="text-xs font-bold">Julia Green</h4>
          <span class="text-[10px] text-slate-500">Founder, Slate Media</span>
        </div>
      </div>
    </div>
    <div class="p-6 bg-slate-950 border border-slate-850 rounded-2xl">
      <p class="text-xs text-slate-300 leading-relaxed italic mb-4">"The styling is super clean, and Alex was incredibly communicative throughout the process. Highly recommend for custom SaaS mockups."</p>
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400">M</div>
        <div>
          <h4 class="text-xs font-bold">Marcus Thorne</h4>
          <span class="text-[10px] text-slate-500">Tech Lead, Vanguard Labs</span>
        </div>
      </div>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'contact',
        order: 5,
        isVisible: true,
        html: `<section data-folient-section-id="contact" id="contact" class="py-20 px-6 md:px-16 bg-slate-950 text-white text-center">
  <h2 class="text-3xl font-bold mb-4">Let's Build Together</h2>
  <p class="text-slate-400 text-xs mb-8 max-w-sm mx-auto">Have a project in mind or want to learn about custom packages? Reach out to start a discussion.</p>
  <a href="mailto:alex@example.com" class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold text-sm transition-transform hover:scale-[1.02]">alex@example.com</a>
</section>`
      }
    ]
  },
  {
    id: 'mono',
    name: 'Mono',
    category: 'Minimal/Dark',
    description: 'Ultra-minimal dark workspace, structural code fonts, high contrast text alignment.',
    sections: [
      {
        sectionId: 'hero',
        order: 0,
        isVisible: true,
        html: `<section data-folient-section-id="hero" class="py-24 px-8 max-w-3xl mx-auto bg-black text-[#F4F4F4] font-mono border-b border-[#222]">
  <h1 class="text-3xl font-bold tracking-tight mb-4">ROLAND.LOG</h1>
  <p class="text-sm text-gray-400 leading-relaxed max-w-xl">Systems architect building lightweight client-side compilers, encrypted key databases, and serverless hosting adapters. Open to collaboration.</p>
</section>`
      },
      {
        sectionId: 'about',
        order: 1,
        isVisible: true,
        html: `<section data-folient-section-id="about" class="py-16 px-8 max-w-3xl mx-auto bg-black text-[#F4F4F4] font-mono border-b border-[#222]">
  <h2 class="text-xs uppercase tracking-widest text-gray-500 mb-6 font-bold">INFO</h2>
  <p class="text-sm leading-relaxed mb-6">Based in Helsinki. Focusing on browser-native cryptography, indexDB caching layouts, and single-file HTML pipelines.</p>
  <div class="grid grid-cols-2 gap-4 text-xs">
    <div>
      <span class="text-gray-500 block">Focus:</span>
      <span>Client-Side Systems</span>
    </div>
    <div>
      <span class="text-gray-500 block">License:</span>
      <span>MIT</span>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'projects',
        order: 2,
        isVisible: true,
        html: `<section data-folient-section-id="projects" class="py-16 px-8 max-w-3xl mx-auto bg-black text-[#F4F4F4] font-mono border-b border-[#222]">
  <h2 class="text-xs uppercase tracking-widest text-gray-500 mb-8 font-bold">SHIPMENTS</h2>
  <div class="space-y-8">
    <div>
      <h3 class="text-sm font-bold flex justify-between">
        <span>01/ Crypto-Engine</span>
        <span class="text-gray-500 text-xs font-normal">Active</span>
      </h3>
      <p class="text-xs text-gray-400 mt-2">Browser PBKDF2 implementation securing credentials client-side.</p>
    </div>
    <div>
      <h3 class="text-sm font-bold flex justify-between">
        <span>02/ Static-Zip</span>
        <span class="text-gray-500 text-xs font-normal">Active</span>
      </h3>
      <p class="text-xs text-gray-400 mt-2">Bundling HTML, inline assets, and code scripts in-browser.</p>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'contact',
        order: 3,
        isVisible: true,
        html: `<section data-folient-section-id="contact" class="py-16 px-8 max-w-3xl mx-auto bg-black text-[#F4F4F4] font-mono text-center">
  <h2 class="text-xs uppercase tracking-widest text-gray-500 mb-6 font-bold">CONNECT</h2>
  <a href="mailto:roland@example.com" class="text-sm text-[#F4F4F4] hover:text-white underline decoration-[#444] hover:decoration-white transition-colors">roland@example.com</a>
</section>`
      }
    ]
  },
  {
    id: 'vivid',
    name: 'Vivid',
    category: 'Creative/Light',
    description: 'Bright layouts, soft shadows, skill radials, and minimal article grids.',
    sections: [
      {
        sectionId: 'hero',
        order: 0,
        isVisible: true,
        html: `<section data-folient-section-id="hero" class="py-24 px-8 text-center bg-rose-50/30 text-rose-950">
  <div class="max-w-2xl mx-auto">
    <span class="bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">Illustrator & UI Artist</span>
    <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight mt-4 mb-6">Hello, I'm Mia. I build visual brand experiences.</h1>
    <p class="text-base text-rose-900/80 leading-relaxed mb-8">Creating modern editorial illustration, vector brand packages, and dynamic mobile UI design in Tokyo.</p>
    <a href="#contact" class="inline-block bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 rounded-xl font-semibold text-xs shadow-md shadow-rose-600/20">Let's Collaborate</a>
  </div>
</section>`
      },
      {
        sectionId: 'about',
        order: 1,
        isVisible: true,
        html: `<section data-folient-section-id="about" class="py-20 px-8 bg-white text-rose-950 border-b border-rose-100">
  <div class="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
    <div>
      <h2 class="text-2xl font-bold mb-4">Crafting Visuals</h2>
      <p class="text-xs text-rose-900/80 leading-relaxed">I help companies express their ideas through warm color palettes, hand-drawn vector elements, and delightful interface micro-interactions.</p>
    </div>
    <div class="flex flex-col justify-center gap-4">
      <div>
        <span class="text-xs font-bold block text-rose-600">Location:</span>
        <span class="text-sm font-medium">Tokyo, Japan</span>
      </div>
      <div>
        <span class="text-xs font-bold block text-rose-600">Focus:</span>
        <span class="text-sm font-medium">Editorial Design & Mobile UI</span>
      </div>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'skills',
        order: 2,
        isVisible: true,
        html: `<section data-folient-section-id="skills" class="py-20 px-8 bg-rose-50/20 text-rose-950 border-b border-rose-100">
  <div class="max-w-3xl mx-auto">
    <h2 class="text-2xl font-bold mb-10 text-center">Design Core</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
      <div class="p-4 bg-white border border-rose-100 rounded-2xl shadow-xs">
        <span class="material-symbols-outlined text-rose-500 text-3xl mb-2">brush</span>
        <h3 class="text-xs font-bold">Vector Illustration</h3>
      </div>
      <div class="p-4 bg-white border border-rose-100 rounded-2xl shadow-xs">
        <span class="material-symbols-outlined text-rose-500 text-3xl mb-2">dashboard</span>
        <h3 class="text-xs font-bold">Layout Grid Design</h3>
      </div>
      <div class="p-4 bg-white border border-rose-100 rounded-2xl shadow-xs">
        <span class="material-symbols-outlined text-rose-500 text-3xl mb-2">phone_iphone</span>
        <h3 class="text-xs font-bold">Mobile UI Prototyping</h3>
      </div>
      <div class="p-4 bg-white border border-rose-100 rounded-2xl shadow-xs">
        <span class="material-symbols-outlined text-rose-500 text-3xl mb-2">color_lens</span>
        <h3 class="text-xs font-bold">Color Palette Direction</h3>
      </div>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'projects',
        order: 3,
        isVisible: true,
        html: `<section data-folient-section-id="projects" class="py-20 px-8 bg-white text-rose-950 border-b border-rose-100">
  <div class="max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold mb-10 text-center">Selected Work</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-rose-50/10 border border-rose-100 rounded-2xl overflow-hidden shadow-xs hover:scale-[1.01] transition-transform">
        <div class="h-36 bg-rose-100/30 flex items-center justify-center text-rose-300">
          <span class="material-symbols-outlined text-4xl">photo</span>
        </div>
        <div class="p-4">
          <h3 class="text-xs font-bold">Flora Vector Pack</h3>
        </div>
      </div>
      <div class="bg-rose-50/10 border border-rose-100 rounded-2xl overflow-hidden shadow-xs hover:scale-[1.01] transition-transform">
        <div class="h-36 bg-rose-100/30 flex items-center justify-center text-rose-300">
          <span class="material-symbols-outlined text-4xl">web</span>
        </div>
        <div class="p-4">
          <h3 class="text-xs font-bold">Editorial Magazine Grid</h3>
        </div>
      </div>
      <div class="bg-rose-50/10 border border-rose-100 rounded-2xl overflow-hidden shadow-xs hover:scale-[1.01] transition-transform">
        <div class="h-36 bg-rose-100/30 flex items-center justify-center text-rose-300">
          <span class="material-symbols-outlined text-4xl">phone_iphone</span>
        </div>
        <div class="p-4">
          <h3 class="text-xs font-bold">Plant Care App UI</h3>
        </div>
      </div>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'blog',
        order: 4,
        isVisible: true,
        html: `<section data-folient-section-id="blog" class="py-20 px-8 bg-rose-50/20 text-rose-950 border-b border-rose-100">
  <div class="max-w-3xl mx-auto">
    <h2 class="text-2xl font-bold mb-10 text-center">Design Insights</h2>
    <div class="space-y-4">
      <a href="#" class="block p-5 bg-white border border-rose-100 rounded-2xl shadow-xs hover:border-rose-300 transition-colors">
        <span class="text-[10px] font-bold text-rose-600">June 2026</span>
        <h3 class="text-sm font-bold mt-1">Evolving Color Palettes in Responsive Mobile Apps</h3>
      </a>
      <a href="#" class="block p-5 bg-white border border-rose-100 rounded-2xl shadow-xs hover:border-rose-300 transition-colors">
        <span class="text-[10px] font-bold text-rose-600">May 2026</span>
        <h3 class="text-sm font-bold mt-1">Grid Structures & Serif Font Scaling for Editorial Content</h3>
      </a>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'contact',
        order: 5,
        isVisible: true,
        html: `<section data-folient-section-id="contact" id="contact" class="py-20 px-8 bg-white text-rose-950 text-center">
  <h2 class="text-2xl font-bold mb-4">Start a Project</h2>
  <a href="mailto:mia@example.com" class="text-rose-600 hover:text-rose-700 font-bold underline text-sm">mia@example.com</a>
</section>`
      }
    ]
  },
  {
    id: 'studio',
    name: 'Studio',
    category: 'Agency',
    description: 'Bold agency wireframe, client project galleries, team profiles, and process steps.',
    sections: [
      {
        sectionId: 'hero',
        order: 0,
        isVisible: true,
        html: `<section data-folient-section-id="hero" class="py-24 px-8 bg-slate-900 text-white text-center">
  <div class="max-w-3xl mx-auto">
    <span class="text-xs font-semibold text-emerald-400 uppercase tracking-widest block mb-4">AXION STUDIO</span>
    <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">We Build Premium Client-Side Web Experiences</h1>
    <p class="text-sm text-slate-300 max-w-lg mx-auto mb-8 leading-relaxed">AXION is a collaborative design & code agency constructing lightweight digital products, fast static rendering pages, and zero-server deployments.</p>
    <a href="#about" class="inline-block bg-white text-slate-950 px-6 py-2.5 rounded-xl font-bold text-xs hover:scale-[1.02] transition-transform">See Work</a>
  </div>
</section>`
      },
      {
        sectionId: 'about',
        order: 1,
        isVisible: true,
        html: `<section data-folient-section-id="about" id="about" class="py-20 px-8 bg-white text-slate-900 border-b border-slate-100">
  <div class="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
    <div>
      <h2 class="text-2xl font-bold mb-4">Systematic Design</h2>
      <p class="text-xs text-slate-600 leading-relaxed">Our work focuses on fast client-side indexing, encrypted credentials interfaces, and robust deployment pipelines. We avoid monolithic code setups in favor of clean section-level rendering.</p>
    </div>
    <div class="bg-slate-50 p-6 rounded-2xl border border-slate-150">
      <h3 class="font-bold text-xs uppercase tracking-wider text-slate-400 mb-4">Focus Areas</h3>
      <ul class="space-y-2 text-xs font-medium text-slate-700 list-none p-0">
        <li>• Responsive UI Systems</li>
        <li>• In-browser DB Caching</li>
        <li>• Serverless OAuth Flow</li>
      </ul>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'our-work',
        order: 2,
        isVisible: true,
        html: `<section data-folient-section-id="our-work" class="py-20 px-8 bg-slate-50 text-slate-900 border-b border-slate-100">
  <div class="max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold mb-10 text-center">Selected Shipments</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="bg-white border border-slate-150 rounded-2xl overflow-hidden hover:scale-[1.01] transition-transform">
        <div class="h-44 bg-slate-100 flex items-center justify-center text-slate-400">
          <span class="material-symbols-outlined text-4xl">web</span>
        </div>
        <div class="p-6">
          <h3 class="text-sm font-bold mb-1">Vanguard Client portal</h3>
          <span class="text-[10px] text-slate-500">React & Supabase</span>
        </div>
      </div>
      <div class="bg-white border border-slate-150 rounded-2xl overflow-hidden hover:scale-[1.01] transition-transform">
        <div class="h-44 bg-slate-100 flex items-center justify-center text-slate-400">
          <span class="material-symbols-outlined text-4xl">phone_iphone</span>
        </div>
        <div class="p-6">
          <h3 class="text-sm font-bold mb-1">Decentralized Asset App</h3>
          <span class="text-[10px] text-slate-500">Mobile UI & Crypto</span>
        </div>
      </div>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'process',
        order: 3,
        isVisible: true,
        html: `<section data-folient-section-id="process" class="py-20 px-8 bg-white text-slate-900 border-b border-slate-100">
  <div class="max-w-3xl mx-auto">
    <h2 class="text-2xl font-bold mb-12 text-center">Our Process</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="p-5 bg-slate-50 border border-slate-150 rounded-xl relative">
        <span class="text-3xl font-extrabold text-slate-200 block mb-2">01</span>
        <h3 class="font-bold text-xs mb-1">Prompt Spec</h3>
        <p class="text-[10px] text-slate-500">Outline requirements and select starting layout templates.</p>
      </div>
      <div class="p-5 bg-slate-50 border border-slate-150 rounded-xl relative">
        <span class="text-3xl font-extrabold text-slate-200 block mb-2">02</span>
        <h3 class="font-bold text-xs mb-1">AI Compile</h3>
        <p class="text-[10px] text-slate-500">Generate section codes and configure style variables in-browser.</p>
      </div>
      <div class="p-5 bg-slate-50 border border-slate-150 rounded-xl relative">
        <span class="text-3xl font-extrabold text-slate-200 block mb-2">03</span>
        <h3 class="font-bold text-xs mb-1">Deploy Site</h3>
        <p class="text-[10px] text-slate-500">Post zip binaries directly to Vercel or Netlify Edge servers.</p>
      </div>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'team',
        order: 4,
        isVisible: true,
        html: `<section data-folient-section-id="team" class="py-20 px-8 bg-slate-50 text-slate-900 border-b border-slate-100">
  <div class="max-w-3xl mx-auto">
    <h2 class="text-2xl font-bold mb-12 text-center">Core Operators</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="p-5 bg-white border border-slate-150 rounded-2xl flex items-center gap-4">
        <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">A</div>
        <div>
          <h3 class="font-bold text-xs">Abhijith</h3>
          <span class="text-[10px] text-slate-500">Systems Director</span>
        </div>
      </div>
      <div class="p-5 bg-white border border-slate-150 rounded-2xl flex items-center gap-4">
        <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">R</div>
        <div>
          <h3 class="font-bold text-xs">Robin</h3>
          <span class="text-[10px] text-slate-500">Interface Lead</span>
        </div>
      </div>
    </div>
  </div>
</section>`
      },
      {
        sectionId: 'contact',
        order: 5,
        isVisible: true,
        html: `<section data-folient-section-id="contact" class="py-20 px-8 bg-white text-slate-900 text-center">
  <h2 class="text-2xl font-bold mb-4">Start Building With Us</h2>
  <p class="text-xs text-slate-500 max-w-xs mx-auto mb-6">Connect with Axion Studio for custom SaaS apps, zero-backend pipelines, and premium design.</p>
  <a href="mailto:axion@example.com" class="inline-block bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:scale-[1.02] transition-transform">axion@example.com</a>
</section>`
      }
    ]
  }
];
