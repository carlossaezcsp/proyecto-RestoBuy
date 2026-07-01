// =============================================
// app.js - Orquestador principal
// =============================================

function initApp() {
    if (Auth.isAuthenticated()) {
        showApp();
        loadAppData();
        setupEventListeners();
    } else {
        showLogin();
    }
    setupLoginListener();
    updateHeaderDate();
}

function showApp() {
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    updateHeaderDate();
}

function showLogin() {
    document.getElementById('loginOverlay').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
}

function updateHeaderDate() {
    const el = document.getElementById('headerDate');
    if (el) {
        const now = new Date();
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        el.textContent = `${months[now.getMonth()]} ${now.getFullYear()}`;
    }
}

function setupLoginListener() {
    const form = document.getElementById('loginForm');
    const errorEl = document.getElementById('loginError');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('loginUser').value.trim();
        const password = document.getElementById('loginPass').value.trim();
        const jefeName = document.getElementById('jefeName').value.trim();
        const result = Auth.login(username, password, jefeName);
        if (result.success) {
            errorEl.textContent = '';
            showApp();
            loadAppData();
            setupEventListeners();
            DOM.showToast('✅ Sesión iniciada correctamente', 'success');
        } else {
            errorEl.textContent = result.message;
            errorEl.style.color = 'var(--red)';
        }
    });
}

function loadAppData() {
    const state = AppState.get();
    if (state.initialGeneralBudget === 0) {
        document.getElementById('initialGeneralBudget').value = '';
    } else {
        document.getElementById('initialGeneralBudget').value = state.initialGeneralBudget;
    }
    const currentDisplay = document.getElementById('currentGeneralBudgetDisplay');
    if (currentDisplay) {
        currentDisplay.value = Budget.formatCurrency(state.generalBudget || 0);
    }
    DOM.renderCategoryBudgets();
    DOM.renderItemList();
    setTimeout(function() {
        if (window.Charts && typeof Charts.updateCharts === 'function') {
            Charts.updateCharts();
        }
        if (window.Charts && typeof Charts.renderAnalysis === 'function') {
            Charts.renderAnalysis();
        }
    }, 100);
}

function setupEventListeners() {
    document.getElementById('budgetForm').addEventListener('submit', handleBudgetSubmit);
    document.getElementById('itemForm').addEventListener('submit', handleItemSubmit);
    DOM.setupDOMListeners();

    document.getElementById('exportBtn').addEventListener('click', function() {
        if (window.Export && typeof Export.exportData === 'function') {
            Export.exportData();
        } else {
            DOM.showToast('❌ Error al exportar datos', 'error');
        }
    });
}

function handleBudgetSubmit(e) {
    e.preventDefault();
    
    // Solicitar contraseña para modificar saldos
    const password = prompt('🔒 Ingrese la contraseña de Jefatura para modificar los saldos:');
    if (password === null) return; // Canceló
    
    if (!Auth.verifyPassword(password)) {
        DOM.showToast('❌ Contraseña incorrecta. No se pueden modificar los saldos.', 'error');
        return;
    }
    
    const state = AppState.get();
    const generalInput = document.getElementById('initialGeneralBudget');
    const generalValue = Number(generalInput.value);
    
    if (!isNaN(generalValue) && generalValue >= 0) {
        state.initialGeneralBudget = generalValue;
        state.generalBudget = generalValue;
    }
    
    const categorySelect = document.getElementById('categoryBudgetSelect');
    const categoryInput = document.getElementById('categoryBudgetInput');
    const category = categorySelect.value;
    const catValue = Number(categoryInput.value);
    
    if (!isNaN(catValue) && catValue >= 0 && state.categoryBudgets[category]) {
        // Calcular la suma de todos los saldos de categoría (incluyendo el que se está modificando)
        let totalCategoryBudget = 0;
        for (const [cat, data] of Object.entries(state.categoryBudgets)) {
            if (cat === category) {
                totalCategoryBudget += catValue;
            } else {
                totalCategoryBudget += data.initial || 0;
            }
        }
        
        // Validar que no supere el saldo general
        if (totalCategoryBudget > state.initialGeneralBudget) {
            DOM.showToast(`❌ La suma de los saldos por categoría (${Budget.formatCurrency(totalCategoryBudget)}) no puede superar el saldo general (${Budget.formatCurrency(state.initialGeneralBudget)})`, 'error');
            return;
        }
        
        state.categoryBudgets[category].initial = catValue;
        state.categoryBudgets[category].current = catValue;
    }
    
    AppState.save();
    DOM.refreshUI();
    DOM.showToast('✅ Saldos actualizados correctamente', 'success');
}

function handleItemSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('itemName').value.trim();
    const description = document.getElementById('itemDesc').value.trim();
    const category = document.getElementById('itemCategory').value;
    const quantity = Number(document.getElementById('itemQty').value);
    const urgency = document.getElementById('itemUrgency').value;
    const result = Items.addItem(name, description, category, quantity, urgency);
    if (result.success) {
        DOM.showToast('✅ Producto agregado: ' + result.item.name, 'success');
        document.getElementById('itemForm').reset();
        DOM.refreshUI();
    } else {
        DOM.showToast('❌ ' + result.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', initApp);