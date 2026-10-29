const state = {
  balance: 248,
  plastic: 1.2,
  packages: 47,
  trips: 18,
  bottles: 32,
  history: [
    { id: 1, action: 'embalagens', title: 'Embalagens vazias', points: 30, date: '28/10/2026', icon: '♻️' },
    { id: 2, action: 'transporte', title: 'Transporte sustentável', points: 20, date: '25/10/2026', icon: '🚶' },
    { id: 3, action: 'garrafa', title: 'Garrafa reutilizável', points: 15, date: '22/10/2026', icon: '🥤' },
    { id: 4, action: 'embalagens', title: 'Embalagens vazias', points: 30, date: '18/10/2026', icon: '♻️' },
    { id: 5, action: 'transporte', title: 'Transporte sustentável', points: 20, date: '15/10/2026', icon: '🚶' },
    { id: 6, action: 'garrafa', title: 'Garrafa reutilizável', points: 15, date: '12/10/2026', icon: '🥤' },
    { id: 7, action: 'embalagens', title: 'Embalagens vazias', points: 30, date: '08/10/2026', icon: '♻️' }
  ],
  rewards: [
    { id: 1, name: 'Desconto no próximo atendimento', desc: '10% de desconto na próxima consulta', cost: 150, icon: '🏷️' },
    { id: 2, name: 'Procedimento complementar', desc: 'Um procedimento extra gratuito', cost: 300, icon: '✨' },
    { id: 3, name: 'Amostra ou produto presente', desc: 'Produto selecionado da clínica', cost: 100, icon: '🎁' },
    { id: 4, name: 'Desconto especial 15%', desc: 'Desconto ampliado em procedimentos', cost: 250, icon: '💎' }
  ]
};

const actionPoints = {
  embalagens: { points: 30, title: 'Embalagens vazias', icon: '♻️', impact: { packages: 1, plastic: 0.05 } },
  transporte: { points: 20, title: 'Transporte sustentável', icon: '🚶', impact: { trips: 1 } },
  garrafa: { points: 15, title: 'Garrafa reutilizável', icon: '🥤', impact: { bottles: 1, plastic: 0.02 } }
};

const nextRewardTarget = 300;

function $(sel) {
  return document.querySelector(sel);
}

function $$(sel) {
  return document.querySelectorAll(sel);
}

function formatDate() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function showToast(msg) {
  const toast = $('#toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

function updateBalanceUI() {
  $('#balance-amount').textContent = state.balance;
  const remaining = Math.max(0, nextRewardTarget - state.balance);
  $('#next-reward').textContent = remaining;
  const progress = Math.min(100, (state.balance / nextRewardTarget) * 100);
  $('#progress-bar').style.width = progress + '%';
  $('#plastic-saved').textContent = state.plastic.toFixed(1);
  $('#packages-recycled').textContent = state.packages;
  $('#visits-sustainable').textContent = state.trips;
  $('#total-impact').textContent = state.plastic.toFixed(1) + ' kg';
  $('#impact-packages').textContent = state.packages;
  $('#impact-trips').textContent = state.trips;
  $('#impact-bottles').textContent = state.bottles;
  $('#impact-coins').textContent = state.balance;
}

function renderHistory() {
  const list = $('#history-list');
  list.innerHTML = state.history.map(item => `
    <div class="history-item">
      <div class="history-icon">${item.icon}</div>
      <div class="history-info">
        <div class="history-title">${item.title}</div>
        <div class="history-date">${item.date}</div>
      </div>
      <div class="history-points">+${item.points}</div>
    </div>
  `).join('');
}

function renderRewards() {
  const list = $('#rewards-list');
  list.innerHTML = state.rewards.map(r => {
    const canAfford = state.balance >= r.cost;
    return `
      <div class="reward-card ${canAfford ? 'affordable' : ''}">
        <div class="reward-icon">${r.icon}</div>
        <div class="reward-info">
          <div class="reward-name">${r.name}</div>
          <div class="reward-desc">${r.desc}</div>
        </div>
        <div class="reward-cost">
          <div class="reward-points">${r.cost} EM</div>
          <button class="reward-btn" data-reward="${r.id}" ${canAfford ? '' : 'disabled'}>
            ${canAfford ? 'Trocar' : 'Insuficiente'}
          </button>
        </div>
      </div>
    `;
  }).join('');

  $$('.reward-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.reward);
      redeemReward(id);
    });
  });
}

function redeemReward(id) {
  const reward = state.rewards.find(r => r.id === id);
  if (!reward || state.balance < reward.cost) return;
  state.balance -= reward.cost;
  updateBalanceUI();
  renderRewards();
  showToast(`🎁 ${reward.name} resgatado!`);
}

function addAction(type) {
  const data = actionPoints[type];
  if (!data) return;
  state.balance += data.points;
  if (data.impact.packages) state.packages += data.impact.packages;
  if (data.impact.trips) state.trips += data.impact.trips;
  if (data.impact.bottles) state.bottles += data.impact.bottles;
  if (data.impact.plastic) state.plastic = +(state.plastic + data.impact.plastic).toFixed(2);
  state.history.unshift({
    id: Date.now(),
    action: type,
    title: data.title,
    points: data.points,
    date: formatDate(),
    icon: data.icon
  });
  updateBalanceUI();
  renderHistory();
  renderRewards();
  showToast(`+${data.points} Eco-Moedas · ${data.title}`);
}

function switchSection(sectionId) {
  $$('.section').forEach(s => s.classList.remove('active'));
  $$('.nav-item').forEach(n => n.classList.remove('active'));
  $(`#${sectionId}`).classList.add('active');
  $(`.nav-item[data-section="${sectionId}"]`).classList.add('active');
}

function init() {
  updateBalanceUI();
  renderHistory();
  renderRewards();

  $$('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => switchSection(btn.dataset.section));
  });

  $$('.action-card').forEach(card => {
    card.addEventListener('click', () => addAction(card.dataset.action));
  });
}

init();
