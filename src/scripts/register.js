let API_URL = 'http://localhost:8000';

fetch('/api/config')
  .then(res => res.json())
  .then(config => {
    API_URL = config.apiUrl;
    console.log('API URL:', API_URL);
  })
  .catch(err => console.error('Failed to load config:', err));

const registerForm = document.getElementById('registerForm');
const messageDiv = document.getElementById('message');
const sendCodeBtn = document.getElementById('sendCodeBtn');
const emailInput = document.getElementById('email');
const codeInput = document.getElementById('code');

let isCodeSent = false;
let countdownTimer = null;
let turnstileToken = null;

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

// 发送验证码按钮点击事件
sendCodeBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  
  if (!email) {
    showMessage('请输入邮箱地址');
    return;
  }
  
  if (!isValidEmail(email)) {
    showMessage('请输入有效的邮箱地址');
    return;
  }
  
  // 检查 Turnstile 验证
  if (!turnstileToken) {
    showMessage('请先完成人机验证');
    return;
  }
  
  try {
    sendCodeBtn.disabled = true;
    sendCodeBtn.textContent = '发送中...';
    
    const formData = new FormData();
    formData.append('email', email);
    formData.append('turnstile_token', turnstileToken);
    
    const response = await fetch(`${API_URL}/send-code`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showMessage(data.message || '验证码已发送，请检查邮箱', 'green');
      isCodeSent = true;
      startCountdown();
    } else {
      showMessage(data.detail || '发送失败，请稍后重试');
      sendCodeBtn.disabled = false;
      sendCodeBtn.textContent = '发送验证码';
    }
  } catch (error) {
    showMessage('网络错误：' + error.message);
    sendCodeBtn.disabled = false;
    sendCodeBtn.textContent = '发送验证码';
  }
});

// 倒计时函数
function startCountdown() {
  let seconds = 60;
  sendCodeBtn.classList.add('countdown');
  sendCodeBtn.textContent = `${seconds}秒后重发`;
  
  countdownTimer = setInterval(() => {
    seconds--;
    sendCodeBtn.textContent = `${seconds}秒后重发`;
    
    if (seconds <= 0) {
      clearInterval(countdownTimer);
      sendCodeBtn.classList.remove('countdown');
      sendCodeBtn.disabled = false;
      sendCodeBtn.textContent = '发送验证码';
      isCodeSent = false;
    }
  }, 1000);
}

// 邮箱验证正则
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = emailInput.value.trim();
  const code = codeInput.value.trim();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  // 验证邮箱和验证码
  if (!email) {
    showMessage('请输入邮箱地址');
    return;
  }
  
  if (!isCodeSent) {
    showMessage('请先获取验证码');
    return;
  }
  
  if (!code) {
    showMessage('请输入验证码');
    return;
  }
  
  // 验证邮箱
  try {
    const verifyResponse = await fetch(`${API_URL}/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ email, code })
    });
    
    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json();
      showMessage(errorData.detail || '验证码错误');
      return;
    }
  } catch (error) {
    showMessage('网络错误：' + error.message);
    return;
  }
  
  if (password !== confirmPassword) {
    showMessage('两次输入的密码不一致');
    return;
  }
  
  if (password.length < 6) {
    showMessage('密码长度至少为 6 位');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password, email })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showMessage(data.message || '注册成功！正在跳转到登录页面...', 'green');
      registerForm.reset();
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    } else {
      showMessage(data.detail || '注册失败');
    }
  } catch (error) {
    showMessage('网络错误：' + error.message);
  }
});

function showMessage(text, color = 'red') {
  messageDiv.textContent = text;
  messageDiv.style.display = 'block';
  messageDiv.style.color = color;
  
  if (color === 'green') {
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 1500);
  }
}
