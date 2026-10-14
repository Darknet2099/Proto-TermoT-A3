import { ClientModule } from '../modules/client.js';

document.addEventListener("DOMContentLoaded", async () => {
    const client = new ClientModule();
    const favoritesList = document.getElementById("favorites-list");
    const historyList = document.getElementById("history-list");

    let db = null;
    try {
        const res = await fetch('../server/data/data.json');
        db = await res.json();
    } catch (e) {
        return;
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
    }

    function gradeBadge(grade) {
        return `<span class="badge grade-${grade}">Evidência ${db.evidenceLabels[grade]}</span>`;
    }

    function resultCard(index) {
        const entry = db.evidence[index];
        if (!entry) return "";
        const resource = db.resources[entry[1]];
        const condition = db.conditions[entry[0]];
        
        return `
        <a class="card result-card" href="recurso.html?id=${index}">
            <div class="card-top">
                <h3>${escapeHtml(resource.name)}</h3>
                ${gradeBadge(entry[3])}
            </div>
            <p class="muted">${escapeHtml(condition.name)} · ${escapeHtml(entry[2])}</p>
            <p style="margin-top:8px"><strong>Resultado:</strong> ${escapeHtml(entry[4])}</p>
            <p class="muted" style="margin-top:8px">Limitações: efeito e relevância clínica variam conforme protocolo e desfecho.</p>
            <p class="muted">Segurança: ${escapeHtml(resource.precautions.split(".")[0])}.</p>
            <p class="go">Acessar ficha científica completa →</p>
        </a>`;
    }

    function render() {
        const favs = client.currentData.favorites || [];
        const hist = client.currentData.history || [];

        favoritesList.innerHTML = favs.length 
            ? favs.map(i => resultCard(i)).join("") 
            : '<div class="empty-state" style="grid-column: 1 / -1;"><p>Nenhum favorito ainda. Abra uma ficha e clique em Favoritar.</p></div>';

        historyList.innerHTML = hist.length 
            ? hist.map(i => resultCard(i)).join("") 
            : '<div class="empty-state" style="grid-column: 1 / -1;"><p>Nenhuma ficha consultada recentemente.</p></div>';
    }

    render();
});