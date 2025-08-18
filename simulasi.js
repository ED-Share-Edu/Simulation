// Load data simulasi dari JSON dan render grid
let simulasiData = [];

// Fetch data
fetch('simulasi-data.json')
  .then(res => res.json())
  .then(data => {
    simulasiData = data;
    renderSimulationGrid(data);
    filterSimulations(); // agar counter dan noResult sinkron
  });

// Render grid simulasi
function renderSimulationGrid(data) {
  const grid = document.getElementById('simulationGrid');
  grid.innerHTML = data.map((sim, i) => `
    <div class="col-lg-4 col-md-6 simulation-card fade-in stagger-${((i%6)+1)}" 
         data-category="${sim.category}" data-grade="${sim.grade}" 
         data-title="${sim.title.toLowerCase()}" data-description="${sim.description}">
      <div class="card card-simulation h-100">
        <div class="card-body text-center p-4">
          <div class="simulation-icon text-${sim.badgeColor}">${sim.icon}</div>
          <div class="d-flex justify-content-center gap-2 mb-2">
            <span class="badge bg-${sim.badgeColor}${sim.badgeColor==='warning'?' text-dark':''}">${capitalize(sim.category)}</span>
            <span class="badge bg-secondary">Kelas ${sim.grade}</span>
          </div>
          <h5 class="card-title fw-semibold">${sim.title}</h5>
          <p class="card-text text-muted">${sim.desc}</p>
          <button class="btn btn-gradient text-white w-100" onclick="openSimulation('${sim.file}')">
            <i class="bi bi-play-fill"></i> Buka Simulasi
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Utility untuk kapitalisasi
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// --------- Search & Filter ---------
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const gradeFilter = document.getElementById('gradeFilter');
const simulationGrid = document.getElementById('simulationGrid');
const resultCount = document.getElementById('resultCount');
const noResults = document.getElementById('noResults');

function filterSimulations() {
  const searchTerm = (searchInput.value || '').toLowerCase();
  const selectedCategory = (categoryFilter.value || '').toLowerCase();
  const selectedGrade = gradeFilter.value;
  const cards = document.querySelectorAll('.simulation-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const category = card.dataset.category.toLowerCase();
    const grade = card.dataset.grade;
    const title = card.dataset.title.toLowerCase();
    const description = card.dataset.description.toLowerCase();
    
    const matchesSearch = !searchTerm ||
      title.includes(searchTerm) ||
      description.includes(searchTerm) ||
      category.includes(searchTerm);

    const matchesCategory = !selectedCategory || category === selectedCategory;
    const matchesGrade = !selectedGrade || grade === selectedGrade;

    if (matchesSearch && matchesCategory && matchesGrade) {
      card.style.display = 'block';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  resultCount.textContent = visibleCount;
  if (visibleCount === 0) {
    simulationGrid.style.display = 'none';
    noResults.style.display = 'block';
  } else {
    simulationGrid.style.display = 'flex';
    noResults.style.display = 'none';
  }
}

function clearFilters() {
  searchInput.value = '';
  categoryFilter.value = '';
  gradeFilter.value = '';
  filterSimulations();
}

// Event listeners
searchInput.addEventListener('input', filterSimulations);
categoryFilter.addEventListener('change', filterSimulations);
gradeFilter.addEventListener('change', filterSimulations);

// --------- Fungsi openSimulation (tidak berubah dari sebelumnya) ---------
function openSimulation(type) {
  const simulationLink = `simulasi-${type}.html`;
  fetch(simulationLink, { method: 'HEAD' })
    .then(response => {
      if (response.ok) {
        window.location.href = simulationLink;
      } else {
        showSimulationNotReady(type, simulationLink);
      }
    })
    .catch(() => {
      showSimulationNotReady(type, simulationLink);
    });
}

function showSimulationNotReady(simulationType, expectedFile) {
  const simulationCard = document.querySelector(`[onclick="openSimulation('${simulationType}')"]`).closest('.simulation-card');
  const simulationName = simulationCard.querySelector('.card-title').textContent;

  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold"><i class="bi bi-info-circle text-primary"></i> ${simulationName}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body text-center">
          <div class="mb-4"><i class="bi bi-file-earmark-code display-1 text-muted"></i></div>
          <h6 class="fw-semibold mb-3">Simulasi Sedang Dalam Pengembangan</h6>
          <p class="text-muted mb-3">File simulasi <code>${expectedFile}</code> belum tersedia.</p>
          <div class="alert alert-info">
            <i class="bi bi-lightbulb"></i> 
            <strong>Untuk Developer:</strong><br>
            Buat file <code>${expectedFile}</code> di folder yang sama dengan index ini
          </div>
          <p class="small text-muted">Simulasi akan otomatis dapat diakses setelah file HTML dibuat</p>
        </div>
        <div class="modal-footer border-0">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
          <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#requestModal" data-bs-dismiss="modal">
            <i class="bi bi-plus-circle"></i> Request Simulasi Ini
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
  modal.addEventListener('hidden.bs.modal', () => {
    document.body.removeChild(modal);
  });
}
