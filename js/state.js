// =============================================
// state.js - Estado global y persistencia
// =============================================

const STORAGE_KEY = 'restobuy_state';

const defaultState = {
    isAuthenticated: false,
    jefeName: 'María González',
    generalBudget: 0,
    initialGeneralBudget: 0,
    categoryBudgets: {
        alimentos: { initial: 0, current: 0 },
        bebidas: { initial: 0, current: 0 },
        mesa: { initial: 0, current: 0 },
        limpieza: { initial: 0, current: 0 },
        otros: { initial: 0, current: 0 },
    },
    items: [],
    movements: [],
    suppliers: [],
    nextId: 1,
};

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return JSON.parse(JSON.stringify(defaultState));
        const parsed = JSON.parse(raw);
        const merged = { ...JSON.parse(JSON.stringify(defaultState)), ...parsed };
        for (const cat of ['alimentos', 'bebidas', 'mesa', 'limpieza', 'otros']) {
            if (!merged.categoryBudgets[cat]) {
                merged.categoryBudgets[cat] = { initial: 0, current: 0 };
            }
        }
        return merged;
    } catch (e) {
        return JSON.parse(JSON.stringify(defaultState));
    }
}

function saveState(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
}

function getNextId(state) {
    const id = state.nextId || 1;
    state.nextId = id + 1;
    return id;
}

const AppState = {
    state: null,
    init() {
        this.state = loadState();
        return this.state;
    },
    save() {
        saveState(this.state);
    },
    get() {
        return this.state;
    },
    set(newState) {
        this.state = newState;
        this.save();
    },
    getItemById(id) {
        return this.state.items.find(item => item.id === id);
    },
};

AppState.init();
window.AppState = AppState;