import { ClientModule } from '../modules/client.js';

document.addEventListener("DOMContentLoaded", async () => {
    const client = new ClientModule();
    
    const conditionSelect = document.getElementById("condition-select");
    const conditionRegion = document.getElementById("condition-region");
    const objectiveStep = document.getElementById("objective-step");
    const objectiveOptions = document.getElementById("objective-options");
    const filterButton = document.getElementById("filter-button");
    const resultsArea = document.getElementById("results");

    let db = null;
    let selectedCond = null;
    let selectedObj = null;

    try {
        const res = await fetch('../server/data/data.json');
        db = await res.json();
        initFilters();
    } catch (e) {
        resultsArea.innerHTML = '<div class="empty-state"><h2>Erro ao carregar os dados</h2></div>';
    }

    function initFilters() {
        conditionSelect.innerHTML = '<option value="">Selecione a condição…</option>' + 
            db.conditions.map((c, i) => `<option value="${i}">${c.name}</option>`).join("");

        conditionSelect.addEventListener("change", (e) => {
            selectedCond = e.target.value === "" ? null : parseInt(e.target.value);
            selectedObj = null;
            filterButton.disabled = true;
            
            if (selectedCond !== null) {
                const c = db.conditions[selectedCond];
                conditionRegion.textContent = `Região: ${c.region}`;
                objectiveStep.classList.remove("step-disabled");
                
                objectiveOptions.innerHTML = c.objectives.map(o => 
                    `<button type="button" class="chip" data-obj="${o}">${o}</button>`
                ).join("");
                
                document.querySelectorAll(".chip").forEach(chip => {
                    chip.addEventListener("click", (evt) => {
                        document.querySelectorAll(".chip").forEach(ch => ch.setAttribute("aria-pressed", "false"));
                        evt.target.setAttribute("aria-pressed", "true");
                        selectedObj = evt.target.getAttribute("data-obj");
                        filterButton.disabled = false;
                    });
                });
            } else {
                conditionRegion.textContent = "Escolha uma condição para ver a região.";
                objectiveStep.classList.add("step-disabled");
                objectiveOptions.innerHTML = '<span class="muted">Escolha uma condição primeiro.</span>';
            }
        });

        filterButton.addEventListener("click", () => {
            renderResults();
        });
    }

    function renderResults() {
        if (selectedCond === null || !selectedObj) return;
        
        const results = db.evidence.filter(e => e[0] === selectedCond && e[2] === selectedObj);
        const condName = db.conditions[selectedCond].name;

        if (results.length === 0) {
            resultsArea.innerHTML = `
                <div class="note"><b>Alertas de segurança e precauções gerais:</b> confira sensibilidade, circulação e integridade da pele.</div>
                <h3 style="margin:0 0 12px;color:var(--navy);font-size:17px;">Nenhum recurso identificado · ${condName} → ${selectedObj}</h3>
                <div class="empty-state"><p>Nenhuma relação cadastrada para esta busca.</p></div>
            `;
            return;
        }

        const cardsHTML = results.map(ev => {
            const r = db.resources[ev[1]];
            const grade = ev[3];
            const gradeLabel = db.evidenceLabels[grade];
            
            return `
                <a class="card result-card" href="recurso.html?id=${ev[1]}&cond=${selectedCond}&obj=${encodeURIComponent(selectedObj)}">
                    <div class="card-top">
                        <h3>${r.name}</h3>
                        <span class="badge grade-${grade}">Evidência ${gradeLabel}</span>
                    </div>
                    <p class="muted">${condName} · ${selectedObj}</p>
                    <p style="margin-top:8px"><strong>Resultado:</strong> ${ev[4]}</p>
                    <p class="muted" style="margin-top:8px">Limitações: efeito e relevância clínica variam conforme protocolo e desfecho.</p>
                    <p class="muted">Segurança: ${r.precautions.split(".")[0]}.</p>
                    <p class="go">Acessar ficha científica completa →</p>
                </a>
            `;
        }).join("");

        const titleText = `${results.length} recurso${results.length === 1 ? '' : 's'} identificado${results.length === 1 ? '' : 's'}`;
        
        resultsArea.innerHTML = `
            <div class="note"><b>Alertas de segurança e precauções gerais:</b> confira sensibilidade, circulação e integridade da pele.</div>
            <h3 style="margin:0 0 16px;color:var(--navy);font-size:17px;">${titleText} · ${condName} → ${selectedObj}</h3>
            <div class="result-grid">
                ${cardsHTML}
            </div>
        `;
    }
});