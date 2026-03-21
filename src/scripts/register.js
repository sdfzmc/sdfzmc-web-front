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

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
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
      body: JSON.stringify({ username, password })
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
