// =============================================
// charts.js - Gráficos y análisis
// =============================================

let categoryChartInstance = null;
let productChartInstance = null;

function updateCharts() {
    const state = AppState.get();
    if (!state || state.movements.length === 0) {
        document.querySelectorAll('.chart-card canvas').forEach(canvas => {
            const parent = canvas.parentElement;
            const msg = parent.querySelector('.no-data-msg');
            if (!msg) {
                const p = document.createElement('p');
                p.className = 'no-data-msg';
                p.textContent = 'Sin movimientos para graficar';
                p.style.cssText = 'color: var(--text-muted); text-align: center; padding: 2rem 0;';
                parent.appendChild(p);
            }
            canvas.style.display = 'none';
        });
        return;
    }
    document.querySelectorAll('.no-data-msg').forEach(el => el.remove());
    document.querySelectorAll('.chart-card canvas').forEach(canvas => canvas.style.display = 'block');
    updateCategoryChart(state);
    updateProductChart(state);
}

function updateCategoryChart(state) {
    const ctx = document.getElementById('categoryChart')?.getContext('2d');
    if (!ctx) return;
    const categories = ['alimentos', 'bebidas', 'mesa', 'limpieza', 'otros'];
    const labels = { alimentos: 'Alimentos', bebidas: 'Bebidas', mesa: 'Art. Mesa', limpieza: 'Limpieza', otros: 'Otros' };
    const spent = categories.map(cat => state.movements.filter(m => m.type === 'purchase' && m.category === cat).reduce((sum, m) => sum + m.amount, 0));
    const colors = ['#4F8EF7', '#22C55E', '#EAB308', '#EF4444', '#8B5CF6'];
    if (categoryChartInstance) categoryChartInstance.destroy();
    categoryChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories.map(c => labels[c] || c),
            datasets: [
                { 
                    label: 'Gasto por Categoría', 
                    data: spent, 
                    backgroundColor: colors.map(c => c + 'CC'), 
                    borderColor: colors, 
                    borderWidth: 2 
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { 
                    labels: { 
                        color: '#94A3B8', 
                        font: { size: 10 }, 
                        boxWidth: 12, 
                        padding: 8 
                    } 
                } 
            },
            scales: {
                x: { ticks: { color: '#64748B', font: { size: 9 } }, grid: { display: false } },
                y: { ticks: { color: '#64748B', font: { size: 9 }, callback: (value) => Budget.formatCurrency(value) }, grid: { color: 'rgba(53,60,82,0.3)' } }
            }
        }
    });
}

function updateProductChart(state) {
    const ctx = document.getElementById('productChart')?.getContext('2d');
    if (!ctx) {
        const chartContainer = document.querySelector('.charts-grid');
        if (chartContainer) {
            const card = document.createElement('div');
            card.className = 'chart-card';
            card.innerHTML = `
                <h4>📊 Gasto por Producto</h4>
                <canvas id="productChart"></canvas>
            `;
            chartContainer.appendChild(card);
        }
        setTimeout(() => updateProductChart(state), 50);
        return;
    }
    
    const productSpending = {};
    state.movements
        .filter(m => m.type === 'purchase' && m.itemId)
        .forEach(m => {
            const item = state.items.find(i => i.id === m.itemId);
            if (item) {
                const key = item.name;
                productSpending[key] = (productSpending[key] || 0) + m.amount;
            }
        });
    
    const productNames = Object.keys(productSpending);
    const productAmounts = Object.values(productSpending);
    
    if (productNames.length === 0) {
        const canvas = document.getElementById('productChart');
        const parent = canvas.parentElement;
        const msg = parent.querySelector('.no-data-msg');
        if (!msg) {
            const p = document.createElement('p');
            p.className = 'no-data-msg';
            p.textContent = 'Sin compras registradas';
            p.style.cssText = 'color: var(--text-muted); text-align: center; padding: 2rem 0;';
            parent.appendChild(p);
        }
        canvas.style.display = 'none';
        return;
    }
    
    const colors = ['#4F8EF7', '#22C55E', '#EAB308', '#EF4444', '#8B5CF6', '#EC4899', '#F97316', '#06B6D4', '#8B5CF6', '#14B8A6'];
    
    if (productChartInstance) productChartInstance.destroy();
    productChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: productNames,
            datasets: [
                { 
                    label: 'Gasto por Producto', 
                    data: productAmounts, 
                    backgroundColor: productNames.map((_, i) => colors[i % colors.length] + 'CC'), 
                    borderColor: productNames.map((_, i) => colors[i % colors.length]), 
                    borderWidth: 2 
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { 
                    labels: { 
                        color: '#94A3B8', 
                        font: { size: 10 }, 
                        boxWidth: 12, 
                        padding: 8 
                    } 
                } 
            },
            scales: {
                x: { 
                    ticks: { 
                        color: '#64748B', 
                        font: { size: 8 }, 
                        maxRotation: 45,
                        minRotation: 30
                    }, 
                    grid: { display: false } 
                },
                y: { 
                    ticks: { 
                        color: '#64748B', 
                        font: { size: 9 }, 
                        callback: (value) => Budget.formatCurrency(value) 
                    }, 
                    grid: { color: 'rgba(53,60,82,0.3)' } 
                }
            }
        }
    });
}

