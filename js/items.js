// =============================================
// items.js - CRUD de productos
// =============================================

function sanitizeText(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;' };
    return text.replace(/[&<>"'/]/g, function (match) { return map[match]; });
}

function validateTextField(value, minLength = 2) {
    const sanitized = sanitizeText(value.trim());
    if (sanitized.length < minLength) {
        return { valid: false, message: `Mínimo ${minLength} caracteres` };
    }
    return { valid: true, value: sanitized };
}

function validateQuantity(value) {
    const num = Number(value);
    if (!Number.isInteger(num) || num <= 0) {
        return { valid: false, message: 'Cantidad debe ser entero positivo' };
    }
    return { valid: true, value: num };
}

function addItem(name, description, category, quantity, urgency) {
    const state = AppState.get();

    const nameValid = validateTextField(name, 2);
    if (!nameValid.valid) return { success: false, message: `Nombre: ${nameValid.message}` };

    const qtyValid = validateQuantity(quantity);
    if (!qtyValid.valid) return { success: false, message: `Cantidad: ${qtyValid.message}` };

    const price = 0;

    const newItem = {
        id: getNextId(state),
        name: nameValid.value,
        description: description || '',
        category: category,
        price: price,
        quantity: qtyValid.value,
        urgency: urgency || 'media',
        purchased: false,
        createdAt: new Date().toISOString(),
    };

    state.items.push(newItem);
    AppState.save();

    return { success: true, item: newItem };
}

function deleteItem(itemId) {
    const state = AppState.get();
    const index = state.items.findIndex(i => i.id === itemId);
    if (index === -1) return { success: false, message: 'Producto no encontrado' };
    const item = state.items[index];
    
    // Si el item estaba comprado, revertir el gasto
    if (item.purchased) {
        const revertResult = Budget.revertPurchase(itemId);
        if (!revertResult || !revertResult.success) {
            return { success: false, message: 'Error al revertir la compra' };
        }
    } else {
        // Si no está comprado, solo eliminar movimientos de estimado
        state.movements = state.movements.filter(m => !(m.itemId === itemId && m.type === 'estimate'));
    }
    
    state.items.splice(index, 1);
    AppState.save();
    Budget.checkBudgetAlerts(state);
    return { success: true };
}

function purchaseItem(itemId, realPrice) {
    const state = AppState.get();
    const item = state.items.find(i => i.id === itemId);
    if (!item) return { success: false, message: 'Producto no encontrado' };
    if (item.purchased) return { success: false, message: 'Producto ya comprado' };
    
    // Validar que el precio sea válido
    if (isNaN(realPrice) || realPrice <= 0) {
        return { success: false, message: 'Precio debe ser mayor a 0' };
    }
    
    // Registrar la compra (resta del saldo)
    const result = Budget.recordPurchase(itemId, realPrice);
    if (!result || !result.success) {
        return { success: false, message: result?.message || 'Error al registrar compra' };
    }
    
    AppState.save();
    return { success: true, item: result.item, realPrice: result.realPrice };
}

function getItems(filters = {}) {
    const state = AppState.get();
    let items = [...state.items];
    if (filters.category && filters.category !== 'all') {
        items = items.filter(i => i.category === filters.category);
    }
    if (filters.urgency && filters.urgency !== 'all') {
        items = items.filter(i => i.urgency === filters.urgency);
    }
    if (filters.status === 'pending') items = items.filter(i => !i.purchased);
    else if (filters.status === 'purchased') items = items.filter(i => i.purchased);
    if (filters.search) {
        const term = sanitizeText(filters.search.trim().toLowerCase());
        items = items.filter(i => i.name.toLowerCase().includes(term) || i.description.toLowerCase().includes(term));
    }
    return items;
}

window.Items = { addItem, deleteItem, purchaseItem, getItems, sanitizeText, validateTextField, validateQuantity };