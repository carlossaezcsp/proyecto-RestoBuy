[uso_IA.md](https://github.com/user-attachments/files/29526370/uso_IA.md)
# 🤖 Uso de Inteligencia Artificial - RestoBuy

## 📋 Descripción

Este documento detalla el uso de herramientas de Inteligencia Artificial (ChatGPT) para apoyar el desarrollo de la aplicación **RestoBuy**. Se incluyen los prompts utilizados, las mejoras aplicadas y el razonamiento detrás de cada decisión.

---

## 🧠 Prompt #1: Estructura de Estado y Persistencia

**Prompt:**
> "Necesito una estructura de estado para una app de gestión de compras de restaurante. Debe incluir: saldo general, saldo por categoría (alimentos, bebidas, mesa, limpieza, otros), array de productos (con id, nombre, categoría, precio, cantidad, urgencia, comprado), array de movimientos (tipo estimado/real, categoría, monto, fecha), array de proveedores. También necesito persistencia en localStorage."

**Mejora aplicada:**
- Se creó `state.js` con estado centralizado
- Funciones de carga/guardado en localStorage
- Validación de integridad de datos al cargar
- Estructura anidada con objetos para categorías

**Razonamiento:** La IA sugirió una estructura de estado robusta con persistencia automática, asegurando que los datos no se pierdan al recargar la página.

---

## 🧠 Prompt #2: Validaciones y Seguridad

**Prompt:**
> "Necesito funciones de validación para un formulario de productos: nombre (mínimo 2 caracteres, sanitizado), cantidad (entero positivo). Además, quiero prevenir XSS usando textContent y createElement en lugar de innerHTML. Dame funciones de sanitización y validación."

**Mejora aplicada:**
- Función `sanitizeText()` que escapa caracteres especiales
- Funciones `validateTextField()` y `validateQuantity()` con mensajes de error claros
- Uso exclusivo de `textContent` y `createElement` en el renderizado DOM
- Prevención de XSS en todas las entradas de usuario

**Razonamiento:** La IA proporcionó funciones de sanitización robustas y reforzó las buenas prácticas de seguridad, cumpliendo con los requisitos de la actividad.

---

## 🧠 Prompt #3: Lógica de Saldos y Alertas

**Prompt:**
> "Necesito lógica para actualizar saldos: al comprar un producto se descuenta del saldo general y por categoría. Al eliminar un producto comprado, se debe devolver el saldo. Alertas cuando el saldo baje del 10% (general y por categoría). Validar que la suma de saldos por categoría no supere el saldo general."

**Mejora aplicada:**
- Función `recordPurchase()` que resta del saldo general y por categoría
- Función `revertPurchase()` que devuelve el saldo al eliminar una compra
- Función `checkBudgetAlerts()` con alertas visuales (toast) del 10%
- Validación de saldos por categoría en `app.js` al modificar presupuestos
- Protección con contraseña para modificar saldos

**Razonamiento:** La IA estructuró la lógica de saldos de forma clara, asegurando que cada compra descuente correctamente del presupuesto y que las alertas se activen cuando sea necesario.

---

## 🧠 Prompt #4: Gestión de Proveedores y Búsqueda en Maps

**Prompt:**
> "Botón 'Proveedores' que abra modal con búsqueda en Google Maps (más barato, más cercano, más conveniente) y registro manual de proveedores (nombre, precio, dirección)."

**Mejora aplicada:**
- Función `searchInMaps()` con 3 tipos de búsqueda
- Función `openSupplierInMaps()` para abrir direcciones específicas
- CRUD completo de proveedores en `suppliers.js`
- Modal con interfaz para registrar y gestionar proveedores

**Razonamiento:** La IA sugirió usar parámetros de búsqueda en Google Maps con palabras clave como "precio barato", "cerca", "mejor opción", y estructuró las funciones CRUD para proveedores.

---

## 🧠 Prompt #5: Gráficos y Análisis

**Prompt:**
> "Necesito gráficos para mostrar: gasto por categoría y gasto por producto. También estadísticas de análisis: gasto actual, gasto mes anterior, categoría más gastada, ítem más recurrente."

**Mejora aplicada:**
- Gráfico de barras para "Gasto por Categoría" con Chart.js
- Gráfico de barras para "Gasto por Producto" con Chart.js
- Estadísticas de análisis con datos en tiempo real
- Contador correcto de "ítem más recurrente" (por número de compras)

**Razonamiento:** La IA ayudó a estructurar los gráficos con datos dinámicos y a calcular correctamente las estadísticas de análisis.

---

## 🧠 Prompt #6: Scroll Horizontal y UI/UX

**Prompt:**
> "Las categorías deben mostrarse en columnas con scroll horizontal, mostrando solo 3 columnas visibles y las demás al deslizar. Las tarjetas deben tener letras más grandes, sin etiquetas de estado, y los botones reorganizados verticalmente."

**Mejora aplicada:**
- Scroll horizontal en `#itemList` con `display: flex` y `overflow-x: auto`
- Columnas con ancho fijo (300-360px) para mostrar 3 columnas
- Tarjetas con letras más grandes (0.95rem para títulos)
- Botones reorganizados: "Comprar" arriba (con color), "Proveedores" y "Eliminar" abajo (sin color)
- Eliminación de etiquetas de estado "Comprado" y "Por comprar"

**Razonamiento:** La IA sugirió usar flexbox para el scroll horizontal y reorganizar la interfaz para mejorar la experiencia de usuario.

---

## 🧠 Prompt #7: Exportación de Datos

**Prompt:**
> "Opción para exportar los datos del mes a Excel/CSV, incluyendo todos los movimientos, productos, saldos y proveedores."

**Mejora aplicada:**
- Archivo `export.js` con función `exportData()`
- Generación de CSV con formato compatible con Excel
- Incluye: saldos generales, saldos por categoría, productos, movimientos y proveedores
- Descarga automática del archivo

**Razonamiento:** La IA estructuró la exportación de datos de forma completa, asegurando que todos los datos relevantes se incluyan en el archivo CSV.

---

## 📊 Resumen de Mejoras Aplicadas

| Área | Mejora |
|------|--------|
| **Estructura de datos** | Estado centralizado con localStorage |
| **Seguridad** | Sanitización + textContent/createElement + contraseña para saldos |
| **Validaciones** | Funciones reutilizables y mensajes de error claros |
| **Saldos** | Lógica de compra/eliminación con validaciones y alertas del 10% |
| **Proveedores** | Búsqueda en Maps + registro manual |
| **Gráficos** | Chart.js con datos en tiempo real (categoría y producto) |
| **UI/UX** | Scroll horizontal, letras más grandes, botones reorganizados |
| **Exportación** | CSV completo con todos los datos |
| **Análisis** | Estadísticas con "Gasto Actual", "Gasto Mes Anterior", etc. |

---

## ✅ Conclusión

El uso de IA permitió:
1. Acelerar el desarrollo de funcionalidades complejas
2. Mejorar la calidad del código con buenas prácticas
3. Estructurar la app de forma modular y mantenible
4. Implementar validaciones, seguridad y gráficos robustos
5. Optimizar la interfaz de usuario para mejor experiencia

Todas las sugerencias fueron revisadas y adaptadas al contexto específico de la aplicación, asegurando que el código final sea funcional, seguro y cumpla con los requisitos del proyecto.
