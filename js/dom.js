// =============================================
// dom.js - Renderizado y manipulación DOM
// =============================================

/**
 * Renderiza la lista de productos en COLUMNAS con SCROLL HORIZONTAL
 * Cada columna tiene su propio scroll independiente
 */
function renderItemList(filters = {}) {
    const container = document.getElementById('itemList');
    if (!container) return;

    // Limpiar estilos inline previos
    container.style.display = 'flex';
    container.style.flexDirection = 'row';
    container.style.gap = '1rem';
    container.style.overflowX = 'auto';
    container.style.overflowY = 'visible';
    container.style.padding = '0.5rem 0.5rem 1rem 0.5rem';
    container.style.maxHeight = 'none';
    container.style.flexWrap = 'nowrap';
    container.style.alignItems = 'stretch';

    const items = Items.getItems(filters);
    const allCategories = ['alimentos', 'bebidas', 'mesa', 'limpieza', 'otros'];
    const categoryLabels = {
        alimentos: '🍎 Alimentos',
        bebidas: '🥤 Bebidas',
        mesa: '🍽️ Artículos de Mesa',
        limpieza: '🧹 Limpieza',
        otros: '📦 Otros'
    };
    const categoryIcons = {
        alimentos: '🍎',
        bebidas: '🥤',
        mesa: '🍽️',
        limpieza: '🧹',
        otros: '📦'
    };

    // Agrupar items por categoría
    const grouped = {};
    allCategories.forEach(cat => { grouped[cat] = []; });
    items.forEach(item => {
        if (grouped[item.category]) {
            grouped[item.category].push(item);
        }
    });

    const fragment = document.createDocumentFragment();

    allCategories.forEach(cat => {
        const column = document.createElement('div');
        column.className = 'category-column';

        // Header de la columna
        const header = document.createElement('div');
        header.className = 'category-column-header';
        
        const iconSpan = document.createElement('span');
        iconSpan.className = 'cat-icon';
        iconSpan.textContent = categoryIcons[cat] || '📦';
        header.appendChild(iconSpan);

        const nameSpan = document.createElement('span');
        nameSpan.className = 'cat-name';
        nameSpan.textContent = categoryLabels[cat] || cat;
        header.appendChild(nameSpan);

        const countSpan = document.createElement('span');
        countSpan.className = 'cat-count';
        countSpan.textContent = grouped[cat].length;
        header.appendChild(countSpan);

        column.appendChild(header);

        // Contenedor con scroll para productos
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'category-column-items';

        if (grouped[cat].length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'category-column-empty';
            emptyMsg.textContent = '📭 Sin productos';
            itemsContainer.appendChild(emptyMsg);
        } else {
            grouped[cat].forEach(item => {
                const card = createItemCard(item);
                itemsContainer.appendChild(card);
            });
        }

        column.appendChild(itemsContainer);
        fragment.appendChild(column);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
    updateItemCount(items.length);
}

/**
 * Crea una tarjeta de producto con etiquetas completas
 */
/**
 * Crea una tarjeta de producto SIN etiquetas de estado
 * Botones reorganizados: Comprar (color) arriba, Proveedores y Eliminar abajo (sin color)
 */
function createItemCard(item) {
    const card = document.createElement('div');
    card.className = `item-card ${item.purchased ? 'purchased' : ''}`;
    card.dataset.id = item.id;

    // Barra de prioridad (arriba)
    const priority = document.createElement('div');
    priority.className = `item-priority ${item.urgency}`;
    card.appendChild(priority);

    // Info
    const info = document.createElement('div');
    info.className = 'item-info';

    const title = document.createElement('div');
    title.className = 'item-title';
    title.textContent = item.name;
    info.appendChild(title);

    const desc = document.createElement('div');
    desc.className = 'item-desc';
    desc.textContent = item.description || 'Sin descripción';
    info.appendChild(desc);

    const meta = document.createElement('div');
    meta.className = 'item-meta';

    const qtySpan = document.createElement('span');
    qtySpan.textContent = `📦 ${item.quantity}`;
    meta.appendChild(qtySpan);

    const urgencyMap = { alta: '🔴 Alta', media: '🟡 Media', baja: '🟢 Baja' };
    const urgSpan = document.createElement('span');
    urgSpan.textContent = urgencyMap[item.urgency] || item.urgency;
    meta.appendChild(urgSpan);

    info.appendChild(meta);
    card.appendChild(info);

    // Precio
    const priceDiv = document.createElement('div');
    priceDiv.className = 'item-price';
    if (item.purchased && item.price > 0) {
        const totalCost = item.price * item.quantity;
        priceDiv.textContent = Budget.formatCurrency(totalCost);
    } else {
        priceDiv.textContent = '💰 Pendiente';
        priceDiv.style.color = 'var(--text-muted)';
        priceDiv.style.fontSize = '0.8rem';
    }
    card.appendChild(priceDiv);

    // Acciones: Comprar (arriba con color), Proveedores y Eliminar (abajo sin color)
    const actions = document.createElement('div');
    actions.className = 'item-actions';

    // Botón "Comprar" (solo si no está comprado) - CON COLOR
    if (!item.purchased) {
        const purchaseBtn = document.createElement('button');
        purchaseBtn.className = 'btn btn-success btn-sm';
        purchaseBtn.textContent = '✅ Comprar';
        purchaseBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            handlePurchaseItem(item.id);
        });
        actions.appendChild(purchaseBtn);
    }

    // Botón "Proveedores" - SIN COLOR (outline)
    const buyBtn = document.createElement('button');
    buyBtn.className = 'btn btn-primary btn-sm';
    buyBtn.textContent = '📍 Proveedores';
    buyBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        openSupplierModal(item.id);
    });
    actions.appendChild(buyBtn);

    // Botón "Eliminar" - SIN COLOR (outline)
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger btn-sm';
    deleteBtn.textContent = '🗑️ Eliminar';
    deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        handleDeleteItem(item.id);
    });
    actions.appendChild(deleteBtn);

    card.appendChild(actions);

    return card;
}

