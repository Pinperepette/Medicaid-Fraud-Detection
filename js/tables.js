/* DataTables wrapper with formatting */

const Tables = {
    // Column field name to i18n key mapping
    COL_KEYS: {
        'BILLING_PROVIDER_NPI_NUM': 'col.billing_npi',
        'SERVICING_PROVIDER_NPI_NUM': 'col.servicing_npi',
        'HCPCS_CODE': 'col.hcpcs',
        'CLAIM_FROM_MONTH': 'col.month',
        'total_paid': 'col.total_paid',
        'total_claims': 'col.total_claims',
        'total_beneficiaries': 'col.total_beneficiaries',
        'total_records': 'col.total_records',
        'num_providers': 'col.num_providers',
        'num_hcpcs': 'col.num_hcpcs',
        'num_months': 'col.num_months',
        'num_servicing_npis': 'col.num_servicing_npis',
        'cost_per_claim': 'col.cost_per_claim',
        'cost_per_beneficiary': 'col.cost_per_beneficiary',
        'claims_per_beneficiary': 'col.claims_per_beneficiary',
        'avg_cost_per_claim': 'col.avg_cost_per_claim',
        'std_cost_per_claim': 'col.std_cost_per_claim',
        'z_cost_per_claim': 'col.z_cost_per_claim',
        'z_cost_per_beneficiary': 'col.z_cost_per_beneficiary',
        'mad': 'col.mad',
        'chi2': 'col.chi2',
        'p_value': 'col.p_value',
        'total_risk_score': 'col.total_risk_score',
        'benford_score': 'col.benford_score',
        'zscore_severity': 'col.zscore_severity',
        'isolation_forest_score': 'col.isolation_forest_score',
        'billing_mismatch_score': 'col.billing_mismatch_score',
        'temporal_spike_score': 'col.temporal_spike_score',
        'ghost_provider_score': 'col.ghost_provider_score',
        'claims_per_bene_score': 'col.claims_per_bene_score',
        'concentration_score': 'col.concentration_score',
        'pct_mismatch_paid': 'col.pct_mismatch_paid',
        'pct_mismatch_claims': 'col.pct_mismatch_claims',
        'mismatch_paid': 'col.mismatch_paid',
        'mismatch_claims': 'col.mismatch_claims',
        'mom_change_pct': 'col.mom_change_pct',
        'rolling_zscore': 'col.rolling_zscore',
        'hhi': 'col.hhi',
        'max_share': 'col.max_share',
        'top_hcpcs': 'col.top_hcpcs',
        'ratio_to_median': 'col.ratio_to_median',
        'first_month': 'col.first_month',
        'last_month': 'col.last_month',
        'months_since_last': 'col.months_since_last',
        'zscore': 'col.zscore',
        'avg_paid': 'col.avg_paid',
        'std_paid': 'col.std_paid',
        'z_outlier_count': 'col.z_outlier_count',
        'iqr_outlier_count': 'col.iqr_outlier_count',
        'share': 'col.share',
        'observed_pct': 'col.observed_pct',
        'expected_pct': 'col.expected_pct',
        'deviation': 'col.deviation',
        'prev_paid': 'col.prev_paid',
        'rolling_avg': 'col.rolling_avg',
        'avg_cost_per_claim_y': 'col.avg_cost_per_claim_y',
        'data_end': 'col.data_end',
    },

    // Get translated label for a column
    getLabel(col) {
        const key = this.COL_KEYS[col];
        return key ? I18n.t(key) : col;
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
            if (el) el.innerHTML = `<p class="text-muted">${I18n.t('noData')}</p>`;
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
            html += `<th>${this.getLabel(col)}</th>`;
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
            language: I18n.dtLanguage(),
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
