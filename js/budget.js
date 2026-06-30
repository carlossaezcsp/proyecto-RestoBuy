// =============================================
// budget.js - Gestión de saldos
// =============================================

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function deductEstimate(amount, category) {
    const state = AppState.get();
    
    if (state.categoryBudgets[category]) {
        if (state.categoryBudgets[category].current < amount) {
            return { 
                success: false, 
                message: `Saldo insuficiente en categoría ${category}. Disponible: ${formatCurrency(state.categoryBudgets[category].current)}` 
            };
        }
    }
    
    state.generalBudget -= amount;
    if (state.categoryBudgets[category]) {
        state.categoryBudgets[category].current -= amount;
    }
    state.movements.push({
        id: getNextId(state),
        type: 'estimate',
        category: category,
        amount: amount,
        date: new Date().toISOString(),
        description: `Estimado: -$${amount}`,
    });
    AppState.save();
    checkBudgetAlerts(state);
    return { success: true };
}

function recordPurchase(itemId, realPrice) {
    const state = AppState.get();
    const item = state.items.find(i => i.id === itemId);
    if (!item) return null;
    
    // VALIDACIÓN: Verificar que la categoría tenga saldo suficiente para la compra real
    if (state.categoryBudgets[item.category]) {
        if (state.categoryBudgets[item.category].current < realPrice) {
            return { 
                success: false, 
                message: `Saldo insuficiente en categoría ${item.category} para la compra real. Disponible: ${formatCurrency(state.categoryBudgets[item.category].current)}` 
            };
        }
    }
    
    // VALIDACIÓN: Verificar saldo general
    if (state.generalBudget < realPrice) {
        return { 
            success: false, 
            message: `Saldo general insuficiente. Disponible: ${formatCurrency(state.generalBudget)}` 
        };
    }
    
    // RESTAR del saldo general el precio REAL
    state.generalBudget -= realPrice;
    
    // RESTAR del saldo de categoría el precio REAL
    if (state.categoryBudgets[item.category]) {
        state.categoryBudgets[item.category].current -= realPrice;
    }
    
    // Registrar movimiento de compra real
    state.movements.push({
        id: getNextId(state),
        itemId: itemId,
        type: 'purchase',
        category: item.category,
        amount: realPrice,
        date: new Date().toISOString(),
        description: `Compra: ${item.name} - $${realPrice}`,
    });
    
    item.purchased = true;
    item.price = realPrice / item.quantity; // Guardar precio real por unidad
    
    AppState.save();
    checkBudgetAlerts(state);
    return { success: true, item, realPrice };
}

// NUEVA FUNCIÓN: Revertir una compra (al eliminar un producto comprado)
function revertPurchase(itemId) {
    const state = AppState.get();
    const item = state.items.find(i => i.id === itemId);
    if (!item) return null;
    if (!item.purchased) return null;
    
    // Buscar el movimiento de compra
    const purchaseMovement = state.movements.find(m => m.itemId === itemId && m.type === 'purchase');
    if (!purchaseMovement) return null;
    
    const amount = purchaseMovement.amount;
    
    // DEVOLVER al saldo general
    state.generalBudget += amount;
    
    // DEVOLVER al saldo de categoría
    if (state.categoryBudgets[item.category]) {
        state.categoryBudgets[item.category].current += amount;
    }
    
    // Eliminar el movimiento de compra
    state.movements = state.movements.filter(m => !(m.itemId === itemId && m.type === 'purchase'));
    
    // Marcar como no comprado
    item.purchased = false;
    item.price = 0;
    
    AppState.save();
    checkBudgetAlerts(state);
    return { success: true, item, amount };
}

function checkBudgetAlerts(state) {
    const alerts = [];
    if (state.initialGeneralBudget > 0) {
        const threshold = state.initialGeneralBudget * 0.1;
        if (state.generalBudget < threshold) {
            alerts.push({ type: 'general', message: `⚠️ Saldo general bajo: ${formatCurrency(state.generalBudget)}` });
            DOM.showToast(`⚠️ ALERTA: Saldo general por debajo del 10% (${formatCurrency(state.generalBudget)})`, 'warning');
        }
    }
    for (const [cat, data] of Object.entries(state.categoryBudgets)) {
        if (data.initial > 0 && data.current < data.initial * 0.1) {
            alerts.push({ type: 'category', category: cat, message: `⚠️ ${cat} bajo: ${formatCurrency(data.current)}` });
            DOM.showToast(`⚠️ ALERTA: Saldo de ${cat} por debajo del 10% (${formatCurrency(data.current)})`, 'warning');
        }
    }
    return alerts;
}

function validateCategoryBudgets(categoryBudgets, totalGeneral) {
    let sum = 0;
    for (const [cat, data] of Object.entries(categoryBudgets)) {
        sum += data.initial || 0;
    }
    return sum <= totalGeneral;
}

function getTotalCategoryBudgets(state) {
    let sum = 0;
    for (const [cat, data] of Object.entries(state.categoryBudgets)) {
        sum += data.initial || 0;
    }
    return sum;
}

window.Budget = { 
    deductEstimate, 
    recordPurchase, 
    revertPurchase,
    checkBudgetAlerts, 
    formatCurrency,
    validateCategoryBudgets,
    getTotalCategoryBudgets
};