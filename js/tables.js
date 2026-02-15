/* DataTables wrapper with formatting */

const Tables = {
    // Column display name mapping (Italian)
    LABELS: {
        'BILLING_PROVIDER_NPI_NUM': 'NPI Billing',
        'SERVICING_PROVIDER_NPI_NUM': 'NPI Servicing',
        'HCPCS_CODE': 'Codice HCPCS',
        'CLAIM_FROM_MONTH': 'Mese',
        'total_paid': 'Spesa Totale',
        'total_claims': 'Claims Totali',
        'total_beneficiaries': 'Beneficiari',
        'total_records': 'Record Totali',
        'num_providers': 'N. Provider',
        'num_hcpcs': 'N. Procedure',
        'num_months': 'N. Mesi',
        'num_servicing_npis': 'N. NPI Servicing',
        'cost_per_claim': 'Costo/Claim',
        'cost_per_beneficiary': 'Costo/Beneficiario',
        'claims_per_beneficiary': 'Claims/Beneficiario',
        'avg_cost_per_claim': 'Media Costo/Claim',
        'std_cost_per_claim': 'Std Costo/Claim',
        'z_cost_per_claim': 'Z-Score Costo/Claim',
        'z_cost_per_beneficiary': 'Z-Score Costo/Bene',
        'mad': 'MAD',
        'chi2': 'Chi-Quadro',
        'p_value': 'P-Value',
        'total_risk_score': 'Risk Score',
        'benford_score': 'Benford',
        'zscore_severity': 'Z-Score',
        'isolation_forest_score': 'Isolation Forest',
        'billing_mismatch_score': 'Mismatch',
        'temporal_spike_score': 'Spike',
        'ghost_provider_score': 'Ghost',
        'claims_per_bene_score': 'Claims/Bene',
        'concentration_score': 'Concentrazione',
        'pct_mismatch_paid': '% Mismatch $',
        'pct_mismatch_claims': '% Mismatch Claims',
        'mismatch_paid': 'Mismatch $',
        'mismatch_claims': 'Mismatch Claims',
        'mom_change_pct': 'Variazione MoM %',
        'rolling_zscore': 'Z-Score Rolling',
        'hhi': 'HHI',
        'max_share': 'Max Share',
        'top_hcpcs': 'HCPCS Principale',
        'ratio_to_median': 'Rapporto vs Mediana',
        'first_month': 'Primo Mese',
        'last_month': 'Ultimo Mese',
        'months_since_last': 'Mesi Inattivo',
        'zscore': 'Z-Score',
        'avg_paid': 'Media Spesa',
        'std_paid': 'Std Spesa',
        'z_outlier_count': 'N. Outlier Z',
        'iqr_outlier_count': 'N. Outlier IQR',
        'share': 'Quota %',
        'observed_pct': '% Osservato',
        'expected_pct': '% Atteso',
        'deviation': 'Deviazione',
        'prev_paid': 'Spesa Prec.',
        'rolling_avg': 'Media Rolling',
        'avg_cost_per_claim_y': 'Media Costo/Claim',
        'data_end': 'Fine Dati',
    },

    // Columns that should be formatted as currency
    CURRENCY_COLS: new Set([
        'total_paid', 'cost_per_claim', 'cost_per_beneficiary',
        'avg_cost_per_claim', 'std_cost_per_claim', 'mismatch_paid',
        'avg_paid', 'std_paid', 'prev_paid', 'rolling_avg',
        'avg_cost_per_claim_y', 'median_cost_per_claim',
    ]),

    // Columns that should be formatted as percentage
    PCT_COLS: new Set([
        'pct_mismatch_paid', 'pct_mismatch_claims', 'observed_pct',
        'expected_pct', 'deviation', 'mom_change_pct', 'share', 'max_share',
    ]),

    // Columns with float formatting
    FLOAT_COLS: new Set([
        'mad', 'chi2', 'p_value', 'hhi', 'ratio_to_median',
        'z_cost_per_claim', 'z_cost_per_beneficiary', 'zscore',
        'rolling_zscore', 'total_risk_score', 'benford_score',
        'zscore_severity', 'isolation_forest_score', 'billing_mismatch_score',
        'temporal_spike_score', 'ghost_provider_score', 'claims_per_bene_score',
        'concentration_score', 'claims_per_beneficiary',
        'avg_claims_per_beneficiary', 'median_claims_per_beneficiary',
    ]),

    /**
     * Render a DataTable.
     * @param {string} containerId - DOM element id
     * @param {Array} data - Array of row objects
     * @param {Array} columns - Column names to display (optional, auto-detect from data)
     * @param {Object} opts - DataTables options override
     */
    render(containerId, data, columns = null, opts = {}) {
        const el = document.getElementById(containerId);
        if (!el || !data || data.length === 0) {
            if (el) el.innerHTML = '<p class="text-muted">Nessun dato disponibile</p>';
            return null;
        }

        // Auto-detect columns from first row
        if (!columns) {
            columns = Object.keys(data[0]);
        }

        // Build table HTML
        const tableId = `dt-${containerId}`;
        let html = `<table id="${tableId}" class="table table-sm table-striped table-hover" style="width:100%">`;
        html += '<thead><tr>';
        columns.forEach(col => {
            html += `<th>${this.LABELS[col] || col}</th>`;
        });
        html += '</tr></thead><tbody>';

        data.forEach(row => {
            html += '<tr>';
            columns.forEach(col => {
                const val = row[col];
                html += `<td>${this.formatCell(col, val)}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';

        el.innerHTML = html;

        // Initialize DataTable
        const dtOpts = Object.assign({
            pageLength: 25,
            order: [],
            language: {
                search: 'Cerca:',
                lengthMenu: 'Mostra _MENU_ righe',
                info: '_START_ - _END_ di _TOTAL_',
                paginate: { first: 'Prima', last: 'Ultima', next: '>', previous: '<' },
            },
            dom: 'lfrtip',
        }, opts);

        return $(`#${tableId}`).DataTable(dtOpts);
    },

    formatCell(col, val) {
        if (val == null || val === '') return '-';
        if (this.CURRENCY_COLS.has(col)) return App.fmtCurrency(val);
        if (this.PCT_COLS.has(col)) return App.fmtPct(val * (Math.abs(val) <= 1 ? 100 : 1));
        if (this.FLOAT_COLS.has(col)) return App.fmtFloat(val, 3);
        if (typeof val === 'number' && Number.isInteger(val)) return App.fmtNum(val);
        if (typeof val === 'number') return App.fmtFloat(val, 2);
        return String(val);
    },
};