/**
 * Actualiza el contador de productos
 */
function updateItemCount(count) {
    const el = document.getElementById('itemCount');
    if (el) {
        el.textContent = `${count} producto${count !== 1 ? 's' : ''}`;
    }
}

/**
 * Renderiza los saldos por categoría
 */
function renderCategoryBudgets() {
    const container = document.getElementById('categoryBudgets');
    if (!container) return;

    const state = AppState.get();
    const categories = ['alimentos', 'bebidas', 'mesa', 'limpieza', 'otros'];
    const catLabels = {
        alimentos: '🍎 Alimentos',
        bebidas: '🥤 Bebidas',
        mesa: '🍽️ Artículos de Mesa',
        limpieza: '🧹 Limpieza',
        otros: '📦 Otros'
    };

    container.innerHTML = '';

    categories.forEach(cat => {
        const data = state.categoryBudgets[cat];
        if (!data) return;

        const item = document.createElement('div');
        item.className = 'category-budget-item';

        // Nombre de categoría + Saldo Inicial
        const label = document.createElement('span');
        label.className = 'cat-label';
        label.textContent = catLabels[cat] || cat;
        
        const initialSpan = document.createElement('span');
        initialSpan.className = 'cat-initial';
        initialSpan.textContent = `(Inicial: ${Budget.formatCurrency(data.initial)})`;
        label.appendChild(initialSpan);
        
        item.appendChild(label);

        // Saldo Actual
        const amount = document.createElement('span');
        amount.className = `cat-amount ${data.current < data.initial * 0.1 ? 'danger' : ''}`;
        amount.textContent = Budget.formatCurrency(data.current);
        item.appendChild(amount);

        // Alerta del 10%
        if (data.initial > 0 && data.current < data.initial * 0.1) {
            const alert = document.createElement('span');
            alert.className = 'cat-alert';
            alert.textContent = '⚠️ 10%';
            item.appendChild(alert);
        }

        container.appendChild(item);
    });

    updateGeneralBudgetDisplay(state);
}

/**
 * Actualiza el saldo general en el header y en el formulario
 * ELIMINÉ el saldo al lado del nombre del jefe
 */
