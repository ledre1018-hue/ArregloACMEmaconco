import { dataManager } from './data/dataManager.js';
import './components/acme-toast.js';
import './components/acme-login.js';
import './components/acme-users.js';
import './components/acme-inventory.js';
import './components/acme-production.js';

const AppState = {
    currentUser: null,
    currentModule: 'login',
    sidebarOpen: false,

    login(user) {
        this.currentUser = user;
        this.currentModule = 'dashboard';
        localStorage.setItem('acme_session', JSON.stringify(user));
        renderApp();
    },

    logout() {
        this.currentUser = null;
        this.currentModule = 'login';
        localStorage.removeItem('acme_session');
        renderApp();
    },

    navigate(module) {
        this.currentModule = module;
        renderApp();
    },

    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.toggle('open', this.sidebarOpen);
    }
};

function renderApp() {
    const app = document.getElementById('app');
    if (!app) return;

    if (!AppState.currentUser) {
        app.innerHTML = `
            <div class="login-screen">
                <acme-login></acme-login>
            </div>
            <acme-toast></acme-toast>
        `;
        setupLoginListener();
    } else {
        app.innerHTML = `
            <button class="menu-toggle" id="menu-toggle">≡</button>
            <div class="app-layout">
                <aside class="sidebar" id="sidebar">
                    <div class="sidebar-header">
                        <h2>Acme · Macondo</h2>
                        <div class="user-info">
                            <p class="user-name">${AppState.currentUser.nombreCompleto}</p>
                            <p>${AppState.currentUser.cargo}</p>
                        </div>
                    </div>
                    <nav class="sidebar-nav">
                        <a href="#" data-module="dashboard" class="${AppState.currentModule === 'dashboard' ? 'active' : ''}">Panel General</a>
                        <a href="#" data-module="inventory" class="${AppState.currentModule === 'inventory' ? 'active' : ''}">Inventario</a>
                        <a href="#" data-module="production" class="${AppState.currentModule === 'production' ? 'active' : ''}">Producción</a>
                        <a href="#" data-module="reports" class="${AppState.currentModule === 'reports' ? 'active' : ''}">Reportes</a>
                        <a href="#" data-module="users" class="${AppState.currentModule === 'users' ? 'active' : ''}">Usuarios</a>
                    </nav>
                    <div class="sidebar-footer">
                        <button class="btn btn-outline w-full" id="logout-btn">Cerrar sesión</button>
                    </div>
                </aside>
                <main class="main-content" id="main-content">
                    ${renderModule()}
                </main>
            </div>
            <acme-toast></acme-toast>
        `;
        setupLayoutListeners();

        // Cargar datos según módulo
        if (AppState.currentModule === 'dashboard') {
            loadDashboardStats();
        } else if (AppState.currentModule === 'reports') {
            loadReports();
        }
    }
}

function renderModule() {
    switch (AppState.currentModule) {
        case 'dashboard': return renderDashboard();
        case 'inventory': return '<acme-inventory></acme-inventory>';
        case 'production': return '<acme-production></acme-production>';
        case 'users': return '<acme-users></acme-users>';
        case 'reports': return renderReports();
        default: return renderDashboard();
    }
}

function renderDashboard() {
    return `
        <div class="page-header">
            <h2>Panel General</h2>
            <p>Resumen operativo de la planta Acme — Macondo</p>
        </div>
        <div class="stats-grid" id="dashboard-stats">
            <div class="stat-card"><div class="stat-label">Productos en Inventario</div><div class="stat-value" id="stat-productos">–</div></div>
            <div class="stat-card"><div class="stat-label">Materia Prima</div><div class="stat-value" id="stat-mp">–</div></div>
            <div class="stat-card"><div class="stat-label">Productos Terminados</div><div class="stat-value" id="stat-pt">–</div></div>
            <div class="stat-card stat-alert"><div class="stat-label">Con Stock Bajo</div><div class="stat-value value-alert" id="stat-stock-bajo">–</div></div>
        </div>
        <div class="card mb-3">
            <div class="card-header"><h3>Alertas de Stock Bajo</h3></div>
            <div class="card-body"><ul class="alert-list" id="dashboard-alertas"></ul></div>
        </div>
    `;
}

async function loadDashboardStats() {
    try {
        const inventario = await dataManager.obtenerInventario();

        const materiaPrima = inventario.filter(p => p.tipo === 'materia_prima');
        const productosTerminados = inventario.filter(p => p.tipo === 'producto_terminado');

        const stockBajo = inventario.filter(p => {
            const minimo = parseFloat(p.stockMinimo);
            const stockActual = parseFloat(p.stock) || 0;
            return minimo > 0 && stockActual <= minimo;
        });

        const statProductos = document.getElementById('stat-productos');
        const statMp = document.getElementById('stat-mp');
        const statPt = document.getElementById('stat-pt');
        const statStockBajo = document.getElementById('stat-stock-bajo');

        if (statProductos) statProductos.textContent = inventario.length;
        if (statMp) statMp.textContent = materiaPrima.length;
        if (statPt) statPt.textContent = productosTerminados.length;
        if (statStockBajo) statStockBajo.textContent = stockBajo.length;

        const lista = document.getElementById('dashboard-alertas');
        if (lista) {
            lista.innerHTML = stockBajo.length
                ? stockBajo.map(p => `<li>${p.nombre} — stock: ${p.stock}${p.unidad ? ' ' + p.unidad : ''} (mínimo: ${p.stockMinimo})</li>`).join('')
                : '<li>No hay alertas de stock bajo</li>';
        }
    } catch (err) {
        console.error('[Dashboard] Error cargando estadísticas:', err);
    }
}

