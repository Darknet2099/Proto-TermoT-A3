import { BridgeModule } from '../modules/bridge.js';

(async () => {

    const detailButton = document.getElementById("detail-content")
    const favoriteButton = document.getElementById("favorite-button")
    const breadcrumbLabel = document.getElementById("detail-breadcrumb")
    const conditionLabel = document.getElementById("detail-condition")
    const objectiveLabel = document.getElementById("detail-objective")
    const contentLabel = document.getElementById("detail-content")

    const bridge = new BridgeModule()

    var medicalData = await bridge.Get("undefined", "api/GetData")

    var currentEvidence;
    var favorites = []
    var history = []

    const index = Number(new URLSearchParams(location.search).get("id"));

    function gradeBadge(grade) {
        return `<span class="badge grade-${grade}">Evidência ${medicalData.evidenceLabels[grade]}</span>`;
    }

    function updateFavoriteButton() {
        const index = currentEvidence
        const favorite = favorites.includes(index);
        
        favoriteButton.textContent = favorite ? "★ Favorito" : "☆ Favoritar";
        favoriteButton.setAttribute("aria-pressed", String(favorite));
    }

    function renderDetail(index) {
        const entry = medicalData.evidence[index];

        if (!entry) {
            detailButton.innerHTML = '<div class="empty-state"><h2>Recurso não encontrado</h2><p>Volte à busca e selecione um dos resultados disponíveis.</p><a class="button primary" href="index.html">Ir para Buscar</a></div>';
            favoriteButton.disabled = true; 
            return;
        }

        currentEvidence = index;

        const [conditionIndex, resourceIndex, objective, grade, summary] = entry;
        const resource = medicalData.resources[resourceIndex];
        const condition = medicalData.conditions[conditionIndex];
        
        breadcrumbLabel.textContent = resource.name;
        conditionLabel.textContent = condition.name;
        objectiveLabel.textContent = objective;

        updateFavoriteButton();

        contentLabel.innerHTML = `<section class="panel detail-card"><div class="detail-title-row"><div><h2>${resource.name}</h2><p class="muted">Categoria: ${resource.category}</p></div>${gradeBadge(grade)}</div></section><section class="panel detail-card" id="detail-description"><h3>Descrição curta</h3><p>${resource.description}</p></section><section class="panel detail-card" id="detail-mechanism"><h3>Mecanismo fisiológico</h3><ul>${resource.mechanisms.map(item => `<li>${item}</li>`).join("")}</ul></section><section class="panel detail-card" id="detail-evidence"><h3>O que a evidência mostra: ${condition.name}</h3><p><strong>Objetivo:</strong> ${objective}</p><p><strong>Resultado:</strong> ${summary}</p><p><strong>Certeza cadastrada:</strong> ${medicalData.evidenceLabels[grade]}</p><p class="muted">Limitações: efeito de curto prazo; não substitui exercício e tratamento ativo.</p></section><section class="panel detail-card" id="detail-parameters"><h3>Parâmetros de aplicação estudados</h3><p>${resource.parameters}</p><p class="muted">Faixas descritas no conteúdo de referência; confira nas referências. Não constituem prescrição universal.</p></section><section class="panel detail-card" id="detail-safety"><h3>Contraindicações e precauções</h3><p><strong>Precauções:</strong> ${resource.precautions}</p><p><strong>Contraindicações:</strong> ${resource.contraindications}</p></section><section class="panel detail-card" id="detail-references"><h3>Referências científicas</h3><p>${resource.references}</p></section><p class="muted small"><strong>Uso como adjuvante:</strong> não substitui avaliação nem tratamento ativo. Revise as referências antes de uso clínico.</p>`;
        history = [index, ...history.filter(item => item !== index)].slice(0, 30);

    }

    renderDetail(Number.isInteger(index) ? index : -1);

    favoriteButton.addEventListener("click", () => {
        const i = currentEvidence; if (i === undefined) return;
        favorites = favorites.includes(i) ? favorites.filter(n => n !== i) : [i, ...favorites];
        updateFavoriteButton();
    });

})();