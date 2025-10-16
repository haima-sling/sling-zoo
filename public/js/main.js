// Zoo Management System - Main JavaScript

class ZooApp {
  constructor() {
    this.apiBaseUrl = '/api';
    this.token = this.getToken();
    this.currentUser = null;
    this.init();
  }

  init() {
    // Initialize the application
    this.checkAuthentication();
    this.setupEventListeners();
    this.loadDashboardData();
  }

  // Authentication Methods
  getToken() {
    return localStorage.getItem('authToken');
  }

  setToken(token) {
    localStorage.setItem('authToken', token);
    this.token = token;
  }

  removeToken() {
    localStorage.removeItem('authToken');
    this.token = null;
  }

  async checkAuthentication() {
    if (!this.token) {
      this.redirectToLogin();
      return false;
    }

    try {
      const response = await this.apiRequest('/auth/profile');
      this.currentUser = response.data;
      this.updateUI();
      return true;
    } catch (error) {
      this.removeToken();
      this.redirectToLogin();
      return false;
    }
  }

  redirectToLogin() {
    if (window.location.pathname !== '/login.html') {
      window.location.href = '/login.html';
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        this.setToken(data.data.token);
        this.currentUser = data.data.user;
        this.showNotification('Login successful!', 'success');
        window.location.href = '/dashboard.html';
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      this.showNotification(error.message, 'error');
    }
  }

  async logout() {
    try {
      await this.apiRequest('/auth/logout', 'POST');
      this.removeToken();
      this.currentUser = null;
      window.location.href = '/login.html';
    } catch (error) {
      console.error('Logout error:', error);
      this.removeToken();
      window.location.href = '/login.html';
    }
  }

