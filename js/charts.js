/* Chart builders using Plotly.js - mirrors dashboard/components/charts.py */

const Charts = {
    lineChart(containerId, data, x, y, title, colorField = null) {
        const traces = [];
        if (colorField && data.length > 0 && data[0][colorField] !== undefined) {
            const groups = {};
            data.forEach(row => {
                const key = row[colorField] || 'default';
                if (!groups[key]) groups[key] = { x: [], y: [] };
                groups[key].x.push(row[x]);
                groups[key].y.push(row[y]);
            });
            Object.entries(groups).forEach(([name, vals]) => {
                traces.push({ x: vals.x, y: vals.y, type: 'scatter', mode: 'lines', name });
            });
        } else {
            traces.push({
                x: data.map(r => r[x]),
                y: data.map(r => r[y]),
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: '#1a73e8' },
            });
        }
        Plotly.newPlot(containerId, traces, App.plotlyLayout(title, {
            hovermode: 'x unified',
        }), App.plotlyConfig);
    },

    barChart(containerId, data, x, y, title, horizontal = false) {
        const trace = horizontal ? {
            x: data.map(r => r[y]),
            y: data.map(r => r[x]),
            type: 'bar',
            orientation: 'h',
            marker: { color: '#1a73e8' },
        } : {
            x: data.map(r => r[x]),
            y: data.map(r => r[y]),
            type: 'bar',
            marker: { color: '#1a73e8' },
        };
        Plotly.newPlot(containerId, [trace], App.plotlyLayout(title), App.plotlyConfig);
    },

    scatterChart(containerId, data, x, y, title, opts = {}) {
        const trace = {
            x: data.map(r => r[x]),
            y: data.map(r => r[y]),
            type: 'scatter',
            mode: 'markers',
            marker: {
                color: opts.color ? data.map(r => r[opts.color]) : '#1a73e8',
                size: opts.size ? data.map(r => Math.max(4, Math.min(20, r[opts.size] / (opts.sizeDiv || 1)))) : 6,
                colorscale: opts.colorscale || 'YlOrRd',
                showscale: !!opts.color,
                colorbar: opts.color ? { title: opts.color } : undefined,
            },
            text: opts.hover ? data.map(r => opts.hover.map(h => `${h}: ${r[h]}`).join('<br>')) : undefined,
            hoverinfo: opts.hover ? 'text' : 'x+y',
        };
        const layout = App.plotlyLayout(title, {
            xaxis: { title: x, type: opts.logX ? 'log' : 'linear' },
            yaxis: { title: y, type: opts.logY ? 'log' : 'linear' },
        });
        Plotly.newPlot(containerId, [trace], layout, App.plotlyConfig);
    },

    histogram(containerId, data, x, title, nbins = 50) {
        const trace = {
            x: data.map(r => r[x]),
            type: 'histogram',
            nbinsx: nbins,
            marker: { color: '#1a73e8' },
        };
        Plotly.newPlot(containerId, [trace], App.plotlyLayout(title), App.plotlyConfig);
    },

    treemap(containerId, data, labelField, valueField, title) {
        const labels = data.map(r => r[labelField]);
        const values = data.map(r => r[valueField]);
        const trace = {
            type: 'treemap',
            labels: labels,
            parents: labels.map(() => ''),
            values: values,
            textinfo: 'label+value+percent root',
            marker: { colorscale: 'Blues' },
        };
        Plotly.newPlot(containerId, [trace], App.plotlyLayout(title, {
            margin: { t: 50, r: 10, b: 10, l: 10 },
        }), App.plotlyConfig);
    },

    benfordChart(containerId, distribution) {
        const digits = distribution.map(r => r.first_digit);
        const observed = distribution.map(r => r.observed_pct);
        const expected = distribution.map(r => r.expected_pct);

        const trace1 = {
            x: digits, y: observed,
            type: 'bar', name: I18n.t('chart.observed'),
            marker: { color: 'steelblue' },
        };
        const trace2 = {
            x: digits, y: expected,
            type: 'scatter', mode: 'lines+markers',
            name: I18n.t('chart.expected'),
            line: { color: 'red', width: 2 },
        };
        Plotly.newPlot(containerId, [trace1, trace2], App.plotlyLayout(
            I18n.t('chart.benford.title'), {
                xaxis: { title: I18n.t('chart.benford.xaxis') },
                yaxis: { title: I18n.t('chart.benford.yaxis') },
                barmode: 'group',
            }
        ), App.plotlyConfig);
    },

    lorenzCurve(containerId, data) {
        const trace1 = {
            x: data.map(r => r.cum_pct_providers),
            y: data.map(r => r.cum_pct_paid),
            type: 'scatter', fill: 'tozeroy',
            fillcolor: 'rgba(70,130,180,0.2)',
            line: { color: 'steelblue' },
            name: 'Lorenz',
        };
        const trace2 = {
            x: [0, 100], y: [0, 100],
            type: 'scatter', mode: 'lines',
            line: { color: 'red', dash: 'dash' },
            name: I18n.t('chart.lorenz.equality'),
        };
        Plotly.newPlot(containerId, [trace1, trace2], App.plotlyLayout(
            I18n.t('chart.lorenz.title'), {
                xaxis: { title: I18n.t('chart.lorenz.xaxis') },
                yaxis: { title: I18n.t('chart.lorenz.yaxis') },
            }
        ), App.plotlyConfig);
    },

    radarChart(containerId, categories, values, title) {
        const trace = {
            type: 'scatterpolar',
            r: [...values, values[0]],
            theta: [...categories, categories[0]],
            fill: 'toself',
            fillcolor: 'rgba(255,99,71,0.2)',
            line: { color: 'tomato' },
        };
        Plotly.newPlot(containerId, [trace], App.plotlyLayout(title, {
            polar: { radialaxis: { visible: true, range: [0, 100] } },
        }), App.plotlyConfig);
    },

    networkGraph(containerId, networkData, title) {
        title = title || I18n.t('chart.network.title');
        if (!networkData || !networkData.nodes || networkData.nodes.length === 0) {
            document.getElementById(containerId).innerHTML = `<p class="text-muted text-center">${I18n.t('noNetworkData')}</p>`;
            return;
        }

        const { nodes, edges } = networkData;

        // Edge traces
        const edgeX = [], edgeY = [];
        const nodeMap = {};
        nodes.forEach(n => { nodeMap[n.id] = n; });

        edges.forEach(e => {
            const s = nodeMap[e.source], t = nodeMap[e.target];
            if (s && t) {
                edgeX.push(s.x, t.x, null);
                edgeY.push(s.y, t.y, null);
            }
        });

        const edgeTrace = {
            x: edgeX, y: edgeY,
            type: 'scatter', mode: 'lines',
            line: { width: 0.5, color: '#888' },
            hoverinfo: 'none',
        };

        const nodeTrace = {
            x: nodes.map(n => n.x),
            y: nodes.map(n => n.y),
            type: 'scatter', mode: 'markers',
            hoverinfo: 'text',
            text: nodes.map(n => `NPI: ${n.id}<br>${I18n.t('chart.network.connections')}: ${n.degree}`),
            marker: {
                size: nodes.map(n => Math.max(5, Math.min(30, n.degree * 3))),
                color: nodes.map(n => n.degree),
                colorscale: 'YlOrRd',
                colorbar: { title: I18n.t('chart.network.connections') },
            },
        };

        Plotly.newPlot(containerId, [edgeTrace, nodeTrace], App.plotlyLayout(title, {
            showlegend: false,
            xaxis: { showgrid: false, zeroline: false, showticklabels: false },
            yaxis: { showgrid: false, zeroline: false, showticklabels: false },
        }), App.plotlyConfig);
    },

    heatmap(containerId, columns, values, title) {
        const trace = {
            z: values,
            x: columns,
            y: columns,
            type: 'heatmap',
            colorscale: 'RdBu',
            zmin: -1, zmax: 1,
            text: values.map(row => row.map(v => v != null ? v.toFixed(2) : '')),
            texttemplate: '%{text}',
            hovertemplate: '%{x} vs %{y}: %{z:.2f}<extra></extra>',
        };
        Plotly.newPlot(containerId, [trace], App.plotlyLayout(title, {
            margin: { t: 50, r: 20, b: 100, l: 100 },
        }), App.plotlyConfig);
    },

    stackedBar(containerId, data, xField, components, title) {
        const traces = components.map(comp => ({
            x: data.map(r => App.shortNpi(r[xField])),
            y: data.map(r => r[comp.field] || 0),
            name: comp.label,
            type: 'bar',
        }));
        Plotly.newPlot(containerId, traces, App.plotlyLayout(title, {
            barmode: 'stack',
        }), App.plotlyConfig);
    },
};
