let API_URL = 'http://localhost:8000';

fetch('/api/config')
  .then(res => res.json())
  .then(config => {
    API_URL = config.apiUrl;
    console.log('API URL:', API_URL);
  })
  .catch(err => console.error('Failed to load config:', err));

const loginForm = document.getElementById('loginForm');
const messageDiv = document.getElementById('message');
const userInfoDiv = document.getElementById('userInfo');
const displayUsername = document.getElementById('displayUsername');
const displayId = document.getElementById('displayId');
const logoutBtn = document.getElementById('logoutBtn');

let accessToken = localStorage.getItem('access_token');

if (accessToken) {
  fetchUserInfo();
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  try {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
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
