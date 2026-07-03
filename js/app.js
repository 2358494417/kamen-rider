/* ============================================
   假面骑士英雄档案 - 前端逻辑
   ============================================ */

// --- 全局状态 ---
let currentFilter = 'all';
let searchQuery = '';
let isLoggedIn = false;
let currentUser = null;

// --- 初始化 ---
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  document.getElementById('searchInput').value = '';
  document.getElementById('searchClear').classList.add('hidden');
  searchQuery = '';
  currentFilter = 'all';
  document.getElementById('statCount').textContent = allRiders.length;

  checkLocalAuth();
  bindEvents();
  renderRiders();
}

// --- 本地认证 (模拟) ---
function checkLocalAuth() {
  const saved = localStorage.getItem('kamen_rider_user');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      isLoggedIn = true;
      updateAuthUI();
    } catch(e) {
      localStorage.removeItem('kamen_rider_user');
    }
  }
}

function updateAuthUI() {
  const btnLogin = document.getElementById('btnShowLogin');
  const userMenu = document.getElementById('userMenu');
  const userGreeting = document.getElementById('userGreeting');

  if (isLoggedIn && currentUser) {
    btnLogin.classList.add('hidden');
    userMenu.classList.remove('hidden');
    userGreeting.textContent = '🦗 ' + currentUser.username;
  } else {
    btnLogin.classList.remove('hidden');
    userMenu.classList.add('hidden');
    userGreeting.textContent = '';
  }
}

// --- 搜索和过滤 ---
function filterRiders() {
  return allRiders.filter(rider => {
    if (currentFilter !== 'all' && rider.category !== currentFilter) return false;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const searchTarget = [
        rider.name, rider.nameEn, rider.era, rider.humanHost,
        rider.homePlanet, rider.transformationItem,
        rider.description, rider.story,
        ...(rider.abilities || [])
      ].join(' ').toLowerCase();
      return searchTarget.includes(query);
    }

    return true;
  });
}

// --- 渲染 ---
function renderRiders() {
  const grid = document.getElementById('heroesGrid');
  const noResults = document.getElementById('noResults');
  const filtered = filterRiders();

  if (filtered.length === 0) {
    grid.innerHTML = '';
    noResults.classList.remove('hidden');
  } else {
    noResults.classList.add('hidden');
    grid.innerHTML = filtered.map(rider => createRiderCard(rider)).join('');
    // After cards are rendered, lazy-load real images
    setTimeout(loadRiderImages, 100);
  }
}

// Load real images after cards are rendered (replacing SVG placeholders)
function loadRiderImages() {
  var posters = document.querySelectorAll('.card-poster[data-img]');
  posters.forEach(function(poster) {
    var imgSrc = poster.getAttribute('data-img');
    var img = new Image();
    img.onload = function() {
      // Replace SVG content with the real image
      poster.innerHTML = '<img src="' + imgSrc + '" alt="" class="poster-img">';
    };
    img.onerror = function() {
      // Keep SVG fallback, remove data-img to mark as done
      poster.removeAttribute('data-img');
    };
    // Start loading
    img.src = imgSrc;
  });
}

