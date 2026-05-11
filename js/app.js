const API_BASE = '/api';
const pageType = document.body.dataset.page;
const charts = {};

function formatTZS(amount) {
  if (amount === null || amount === undefined) return '-';
  return `${Number(amount).toLocaleString('en-US')} TZS`;
}

async function apiRequest(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || response.statusText);
    }
    return await response.json();
  } catch (error) {
    console.error('API request failed', error);
    return { error: error.message || 'Network error' };
  }
}

function createChart(canvas, config) {
  if (!canvas || !window.Chart) return null;
  if (charts[canvas.id]) {
    charts[canvas.id].destroy();
  }
  charts[canvas.id] = new Chart(canvas, config);
  return charts[canvas.id];
}

async function initDashboardPage() {
  const response = await apiRequest('/dashboard');
  if (response.error) return;

  document.getElementById('total-loaned')?.textContent = formatTZS(response.totalLoaned);
  document.getElementById('total-interest')?.textContent = formatTZS(response.totalInterest);
  document.getElementById('active-loans')?.textContent = response.activeLoans;
  document.getElementById('payment-rate')?.textContent = `${response.activeLoans ? response.activeLoans : 0}%`;

  const canvas = document.getElementById('trendsChart');
  if (!canvas) return;

  const labels = response.timeline.length ? response.timeline.map((item) => item.month) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const loanData = response.timeline.length ? response.timeline.map((item) => item.loansIssued) : [185000, 195000, 210000, 225000, 240000, 260000];
  const collectionData = response.timeline.length ? response.timeline.map((item) => item.collections) : [15000, 18500, 22000, 25500, 29000, 32500];
  const interestData = response.timeline.length ? response.timeline.map((item) => item.interest) : [8500, 10200, 12000, 14500, 17200, 20000];

  createChart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Loans Issued', data: loanData, borderColor: '#667eea', backgroundColor: 'rgba(102, 126, 234, 0.15)', tension: 0.35, fill: true, borderWidth: 3 },
        { label: 'Collections', data: collectionData, borderColor: '#764ba2', backgroundColor: 'rgba(118, 75, 162, 0.15)', tension: 0.35, fill: true, borderWidth: 3 },
        { label: 'Interest Collected', data: interestData, borderColor: '#f39c12', backgroundColor: 'rgba(243, 156, 18, 0.15)', tension: 0.35, fill: true, borderWidth: 3 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top' } },
      scales: {
        y: { beginAtZero: true, ticks: { callback: (value) => `${value / 1000}K` } }
      }
    }
  });
}

function buildTableRow(cells) {
  const row = document.createElement('tr');
  cells.forEach((cell) => {
    const td = document.createElement('td');
    if (cell instanceof Node) {
      td.appendChild(cell);
    } else if (typeof cell === 'string' && cell.includes('<')) {
      td.innerHTML = cell;
    } else {
      td.textContent = cell;
    }
    row.appendChild(td);
  });
  return row;
}

function getApplicationIdFromRow(row) {
  const idCell = row.querySelector('td');
  if (!idCell) return null;
  return idCell.textContent.trim().replace('#APP', '');
}

async function handleApplicationAction(applicationId, action) {
  const response = await apiRequest(`/applications/${applicationId}/action`, {
    method: 'POST',
    body: JSON.stringify({ action })
  });

  if (response.error) {
    alert(`Unable to ${action} application: ${response.error}`);
    return;
  }

  alert(`Application ${action}ed successfully.`);
  await loadApplications();
}

async function loadApplications() {
  const status = document.getElementById('statusFilter')?.value || 'all';
  const priority = document.getElementById('priorityFilter')?.value || 'all';
  const amountFilter = document.getElementById('amountFilter')?.value || '';
  let minAmount = null;
  let maxAmount = null;

  if (amountFilter.includes('-')) {
    const parts = amountFilter.split('-').map((part) => Number(part.trim()));
    minAmount = parts[0] || null;
    maxAmount = parts[1] || null;
  }

  const queryParts = [];
  if (status && status !== 'all') queryParts.push(`status=${encodeURIComponent(status)}`);
  if (priority && priority !== 'all') queryParts.push(`priority=${encodeURIComponent(priority)}`);
  if (minAmount) queryParts.push(`minAmount=${encodeURIComponent(minAmount)}`);
  if (maxAmount) queryParts.push(`maxAmount=${encodeURIComponent(maxAmount)}`);

  const query = queryParts.length ? `?${queryParts.join('&')}` : '';
  const response = await apiRequest(`/applications${query}`);
  if (response.error) return;

  const body = document.getElementById('applicationsTableBody');
  if (!body) return;
  body.innerHTML = '';

  response.applications.forEach((application) => {
    const statusBadge = document.createElement('span');
    statusBadge.className = 'status-badge';
    statusBadge.textContent = application.status.replace('_', ' ');

    const actionButton = document.createElement('button');
    actionButton.className = 'btn btn-review';
    actionButton.textContent = 'Review';
    actionButton.addEventListener('click', () => handleApplicationAction(application.applicationId.replace('APP', ''), 'review'));

    body.appendChild(buildTableRow([
      `#${application.applicationId}`,
      application.borrowerName,
      formatTZS(application.amount),
      application.creditScore,
      statusBadge.outerHTML,
      application.priority.toUpperCase(),
      new Date(application.submittedAt).toLocaleDateString(),
      actionButton
    ]));
  });
}

