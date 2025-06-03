const API_BASE = 'http://localhost:10000/api'; // Change if your backend URL differs

// Elements
const content = document.getElementById('content');
const authStatus = document.getElementById('auth-status');
const linkLogin = document.getElementById('link-login');
const linkRegister = document.getElementById('link-register');
const linkAbout = document.getElementById('link-about');
const linkDashboard = document.getElementById('link-dashboard');
const linkLogout = document.getElementById('link-logout');
const linkDownload = document.getElementById('link-download');

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

function getUser() {
  const userJson = localStorage.getItem('wekelogin_user');
  return userJson ? JSON.parse(userJson) : null;
}

function updateNav() {
  if (isLoggedIn()) {
    linkDashboard.classList.remove('hidden');
    linkLogout.classList.remove('hidden');
    linkLogin.classList.add('hidden');
    linkRegister.classList.add('hidden');
    const user = getUser();
    authStatus.textContent = `Logged in as ${user?.username || 'User'}`;
  } else {
    linkDashboard.classList.add('hidden');
    linkLogout.classList.add('hidden');
    linkLogin.classList.remove('hidden');
    linkRegister.classList.remove('hidden');
    authStatus.textContent = 'Not logged in';
  }
}

// Show error message helper
function showError(id, message) {
  const el = document.getElementById(id);
  if(el) el.textContent = message;
}

// LOGIN page
function renderLogin() {
  content.innerHTML = `
    <div class="form-container">
      <h2>Login</h2>
      <form id="login-form">
        <input type="text" id="login-username" placeholder="Username" required />
        <input type="password" id="login-password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <a href="#" id="to-register">Register here</a></p>
      <p id="login-error" style="color:red;"></p>
    </div>
  `;

  document.getElementById('to-register').onclick = e => {
    e.preventDefault();
    renderRegister();
  };

  document.getElementById('login-form').onsubmit = async e => {
    e.preventDefault();
    showError('login-error', '');

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
      showError('login-error', 'Please fill all fields');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        showError('login-error', errorData.message || 'Login failed');
        return;
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('wekelogin_user', JSON.stringify({ username }));

      updateNav();
      renderWelcome();
    } catch (err) {
      showError('login-error', 'Network error');
    }
  };
}

// REGISTER page
function renderRegister() {
  content.innerHTML = `
    <div class="form-container">
      <h2>Register</h2>
      <form id="register-form">
        <input type="text" id="register-username" placeholder="Choose username" required />
        <input type="password" id="register-password" placeholder="Choose password" required />
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <a href="#" id="to-login">Login here</a></p>
      <p id="register-error" style="color:red;"></p>
    </div>
  `;

  document.getElementById('to-login').onclick = e => {
    e.preventDefault();
    renderLogin();
  };

  document.getElementById('register-form').onsubmit = async e => {
    e.preventDefault();
    showError('register-error', '');

    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;

    if (!username || !password) {
      showError('register-error', 'Please fill all fields');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        showError('register-error', errorData.message || 'Registration failed');
        return;
      }

      alert('Registration successful! You can now login.');
      renderLogin();
    } catch (err) {
      showError('register-error', 'Network error');
    }
  };
}

// ABOUT page
function renderAbout() {
  content.innerHTML = `
    <div>
      <h2>About Weke</h2>
      <p>Weke is a platform for Windows and Office tools.</p>
      <p>This demo shows a login system connected to a backend with JWT auth.</p>
    </div>
  `;
}

// ADMIN DASHBOARD page
async function renderDashboard() {
  if (!isLoggedIn()) {
    alert('You must be logged in to access the Admin Dashboard.');
    renderLogin();
    return;
  }

  content.innerHTML = '<p>Loading admin data...</p>';

  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/admin`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.status === 401) {
      alert('Session expired or unauthorized. Please login again.');
      localStorage.removeItem('token');
      localStorage.removeItem('wekelogin_user');
      renderLogin();
      updateNav();
      return;
    }

    if (!res.ok) {
      content.innerHTML = `<p>Error loading admin data</p>`;
      return;
    }

    const data = await res.json();

    const user = getUser();
    content.innerHTML = `
      <div>
        <h2>Admin Dashboard</h2>
        <p>Welcome, <strong>${user.username}</strong>!</p>
        <pre>${JSON.stringify(data, null, 2)}</pre>
        <p>This is a protected admin area.</p>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<p>Network error loading admin data.</p>`;
  }
}

// DOWNLOADS page (protected)
function renderDownload() {
  if (!isLoggedIn()) {
    alert('Please login to access downloads.');
    renderLogin();
    return;
  }

  content.innerHTML = `
    <div>
      <h2>Download Center</h2>
      <p>Access your tools below:</p>
      <ul>
        <li><a href="/downloads/windows.iso" download>Download Windows ISO</a></li>
        <li><a href="/downloads/office.iso" download>Download Office ISO</a></li>
        <li><a href="/downloads/activator.zip" download>Download Activator</a></li>
      </ul>
    </div>
  `;
}

// WELCOME / HOME page
function renderWelcome() {
  content.innerHTML = `
    <div>
      <h2>Welcome to Weke!</h2>
      <p>This is the home page. Please login or register to continue.</p>
    </div>
  `;
}

// Event listeners for navigation links
linkLogin.onclick = e => {
  e.preventDefault();
  renderLogin();
};

linkRegister.onclick = e => {
  e.preventDefault();
  renderRegister();
};

linkAbout.onclick = e => {
  e.preventDefault();
  renderAbout();
};

linkDashboard.onclick = e => {
  e.preventDefault();
  renderDashboard();
};

linkDownload.onclick = e => {
  e.preventDefault();
  renderDownload();
};

linkLogout.onclick = e => {
  e.preventDefault();
  localStorage.removeItem('token');
  localStorage.removeItem('wekelogin_user');
  updateNav();
  renderWelcome();
};

// Initialize
updateNav();
renderWelcome();
