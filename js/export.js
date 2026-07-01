// =============================================
// export.js - Exportar datos a CSV/Excel
// =============================================

function exportData() {
    const state = AppState.get();
    const jefeName = state.jefeName || 'Jefe(a)';
    const mes = getCurrentMonthYear();

    // ====== 1. RESULTADOS GENERALES ======
    const generalData = [
        ['=== RESTOBUY - REPORTE DE COMPRAS ==='],
        [''],
        ['Jefe(a):', jefeName],
        ['Periodo:', mes],
        [''],
        ['=== SALDOS ==='],
        ['Saldo General Inicial:', Budget.formatCurrency(state.initialGeneralBudget)],
        ['Saldo General Actual:', Budget.formatCurrency(state.generalBudget)],
        [''],
        ['=== SALDOS POR CATEGORÍA ==='],
        ['Categoría', 'Saldo Inicial', 'Saldo Actual', 'Estado'],
    ];

    const categories = ['alimentos', 'bebidas', 'mesa', 'limpieza', 'otros'];
    const catLabels = {
        alimentos: 'Alimentos',
        bebidas: 'Bebidas',
        mesa: 'Artículos de Mesa',
        limpieza: 'Limpieza',
        otros: 'Otros'
    };

    categories.forEach(cat => {
        const data = state.categoryBudgets[cat];
        if (data) {
            const estado = data.current < data.initial * 0.1 ? '⚠️ CRÍTICO' : 'OK';
            generalData.push([
                catLabels[cat] || cat,
                Budget.formatCurrency(data.initial),
                Budget.formatCurrency(data.current),
                estado
            ]);
        }
    });

    generalData.push(['']);
    generalData.push(['=== PRODUCTOS ===']);
    generalData.push(['ID', 'Nombre', 'Categoría', 'Cantidad', 'Precio Unitario', 'Total', 'Urgencia', 'Estado']);

    state.items.forEach(item => {
        const total = item.purchased ? (item.price * item.quantity) : 0;
        const estado = item.purchased ? 'Comprado' : 'Pendiente';
        generalData.push([
            item.id,
            item.name,
            catLabels[item.category] || item.category,
            item.quantity,
            item.purchased ? Budget.formatCurrency(item.price) : 'Pendiente',
            item.purchased ? Budget.formatCurrency(total) : 'Pendiente',
            item.urgency,
            estado
        ]);
    });

    generalData.push(['']);
    generalData.push(['=== MOVIMIENTOS ===']);
    generalData.push(['ID', 'Tipo', 'Categoría', 'Monto', 'Fecha', 'Descripción']);

    state.movements.forEach(m => {
        const tipo = m.type === 'purchase' ? 'COMPRA REAL' : 'ESTIMADO';
        generalData.push([
            m.id || '',
            tipo,
            catLabels[m.category] || m.category || '',
            Budget.formatCurrency(m.amount),
            new Date(m.date).toLocaleString('es-CL'),
            m.description || ''
        ]);
    });

    generalData.push(['']);
    generalData.push(['=== PROVEEDORES ===']);
    generalData.push(['ID', 'Producto ID', 'Nombre', 'Precio', 'Dirección']);

    state.suppliers.forEach(s => {
        const item = state.items.find(i => i.id === s.itemId);
        generalData.push([
            s.id,
            s.itemId,
            s.name,
            Budget.formatCurrency(s.price),
            s.address
        ]);
    });

    // ====== 2. GENERAR CSV ======
    const csvContent = generalData.map(row => 
        row.map(cell => {
            if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
                return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
        }).join(',')
    ).join('\n');

    // ====== 3. DESCARGAR ======
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `RestoBuy_Reporte_${jefeName.replace(/\s/g, '_')}_${mes.replace(/\s/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    DOM.showToast('✅ Datos exportados correctamente', 'success');
}

function getCurrentMonthYear() {
    const now = new Date();
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${months[now.getMonth()]} ${now.getFullYear()}`;
}

// Exportar función
window.Export = { exportData };