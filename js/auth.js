// =============================================
// auth.js - Autenticación
// =============================================

const AUTH_CREDENTIALS = {
    username: 'admin',
    password: 'restaurant2026',
};

function authenticate(username, password) {
    return username === AUTH_CREDENTIALS.username && password === AUTH_CREDENTIALS.password;
}

function login(username, password, jefeName) {
    if (!authenticate(username, password)) {
        return { success: false, message: 'Usuario o contraseña incorrectos' };
    }
    const state = AppState.get();
    state.isAuthenticated = true;
    if (jefeName && jefeName.trim()) {
        state.jefeName = jefeName.trim();
    }
    AppState.save();
    return { success: true, message: 'Bienvenido, Jefatura' };
}

function logout() {
    const state = AppState.get();
    state.isAuthenticated = false;
    AppState.save();
    location.reload();
}

function isAuthenticated() {
    return AppState.get().isAuthenticated === true;
}

function getJefeName() {
    return AppState.get().jefeName || 'Jefe(a)';
}

// NUEVA FUNCIÓN: Verificar contraseña para acciones sensibles
function verifyPassword(password) {
    return password === AUTH_CREDENTIALS.password;
}

window.Auth = { login, logout, isAuthenticated, getJefeName, verifyPassword };