async function initApplicationsPage() {
  await loadApplications();

  document.getElementById('applyFilterButton')?.addEventListener('click', async () => {
    await loadApplications();
  });

  document.querySelectorAll('.app-card button[data-action]').forEach((button) => {
    button.addEventListener('click', async (event) => {
      const card = event.target.closest('.app-card');
      const applicationId = card?.dataset.appId?.replace('APP', '');
      const action = event.target.dataset.action;
      if (applicationId && action) {
        await handleApplicationAction(applicationId, action);
      }
    });
  });
}

async function renderUsers(users) {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  users.forEach((user) => {
    const avatar = document.createElement('div');
    avatar.className = 'user-avatar';
    avatar.textContent = user.name.split(' ').map((part) => part[0]).join('').substring(0, 2).toUpperCase();

    const info = document.createElement('div');
    info.innerHTML = `<div class="user-name">${user.name}</div><div class="user-email">ID: #USR${String(user.id).padStart(3, '0')}</div>`;

    const nameCell = document.createElement('td');
    const wrapper = document.createElement('div');
    wrapper.className = 'user-info';
    wrapper.appendChild(avatar);
    wrapper.appendChild(info);
    nameCell.appendChild(wrapper);

    const statusBadge = document.createElement('span');
    statusBadge.className = `status-badge ${user.status === 'active' ? 'status-active' : 'status-inactive'}`;
    statusBadge.textContent = user.status.charAt(0).toUpperCase() + user.status.slice(1);

    const actionCell = document.createElement('td');
    actionCell.innerHTML = `
      <div class="action-icons">
        <button class="icon-btn icon-btn-view">👁️</button>
        <button class="icon-btn icon-btn-edit">✏️</button>
        <button class="icon-btn icon-btn-delete">🗑️</button>
      </div>
    `;

    tbody.appendChild(buildTableRow([
      nameCell,
      user.email,
      user.phone || '-',
      `<span class="role-badge role-${user.role.toLowerCase()}">${user.role}</span>`,
      statusBadge.outerHTML,
      new Date(user.joined_date).toLocaleDateString(),
      user.last_login ? new Date(user.last_login).toLocaleTimeString() : 'Never',
      actionCell
    ]));
  });
}

async function loadUsers(search = '') {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  const response = await apiRequest(`/users${query}`);
  if (response.error) return;
  await renderUsers(response.users);
}

async function initUsersPage() {
  await loadUsers();

  document.getElementById('userSearch')?.addEventListener('input', async (event) => {
    await loadUsers(event.target.value.trim());
  });

  document.getElementById('addUserButton')?.addEventListener('click', async () => {
    const name = prompt('Enter user name');
    const email = prompt('Enter user email');
    const phone = prompt('Enter user phone');
    const role = prompt('Enter role (admin, staff, viewer)', 'viewer');
    if (!name || !email) return alert('Name and email are required.');

    const response = await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, role })
    });
    if (response.error) {
      alert(`Error: ${response.error}`);
      return;
    }
    await loadUsers();
    alert('User created successfully.');
  });
}

