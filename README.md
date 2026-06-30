[readme.md](https://github.com/user-attachments/files/29526342/readme.md)
# 🍽️ RestoBuy - Gestor de Compras para Restaurantes

## 📋 Descripción

**RestoBuy** es una aplicación web para la gestión de compras en restaurantes. Permite administrar el presupuesto general y por categorías, gestionar productos de compra, registrar proveedores, y visualizar análisis financieros a través de gráficos interactivos.

---

## 🚀 Características Principales

### 🔐 Autenticación y Seguridad
- Login de jefatura con credenciales fijas
- Protección con contraseña para modificar saldos
- Validación de saldos por categoría (no pueden superar el saldo general)

### 💰 Gestión de Presupuesto
- Saldo general inicial (protegido con contraseña)
- Saldo general actual (se actualiza automáticamente con cada compra)
- Saldo individual por categoría (5 categorías: Alimentos, Bebidas, Artículos de Mesa, Limpieza, Otros)
- Validación: suma de saldos por categoría no puede superar el saldo general
- Alerta automática cuando el saldo baja del 10% (general y por categoría)
- Los saldos solo se pueden modificar con contraseña de jefatura

### 📦 Gestión de Productos
- CRUD completo de productos
- Campos: nombre, descripción, categoría, cantidad, urgencia
- Sin precio estimado (se ingresa al comprar)
- Productos agrupados por categoría con scroll horizontal
- Etiquetas de estado: "Por comprar" y "Comprado"
- Validación de compras: no pueden superar el saldo de la categoría

### 📍 Gestión de Proveedores
- Botón "Proveedores" en cada producto
- Búsqueda en Google Maps (más barato, más cercano, más conveniente)
- Registrar proveedores manualmente (nombre, precio, dirección)

### 📊 Análisis y Gráficos
- **Gráfico de Gasto por Categoría**: Visualiza el gasto acumulado por categoría
- **Gráfico de Gasto por Producto**: Visualiza el gasto acumulado por producto
- **Estadísticas de Análisis**:
  - Gasto Actual (total de compras realizadas)
  - Gasto Mes Anterior (estimado basado en el mes actual)
  - Categoría más gastada
  - Ítem más recurrente (producto más comprado)
  - Total de productos
  - Pendientes de compra

### 💾 Persistencia
- Todos los datos guardados en localStorage
- Recuperación automática al recargar la página

### 📥 Exportación de Datos
- Exportar todos los datos del mes a CSV (compatible con Excel)
- Incluye: saldos, productos, movimientos y proveedores

---

## 🔑 Credenciales de Acceso

| Usuario | Contraseña |
|---------|------------|
| `admin` | `restaurant2026` |

---

## 📂 Estructura del Proyecto

📁 restobuy/
├── index.html # Página principal
├── README.md # Documentación
├── USO_IA.md # Uso de IA
├── 📁 css/
│ └── style.css # Estilos
└── 📁 js/
├── state.js # Estado global + localStorage
├── auth.js # Autenticación
├── budget.js # Lógica de saldos y alertas
├── items.js # CRUD de productos
├── suppliers.js # Gestión de proveedores
├── dom.js # Renderizado DOM
├── charts.js # Gráficos y análisis
├── export.js # Exportación a CSV
└── app.js # Orquestador principal


---

## 🚀 Cómo Ejecutar

1. Clona o descarga los archivos
2. Abre `index.html` en tu navegador
3. Inicia sesión con las credenciales
4. Configura los saldos (requiere contraseña)
5. Comienza a gestionar tus compras

> **Nota:** No necesita servidor web. Todos los datos se guardan en localStorage.

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Uso |
|------------|-----|
| **HTML5** | Estructura de la aplicación |
| **CSS3** | Estilos y diseño responsivo |
| **JavaScript (Vanilla)** | Lógica de la aplicación |
| **Chart.js** | Gráficos interactivos |
| **LocalStorage** | Persistencia de datos |
| **Google Fonts** | Tipografía Space Grotesk + Inter |

---

## 🧠 Uso de IA

Este proyecto fue desarrollado con apoyo de herramientas de Inteligencia Artificial. Ver [`USO_IA.md`](./USO_IA.md) para detalles de los prompts utilizados y mejoras aplicadas.

---

## 👥 Autores

- **Equipo de Desarrollo** - *Sumativa 2 - INACAP*

---

## 📄 Licencia

Este proyecto es de uso académico para la asignatura de Desarrollo de Aplicaciones Web.
