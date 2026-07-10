# 🏭 Acme Producción - Macondo

Sistema de automatización del proceso productivo para la planta Acme en la ciudad de Macondo.

## 📋 Descripción del Proyecto

Aplicación web desarrollada con **HTML5**, **CSS3** y **JavaScript Vanilla (ES6+)** que permite gestionar:

- **Usuarios:** Registro y autenticación con doble validación de contraseña.
- **Inventario/Bodega:** Control de materia prima y productos terminados con fórmulas.
- **Producción:** Motor de transformación que consume materia prima y genera productos terminados.
- **Reportes:** Módulo analítico visual con métricas clave de la producción de la planta.

La persistencia de datos se realiza en **Firebase Realtime Database** mediante la API REST utilizando `fetch` con `async/await`.

---

## 🚀 Cómo Ejecutar el Proyecto

### Opción 1: Servidor Local (Recomendado)

1. Clonar o descargar el repositorio.
2. Abrir el proyecto en **Visual Studio Code**.
3. Instalar la extensión **Live Server** (Ritwick Dey).
4. Clic derecho en `index.html` → **"Open with Live Server"**.
5. El navegador se abrirá automáticamente en `http://127.0.0.1:5500`.

### Opción 2: Servidor Python

```bash
# Python 3
python -m http.server 5500

# Python 2
python -m SimpleHTTPServer 5500
Luego abrir: http://localhost:5500

Opción 3: Node.js (http-server)
npx http-server -p 5500⚠️ Importante
Es necesario usar un servidor local (no abrir el HTML directamente) debido a los módulos ES6 (type="module") y la política CORS.

La base de datos Firebase ya está configurada y lista para usar.
 Estructura del Proyecto
proyecto-acme-macondo/
│
├── index.html                  # Punto de entrada principal
├── style.css                   # Estilos globales, responsive, temas
├── README.md                   # Documentación técnica
│
├── src/
│   ├── main.js                 # Orquestador principal de la app y ruteo de módulos
│   │
│   ├── data/
│   │   └── dataManager.js      # Centralizador de peticiones Firebase
│   │                           # (GET, PUT, POST, PATCH, DELETE)
│   │
│   ├── components/             # Web Components encapsulados y reutilizables
│   │   ├── acme-toast.js       # Sistema de notificaciones emergentes
│   │   ├── acme-login.js       # Login y registro de usuarios
│   │   ├── acme-users.js       # CRUD completo de usuarios
│   │   ├── acme-inventory.js   # Gestión de inventario y fórmulas
│   │   └── acme-production.js  # Motor de producción
│   │
│   └── modules/                # Lógica operativa independiente
│       ├── auth.js             # Autenticación y sesiones
│       ├── inventory.js        # Operaciones de bodega
│       └── production.js       # Motor de transformación

Estructura de Datos en Firebase
Nodo: usuarios
{
  "usuarios": {
    "-O1AbC2dE3fG4hI5jK6l": {
      "identificacion": "123456789",
      "nombreCompleto": "Leo Escalona",
      "cargo": "Administrador",
      "password": "****",
      "fechaRegistro": "2024-01-15T10:30:00.000Z"
    }
  }
}
Nodo: inventario
{
  "inventario": {
    "-O2MnO3pQ4rS5tU6vW7x": {
      "codigo": "MP-001",
      "nombre": "Harina de trigo",
      "proveedor": "Distribuidora del Norte",
      "tipo": "materia_prima",
      "stock": 500,
      "unidad": "g",
      "stockMinimo": 1000,
      "fechaCreacion": "2024-01-10T08:00:00.000Z"
    },
    "-O3YzA4bC5dE6fG7hI8j": {
      "codigo": "PT-001",
      "nombre": "Galleta de mantequilla",
      "proveedor": "Acme",
      "tipo": "producto_terminado",
      "stock": 50,
      "unidad": "unidad",
      "formula": [
        { "codigoMP": "MP-001", "cantidad": 100 },
        { "codigoMP": "MP-002", "cantidad": 100 },
        { "codigoMP": "MP-003", "cantidad": 1 }
      ],
      "fechaCreacion": "2024-01-12T14:00:00.000Z"
    }
  }
}
unidad y stockMinimo son campos adicionales opcionales: los productos creados antes de esta actualización siguen funcionando igual, simplemente no muestran unidad ni alerta de stock mínimo hasta que se editen.
Nodo: produccion
{
  "produccion": {
    "-O4KlM5nO6pQ7rS8tU9v": {
      "codigo": "1",
      "productoKey": "-O3YzA4bC5dE6fG7hI8j",
      "codigoProducto": "PT-001",
      "nombreProducto": "Galleta de mantequilla",
      "cantidadProducida": 10,
      "materiaPrimaConsumida": [
        { "codigo": "MP-001", "nombre": "Harina de trigo", "cantidad": 1000, "stockAnterior": 500, "stockNuevo": 400 },
        { "codigo": "MP-002", "nombre": "Mantequilla", "cantidad": 1000, "stockAnterior": 300, "stockNuevo": 200 },
        { "codigo": "MP-003", "nombre": "Huevo", "cantidad": 10, "stockAnterior": 100, "stockNuevo": 90 }
      ],
      "usuarioNombre": "Juan Pérez",
      "fecha": "2024-01-20T16:45:00.000Z",
      "timestamp": 1705767900000
    }
  }
}
Nodo: mermas
{
  "mermas": {
    "-O5PqR6sT7uV8wX9yZ0a": {
      "codigoProducto": "MP-002",
      "nombreProducto": "Mantequilla",
      "cantidad": 20,
      "unidad": "g",
      "motivo": "Producto vencido",
      "stockAnterior": 200,
      "stockNuevo": 180,
      "usuario": "Juan Pérez",
      "fecha": "2024-01-21T09:15:00.000Z"
    }
  }
}
⚡ Funcionalidades Implementadas
🔐 Login / Autenticación
Acceso por identificación + contraseña.

Validación de credenciales contra Firebase.

Navegación lateral oculta hasta el login exitoso.

Sesión persistente con localStorage (mantenimiento de estado al recargar).

Cierre de sesión completo con limpieza de almacenamiento local.

Estados de carga (spinners) visuales en los flujos de login/registro.
👥 Módulo de Usuarios (CRUD)
Crear usuario: ID, nombre completo, cargo y contraseña.

Doble validación de contraseña (password + confirmación en tiempo real).

Editar usuario (cambiar nombre, cargo, password opcional).

Eliminar usuario con confirmación preventiva.

Búsqueda en tiempo real por ID, nombre o cargo.

Paginación integrada de la tabla (10 registros por página).

Exportar a CSV.

📦 Módulo de Inventario (CRUD + Bodega)
Crear producto: código, nombre, proveedor, tipo, stock inicial.

Tipos: Materia Prima o Producto Terminado.

Unidad de medida parametrizada por producto (g, kg, ml, l, unidad, lb).

Stock mínimo configurable con alerta visual reactiva en la tabla y en el Dashboard.

Fórmula/Receta para productos terminados (materia prima + cantidad por unidad), detallando unidades de ingredientes individuales.

Ingresar materia prima al inventario (aumento dinámico de stock existente).

Registro de mermas/pérdidas (producto, cantidad, motivo, usuario) que descuenta stock directo y registra logs en el nodo mermas.

Editar producto (incluyendo fórmula, unidad y stock mínimo).

Eliminar producto bajo confirmación.

Buscador en tiempo real por código, nombre o proveedor.

Validación de código único en tiempo real (con debounce) al crear un producto.

Visualización de tipo con badges de color.

Paginación y exportación a CSV.

 Módulo de Producción (Motor de Transformación)Selección guiada del producto terminado a fabricar.Preview de fórmula con verificación de stock en tiempo real (incluye unidad de medida).Validación estricta de stock: compara stock actual vs requerido ($fórmula \times cantidad$).Transformación atómica: resta materias primas consumidas y suma el producto terminado obtenido.Consecutivo automático iniciando en 1, incrementando secuencialmente.Registro del usuario que ejecutó la producción (auditoría básica).Guardado histórico en el nodo produccion de Firebase.Resumen de producción con materia prima consumida y cantidad fabricada final.Historial completo de todas las producciones con buscador, paginación y exportación a CSV.

 Panel General (Dashboard)
Indicadores cuantitativos globales de productos totales, materia prima y productos terminados.

Alertas de stock bajo: lista inteligente de productos por debajo de su stock mínimo configurado junto con sus respectivas unidades de medida.

 Módulo de Reportes (Nuevo)
Top 5 Productos Más Fabricados: Vista analítica que procesa el historial de producción para computar y ordenar de mayor a menor los productos más elaborados de la planta de forma agregada.

Desglose de Consumo: Muestra el acumulado de toda la materia prima utilizada específicamente para la fabricación de cada uno de estos productos top.

Exportación Independiente: Permite la descarga del reporte analítico consolidado directamente a un archivo CSV (top5_productos_mas_fabricados.csv).

 Web Components Reutilizables y Vistas
Componente / MóduloDescripción
<acme-toast>	Notificaciones emergentes dinámicas (success, error, warning, info).
<acme-login>	Formulario de login y registro con validaciones integradas.
<acme-users>	Tabla y formulario CRUD optimizado para usuarios.
<acme-inventory>	Tabla y formulario CRUD de inventario con gestión avanzada de fórmulas.
<acme-production>	Motor transaccional de producción con resumen e historial.
renderDashboard()	Renderiza las métricas generales del estado de planta y alertas de stock mínimo.
renderReports()	Renderiza la interfaz analítica del Top 5 de producción y consumo de MP.

API de Firebase (dataManager.js)
Método   ---     Descripción
obtenerTodos(node)	GET - Obtiene array de registros mapeados.
obtenerRaw(node)	GET - Obtiene objeto raw directo de Firebase.
guardarArray(node, array)	PUT - Guarda array completo (sobrescribe nodo).
agregarItem(node, item)	POST - Agrega ítem con key auto-generada por Firebase.
actualizarItem(node, key, datos)	PATCH - Actualiza campos específicos del registro.
eliminarItem(node, key)	DELETE - Elimina un registro según su key única.
ejecutarProduccion(params)	Transacción: guarda inventario actualizado + registro histórico.
obtenerSiguienteConsecutivo()	Calcula secuencialmente el siguiente número de lote de producción.

 Tecnologías Utilizadas
HTML5 - Estructura semántica avanzada.

CSS3 - Flexbox, Grid, Custom Properties, Animaciones nativas, Responsive Layouts.

JavaScript ES6+ - Arquitectura modular, Clases, Async/Await, Arrow Functions, Destructuring, Spread Operator.

Web Components - Custom Elements, Shadow DOM, HTML Templates.

Firebase Realtime Database - Persistencia en la nube vía REST API (fetch).

Fetch API - Peticiones HTTP asíncronas optimizadas.


Responsive Design
El sistema es completamente responsive mediante breakpoints nativos:

Desktop (> 768px): Sidebar fijo a la izquierda, área de contenido principal fluido a la derecha.

Tablet/Mobile (<= 768px): Sidebar colapsable intermitente activado por botón hamburguesa (≡), layouts reestructurados en una sola columna.

Small Mobile (<= 480px): Grids de 1 columna estrictos, tablas adaptativas con scroll horizontal.


Consideraciones de Seguridad
Las contraseñas se almacenan en texto plano en Firebase, ya que el proyecto corresponde a un ejercicio académico.

Para entornos productivos reales se recomienda implementar hashing criptográfico (ej. bcrypt) y migrar hacia Firebase Auth.

La base de datos opera bajo reglas públicas de lectura/escritura temporal para facilitar la simulación.

📊 Datos de Prueba (Opcional)
Para probar el sistema rápidamente, puede crear los siguientes productos:

Materias Primas:

Código	Nombre	Stock Inicial
MP-001	Harina de trigo	10000
MP-002	Mantequilla	5000
MP-003	Huevo (unidad)	1000
MP-004	Azúcar	8000
MP-005	Chocolate	3000

Producto Terminado (ejemplo):

Código	Nombre	Fórmula
PT-001	Galleta de mantequilla	100g Harina + 100g Mantequilla + 1 Huevo
👨‍💻 Desarrollador
Proyecto individual desarrollado para la automatización de la planta Acme en Macondo.

📄 Licencia
Proyecto académico. Todos los derechos reservados.
