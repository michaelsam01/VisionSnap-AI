export function renderResult(result, container) {
    const statusClass = result.status === 'safe' ? 'status-safe' :
        result.status === 'danger' ? 'status-danger' : 'status-warning';

    const detailsHtml = Object.entries(result.details).map(([key, value]) => `
        <div class="info-item">
            <h4>${key}</h4>
            <p>${value}</p>
        </div>
    `).join('');

    let statusLabel = result.status.toUpperCase();
    if (result.category === 'food') {
        if (result.status === 'safe') statusLabel = 'EDIBLE';
        else if (result.status === 'danger') statusLabel = 'NOT EDIBLE';
        else statusLabel = 'CONSUME WITH CAUTION';
    } else if (result.category === 'plant') {
        if (result.status === 'safe') statusLabel = 'NON-TOXIC';
        else if (result.status === 'danger') statusLabel = 'TOXIC';
        else statusLabel = 'POTENTIALLY TOXIC';
    }

    container.innerHTML = `
        <div class="result-card">
            <img src="${result.imageUrl}" class="result-img" alt="Scanned Image">
            <div class="result-body">
                <div class="result-title-row">
                    <div>
                        <h2 class="result-name">${result.name}</h2>
                        <p class="result-category">${result.label}</p>
                    </div>
                    <span class="status-badge ${statusClass}">${statusLabel}</span>
                </div>
                <p class="description">${result.desc}</p>
                <div class="info-grid">
                    ${detailsHtml}
                </div>
                ${result.status === 'warning' || result.status === 'danger' ?
            `<div class="alert-box" style="background:#feebeb; padding:10px; border-radius:8px; color:#c00; font-size:13px;">
                        <i class="fas fa-exclamation-triangle"></i> Caution: Please verify important safety info.
                     </div>` : ''
        }
            </div>
        </div>
    `;
}

export function renderHistory(historyItems, container) {
    if (historyItems.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888; margin-top:40px;">No scans yet.</p>';
        return;
    }

    container.innerHTML = historyItems.map(item => `
        <div class="history-item" style="display:flex; gap:10px; background:white; padding:10px; border-radius:12px; margin-bottom:10px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <div style="width:60px; height:60px; border-radius:8px; overflow:hidden; background:#eee;">
                 ${item.imageUrl ? `<img src="${item.imageUrl}" style="width:100%; height:100%; object-fit:cover;">` :
            `<div style="width:100%; height:100%; background: #ddd; display:flex; align-items:center; justify-content:center; color:#888;"><i class="fas fa-image"></i></div>`}
            </div>
            <div>
                <h4 style="font-size:16px; margin-bottom:4px;">${item.name}</h4>
                <p style="font-size:12px; color:#888;">${new Date(item.timestamp).toLocaleDateString()}</p>
                <span style="font-size:10px; background:#eee; padding:2px 6px; border-radius:4px;">${item.label}</span>
            </div>
        </div>
    `).join('');
}