  // API Request Methods
  async apiRequest(endpoint, method = 'GET', data = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (this.token) {
      options.headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.apiBaseUrl}${endpoint}`, options);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Request failed');
    }

    return responseData;
  }

  // Dashboard Methods
  async loadDashboardData() {
    const dashboardContainer = document.getElementById('dashboard-stats');
    if (!dashboardContainer) return;

    try {
      this.showLoader();

      const [animalsRes, visitorsRes, ticketsRes, exhibitsRes] = await Promise.all([
        this.apiRequest('/animals/stats'),
        this.apiRequest('/visitors/stats'),
        this.apiRequest('/tickets/stats'),
        this.apiRequest('/exhibits/stats')
      ]);

      this.renderDashboardStats({
        animals: animalsRes.data,
        visitors: visitorsRes.data,
        tickets: ticketsRes.data,
        exhibits: exhibitsRes.data
      });

      this.hideLoader();
    } catch (error) {
      this.hideLoader();
      this.showNotification('Failed to load dashboard data', 'error');
    }
  }

  renderDashboardStats(stats) {
    const container = document.getElementById('dashboard-stats');
    if (!container) return;

    const html = `
      <div class="stats-grid">
        <div class="stat-card">
          <h3>${stats.animals.totalAnimals || 0}</h3>
          <p>Total Animals</p>
        </div>
        <div class="stat-card">
          <h3>${stats.visitors.totalVisitors || 0}</h3>
          <p>Total Visitors</p>
        </div>
        <div class="stat-card">
          <h3>$${(stats.tickets.totalRevenue || 0).toFixed(2)}</h3>
          <p>Total Revenue</p>
        </div>
        <div class="stat-card">
          <h3>${stats.exhibits.totalExhibits || 0}</h3>
          <p>Total Exhibits</p>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  // Animal Methods
  async loadAnimals(page = 1, limit = 10) {
    try {
      const response = await this.apiRequest(`/animals?page=${page}&limit=${limit}`);
      this.renderAnimalsList(response.data, response.pagination);
    } catch (error) {
      this.showNotification('Failed to load animals', 'error');
    }
  }

  renderAnimalsList(animals, pagination) {
    const container = document.getElementById('animals-list');
    if (!container) return;

    let html = '<div class="table-responsive"><table class="table"><thead><tr>';
    html += '<th>Name</th><th>Species</th><th>Gender</th><th>Status</th><th>Actions</th>';
    html += '</tr></thead><tbody>';

    animals.forEach(animal => {
      html += `
        <tr>
          <td>${animal.name}</td>
          <td>${animal.species}</td>
          <td>${animal.gender}</td>
          <td><span class="badge badge-${this.getStatusColor(animal.status)}">${animal.status}</span></td>
          <td>
            <button onclick="zooApp.viewAnimal('${animal._id}')" class="btn btn-sm btn-info">View</button>
            <button onclick="zooApp.editAnimal('${animal._id}')" class="btn btn-sm btn-primary">Edit</button>
          </td>
        </tr>
      `;
    });

    html += '</tbody></table></div>';
    html += this.renderPagination(pagination);

    container.innerHTML = html;
  }

  // Visitor Methods
  async loadVisitors(page = 1, limit = 10) {
    try {
      const response = await this.apiRequest(`/visitors?page=${page}&limit=${limit}`);
      this.renderVisitorsList(response.data, response.pagination);
    } catch (error) {
      this.showNotification('Failed to load visitors', 'error');
    }
  }

  renderVisitorsList(visitors, pagination) {
    const container = document.getElementById('visitors-list');
    if (!container) return;

    let html = '<table class="table"><thead><tr>';
    html += '<th>Name</th><th>Email</th><th>Phone</th><th>Total Visits</th><th>Actions</th>';
    html += '</tr></thead><tbody>';

    visitors.forEach(visitor => {
      html += `
        <tr>
          <td>${visitor.fullName}</td>
          <td>${visitor.email}</td>
          <td>${visitor.phone || 'N/A'}</td>
          <td>${visitor.totalVisits || 0}</td>
          <td>
            <button onclick="zooApp.viewVisitor('${visitor._id}')" class="btn btn-sm btn-info">View</button>
          </td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    html += this.renderPagination(pagination);

    container.innerHTML = html;
  }

  // Search Methods
  async searchAnimals(query) {
    try {
      const response = await this.apiRequest(`/animals/search?q=${encodeURIComponent(query)}`);
      this.renderSearchResults(response.data, 'animals');
    } catch (error) {
      this.showNotification('Search failed', 'error');
    }
  }

  async searchVisitors(query) {
    try {
      const response = await this.apiRequest(`/visitors/search?q=${encodeURIComponent(query)}`);
      this.renderSearchResults(response.data, 'visitors');
    } catch (error) {
      this.showNotification('Search failed', 'error');
    }
  }

  // UI Helper Methods
  renderPagination(pagination) {
    if (!pagination) return '';

    let html = '<div class="pagination">';
    
    // Previous button
    html += `<button onclick="zooApp.loadPage(${pagination.page - 1})" ${pagination.page === 1 ? 'disabled' : ''}>Previous</button>`;
    
    // Page numbers
    for (let i = 1; i <= pagination.pages; i++) {
      if (i === pagination.page) {
        html += `<button class="active">${i}</button>`;
      } else {
        html += `<button onclick="zooApp.loadPage(${i})">${i}</button>`;
      }
    }
    
    // Next button
    html += `<button onclick="zooApp.loadPage(${pagination.page + 1})" ${pagination.page === pagination.pages ? 'disabled' : ''}>Next</button>`;
    
    html += '</div>';
    return html;
  }

  getStatusColor(status) {
    const colors = {
      active: 'success',
      inactive: 'warning',
      quarantine: 'warning',
      medical_treatment: 'info',
      deceased: 'error'
    };
    return colors[status] || 'info';
  }

  showLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.remove('hidden');
  }

  hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.textContent = message;
    
    const container = document.getElementById('notifications') || document.body;
    container.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  updateUI() {
    if (!this.currentUser) return;

    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
      userNameElement.textContent = this.currentUser.fullName;
    }

    const userRoleElement = document.getElementById('user-role');
    if (userRoleElement) {
      userRoleElement.textContent = this.currentUser.role;
    }
  }

  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        this.login(email, password);
      });
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }

    // Search forms
    const animalSearchForm = document.getElementById('animal-search-form');
    if (animalSearchForm) {
      animalSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = document.getElementById('animal-search').value;
        this.searchAnimals(query);
      });
    }
  }
}

// Initialize the application
const zooApp = new ZooApp();