function createRiderCard(rider) {
  const eraIcons = { showa: '🌟', heisei: '💎', reiwa: '🚀' };
  const eraIcon = eraIcons[rider.category] || '⚡';
  const imgPath = 'img/heroes/' + rider.id + '.png';

  return `
    <div class="hero-card" data-id="${rider.id}" style="--card-color: ${rider.color}" onclick="showRiderDetail(${rider.id})">
      <div class="card-image">
        <div class="card-poster" data-img="${imgPath}" data-id="${rider.id}">
          ${generateRiderPosterSVG(rider, 300, 360)}
        </div>
        <div class="card-era-badge" style="color: ${rider.color}; border-color: ${rider.color}">
          ${eraIcon} ${rider.era}
        </div>
      </div>
      <div class="card-body">
        <h3 class="card-name">${rider.name}</h3>
        <p class="card-name-en">${rider.nameEn} · ${rider.debut}</p>
        <div class="card-meta">
          <span class="card-tag">📏 ${rider.height}</span>
          <span class="card-tag">⚖️ ${rider.weight}</span>
          <span class="card-tag">👤 ${rider.humanHost}</span>
        </div>
        <p class="card-desc">${rider.description}</p>
        <div class="card-abilities">
          ${(rider.abilities || []).slice(0, 3).map(a => `<span class="ability-tag">⚡ ${a}</span>`).join('')}
          ${(rider.abilities || []).length > 3 ? `<span class="ability-tag">+${rider.abilities.length - 3}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

// ============================================
// 海报 SVG 生成器 - 每个假面骑士的独特海报
// ============================================
function generateRiderPosterSVG(rider, w, h) {
  const id = rider.id;
  const c1 = rider.color;
  const c2 = rider.colorSecondary || '#C0C0C0';

  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}" stop-opacity="0.9"/>
        <stop offset="40%" stop-color="${adjustColor(c1, -40)}" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#0a0a15" stop-opacity="1"/>
      </linearGradient>
      <linearGradient id="suit_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="50%" stop-color="${c2}"/>
        <stop offset="100%" stop-color="${c1}"/>
      </linearGradient>
      <radialGradient id="glow_${id}" cx="50%" cy="35%" r="55%">
        <stop offset="0%" stop-color="${c1}" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="${c1}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="eye_${id}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ff0000" stop-opacity="0.95"/>
        <stop offset="40%" stop-color="#cc0000" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="#550000" stop-opacity="0.7"/>
      </radialGradient>
      <filter id="shine_${id}">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    <!-- 背景 -->
    <rect width="${w}" height="${h}" fill="url(#bg_${id})"/>
    <rect width="${w}" height="${h}" fill="url(#glow_${id})"/>

    <!-- 星星 / 粒子背景 -->
    ${generateStars(w, h, id, c1)}

    <!-- 底部光晕 -->
    <ellipse cx="${w/2}" cy="${h*0.85}" rx="${w*0.4}" ry="${h*0.12}" fill="${c1}" opacity="0.1">
      <animate attributeName="opacity" values="0.1;0.2;0.1" dur="2s" repeatCount="indefinite"/>
    </ellipse>

    <!-- 假面骑士身体 -->
    <g filter="url(#shine_${id})">
      ${generateRiderBody(w, h, id, c1, c2)}
    </g>

    <!-- 红色复眼 -->
    ${generateRiderEyes(w, h, id)}

    <!-- 名字 -->
    <rect x="${w*0.06}" y="${h*0.80}" width="${w*0.88}" height="${h*0.11}" rx="8" fill="rgba(0,0,0,0.75)" stroke="${c1}" stroke-width="1.5" stroke-opacity="0.6"/>
    <text x="${w/2}" y="${h*0.875}" text-anchor="middle" fill="white" font-size="${w*0.062}" font-weight="900" letter-spacing="2">${rider.name}</text>

    <!-- 英文名 -->
    <text x="${w/2}" y="${h*0.955}" text-anchor="middle" fill="${c1}" font-size="${w*0.04}" font-weight="600" letter-spacing="1" opacity="0.8">${rider.nameEn}</text>
  </svg>`;
}

function generateRiderBody(w, h, id, c1, c2) {
  const cx = w / 2;
  const headCY = h * 0.18;
  const bodyCY = h * 0.46;
  const bodyW = w * 0.22;
  const bodyH = h * 0.26;

  return `
    <!-- 双腿 -->
    <path d="M${cx - bodyW*0.4} ${bodyCY + bodyH*0.65}
             L${cx - bodyW*0.5} ${bodyCY + bodyH*1.2}
             L${cx - bodyW*0.05} ${bodyCY + bodyH*1.2}
             L${cx - bodyW*0.1} ${bodyCY + bodyH*0.65} Z"
          fill="url(#suit_${id})" opacity="0.9"/>
    <path d="M${cx + bodyW*0.1} ${bodyCY + bodyH*0.65}
             L${cx + bodyW*0.05} ${bodyCY + bodyH*1.2}
             L${cx + bodyW*0.5} ${bodyCY + bodyH*1.2}
             L${cx + bodyW*0.4} ${bodyCY + bodyH*0.65} Z"
          fill="url(#suit_${id})" opacity="0.9"/>

    <!-- 躯干 -->
    <path d="M${cx - bodyW*0.5} ${bodyCY - bodyH*0.35}
             L${cx + bodyW*0.5} ${bodyCY - bodyH*0.35}
             L${cx + bodyW*0.45} ${bodyCY + bodyH*0.5}
             L${cx - bodyW*0.45} ${bodyCY + bodyH*0.5} Z"
          fill="url(#suit_${id})" opacity="0.95"/>

    <!-- 装甲条纹（躯干） -->
    <line x1="${cx - bodyW*0.2}" y1="${bodyCY - bodyH*0.2}" x2="${cx + bodyW*0.2}" y2="${bodyCY - bodyH*0.2}"
          stroke="${c2}" stroke-width="2" opacity="0.6"/>
    <line x1="${cx - bodyW*0.3}" y1="${bodyCY + bodyH*0.1}" x2="${cx + bodyW*0.3}" y2="${bodyCY + bodyH*0.1}"
          stroke="${c2}" stroke-width="2" opacity="0.6"/>

    <!-- 左臂 -->
    <path d="M${cx - bodyW*0.48} ${bodyCY - bodyH*0.3}
             L${cx - bodyW*0.68} ${bodyCY + bodyH*0.15}
             L${cx - bodyW*0.38} ${bodyCY + bodyH*0.25}
             L${cx - bodyW*0.28} ${bodyCY - bodyH*0.1} Z"
          fill="url(#suit_${id})" opacity="0.9"/>

    <!-- 右臂（上举，经典变身姿势） -->
    <path d="M${cx + bodyW*0.28} ${bodyCY - bodyH*0.1}
             L${cx + bodyW*0.4} ${bodyCY + bodyH*0.25}
             L${cx + bodyW*0.7} ${bodyCY + bodyH*0.15}
             L${cx + bodyW*0.48} ${bodyCY - bodyH*0.3} Z"
          fill="url(#suit_${id})" opacity="0.9"/>

    <!-- 头部 / 头盔 -->
    <ellipse cx="${cx}" cy="${headCY}" rx="${bodyW*0.5}" ry="${bodyH*0.35}"
             fill="url(#suit_${id})" opacity="0.95"/>

    <!-- 头盔顶部装饰（触角 / 天线） -->
    <line x1="${cx - bodyW*0.08}" y1="${headCY - bodyH*0.33}" x2="${cx - bodyW*0.18}" y2="${headCY - bodyH*0.55}"
          stroke="${c2}" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/>
    <line x1="${cx + bodyW*0.08}" y1="${headCY - bodyH*0.33}" x2="${cx + bodyW*0.18}" y2="${headCY - bodyH*0.55}"
          stroke="${c2}" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/>

    <!-- 头盔面部银色条纹 -->
    <path d="M${cx - bodyW*0.25} ${headCY - bodyH*0.1}
             Q${cx} ${headCY + bodyH*0.05} ${cx + bodyW*0.25} ${headCY - bodyH*0.1}"
          fill="none" stroke="${c2}" stroke-width="2" opacity="0.6"/>

    <!-- 嘴部装甲 -->
    <rect x="${cx - bodyW*0.15}" y="${headCY + bodyH*0.05}" width="${bodyW*0.3}" height="${bodyH*0.06}" rx="2"
          fill="${c2}" opacity="0.5"/>

    <!-- 围巾 / 领巾（假面骑士标志性元素） -->
    <path d="M${cx - bodyW*0.35} ${bodyCY - bodyH*0.2}
             Q${cx - bodyW*0.8} ${bodyCY - bodyH*0.05} ${cx - bodyW*0.95} ${bodyCY + bodyH*0.4}"
          fill="none" stroke="#cc0000" stroke-width="6" opacity="0.7" stroke-linecap="round">
      <animate attributeName="opacity" values="0.7;0.4;0.7" dur="2.5s" repeatCount="indefinite"/>
    </path>
  `;
}

function generateRiderEyes(w, h, id) {
  const cx = w / 2;
  const headCY = h * 0.18;
  const bodyW = w * 0.22;
  const bodyH = h * 0.26;

  // 两只红色复眼（经典假面骑士设计）
  return `
    <!-- 左复眼 -->
    <ellipse cx="${cx - bodyW*0.2}" cy="${headCY - bodyH*0.08}"
             rx="${bodyW*0.14}" ry="${bodyH*0.07}"
             fill="url(#eye_${id})" opacity="0.9">
      <animate attributeName="opacity" values="0.9;0.6;0.9" dur="2s" repeatCount="indefinite"/>
    </ellipse>
    <!-- 右复眼 -->
    <ellipse cx="${cx + bodyW*0.2}" cy="${headCY - bodyH*0.08}"
             rx="${bodyW*0.14}" ry="${bodyH*0.07}"
             fill="url(#eye_${id})" opacity="0.9">
      <animate attributeName="opacity" values="0.9;0.6;0.9" dur="2s" repeatCount="indefinite"/>
    </ellipse>
    <!-- 复眼高光 -->
    <ellipse cx="${cx - bodyW*0.2}" cy="${headCY - bodyH*0.1}"
             rx="${bodyW*0.06}" ry="${bodyH*0.025}" fill="white" opacity="0.4"/>
    <ellipse cx="${cx + bodyW*0.2}" cy="${headCY - bodyH*0.1}"
             rx="${bodyW*0.06}" ry="${bodyH*0.025}" fill="white" opacity="0.4"/>
  `;
}

function generateStars(w, h, id, c1) {
  let stars = '';
  const seed = id * 137.5;
  for (let i = 0; i < 30; i++) {
    const sx = ((seed * (i + 1) * 73) % 1000) / 1000 * w;
    const sy = ((seed * (i + 1) * 47) % 1000) / 1000 * h;
    const sr = ((seed * (i + 1) * 29) % 100) / 130 + 0.5;
    const so = ((seed * (i + 1) * 19) % 50) / 100 + 0.2;
    const twinkle = (i % 4 === 0) ?
      `<animate attributeName="opacity" values="${so};${so*2.5};${so}" dur="${1.2 + (i%3)*1.0}s" repeatCount="indefinite"/>` : '';
    const starColor = i % 5 === 0 ? c1 : (i % 3 === 0 ? '#ffffff' : '#ffcc00');
    stars += `<circle cx="${sx}" cy="${sy}" r="${sr}" fill="${starColor}" opacity="${so}">${twinkle}</circle>`;
  }
  return stars;
}

function adjustColor(hex, amount) {
  hex = hex.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substring(0,2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substring(2,4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substring(4,6), 16) + amount));
  return '#' + [r,g,b].map(c => c.toString(16).padStart(2,'0')).join('');
}

// ============================================
// 骑士详情弹窗
// ============================================
function showRiderDetail(id) {
  const rider = allRiders.find(h => h.id === id);
  if (!rider) return;

  const modal = document.getElementById('detailModal');
  const body = document.getElementById('modalBody');
  const imgPath = 'img/heroes/' + rider.id + '.png';

  body.innerHTML = `
    <div class="detail-header">
      <div class="detail-poster-wrap" data-detail-img="${imgPath}">
        ${generateRiderPosterSVG(rider, 700, 280)}
      </div>
      <div class="detail-header-info">
        <h2 class="detail-name">${rider.name}</h2>
        <p class="detail-name-en">${rider.nameEn} · 登场: ${rider.debut}年</p>
        <span class="detail-era" style="color: ${rider.color}; border-color: ${rider.color};">${rider.era}</span>
      </div>
    </div>
    <div class="detail-body">
      <div class="detail-section">
        <h3>基本资料</h3>
        <div class="detail-stats">
          <div class="detail-stat">
            <div class="detail-stat-label">身高</div>
            <div class="detail-stat-value">${rider.height}</div>
          </div>
          <div class="detail-stat">
            <div class="detail-stat-label">体重</div>
            <div class="detail-stat-value">${rider.weight}</div>
          </div>
          <div class="detail-stat">
            <div class="detail-stat-label">拳力</div>
            <div class="detail-stat-value">${rider.punchPower}</div>
          </div>
          <div class="detail-stat">
            <div class="detail-stat-label">踢力</div>
            <div class="detail-stat-value">${rider.kickPower}</div>
          </div>
          <div class="detail-stat">
            <div class="detail-stat-label">跳跃力</div>
            <div class="detail-stat-value">${rider.jumpPower}</div>
          </div>
          <div class="detail-stat">
            <div class="detail-stat-label">跑速</div>
            <div class="detail-stat-value">${rider.runSpeed}</div>
          </div>
          <div class="detail-stat">
            <div class="detail-stat-label">变身者</div>
            <div class="detail-stat-value">${rider.humanHost}</div>
          </div>
          <div class="detail-stat">
            <div class="detail-stat-label">变身道具</div>
            <div class="detail-stat-value">${rider.transformationItem}</div>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h3>必杀技 / 特殊能力</h3>
        <div class="detail-abilities">
          ${(rider.abilities || []).map(a => `<span class="detail-ability">⚡ ${a}</span>`).join('')}
        </div>
      </div>

      <div class="detail-section">
        <h3>角色介绍</h3>
        <p class="detail-text">${rider.description}</p>
      </div>

      <div class="detail-section">
        <h3>背景故事</h3>
        <p class="detail-text">${rider.story}</p>
      </div>

      ${generateVideoSection(rider)}
    </div>
  `;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Lazy-load real image for detail view (replacing SVG placeholder)
  var detailWrap = body.querySelector('.detail-poster-wrap[data-detail-img]');
  if (detailWrap) {
    var detailSrc = detailWrap.getAttribute('data-detail-img');
    var detailImg = new Image();
    detailImg.onload = function() {
      detailWrap.innerHTML = '<img src="' + detailSrc + '" alt="' + rider.name + '" class="detail-poster-img">';
    };
    detailImg.src = detailSrc;
  }
}

function closeDetailModal() {
  const iframe = document.querySelector('.detail-video-wrap iframe');
  if (iframe) iframe.src = '';
  document.getElementById('detailModal').classList.add('hidden');
  document.body.style.overflow = '';
}

function generateLoginPrompt() {
  return `
    <div class="detail-section detail-video-section">
      <h3>🔒 视频内容需要登录</h3>
      <div class="login-prompt">
        <div class="login-prompt-icon">🔐</div>
        <h4>登录后可观看相关视频</h4>
        <p>注册账号即可解锁全部骑士视频和选集功能</p>
        <button class="btn-login-prompt" onclick="showAuthModal(); event.stopPropagation();">立即登录 / 注册</button>
      </div>
    </div>
  `;
}

function generateVideoSection(rider) {
  var video = (typeof riderVideos !== 'undefined') ? riderVideos[rider.id] : null;

  if (video && video.bvid) {
    return `
    <div class="detail-section detail-video-section">
      <h3>🎬 相关视频</h3>
      <div class="detail-video-wrap" id="videoPlayer_${rider.id}">
        <iframe
          src="https://player.bilibili.com/player.html?bvid=${video.bvid}&page=1&high_quality=1&autoplay=0"
          scrolling="no" border="0" frameborder="no" framespacing="0"
          allowfullscreen="true" loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups"
          style="position:absolute;top:0;left:0;width:100%;height:100%;">
        </iframe>
      </div>
      <div class="detail-video-info">
        <span class="video-platform">📺 Bilibili</span>
        <span class="video-title">${video.title || rider.name}</span>
      </div>
    </div>`;
  } else {
    var bilibiliSearch = encodeURIComponent(rider.name + ' 假面骑士');
    return `
    <div class="detail-section detail-video-section">
      <h3>🎬 相关视频</h3>
      <div class="detail-video-wrap" style="position:relative;">
        <div class="video-placeholder">
          <span style="font-size:3rem;">🏍️</span>
          <span>暂无「${rider.name}」的专属视频</span>
          <a href="https://search.bilibili.com/all?keyword=${bilibiliSearch}" target="_blank" class="btn-video-search">
            🔍 在Bilibili搜索「${rider.name}」
          </a>
        </div>
      </div>
    </div>`;
  }
}

// ============================================
// 认证弹窗
// ============================================
function showAuthModal() {
  document.getElementById('authModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  showLoginForm();
  clearAuthErrors();
}

function closeAuthModal() {
  document.getElementById('authModal').classList.add('hidden');
  document.body.style.overflow = '';
}

function showLoginForm() {
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('registerForm').classList.add('hidden');
}

function showRegisterForm() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('registerForm').classList.remove('hidden');
}

function clearAuthErrors() {
  document.getElementById('loginError').classList.add('hidden');
  document.getElementById('registerError').classList.add('hidden');
}

// --- 认证逻辑（本地模拟）---
function handleLogin(username, password) {
  // 模拟登录 - 在实际项目中应连接后端API
  const users = JSON.parse(localStorage.getItem('kamen_rider_users') || '{}');
  const userKey = username.toLowerCase();

  if (users[userKey] && users[userKey].password === password) {
    currentUser = { username: username, email: users[userKey].email };
    isLoggedIn = true;
    localStorage.setItem('kamen_rider_user', JSON.stringify(currentUser));
    updateAuthUI();
    closeAuthModal();
    return { success: true };
  }
  return { success: false, error: '用户名或密码错误' };
}

function handleRegister(username, email, password) {
  const users = JSON.parse(localStorage.getItem('kamen_rider_users') || '{}');
  const userKey = username.toLowerCase();

  if (users[userKey]) {
    return { success: false, error: '用户名已存在' };
  }

  users[userKey] = { email, password };
  localStorage.setItem('kamen_rider_users', JSON.stringify(users));

  currentUser = { username, email };
  isLoggedIn = true;
  localStorage.setItem('kamen_rider_user', JSON.stringify(currentUser));
  updateAuthUI();
  closeAuthModal();
  return { success: true };
}

function handleLogout() {
  localStorage.removeItem('kamen_rider_user');
  isLoggedIn = false;
  currentUser = null;
  updateAuthUI();
}

// ============================================
// 事件绑定
// ============================================
function bindEvents() {
  // 搜索
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');

  searchInput.addEventListener('input', function() {
    searchQuery = this.value;
    if (searchQuery.trim()) {
      searchClear.classList.remove('hidden');
    } else {
      searchClear.classList.add('hidden');
    }
    renderRiders();
  });

  searchClear.addEventListener('click', function() {
    searchInput.value = '';
    searchQuery = '';
    searchClear.classList.add('hidden');
    renderRiders();
    searchInput.focus();
  });

  // 分类过滤
  document.querySelectorAll('.cat-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.cat-btn').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      currentFilter = this.dataset.category;
      renderRiders();
    });
  });

  // 详情弹窗关闭
  document.getElementById('modalClose').addEventListener('click', closeDetailModal);
  document.getElementById('detailModal').addEventListener('click', function(e) {
    if (e.target === e.currentTarget) closeDetailModal();
  });

  // 认证弹窗
  document.getElementById('btnShowLogin').addEventListener('click', showAuthModal);
  document.getElementById('authModalClose').addEventListener('click', closeAuthModal);
  document.getElementById('authModal').addEventListener('click', function(e) {
    if (e.target === e.currentTarget) closeAuthModal();
  });

  // 登录/注册切换
  document.getElementById('showRegister').addEventListener('click', function(e) {
    e.preventDefault();
    showRegisterForm();
  });
  document.getElementById('showLogin').addEventListener('click', function(e) {
    e.preventDefault();
    showLoginForm();
  });

  // 登录提交
  document.getElementById('btnLogin').addEventListener('click', function() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
      const errEl = document.getElementById('loginError');
      errEl.textContent = '请填写用户名和密码';
      errEl.classList.remove('hidden');
      return;
    }

    const result = handleLogin(username, password);
    if (!result.success) {
      const errEl = document.getElementById('loginError');
      errEl.textContent = result.error;
      errEl.classList.remove('hidden');
    }
  });

  // 回车键登录
  ['loginUsername', 'loginPassword'].forEach(function(id) {
    document.getElementById(id).addEventListener('keydown', function(e) {
      if (e.key === 'Enter') document.getElementById('btnLogin').click();
    });
  });

  // 注册提交
  document.getElementById('btnRegister').addEventListener('click', function() {
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regPasswordConfirm').value;
    const errEl = document.getElementById('registerError');

    if (!username || !email || !password) {
      errEl.textContent = '所有字段都必须填写';
      errEl.classList.remove('hidden');
      return;
    }
    if (username.length < 2 || username.length > 20) {
      errEl.textContent = '用户名长度需要2-20个字符';
      errEl.classList.remove('hidden');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errEl.textContent = '请输入有效的邮箱地址';
      errEl.classList.remove('hidden');
      return;
    }
    if (password.length < 6) {
      errEl.textContent = '密码长度至少6位';
      errEl.classList.remove('hidden');
      return;
    }
    if (password !== passwordConfirm) {
      errEl.textContent = '两次输入的密码不一致';
      errEl.classList.remove('hidden');
      return;
    }

    const result = handleRegister(username, email, password);
    if (!result.success) {
      errEl.textContent = result.error;
      errEl.classList.remove('hidden');
    }
  });

  document.getElementById('regPasswordConfirm').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') document.getElementById('btnRegister').click();
  });

  // 登出
  document.getElementById('btnLogout').addEventListener('click', handleLogout);

  // 键盘关闭弹窗
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeDetailModal();
      closeAuthModal();
    }
  });

  // 导航链接
  document.querySelectorAll('.nav-link').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelectorAll('.nav-link').forEach(function(l) { l.classList.remove('active'); });
      this.classList.add('active');

      const target = this.dataset.nav;
      if (target === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (target === 'heroes') {
        document.getElementById('filterBar').scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}
