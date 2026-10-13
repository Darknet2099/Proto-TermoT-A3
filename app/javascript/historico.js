import { ClientModule } from '../modules/client.js';

(async () => {

    const limparFavoritos =  document.getElementById("clear-favorites")
    const limparHistorico =  document.getElementById("clear-history")

    const client = new ClientModule()

    var medicalData = await client.bridgeModule.Get("undefined", "api/GetData")

    function escapeHtml(value) {
        return String(value).replace(/[&<>\"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;", "'": "&#39;" }[ch]));
    }

    function gradeBadge(grade) {
        return `<span class="badge grade-${grade}">Evidência ${medicalData.evidenceLabels[grade]}</span>`;
    }
    function resultCard(entry, index) {
        const resource = medicalData.resources[entry[1]]
        const condition = medicalData.conditions[entry[0]];
        return `<a class="panel result-card" href="recurso.html?id=${index}"><div class="card-top"><h3>${escapeHtml(resource.name)}</h3>${gradeBadge(entry[3])}</div><p class="muted">${escapeHtml(condition.name)} · ${escapeHtml(entry[2])}</p><p class="result-summary"><strong>Resultado:</strong> ${escapeHtml(entry[4])}</p><p class="muted">Limitações: efeito e relevância clínica variam conforme protocolo e desfecho.</p><p class="muted">Segurança: ${escapeHtml(resource.precautions.split(".")[0])}.</p><div class="go">Acessar ficha científica completa →</div></a>`;
    }

    function renderHistoryList(containerId, indices) {
        const container = document.getElementById(containerId);
        container.innerHTML = indices.length ? indices.filter(i => medicalData.evidence[i]).map(i => resultCard(medicalData.evidence[i], i)).join("") : '<div class="empty-inline">Nenhum item por enquanto.</div>';
    }

    function render() {
        renderHistoryList("favorites-list", client.currentData.favorites); 
        renderHistoryList("history-list", client.currentData.history);
    }

    limparFavoritos.addEventListener("click", () => { client.currentData.favorites = []; client.SaveLocalData(); render(); });
    limparHistorico.addEventListener("click", () => { client.currentData.history = []; client.SaveLocalData(); render(); });

    render()

})();