async function initPortfolioPage() {
  const response = await apiRequest('/portfolio');
  if (response.error) return;

  document.getElementById('portfolioValue')?.textContent = formatTZS(response.summary.totalPortfolio);
  document.getElementById('portfolioHealth')?.textContent = `${response.summary.activeRatio.toFixed(1)}%`;
  document.getElementById('atRiskLoans')?.textContent = formatTZS(response.summary.atRiskTotal);
  document.getElementById('avgPerformance')?.textContent = `${response.summary.averagePerformance.toFixed(1)}%`;

  const distributionCanvas = document.getElementById('distributionChart');
  if (distributionCanvas) {
    createChart(distributionCanvas, {
      type: 'bar',
      data: {
        labels: response.distribution.map((row) => row.bucket),
        datasets: [{ label: 'Loan Counts', data: response.distribution.map((row) => Number(row.count)), backgroundColor: ['#667eea', '#764ba2', '#f39c12', '#e74c3c'] }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  }

  const compositionCanvas = document.getElementById('compositionChart');
  if (compositionCanvas) {
    createChart(compositionCanvas, {
      type: 'doughnut',
      data: {
        labels: response.composition.map((row) => row.loan_type || 'Other'),
        datasets: [{ data: response.composition.map((row) => Number(row.total_amount)), backgroundColor: ['#667eea', '#764ba2', '#f39c12', '#27ae60'] }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
  }
}

async function initCollectionsPage() {
  const response = await apiRequest('/collections');
  if (response.error) return;

  document.getElementById('collectionsThisMonth')?.textContent = formatTZS(response.summary.collected);
  document.getElementById('totalOverdue')?.textContent = formatTZS(response.summary.overdueAmount);
  document.getElementById('daysDelinquent90')?.textContent = `${formatTZS(response.summary.overdueAmount)} (${response.summary.overdueAccounts} accounts)`;
  document.getElementById('collectionRate')?.textContent = `${response.summary.collected ? ((response.summary.collected / (response.summary.collected + response.summary.overdueAmount)) * 100).toFixed(1) : 0}%`;

  const agingCanvas = document.getElementById('agingChart');
  if (agingCanvas) {
    const labels = response.aging.map((row, index) => `Group ${index + 1}`);
    const data = response.aging.map((row) => Number(row.overdue_amount));
    createChart(agingCanvas, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Overdue Amount', data, backgroundColor: '#e74c3c' }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  }

  const trendCanvas = document.getElementById('trendChart');
  if (trendCanvas) {
    createChart(trendCanvas, {
      type: 'line',
      data: { labels: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'], datasets: [{ label: 'Collections', data: [142000, 156000, 168500, 175200, 181000, response.summary.collected], borderColor: '#27ae60', backgroundColor: 'rgba(39, 174, 96, 0.15)', tension: 0.35, fill: true, borderWidth: 3 }] },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}

function showSettingsSection(sectionId) {
  document.querySelectorAll('.settings-section').forEach((section) => {
    section.style.display = section.id === sectionId ? 'block' : 'none';
  });
  document.querySelectorAll('.sidebar-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.section === sectionId);
  });
}

function collectSettings() {
  return {
    orgName: document.getElementById('orgName')?.value || '',
    orgEmail: document.getElementById('orgEmail')?.value || '',
    supportPhone: document.getElementById('supportPhone')?.value || '',
    timeZone: document.getElementById('timeZone')?.value || '',
    currency: document.getElementById('currency')?.value || '',
    sessionTimeout: document.getElementById('sessionTimeout')?.value || '',
    smtpServer: document.getElementById('smtpServer')?.value || '',
    smtpPort: document.getElementById('smtpPort')?.value || '',
    smtpEmail: document.getElementById('smtpEmail')?.value || '',
    require2fa: document.querySelector('.toggle-switch[data-setting="require2fa"]')?.classList.contains('active') ? 'true' : 'false',
    ipWhitelisting: document.querySelector('.toggle-switch[data-setting="ipWhitelisting"]')?.classList.contains('active') ? 'true' : 'false',
    requireCreditCheck: document.querySelector('.toggle-switch[data-setting="requireCreditCheck"]')?.classList.contains('active') ? 'true' : 'false',
    minimumLoanAmount: document.getElementById('minimumLoanAmount')?.value || '',
    maximumLoanAmount: document.getElementById('maximumLoanAmount')?.value || '',
    minimumInterest: document.getElementById('minimumInterest')?.value || '',
    maximumInterest: document.getElementById('maximumInterest')?.value || ''
  };
}

async function initSettingsPage() {
  document.querySelectorAll('.sidebar-item[data-section]').forEach((item) => {
    item.addEventListener('click', () => showSettingsSection(item.dataset.section));
  });

  document.querySelectorAll('.settings-section .btn-save').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const payload = collectSettings();
      const response = await apiRequest('/settings', { method: 'PUT', body: JSON.stringify(payload) });
      if (response.error) return alert(`Error saving settings: ${response.error}`);
      alert('Settings saved successfully.');
    });
  });

  document.querySelectorAll('.toggle-switch').forEach((toggle) => {
    toggle.addEventListener('click', () => toggle.classList.toggle('active'));
  });

  showSettingsSection('general');
}

async function initReportsPage() {
  document.getElementById('generateReportBtn')?.addEventListener('click', async () => {
    const type = document.getElementById('reportType')?.value || 'all';
    const range = document.getElementById('reportRange')?.value || '30';
    const response = await apiRequest('/reports/generate', { method: 'POST', body: JSON.stringify({ type, range }) });
    if (response.error) return alert(`Unable to generate report: ${response.error}`);
    alert(`Report generated: ${response.report.title}`);
  });

  document.getElementById('downloadReportBtn')?.addEventListener('click', () => {
    alert('Download functionality is ready once a report is generated.');
  });
}

async function init() {
  switch (pageType) {
    case 'dashboard':
      await initDashboardPage();
      break;
    case 'applications':
      await initApplicationsPage();
      break;
    case 'users':
      await initUsersPage();
      break;
    case 'portfolio':
      await initPortfolioPage();
      break;
    case 'collections':
      await initCollectionsPage();
      break;
    case 'reports':
      await initReportsPage();
      break;
    case 'settings':
      await initSettingsPage();
      break;
    default:
      break;
  }
}

window.addEventListener('DOMContentLoaded', init);
