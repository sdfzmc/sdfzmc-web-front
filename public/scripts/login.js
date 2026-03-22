let API_URL = 'http://103.40.13.68:10951';

// 如果需要动态配置，可以保留 fetch('/api/config')
// 否则直接使用上面的固定地址
console.log('API URL:', API_URL);

const loginForm = document.getElementById('loginForm');
const messageDiv = document.getElementById('message');
const userInfoDiv = document.getElementById('userInfo');
const displayUsername = document.getElementById('displayUsername');
const displayId = document.getElementById('displayId');
const logoutBtn = document.getElementById('logoutBtn');

// 登录方式切换
const tabBtns = document.querySelectorAll('.tab-btn');
const usernameLogin = document.getElementById('username-login');
const emailLogin = document.getElementById('email-login');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');

let currentLoginType = 'username';
let turnstileToken = null;
let accessToken = localStorage.getItem('access_token');

if (accessToken) {
  fetchUserInfo();
}

// 初始化 Cloudflare Turnstile
function initTurnstile() {
  if (typeof turnstile === 'undefined') {
    console.warn('Turnstile 还未加载，等待 500ms 后重试...');
    setTimeout(initTurnstile, 500);
    return;
  }
  
  turnstile.render('#turnstile-widget', {
    sitekey: '0x4AAAAAACuZ_dFYYjtti6lR',
    callback: function(token) {
      console.log('Turnstile 验证通过，token:', token);
      turnstileToken = token;
    },
    'error-callback': function(err) {
      console.error('Turnstile 错误:', err);
      showMessage('人机验证失败，请刷新页面重试');
    },
    'expired-callback': function() {
      console.warn('Turnstile token 已过期');
      turnstileToken = null;
      showMessage('人机验证已过期，请重新验证');
    }
  });
}

// 页面加载完成后初始化 Turnstile
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTurnstile);
} else {
  initTurnstile();
}

// 登录方式切换
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const tabType = btn.dataset.tab;
    currentLoginType = tabType;
    
    if (tabType === 'username') {
      usernameLogin.style.display = 'flex';
      emailLogin.style.display = 'none';
      usernameInput.setAttribute('required', '');
      emailInput.removeAttribute('required');
    } else {
      usernameLogin.style.display = 'none';
      emailLogin.style.display = 'flex';
      usernameInput.removeAttribute('required');
      emailInput.setAttribute('required', '');
    }
  });
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // 检查 Turnstile 验证
  if (!turnstileToken) {
    showMessage('请先完成人机验证');
    return;
  }
  
  let identifier;
  if (currentLoginType === 'username') {
    identifier = usernameInput.value;
  } else {
    identifier = emailInput.value;
  }
  
  const password = document.getElementById('password').value;
  
  try {
    const formData = new URLSearchParams();
    formData.append('username', identifier);
    formData.append('password', password);
    formData.append('turnstile_token', turnstileToken);
    
    const response = await fetch(`${API_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (response.ok) {
      accessToken = data.access_token;
      localStorage.setItem('access_token', accessToken);
      showMessage('登录成功！');
      loginForm.reset();
      fetchUserInfo();
    } else {
      showMessage(data.detail || '登录失败');
    }
  } catch (error) {
    showMessage('网络错误：' + error.message);
  }
});

logoutBtn.addEventListener('click', () => {
  accessToken = null;
  localStorage.removeItem('access_token');
  userInfoDiv.style.display = 'none';
  loginForm.style.display = 'block';
  showMessage('已退出登录');
});

async function fetchUserInfo() {
  if (!accessToken) return;
  
  try {
    const response = await fetch(`${API_URL}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (response.ok) {
      const user = await response.json();
      displayUsername.textContent = user.username;
      displayId.textContent = user.id;
      userInfoDiv.style.display = 'block';
      loginForm.style.display = 'none';
      messageDiv.style.display = 'none';
    } else {
      localStorage.removeItem('access_token');
      accessToken = null;
      showMessage('Token 已过期，请重新登录');
    }
  } catch (error) {
    showMessage('获取用户信息失败：' + error.message);
  }
}

function showMessage(text) {
  messageDiv.textContent = text;
  messageDiv.style.display = 'block';
  messageDiv.style.color = 'red';
  
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 3000);
}
