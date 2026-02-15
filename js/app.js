/* Common utilities for the Medicaid Fraud Detection static site */

const App = {
    // Fetch JSON data from the data/ directory
    async fetchData(path) {
        try {
            const resp = await fetch(`data/${path}`);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            return await resp.json();
        } catch (e) {
            console.error(`Failed to load data/${path}:`, e);
            return null;
        }
    },

    // Format number with comma separators
    fmtNum(val) {
        if (val == null) return '-';
        return Number(val).toLocaleString('en-US', { maximumFractionDigits: 0 });
    },

    // Format as currency ($B/$M/$K)
    fmtCurrency(val) {
        if (val == null) return '-';
        val = Number(val);
        if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
        if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
        if (val >= 1e3) return `$${(val / 1e3).toFixed(1)}K`;
        return `$${val.toFixed(0)}`;
    },

    // Format as currency with full precision
    fmtDollar(val) {
        if (val == null) return '-';
        return Number(val).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
    },

    // Format percentage
    fmtPct(val) {
        if (val == null) return '-';
        return `${Number(val).toFixed(1)}%`;
    },

    // Format float with decimals
    fmtFloat(val, dec = 2) {
        if (val == null) return '-';
        return Number(val).toFixed(dec);
    },

    // Show loading spinner in element
    showLoading(containerId) {
        const el = document.getElementById(containerId);
        if (el) {
            el.innerHTML = `<div class="loading">
                <div class="spinner-border text-primary" role="status"></div>
                <div class="mt-2">Caricamento dati...</div>
            </div>`;
        }
    },

    // Show error message
    showError(containerId, msg) {
        const el = document.getElementById(containerId);
        if (el) {
            el.innerHTML = `<div class="alert alert-danger">${msg}</div>`;
        }
    },

    // Create KPI card HTML
    kpiCard(label, value, danger = false) {
        return `<div class="col">
            <div class="kpi-card ${danger ? 'danger' : ''}">
                <div class="kpi-value">${value}</div>
                <div class="kpi-label">${label}</div>
            </div>
        </div>`;
    },

    // Get current page name from URL
    currentPage() {
        const path = window.location.pathname;
        const file = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
        return file.replace('.html', '');
    },

    // Set active nav link
    initNav() {
        const page = this.currentPage();
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href') || '';
            const linkPage = href.replace('.html', '').replace('./', '');
            if (linkPage === page || (page === 'index' && linkPage === '')) {
                link.classList.add('active');
            }
        });
    },

    // Plotly default layout
    plotlyLayout(title, extra = {}) {
        return Object.assign({
            title: title,
            template: 'plotly_white',
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
            margin: { t: 50, r: 20, b: 50, l: 60 },
            autosize: true,
        }, extra);
    },

    // Plotly responsive config
    plotlyConfig: {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    },

    // Truncate NPI for display
    shortNpi(npi) {
        if (!npi) return '-';
        const s = String(npi);
        return s.length > 10 ? `...${s.slice(-6)}` : s;
    },
};

// Initialize nav on page load
document.addEventListener('DOMContentLoaded', () => App.initNav());