function setupLoginListener() {
    const loginEl = document.querySelector('acme-login');
    if (loginEl) {
        loginEl.addEventListener('login-success', e => {
            AppState.login(e.detail.user);
        });
    }
}

function setupLayoutListeners() {
    document.querySelectorAll('.sidebar-nav a[data-module]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            AppState.navigate(e.currentTarget.dataset.module);
        });
    });

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => AppState.logout());

    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) menuToggle.addEventListener('click', () => AppState.toggleSidebar());
}

function loadSession() {
    try {
        const data = localStorage.getItem('acme_session');
        if (data) {
            AppState.currentUser = JSON.parse(data);
            AppState.currentModule = 'dashboard';
            return true;
        }
    } catch (e) {}
    return false;
}

function init() {
    loadSession();
    renderApp();
}
function renderReports() {
    return `
        <div class="page-header">
            <h2>Reportes</h2>
            <p>5 Productos Más Fabricados</p>
        </div>
        <div class="card">
            <div class="card-header">
                <h3>Top 5 Productos Más Fabricados</h3>
                <button class="btn btn-outline btn-sm" id="report-export">Exportar CSV</button>
            </div>
            <div class="card-body" id="top-products-report">Cargando reporte...</div>
        </div>
    `;
}

async function loadReports() {
    try {
        const produccion = await dataManager.obtenerProduccion();
        renderTopProductsReport(produccion);
        setupReportExport();
    } catch (err) {
        console.error(err);
        document.getElementById('top-products-report').innerHTML = '<p style="color:red">Error al cargar</p>';
    }
}

function renderTopProductsReport(produccion) {
    const container = document.getElementById('top-products-report');
    if (!container) return;

    const stats = {};
    produccion.forEach(r => {
        const k = r.codigoProducto;
        if (!stats[k]) stats[k] = { codigo: r.codigoProducto, nombre: r.nombreProducto, total: 0, mp: {} };
        stats[k].total += Number(r.cantidadProducida) || 0;
        (r.materiaPrimaConsumida || []).forEach(m => {
            if (!stats[k].mp[m.codigo]) stats[k].mp[m.codigo] = { nombre: m.nombre, total: 0 };
            stats[k].mp[m.codigo].total += Number(m.cantidad) || 0;
        });
    });

    const top5 = Object.values(stats).sort((a,b) => b.total - a.total).slice(0,5);

    if (top5.length === 0) {
        container.innerHTML = `<p style="color:#9ca3af;text-align:center;padding:3rem;">Aún no hay producciones registradas.</p>`;
        return;
    }

    let html = `<div style="display:grid;gap:1.25rem;">`;
    top5.forEach(p => {
        html += `
            <div style="border:1px solid #e1ddd3;border-radius:4px;padding:1.25rem;background:#f9f8f5;">
                <strong>${p.codigo} — ${p.nombre}</strong> 
                <span style="float:right;color:#2f6659;font-weight:600;">${p.total} unidades</span>
                <div style="margin-top:0.75rem;font-size:0.8125rem;color:#5b6577;">
                    <strong>MP utilizada:</strong><br>
                    ${Object.values(p.mp).map(m => `• ${m.nombre}: ${m.total}`).join('<br>')}
                </div>
            </div>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}

function setupReportExport() {
    const btn = document.getElementById('report-export');
    if (btn) btn.addEventListener('click', async () => {
        const produccion = await dataManager.obtenerProduccion();
        exportTopProductsReport(produccion);
    });
}

function exportTopProductsReport(produccion) {
    const stats = {};
    produccion.forEach(r => {
        const k = r.codigoProducto;
        if (!stats[k]) stats[k] = { codigo: r.codigoProducto, nombre: r.nombreProducto, total: 0, mp: {} };
        stats[k].total += Number(r.cantidadProducida) || 0;
        (r.materiaPrimaConsumida || []).forEach(m => {
            if (!stats[k].mp[m.codigo]) stats[k].mp[m.codigo] = { nombre: m.nombre, total: 0 };
            stats[k].mp[m.codigo].total += Number(m.cantidad) || 0;
        });
    });

    const top5 = Object.values(stats).sort((a,b) => b.total - a.total).slice(0,5);

    const headers = ['Código', 'Producto', 'Total Producido', 'Materia Prima Utilizada'];
    const rows = top5.map(p => [p.codigo, p.nombre, p.total, Object.values(p.mp).map(m => `${m.nombre}:${m.total}`).join(' | ')]);

    exportarCSV('top5_productos_mas_fabricados.csv', headers, rows);
}
document.addEventListener('DOMContentLoaded', init);