function updateGeneralBudgetDisplay(state) {
    // Mostrar SOLO el nombre del jefe (sin saldo)
    const jefeEl = document.getElementById('jefeNameDisplay');
    if (jefeEl) {
        jefeEl.textContent = `👔 ${state.jefeName || 'Jefe(a)'}`;
    }

    // Mostrar saldo actual en el formulario de presupuesto (readonly)
    const currentDisplay = document.getElementById('currentGeneralBudgetDisplay');
    if (currentDisplay) {
        currentDisplay.value = Budget.formatCurrency(state.generalBudget || 0);
        if (state.initialGeneralBudget > 0 && state.generalBudget < state.initialGeneralBudget * 0.1) {
            currentDisplay.style.color = 'var(--red)';
        } else {
            currentDisplay.style.color = 'var(--green)';
        }
    }

    // Alerta del 10% general (se muestra en el header)
    const alertEl = document.getElementById('generalAlert');
    if (state.initialGeneralBudget > 0 && state.generalBudget < state.initialGeneralBudget * 0.1) {
        if (alertEl) {
            alertEl.textContent = '⚠️ Menos del 10%';
            alertEl.style.display = 'inline';
        }
    } else {
        if (alertEl) {
            alertEl.textContent = '';
            alertEl.style.display = 'none';
        }
    }
}

/**
 * Abre el modal de proveedores
 */
function openSupplierModal(itemId) {
    const modal = document.getElementById('supplierModal');
    const state = AppState.get();
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;

    const title = document.getElementById('modalProductName');
    if (title) title.textContent = `📍 ${item.name} - Proveedores`;

    modal.dataset.itemId = itemId;
    renderSuppliers(itemId);
    modal.style.display = 'flex';
}

/**
 * Renderiza la lista de proveedores en el modal
 */
