/**
 * FitGirl Repacks Archive Scanner - Editorial Warm Theme
 * Features a Light/Dark mode toggle, an organic cream-toned aesthetic,
 * deep metadata extraction, live result filtering, and ULTRA-FAST concurrent scraping.
 * 
 * Crafted with ❤️ by pavnxet
 * https://pavnxet.github.io/
 */

// ==========================================
// 1. PARSING ENGINE
// ==========================================
// Extracted to a separate function for cleaner concurrent mapping
function parseHtml(html) {
    let games = [];
    // Support both h1 and h2 for entry-title to be robust against theme changes
    const postRegex = /<h[12][^>]*class="[^"]*entry-title[^"]*"[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>\s*<\/h[12]>([\s\S]*?)(?=<h[12][^>]*class="[^"]*entry-title[^"]*"|$)/gi;

    let match;
    while ((match = postRegex.exec(html)) !== null) {
        const url = match[1];
        const title = match[2].replace(/<[^>]+>/g, '').trim();
        const content = match[3];

        const extractField = (label, nextLabel) => {
            const regex = new RegExp(`${label}:\s*([\s\S]*?)(?=<br\s*\\/?>|${nextLabel}:)`, 'i');
            const m = content.match(regex);
            return m ? m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';
        };

        const genres = extractField('Genres\\/Tags', 'Companies');
        const companies = extractField('Companies', 'Languages');
        const languages = extractField('Languages', 'Original Size');
        const originalSize = extractField('Original Size', 'Repack Size');

        const repackSizeMatch = content.match(/Repack Size:\s*([\s\S]*?)(?=<br\s*\/?>|<\/p>|Download Mirrors)/i);
        const repackSize = repackSizeMatch ? repackSizeMatch[1].replace(/<[^>]+>/g, '').trim() : '';

        games.push({
            url,
            title,
            genres,
            companies,
            languages,
            originalSize,
            repackSize
        });
    }
    return games;
}

// ==========================================
// 2. BACKEND LOGIC (ULTRA-FAST CONCURRENT)
// ==========================================
function getPageUrl(baseUrl, pageNum) {
    let url = baseUrl.replace(/\/+$/, '');
    if (url.match(/\/page\/\d+$/)) return url.replace(/\/page\/\d+$/, `/page/${pageNum}`);
    return `${url}/page/${pageNum}/`;
}

async function scrapePages(baseUrl, startPage, endPage) {
    let allGames = [];
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Fetch-Dest': 'document', 'Sec-Fetch-Mode': 'navigate', 'Sec-Fetch-Site': 'none'
    };

    // ULTRA-FAST CONCURRENCY SETTINGS
    const concurrency = 10; // Fetch 10 pages simultaneously
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    // Process in chunks to avoid hitting WAF rate limits while maximizing speed
    for (let i = 0; i < pages.length; i += concurrency) {
        const chunk = pages.slice(i, i + concurrency);
        const promises = chunk.map(async (pageNum) => {
            const targetUrl = getPageUrl(baseUrl, pageNum);
            try {
                // Add a tiny random delay to each request in the chunk to look more human and avoid burst blocks
                await new Promise(resolve => setTimeout(resolve, Math.random() * 200));
                const response = await fetch(targetUrl, { headers });
                if (!response.ok) return [];
                const html = await response.text();
                return parseHtml(html);
            } catch (error) {
                console.error(`Error page ${pageNum}:`, error);
                return [];
            }
        });

        const results = await Promise.all(promises);
        results.forEach(games => allGames.push(...games));
    }

    return allGames;
}

