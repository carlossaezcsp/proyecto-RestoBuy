// =============================================
// suppliers.js - Gestión de proveedores
// =============================================

function addSupplier(itemId, name, price, address) {
    const state = AppState.get();
    const nameValid = Items.validateTextField(name, 2);
    if (!nameValid.valid) return { success: false, message: `Nombre: ${nameValid.message}` };
    const addressValid = Items.validateTextField(address, 3);
    if (!addressValid.valid) return { success: false, message: `Dirección: ${addressValid.message}` };
    const item = state.items.find(i => i.id === itemId);
    if (!item) return { success: false, message: 'Producto no encontrado' };
    const supplier = {
        id: getNextId(state),
        itemId: itemId,
        name: nameValid.value,
        price: Number(price),
        address: addressValid.value,
        createdAt: new Date().toISOString(),
    };
    state.suppliers.push(supplier);
    AppState.save();
    return { success: true, supplier };
}

function deleteSupplier(supplierId) {
    const state = AppState.get();
    const index = state.suppliers.findIndex(s => s.id === supplierId);
    if (index === -1) return { success: false, message: 'Proveedor no encontrado' };
    state.suppliers.splice(index, 1);
    AppState.save();
    return { success: true };
}

function getSuppliersByItem(itemId) {
    const state = AppState.get();
    return state.suppliers.filter(s => s.itemId === itemId);
}

function searchInMaps(productName, queryType = 'nearby') {
    const encoded = encodeURIComponent(productName);
    const urls = {
        cheapest: `https://www.google.com/maps/search/${encoded}+precio+barato`,
        nearest: `https://www.google.com/maps/search/${encoded}+cerca`,
        convenient: `https://www.google.com/maps/search/${encoded}+mejor+opcion`,
    };
    window.open(urls[queryType] || urls.nearby, '_blank');
}

function openSupplierInMaps(address, name) {
    const encoded = encodeURIComponent(`${name} ${address}`);
    window.open(`https://www.google.com/maps/search/${encoded}`, '_blank');
}

window.Suppliers = { addSupplier, deleteSupplier, getSuppliersByItem, searchInMaps, openSupplierInMaps };