function renderSuppliers(itemId) {
    const container = document.getElementById('supplierItems');
    if (!container) return;

    const suppliers = Suppliers.getSuppliersByItem(itemId);

    if (suppliers.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No hay proveedores registrados.</p>`;
        return;
    }

    const fragment = document.createDocumentFragment();

    suppliers.forEach(sup => {
        const div = document.createElement('div');
        div.className = 'supplier-item';

        const info = document.createElement('div');
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'sup-name';
        nameSpan.textContent = sup.name;
        info.appendChild(nameSpan);

        const priceSpan = document.createElement('span');
        priceSpan.className = 'sup-price';
        priceSpan.textContent = Budget.formatCurrency(sup.price);
        info.appendChild(priceSpan);

        const addrSpan = document.createElement('span');
        addrSpan.className = 'sup-address';
        addrSpan.textContent = `📍 ${sup.address}`;
        info.appendChild(addrSpan);

        div.appendChild(info);

        const actions = document.createElement('div');
        actions.className = 'sup-actions';

        const mapBtn = document.createElement('button');
        mapBtn.className = 'btn btn-outline btn-sm';
        mapBtn.textContent = '🗺️';
        mapBtn.title = 'Abrir en Maps';
        mapBtn.addEventListener('click', function() {
            Suppliers.openSupplierInMaps(sup.address, sup.name);
        });
        actions.appendChild(mapBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger btn-sm';
        deleteBtn.textContent = '✕';
        deleteBtn.title = 'Eliminar proveedor';
        deleteBtn.addEventListener('click', function() {
            if (confirm(`¿Eliminar proveedor "${sup.name}"?`)) {
                Suppliers.deleteSupplier(sup.id);
                renderSuppliers(itemId);
                showToast('Proveedor eliminado', 'success');
            }
        });
        actions.appendChild(deleteBtn);

        div.appendChild(actions);
        fragment.appendChild(div);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
}

/**
 * Cierra el modal de proveedores
 */
function closeSupplierModal() {
    document.getElementById('supplierModal').style.display = 'none';
}

/**
 * Muestra un toast (notificación)
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const icon = document.createElement('span');
    icon.textContent = icons[type] || 'ℹ️';
    toast.appendChild(icon);

    const text = document.createElement('span');
    text.textContent = message;
    toast.appendChild(text);

    container.appendChild(toast);

    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(function() {
            if (toast.parentNode) toast.remove();
        }, 400);
    }, 4000);
}

/**
 * Maneja la compra de un item (con input de precio real)
 */
function handlePurchaseItem(itemId) {
    const realPrice = prompt('Ingrese el precio real pagado (CLP):');
    if (realPrice === null) return;

    const result = Items.purchaseItem(itemId, Number(realPrice));
    if (result.success) {
        showToast(`✅ Compra registrada! Diferencia: ${Budget.formatCurrency(result.difference)}`, 'success');
        refreshUI();
    } else {
        showToast(`❌ ${result.message}`, 'error');
    }
}

/**
 * Maneja la eliminación de un item
 */
function handleDeleteItem(itemId) {
    if (!confirm('¿Eliminar este producto?')) return;

    const result = Items.deleteItem(itemId);
    if (result.success) {
        showToast('Producto eliminado', 'success');
        refreshUI();
    } else {
        showToast(`❌ ${result.message}`, 'error');
    }
}

/**
 * Refresca toda la UI
 */
function refreshUI() {
    const filters = getCurrentFilters();
    renderItemList(filters);
    renderCategoryBudgets();
    updateGeneralBudgetDisplay(AppState.get());

    if (window.Charts && typeof window.Charts.updateCharts === 'function') {
        window.Charts.updateCharts();
    }
    if (window.Charts && typeof window.Charts.renderAnalysis === 'function') {
        window.Charts.renderAnalysis();
    }
}

/**
 * Obtiene los filtros actuales de la UI
 */
function getCurrentFilters() {
    const search = document.getElementById('searchInput')?.value || '';
    const category = document.getElementById('filterCategory')?.value || 'all';
    const urgency = document.getElementById('filterUrgency')?.value || 'all';
    const status = document.getElementById('filterStatus')?.value || 'all';

    return { search, category, urgency, status };
}

/**
 * Configura los event listeners del DOM
 */
function setupDOMListeners() {
    // Filtros
    document.getElementById('searchInput')?.addEventListener('input', refreshUI);
    document.getElementById('filterCategory')?.addEventListener('change', refreshUI);
    document.getElementById('filterUrgency')?.addEventListener('change', refreshUI);
    document.getElementById('filterStatus')?.addEventListener('change', refreshUI);

    // Modal
    document.getElementById('modalClose')?.addEventListener('click', closeSupplierModal);
    document.addEventListener('click', function(e) {
        const modal = document.getElementById('supplierModal');
        if (e.target === modal) closeSupplierModal();
    });

    // Botones de búsqueda en Maps (desde modal)
    document.getElementById('searchCheapest')?.addEventListener('click', function() {
        const modal = document.getElementById('supplierModal');
        const itemId = parseInt(modal.dataset.itemId);
        const state = AppState.get();
        const item = state.items.find(i => i.id === itemId);
        if (item) Suppliers.searchInMaps(item.name, 'cheapest');
    });

    document.getElementById('searchNearest')?.addEventListener('click', function() {
        const modal = document.getElementById('supplierModal');
        const itemId = parseInt(modal.dataset.itemId);
        const state = AppState.get();
        const item = state.items.find(i => i.id === itemId);
        if (item) Suppliers.searchInMaps(item.name, 'nearest');
    });

    document.getElementById('searchConvenient')?.addEventListener('click', function() {
        const modal = document.getElementById('supplierModal');
        const itemId = parseInt(modal.dataset.itemId);
        const state = AppState.get();
        const item = state.items.find(i => i.id === itemId);
        if (item) Suppliers.searchInMaps(item.name, 'convenient');
    });

    // Formulario de proveedores
    document.getElementById('supplierForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const modal = document.getElementById('supplierModal');
        const itemId = parseInt(modal.dataset.itemId);

        const name = document.getElementById('supplierName').value.trim();
        const price = document.getElementById('supplierPrice').value;
        const address = document.getElementById('supplierAddress').value.trim();

        const result = Suppliers.addSupplier(itemId, name, Number(price), address);
        if (result.success) {
            showToast('✅ Proveedor registrado', 'success');
            renderSuppliers(itemId);
            document.getElementById('supplierForm').reset();
        } else {
            showToast(`❌ ${result.message}`, 'error');
        }
    });

    // Cerrar sesión
    document.getElementById('logoutBtn')?.addEventListener('click', function() {
        if (confirm('¿Cerrar sesión?')) {
            Auth.logout();
        }
    });
}

// Exportar globalmente
window.DOM = {
    renderItemList: renderItemList,
    renderCategoryBudgets: renderCategoryBudgets,
    refreshUI: refreshUI,
    showToast: showToast,
    openSupplierModal: openSupplierModal,
    closeSupplierModal: closeSupplierModal,
    setupDOMListeners: setupDOMListeners
};