// ==========================================
// 3. FRONTEND GUI (Warm Editorial Theme)
// ==========================================
function renderGUI() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Archive Scanner</title>
  <!-- Crafted with ❤️ by pavnxet | https://pavnxet.github.io/ -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = { darkMode: 'class' }
  </script>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,600;9..144,700;9..144,800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    /* --- CORE THEME VARIABLES --- */
    :root {
      --bg-base: #F7F4EE;
      --bg-surface-1: #FFFFFF;
      --bg-surface-2: #EFEAE0;
      --bg-surface-3: #E5DFD3;
      --text-primary: #26211D;
      --text-secondary: #635C54;
      --text-muted: #948C82;
      --accent: #B85135; /* Terracotta */
      --accent-hover: #9A4128;
      --accent-muted: rgba(184, 81, 53, 0.08);
      --border: rgba(38, 33, 29, 0.08);
      --shadow-sm: 0 2px 8px rgba(120, 100, 80, 0.04);
      --shadow-md: 0 8px 24px rgba(120, 100, 80, 0.08);
      --glass-bg: rgba(255, 253, 249, 0.75);
      --glass-border: rgba(255, 255, 255, 0.8);
      --glass-shadow: 0 8px 32px rgba(120, 100, 80, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9);
    }

    .dark {
      --bg-base: #14110F;
      --bg-surface-1: #1C1815;
      --bg-surface-2: #25201C;
      --bg-surface-3: #302A25;
      --text-primary: #F2EBE1;
      --text-secondary: #B5ACA0;
      --text-muted: #7A7166;
      --accent: #E0825D; /* Warm Amber */
      --accent-hover: #F09876;
      --accent-muted: rgba(224, 130, 93, 0.12);
      --border: rgba(242, 235, 225, 0.06);
      --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
      --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.3);
      --glass-bg: rgba(28, 24, 21, 0.65);
      --glass-border: rgba(255, 255, 255, 0.04);
      --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.03);
    }

    /* --- BASE & TYPOGRAPHY --- */
    body {
      font-family: 'DM Sans', sans-serif;
      background-color: var(--bg-base);
      color: var(--text-primary);
      transition: background-color 0.4s ease, color 0.4s ease;
      background-image: radial-gradient(var(--border) 1px, transparent 1px);
      background-size: 24px 24px;
      min-height: 100vh;
    }

    h1, h2, h3 {
      font-family: 'Fraunces', serif;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }
    h1 { font-size: 2.5rem; font-weight: 700; line-height: 1.1; }
    h2 { font-size: 1.75rem; font-weight: 600; }
    h3 { font-size: 1.25rem; font-weight: 600; }
    
    .mono { font-family: 'JetBrains Mono', monospace; }

    /* --- GLASSMORPHISM & SURFACES --- */
    .glass-panel {
      background: var(--glass-bg);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      border-radius: 24px;
      box-shadow: var(--glass-shadow);
    }

    .glass-inner {
      background: var(--bg-surface-1);
      border: 1px solid var(--border);
      border-radius: 16px;
      box-shadow: var(--shadow-sm);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .dark .glass-inner { background: var(--bg-surface-2); }
    
    .glass-inner:hover {
      border-color: var(--accent);
      transform: translateY(-3px);
      box-shadow: var(--shadow-md);
    }

    /* --- INPUTS & BUTTONS --- */
    .input-field {
      background: var(--bg-surface-2);
      border: 1px solid var(--border);
      color: var(--text-primary);
      border-radius: 12px;
      padding: 14px 16px;
      font-size: 0.9rem;
      width: 100%;
      transition: all 0.2s ease;
    }
    .input-field::placeholder { color: var(--text-muted); }
    .input-field:focus {
      outline: none;
      border-color: var(--accent);
      background: var(--bg-surface-1);
      box-shadow: 0 0 0 4px var(--accent-muted);
    }

    .btn-primary {
      background: var(--accent);
      color: #FFFFFF;
      font-weight: 600;
      border: none;
      border-radius: 12px;
      box-shadow: 0 4px 12px var(--accent-muted);
      transition: all 0.2s ease;
    }
    .btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); }
    .btn-primary:active { transform: scale(0.98); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .btn-secondary {
      background: var(--bg-surface-2);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      border-radius: 12px;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .btn-secondary:hover { background: var(--bg-surface-3); color: var(--text-primary); }

    /* --- BADGES & TAGS --- */
    .badge {
      padding: 6px 12px;
      border-radius: 99px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: var(--accent-muted);
      border: 1px solid rgba(184, 81, 53, 0.2);
      color: var(--accent);
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .dark .badge { border-color: rgba(224, 130, 93, 0.3); }

    .badge-id {
      background: var(--bg-surface-2);
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 4px 8px;
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
    }

    /* --- THEME TOGGLE --- */
    .theme-toggle {
      width: 44px; height: 44px;
      border-radius: 50%;
      background: var(--glass-bg);
      backdrop-filter: blur(10px);
      border: 1px solid var(--glass-border);
      display: flex; align-items: center; justify-content: center;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: var(--shadow-sm);
    }
    .theme-toggle:hover { color: var(--accent); transform: rotate(15deg); }

    /* --- VIEW TOGGLE --- */
    .view-btn {
      color: var(--text-muted);
      background: transparent;
      transition: all 0.2s ease;
    }
    .view-btn:hover {
      color: var(--text-primary);
    }
    .view-btn.active {
      background: var(--bg-surface-1);
      color: var(--accent);
      box-shadow: var(--shadow-sm);
    }
    .dark .view-btn.active {
      background: var(--bg-surface-3);
    }

    /* --- SCROLLBARS --- */
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

    /* --- ANIMATIONS --- */
    @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    .fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
    
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    
    /* Progress Bar */
    .progress-track { background: var(--bg-surface-2); }
    .progress-fill { background: var(--accent); }
  </style>
</head>
<body class="antialiased">
  <div class="max-w-4xl mx-auto px-6 py-12 md:py-20">
    
    <!-- HEADER -->
    <header class="flex justify-between items-start mb-16 fade-up">
      <div>
        <div class="badge mb-6">
          <span class="w-1.5 h-1.5 rounded-full" style="background-color: var(--accent);"></span>
          Archive Extractor
        </div>
        <h1>FitGirl Repacks</h1>
        <p class="mt-4 max-w-md text-lg leading-relaxed" style="color: var(--text-secondary);">A quiet tool for scanning the archives. Extracting metadata and download links with organic precision.</p>
      </div>
      <button id="themeToggle" class="theme-toggle" aria-label="Toggle theme">
        <!-- Sun Icon (Visible in Dark Mode) -->
        <svg class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
        <!-- Moon Icon (Visible in Light Mode) -->
        <svg class="w-5 h-5 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
      </button>
    </header>

    <!-- CONTROL PANEL -->
    <div class="glass-panel p-8 mb-12 fade-up" style="animation-delay: 100ms;">
      <form id="scanForm" class="space-y-6">
        <div>
          <label class="block text-sm font-medium mb-2" style="color: var(--text-muted);">Target Base URL</label>
          <input type="text" id="baseUrl" class="input-field mono text-sm" value="https://fitgirl-repacks.site/2026/05/page/1/" required>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium mb-2" style="color: var(--text-muted);">Start Page</label>
            <input type="number" id="startPage" class="input-field mono text-center" value="1" min="1" required>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2" style="color: var(--text-muted);">End Page</label>
            <input type="number" id="endPage" class="input-field mono text-center" value="20" min="1" required>
          </div>
          <div class="flex items-end">
            <button type="submit" id="submitBtn" class="btn-primary w-full py-3.5 px-6 flex items-center justify-center gap-2">
              <svg id="btnIcon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              <span id="btnText">Begin Extraction</span>
            </button>
          </div>
        </div>
      </form>

      <!-- PROGRESS BAR -->
      <div id="progressContainer" class="hidden mt-8 pt-8 border-t" style="border-color: var(--border);">
        <div class="flex justify-between items-center mb-3">
          <span class="text-sm" id="progressStatus" style="color: var(--text-secondary);">Reading the archives...</span>
          <span class="mono text-xs" id="progressPercent" style="color: var(--text-muted);">0%</span>
        </div>
        <div class="w-full h-1.5 progress-track rounded-full overflow-hidden">
          <div id="progressBar" class="h-full progress-fill rounded-full transition-all duration-300" style="width: 0%"></div>
        </div>
      </div>
    </div>

    <!-- RESULTS AREA -->
    <div id="results"></div>

    <!-- FOOTER WATERMARK -->
    <footer class="mt-16 pt-8 border-t text-center fade-up" style="border-color: var(--border); animation-delay: 200ms;">
      <p class="text-sm" style="color: var(--text-muted);">
        Made with <span style="color: var(--accent);">❤️</span> by 
        <a href="https://pavnxet.github.io/" target="_blank" rel="noopener noreferrer" class="font-semibold hover:underline" style="color: var(--text-secondary);">pavnxet</a>
      </p>
    </footer>
  </div>

  <script>
    // Crafted with ❤️ by pavnxet (https://pavnxet.github.io/)
    
    // Theme Toggle Logic
    const themeToggle = document.getElementById('themeToggle');
    const root = document.documentElement;
    const currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (currentTheme === 'dark') root.classList.add('dark');

    themeToggle.addEventListener('click', () => {
      root.classList.toggle('dark');
      localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
    });

    let progressInterval;
    let allScrapedData = [];
    let currentView = 'grid'; // 'grid' or 'list'
    
    function startProgress() {
      let width = 0;
      const bar = document.getElementById('progressBar');
      const status = document.getElementById('progressStatus');
      const percent = document.getElementById('progressPercent');
      const container = document.getElementById('progressContainer');
      const btn = document.getElementById('submitBtn');
      
      btn.disabled = true;
      document.getElementById('btnText').innerText = 'Extracting...';
      container.classList.remove('hidden');
      
      const messages = ['Connecting to nodes...', 'Gathering metadata concurrently...', 'Organizing links...', 'Almost done...'];
      let msgIndex = 0;
      
      // Sped up interval to match ultra-fast backend
      progressInterval = setInterval(() => {
        if (width < 90) {
          width += Math.random() * 15; 
          if (width > 90) width = 90;
          bar.style.width = width + '%';
          percent.innerText = Math.round(width) + '%';
          if (width > (msgIndex + 1) * (90 / messages.length)) {
            msgIndex = Math.min(msgIndex + 1, messages.length - 1);
            status.innerText = messages[msgIndex];
          }
        }
      }, 150);
    }

    function finishProgress(success) {
      clearInterval(progressInterval);
      const bar = document.getElementById('progressBar');
      const status = document.getElementById('progressStatus');
      const percent = document.getElementById('progressPercent');
      const btn = document.getElementById('submitBtn');
      
      bar.style.width = '100%';
      percent.innerText = '100%';
      status.innerText = success ? 'Extraction complete.' : 'Extraction failed.';
      
      setTimeout(() => {
        document.getElementById('progressContainer').classList.add('hidden');
        bar.style.width = '0%';
        btn.disabled = false;
        document.getElementById('btnText').innerText = 'Begin Extraction';
      }, 500);
    }

    window.copyToClipboard = function(text, btn) {
      navigator.clipboard.writeText(text).then(() => {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<svg class="w-4 h-4" style="color: var(--accent);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
        setTimeout(() => { btn.innerHTML = originalHTML; }, 2000);
      });
    }

    function parseSizeToMB(sizeStr) {
      if (!sizeStr) return Infinity;
      const sizes = sizeStr.match(/([\d.]+)\s*(GB|MB)/gi);
      if (!sizes) return Infinity;
      
      let maxMB = 0;
      sizes.forEach(s => {
        const m = s.match(/([\d.]+)\s*(GB|MB)/i);
        if (m) {
          const v = parseFloat(m[1]);
          const u = m[2].toUpperCase();
          const mb = u === 'GB' ? v * 1024 : v;
          if (mb > maxMB) maxMB = mb;
        }
      });
      return maxMB;
    }

    function setView(mode) {
      currentView = mode;
      document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
      document.getElementById(mode === 'grid' ? 'viewGrid' : 'viewList').classList.add('active');
      
      const gridDiv = document.getElementById('resultsGrid');
      if (gridDiv && allScrapedData.length > 0) {
        renderResultsGrid(allScrapedData);
      }
    }

    function applyFilters() {
      const searchTerm = document.getElementById('filterSearch').value.toLowerCase().trim();
      const maxSizeStr = document.getElementById('filterSize').value.toLowerCase().trim();
      
      let maxSizeMB = Infinity;
      if (maxSizeStr) {
        const match = maxSizeStr.match(/([\d.]+)\s*(gb|mb)?/i);
        if (match) {
          const val = parseFloat(match[1]);
          const unit = match[2] ? match[2].toUpperCase() : 'GB';
          maxSizeMB = unit === 'GB' ? val * 1024 : val;
        }
      }

      const filtered = allScrapedData.filter(game => {
        if (searchTerm) {
          const searchBlob = `${game.title || ''} ${game.genres || ''} ${game.companies || ''} ${game.languages || ''}`.toLowerCase();
          if (!searchBlob.includes(searchTerm)) return false;
        }
        
        if (maxSizeMB < Infinity) {
          const gameMaxMB = parseSizeToMB(game.repackSize);
          if (gameMaxMB > maxSizeMB) return false;
        }
        
        return true;
      });

      document.getElementById('filterStats').innerText = `Showing ${filtered.length} of ${allScrapedData.length} entries`;
      renderResultsGrid(filtered);
      updateExportLinks(filtered);
    }

    function updateExportLinks(data) {
      const csvHeaders = ["Title", "URL", "Genres", "Companies", "Languages", "Original Size", "Repack Size"];
      const csvRows = data.map(g => [
        `"${g.title.replace(/"/g, '""')}"`,
        g.url,
        `"${(g.genres || '').replace(/"/g, '""')}"`,
        `"${(g.companies || '').replace(/"/g, '""')}"`,
        `"${(g.languages || '').replace(/"/g, '""')}"`,
        `"${(g.originalSize || '').replace(/"/g, '""')}"`,
        `"${(g.repackSize || '').replace(/"/g, '""')}"`
      ].join(","));
      
      const csvContent = "data:text/csv;charset=utf-8," + csvHeaders.join(",") + "\n" + csvRows.join("\n");
      const jsonContent = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
      
      const csvBtn = document.getElementById('exportCsv');
      const jsonBtn = document.getElementById('exportJson');
      if (csvBtn) csvBtn.href = csvContent;
      if (jsonBtn) jsonBtn.href = jsonContent;
    }

    function renderResultsGrid(data) {
      const gridDiv = document.getElementById('resultsGrid');
      if (!gridDiv) return;
      
      // Update grid container classes based on view mode
      gridDiv.className = currentView === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 gap-4' 
        : 'flex flex-col gap-3';

      if (data.length === 0) {
        gridDiv.innerHTML = `
          <div class="glass-inner p-8 text-center fade-up col-span-full">
            <p style="color: var(--text-secondary);">No entries match your current filters.</p>
          </div>
        `;
        return;
      }

      let html = '';
      data.forEach((game, index) => {
        if (currentView === 'grid') {
          html += `
          <div class="glass-inner p-6 fade-up" style="animation-delay: ${Math.min(index * 20, 200)}ms">
            <div class="flex justify-between items-start mb-4 gap-4">
              <h3 class="leading-snug line-clamp-2" title="${game.title}">${game.title}</h3>
              <span class="badge-id whitespace-nowrap">#${String(index + 1).padStart(3, '0')}</span>
            </div>
            
            <!-- Game Details Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mb-4 text-sm" style="color: var(--text-secondary);">
              ${game.genres ? `<div class="flex gap-2"><span class="font-semibold" style="color: var(--text-primary);">Genres:</span> <span class="truncate" title="${game.genres}">${game.genres}</span></div>` : ''}
              ${game.companies ? `<div class="flex gap-2"><span class="font-semibold" style="color: var(--text-primary);">Companies:</span> <span class="truncate" title="${game.companies}">${game.companies}</span></div>` : ''}
              ${game.languages ? `<div class="flex gap-2"><span class="font-semibold" style="color: var(--text-primary);">Languages:</span> <span class="truncate" title="${game.languages}">${game.languages}</span></div>` : ''}
              <div class="flex gap-4">
                ${game.originalSize ? `<div><span class="font-semibold" style="color: var(--text-primary);">Original:</span> ${game.originalSize}</div>` : ''}
                ${game.repackSize ? `<div><span class="font-semibold" style="color: var(--accent);">Repack:</span> ${game.repackSize}</div>` : ''}
              </div>
            </div>

            <div class="flex items-center gap-3 rounded-xl p-3 border" style="background-color: var(--bg-surface-2); border-color: var(--border);">
              <code class="text-xs truncate flex-1 mono" style="color: var(--text-secondary);">${game.url}</code>
              <button onclick="copyToClipboard('${game.url}', this)" class="transition-colors p-1.5 rounded-lg hover:bg-[var(--bg-surface-3)]" style="color: var(--text-muted);" title="Copy URL">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              </button>
              <a href="${game.url}" target="_blank" class="transition-colors p-1.5 rounded-lg hover:bg-[var(--bg-surface-3)]" style="color: var(--text-muted);" title="Open Link">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </a>
            </div>
          </div>`;
        } else {
          // List View
          html += `
          <div class="glass-inner p-4 fade-up flex flex-col md:flex-row md:items-center gap-4" style="animation-delay: ${Math.min(index * 10, 100)}ms">
            <div class="flex items-center gap-4 flex-1 min-w-0">
              <span class="badge-id whitespace-nowrap">#${String(index + 1).padStart(3, '0')}</span>
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-semibold truncate leading-tight" title="${game.title}">${game.title}</h3>
                <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs" style="color: var(--text-muted);">
                  ${game.genres ? `<span class="truncate max-w-[200px]" title="${game.genres}">${game.genres}</span>` : ''}
                  ${game.genres && game.companies ? `<span>•</span>` : ''}
                  ${game.companies ? `<span class="truncate max-w-[150px]" title="${game.companies}">${game.companies}</span>` : ''}
                </div>
              </div>
            </div>
            
            <div class="flex items-center gap-6 text-xs mono shrink-0" style="color: var(--text-secondary);">
              ${game.originalSize ? `<div><span style="color: var(--text-muted);">Orig:</span> ${game.originalSize}</div>` : ''}
              <div><span style="color: var(--text-muted);">Repack:</span> <span style="color: var(--accent); font-weight: 600;">${game.repackSize || 'N/A'}</span></div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <button onclick="copyToClipboard('${game.url}', this)" class="transition-colors p-2 rounded-lg hover:bg-[var(--bg-surface-3)]" style="color: var(--text-muted);" title="Copy URL">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              </button>
              <a href="${game.url}" target="_blank" class="transition-colors p-2 rounded-lg hover:bg-[var(--bg-surface-3)]" style="color: var(--text-muted);" title="Open Link">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </a>
            </div>
          </div>`;
        }
      });
      gridDiv.innerHTML = html;
    }

    function renderResults(data) {
      allScrapedData = data;
      const resultsDiv = document.getElementById('results');
      if (!data || data.length === 0) {
        resultsDiv.innerHTML = `
          <div class="glass-panel p-8 text-center fade-up">
            <h3 class="mb-2">No Stories Found</h3>
            <p style="color: var(--text-secondary);">Verify your target URL and page range parameters.</p>
          </div>`;
        return;
      }

      let html = `
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 fade-up">
          <div>
            <h2>Scan Results</h2>
            <p class="mt-1" style="color: var(--text-secondary);">Successfully parsed <span class="mono" style="color: var(--accent);">${data.length}</span> entries.</p>
          </div>
          <div class="flex items-center gap-4">
            <!-- View Toggle -->
            <div class="flex items-center gap-1 bg-[var(--bg-surface-2)] p-1 rounded-xl border" style="border-color: var(--border);">
              <button id="viewGrid" class="p-2 rounded-lg transition-all view-btn active" title="Grid View">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
              </button>
              <button id="viewList" class="p-2 rounded-lg transition-all view-btn" title="List View">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </button>
            </div>
            <div class="flex gap-2">
              <a href="#" id="exportCsv" download="fitgirl_scrape.csv" class="btn-secondary py-2 px-3 flex items-center gap-2 text-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> 
                CSV
              </a>
              <a href="#" id="exportJson" download="fitgirl_scrape.json" class="btn-secondary py-2 px-3 flex items-center gap-2 text-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> 
                JSON
              </a>
            </div>
          </div>
        </div>

        <!-- FILTER PANEL -->
        <div class="glass-panel p-6 mb-8 fade-up" style="animation-delay: 50ms;">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: var(--accent-muted);">
              <svg class="w-4 h-4" style="color: var(--accent);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
            </div>
            <h3 class="text-lg font-semibold" style="font-family: 'Fraunces', serif;">Refine Archive</h3>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div class="md:col-span-7">
              <label class="block text-xs font-medium mb-2 uppercase tracking-wider" style="color: var(--text-muted);">Search Metadata</label>
              <input type="text" id="filterSearch" class="input-field mono text-sm" placeholder="Filter by title, genre, company, or language...">
            </div>
            <div class="md:col-span-3">
              <label class="block text-xs font-medium mb-2 uppercase tracking-wider" style="color: var(--text-muted);">Max Repack Size</label>
              <input type="text" id="filterSize" class="input-field mono text-sm" placeholder="e.g. 5 GB or 800 MB">
            </div>
            <div class="md:col-span-2 flex justify-end">
              <button id="clearFilters" class="btn-secondary w-full py-3 px-4 flex items-center justify-center gap-2 text-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                Reset
              </button>
            </div>
          </div>
          <div class="mt-5 pt-4 border-t flex items-center gap-2" style="border-color: var(--border);">
            <span class="text-xs font-medium mono" style="color: var(--text-muted);" id="filterStats">Showing ${data.length} of ${data.length} entries</span>
          </div>
        </div>

        <div id="resultsGrid" class="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
      `;
      
      resultsDiv.innerHTML = html;
      
      // Attach view toggle listeners
      document.getElementById('viewGrid').addEventListener('click', () => setView('grid'));
      document.getElementById('viewList').addEventListener('click', () => setView('list'));
      
      document.getElementById('filterSearch').addEventListener('input', applyFilters);
      document.getElementById('filterSize').addEventListener('input', applyFilters);
      document.getElementById('clearFilters').addEventListener('click', () => {
        document.getElementById('filterSearch').value = '';
        document.getElementById('filterSize').value = '';
        applyFilters();
      });
      
      renderResultsGrid(data);
      updateExportLinks(data);
    }

    document.getElementById('scanForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = document.getElementById('baseUrl').value;
      const start = document.getElementById('startPage').value;
      const end = document.getElementById('endPage').value;
      const resultsDiv = document.getElementById('results');
      resultsDiv.innerHTML = '';
      
      startProgress();
      try {
        const res = await fetch(`/api/scan?url=${encodeURIComponent(url)}&start=${start}&end=${end}`);
        const data = await res.json();
        finishProgress(true);
        if (data.error) throw new Error(data.error);
        setTimeout(() => renderResults(data), 300);
      } catch (err) {
        finishProgress(false);
        resultsDiv.innerHTML = `
          <div class="glass-panel p-6 fade-up" style="border-color: var(--accent); border-width: 1px;">
            <p class="font-medium" style="color: var(--accent);">Error: ${err.message}</p>
          </div>`;
      }
    });
  </script>
</body>
</html>
  `;
}

// ==========================================
// 4. ROUTING & MAIN WORKER LOGIC
// ==========================================
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        if (url.pathname === '/' && request.method === 'GET') {
            return new Response(renderGUI(), { headers: { 'content-type': 'text/html;charset=UTF-8' } });
        }

        if (url.pathname === '/api/scan' && request.method === 'GET') {
            const targetUrl = url.searchParams.get('url');
            const startPage = parseInt(url.searchParams.get('start') || '1');
            const endPage = parseInt(url.searchParams.get('end') || '1');

            if (!targetUrl) return new Response(JSON.stringify({ error: 'Missing URL parameter' }), { status: 400, headers: { 'content-type': 'application/json' } });

            try {
                const games = await scrapePages(targetUrl, startPage, endPage);
                return new Response(JSON.stringify(games), { headers: { 'content-type': 'application/json' } });
            } catch (error) {
                return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'content-type': 'application/json' } });
            }
        }

        return new Response('Not Found', { status: 404 });
    },
};