function renderAnalysis() {
    const container = document.getElementById('analysisStats');
    if (!container) return;
    const state = AppState.get();
    
    // Gasto total actual (compras reales)
    const totalSpent = state.movements
        .filter(m => m.type === 'purchase')
        .reduce((sum, m) => sum + m.amount, 0);
    
    // ===== GASTO MES ANTERIOR =====
    // Verificar si hay movimientos de meses anteriores
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Filtrar movimientos de meses anteriores
    const previousMonthMovements = state.movements.filter(m => {
        const date = new Date(m.date);
        return (date.getMonth() !== currentMonth || date.getFullYear() !== currentYear);
    });
    
    // Calcular gasto del mes anterior
    let previousMonthSpending = 0;
    if (previousMonthMovements.length > 0) {
        previousMonthSpending = previousMonthMovements
            .filter(m => m.type === 'purchase')
            .reduce((sum, m) => sum + m.amount, 0);
    }
    // Si no hay movimientos de meses anteriores, mostrar "$0"
    
    // ===== ÍTEM MÁS RECURRENTE =====
    // Contar compras por producto (cada compra cuenta como 1)
    const itemCounts = {};
    state.movements
        .filter(m => m.type === 'purchase' && m.itemId)
        .forEach(m => {
            // Contar cada compra como 1 (independientemente de la cantidad)
            itemCounts[m.itemId] = (itemCounts[m.itemId] || 0) + 1;
        });
    
    let mostRecurrent = null;
    let maxCount = 0;
    for (const [id, count] of Object.entries(itemCounts)) {
        if (count > maxCount) {
            maxCount = count;
            const item = state.items.find(i => i.id === parseInt(id));
            if (item) mostRecurrent = item;
        }
    }
    
    // Si no hay compras, mostrar "N/A"
    if (Object.keys(itemCounts).length === 0) {
        mostRecurrent = null;
        maxCount = 0;
    }
    
    // Categoría con mayor gasto
    const catSpending = {};
    state.movements
        .filter(m => m.type === 'purchase')
        .forEach(m => {
            catSpending[m.category] = (catSpending[m.category] || 0) + m.amount;
        });
    const topCat = Object.entries(catSpending).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];

    const html = `
        <div class="analysis-stat">
            <span class="stat-value">${Budget.formatCurrency(totalSpent)}</span>
            <span class="stat-label">💰 Gasto Actual</span>
        </div>
        <div class="analysis-stat">
            <span class="stat-value">${previousMonthMovements.length > 0 ? Budget.formatCurrency(previousMonthSpending) : '$0'}</span>
            <span class="stat-label">📆 Gasto Mes Anterior</span>
        </div>
        <div class="analysis-stat">
            <span class="stat-value">${topCat[0] !== 'N/A' ? topCat[0].charAt(0).toUpperCase() + topCat[0].slice(1) : 'N/A'}</span>
            <span class="stat-label">🏷️ Categoría más gastada (${Budget.formatCurrency(topCat[1])})</span>
        </div>
        <div class="analysis-stat">
            <span class="stat-value">${mostRecurrent ? mostRecurrent.name : 'N/A'}</span>
            <span class="stat-label">🔄 Item más recurrente (${maxCount} compras)</span>
        </div>
        <div class="analysis-stat">
            <span class="stat-value">${state.items.length}</span>
            <span class="stat-label">📦 Total de productos</span>
        </div>
        <div class="analysis-stat">
            <span class="stat-value">${state.items.filter(i => !i.purchased).length}</span>
            <span class="stat-label">⏳ Pendientes de compra</span>
        </div>
    `;

    container.innerHTML = html;
}

function updateAllCharts() {
    updateCharts();
    renderAnalysis();
}

window.Charts = {
    updateCharts: updateCharts,
    renderAnalysis: renderAnalysis,
    updateAll: updateAllCharts
};
