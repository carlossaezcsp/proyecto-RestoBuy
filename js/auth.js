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
    // Limpiar el estado de autenticación
    const state = AppState.get();
    state.isAuthenticated = false;
    // Mantener el nombre del jefe pero limpiar autenticación
    AppState.save();
    
    // Limpiar los campos del formulario de login
    const userInput = document.getElementById('loginUser');
    const passInput = document.getElementById('loginPass');
    const jefeInput = document.getElementById('jefeName');
    
    if (userInput) userInput.value = '';
    if (passInput) passInput.value = '';
    if (jefeInput) jefeInput.value = '';
    
    // Recargar la página para mostrar el login limpio
    location.reload();
}

function isAuthenticated() {
    return AppState.get().isAuthenticated === true;
}

function getJefeName() {
    return AppState.get().jefeName || 'Jefe(a)';
}

function verifyPassword(password) {
    return password === AUTH_CREDENTIALS.password;
}

window.Auth = { login, logout, isAuthenticated, getJefeName, verifyPassword };
