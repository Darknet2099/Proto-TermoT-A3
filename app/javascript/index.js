import { ClientModule } from '../modules/client.js';

(async () => {

    const selectionLabel = document.getElementById("condition-select");
    const selectionRegion = document.getElementById("condition-region");
    const objectiveStep = document.getElementById("objective-step");
    const objectiveOptions = document.getElementById("objective-options");
    const filterButton = document.getElementById("filter-button");
    const resultsLabel = document.getElementById("results");

    const client = new ClientModule()

    var medicalData = await client.bridgeModule.Get("undefined", "api/GetData")

    var selectedCondition
    var objective

    function gradeBadge(grade) {
        return `<span class="badge grade-${grade}">Evidência ${medicalData.evidenceLabels[grade]}</span>`;
    }

    function resultCard(entry, index) {
        const resource = medicalData.resources[entry[1]]
        const condition = medicalData.conditions[entry[0]];
        return `<a class="panel result-card" href="recurso.html?id=${index}"><div class="card-top"><h3>${resource.name}</h3>${gradeBadge(entry[3])}</div><p class="muted">${condition.name} · ${entry[2]}</p><p class="result-summary"><strong>Resultado:</strong> ${entry[4]}</p><p class="muted">Limitações: efeito e relevância clínica variam conforme protocolo e desfecho.</p><p class="muted">Segurança: ${resource.precautions.split(".")[0]}.</p><div class="go">Acessar ficha científica completa →</div></a>`;
    }

    selectionLabel.innerHTML = '<option value="">Selecione a condição…</option>' + medicalData.conditions.map((data, index) => `<option value="${index}">${data.name}</option>`).join("");
    selectionLabel.addEventListener("change", async () => {
        selectedCondition = selectionLabel.value === "" ? null : Number(selectionLabel.value);
        objective = null;

        const condition = selectedCondition === null ? null : medicalData.conditions[selectedCondition];

        selectionRegion.textContent = condition ? `Região: ${condition.region}` : "Escolha uma condição para ver a região.";
        objectiveStep.classList.toggle("step-disabled", !condition);
        objectiveOptions.innerHTML = condition ? condition.objectives.map((objective, i) => `<button type="button" class="chip" data-objective="${i}" aria-pressed="false">${objective}</button>`).join("") : '<span class="muted">Escolha uma condição primeiro.</span>';
        filterButton.disabled = true;
        resultsLabel.innerHTML = '<div class="empty-state"><h2>Os resultados aparecem aqui</h2><p>Escolha uma condição clínica e um objetivo terapêutico e clique em “Filtrar recursos disponíveis”.</p></div>';
    });

    objectiveOptions.addEventListener("click", event => {
        const button = event.target.closest("[data-objective]"); 
        if (!button) return;

        objective = medicalData.conditions[selectedCondition].objectives[Number(button.dataset.objective)];
        objectiveOptions.querySelectorAll(".chip").forEach(chip => chip.setAttribute("aria-pressed", String(chip === button)));
        filterButton.disabled = false;
    })

    filterButton.addEventListener("click", () => {
        if (selectedCondition === null || !objective) return;
        const matches = medicalData.evidence.map((entry, index) => ({ entry, index })).filter(({ entry }) => entry[0] === selectedCondition && entry[2] === objective);
        const condition = medicalData.conditions[selectedCondition];
        resultsLabel.innerHTML = `<div class="note"><strong>Alertas gerais de segurança:</strong> confira sensibilidade, circulação e integridade da pele. Parâmetros variam conforme o recurso e a pessoa.</div><h2 class="result-heading">${matches.length} recurso${matches.length === 1 ? "" : "s"} identificado${matches.length === 1 ? "" : "s"} · ${condition.name} → ${objective}</h2>${matches.length ? `<div class="result-grid">${matches.map(({ entry, index }) => resultCard(entry, index)).join("")}</div>` : '<div class="empty-state"><h2>Nenhuma relação cadastrada</h2><p>Não há uma relação cadastrada para esta combinação de condição e objetivo.</p></div>'}`;
    });

})();