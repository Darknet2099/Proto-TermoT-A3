import { ClientModule } from '../modules/client.js';

document.addEventListener("DOMContentLoaded", async () => {
    const client = new ClientModule();
    
    const detailContent = document.getElementById("detail-content");
    const favoriteButton = document.getElementById("favorite-button");
    const breadcrumbLabel = document.getElementById("detail-breadcrumb");
    const conditionLabel = document.getElementById("detail-condition");
    const objectiveLabel = document.getElementById("detail-objective");

    const urlParams = new URLSearchParams(window.location.search);
    const index = Number(urlParams.get("id"));

    let db = null;
    let patients = [];
    let selectedCPF = "";
    let draftParams = "";
    let draftNotes = "";
    let draftChecked = [];

    try {
        const res = await fetch('../server/data/data.json');
        db = await res.json();
    } catch (e) {
        detailContent.innerHTML = '<div class="empty-state"><h2>Erro ao carregar dados</h2></div>';
        return;
    }

    try {
        const saved = JSON.parse(localStorage.getItem("termoterapia-pacientes-v1") || "[]");
        if (Array.isArray(saved)) patients = saved;
    } catch (e) {}

    const entry = db.evidence[index];

    if (!entry || !Number.isInteger(index)) {
        detailContent.innerHTML = '<div class="empty-state"><h2>Recurso não encontrado</h2><p>Volte à busca e selecione um dos resultados disponíveis.</p><a class="button primary" href="index.html">Ir para Buscar</a></div>';
        favoriteButton.disabled = true; 
        return;
    }

    const [conditionIndex, resourceIndex, objective, grade, summary] = entry;
    const resource = db.resources[resourceIndex];
    const condition = db.conditions[conditionIndex];

    const steps = [
        "Conferir a identificação do paciente e registrar a avaliação inicial.",
        ...resource.precautions.split(/\.\s*/).filter(Boolean),
        "Revisar contraindicações do recurso e da região antes de iniciar.",
        "Definir e registrar os parâmetros individualizados da aplicação.",
        "Aplicar o recurso conforme a avaliação e as orientações do equipamento.",
        "Monitorar a pele, o conforto e a resposta do paciente durante a aplicação.",
        "Reavaliar após a aplicação e registrar a resposta e eventuais intercorrências."
    ];
    draftChecked = steps.map(() => false);

    breadcrumbLabel.textContent = resource.name;
    conditionLabel.textContent = condition.name;
    objectiveLabel.textContent = objective;

    function updateFavoriteButton() {
        const favs = client.currentData.favorites || [];
        const favorite = favs.includes(index);
        favoriteButton.textContent = favorite ? "★ Favorito" : "☆ Favoritar";
        favoriteButton.setAttribute("aria-pressed", String(favorite));
    }
    updateFavoriteButton();

    favoriteButton.addEventListener("click", () => {
        let favs = client.currentData.favorites || [];
        client.currentData.favorites = favs.includes(index)
            ? favs.filter(n => n !== index)
            : [index, ...favs];
        client.SaveLocalData();
        updateFavoriteButton();
    });

    const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    const cpfFormat = v => v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");

    function renderContent() {
        const gradeBadge = `<span class="badge grade-${grade}">Evidência ${db.evidenceLabels[grade]}</span>`;
        
        const checklistHTML = `
        <section class="panel detail-card" id="procedure" style="margin-top: 14px;">
            <h3 style="margin-bottom: 4px;">Checklist do procedimento</h3>
            <p class="muted small" style="margin-bottom: 16px;">Modelo de registro a ser revisado pelo fisioterapeuta. Marque apenas as ações realizadas; itens desmarcados serão registrados como não realizados.</p>
            
            <div style="margin-bottom: 16px;">
                <label for="session-patient" style="display:block; font-size:13px; font-weight:750; margin-bottom:6px; color:var(--navy);">Paciente</label>
                <select id="session-patient" style="width:100%; border:1.5px solid var(--border); border-radius:12px; background:var(--bg); color:var(--ink); padding:12px; font:inherit; outline-offset: 2px;">
                    <option value="">Selecione um paciente…</option>
                    ${patients.map(p => `<option value="${p.cpf}" ${selectedCPF === p.cpf ? "selected" : ""}>${escapeHtml(p.name)} ·${cpfFormat(p.cpf)}</option>`).join("")}
                </select>
                <a href="pacientes.html" style="display:inline-block; font-size:13px; margin-top:8px;">Cadastrar paciente / consultar prontuário</a>
            </div>

            <p id="check-progress" class="muted small" aria-live="polite" style="margin-bottom: 8px;">${draftChecked.filter(Boolean).length} de ${steps.length} ações realizadas</p>
            
            <div style="margin: 16px 0;">
                ${steps.map((t, j) => `
                    <label style="display:flex; align-items:flex-start; gap:12px; padding:12px; margin:0; border-bottom:1px solid var(--border); cursor:pointer;">
                        <input type="checkbox" data-index="${j}" ${draftChecked[j] ? "checked" : ""} style="width:20px; height:20px; margin-top:2px;">
                        <span style="font-size:14px; color: ${draftChecked[j] ? 'var(--muted)' : 'var(--ink)'};">${escapeHtml(t)}</span>
                    </label>
                `).join("")}
            </div>

            <div style="margin-bottom: 16px;">
                <label for="session-parameters" style="display:block; font-size:13px; font-weight:750; margin-bottom:6px; color:var(--navy);">Parâmetros efetivamente utilizados</label>
                <textarea id="session-parameters" rows="2" style="width:100%; border:1.5px solid var(--border); border-radius:12px; background:var(--bg); color:var(--ink); padding:12px; font:inherit;" placeholder="Registre os parâmetros definidos na avaliação">${escapeHtml(draftParams)}</textarea>
            </div>

            <div style="margin-bottom: 16px;">
                <label for="session-notes" style="display:block; font-size:13px; font-weight:750; margin-bottom:6px; color:var(--navy);">Evolução e observações</label>
                <textarea id="session-notes" rows="3" style="width:100%; border:1.5px solid var(--border); border-radius:12px; background:var(--bg); color:var(--ink); padding:12px; font:inherit;" placeholder="Resposta do paciente, ações não realizadas e intercorrências">${escapeHtml(draftNotes)}</textarea>
            </div>

            <p id="session-message" style="margin-bottom: 12px; font-size: 13px;"></p>
            <button class="button primary full" id="save-session" style="margin-top:0;">Salvar sessão no prontuário</button>
            <p class="muted small" style="margin-top: 12px;">Protótipo: use dados fictícios. Registros salvos apenas neste navegador.</p>
        </section>`;

        detailContent.innerHTML = `
            <section class="panel detail-card">
                <div class="detail-title-row">
                    <div>
                        <h2 style="font-size: 28px;">${resource.name}</h2>
                        <p class="muted" style="margin-top:4px;">Categoria: ${resource.category}</p>
                    </div>
                    ${gradeBadge}
                </div>
            </section>
            <section class="panel detail-card" id="detail-description">
                <h3>Descrição curta</h3>
                <p>${resource.description}</p>
            </section>
            <section class="panel detail-card" id="detail-mechanism">
                <h3>Mecanismo fisiológico</h3>
                <ul>${resource.mechanisms.map(item => `<li>${item}</li>`).join("")}</ul>
            </section>
            <section class="panel detail-card" id="detail-evidence">
                <h3>O que a evidência mostra: ${condition.name}</h3>
                <p><strong>Objetivo:</strong> ${objective}</p>
                <p style="margin-top: 8px;"><strong>Resultado:</strong> ${summary}</p>
                <p style="margin-top: 8px;"><strong>Certeza cadastrada:</strong> ${db.evidenceLabels[grade]}</p>
                <p class="muted small" style="margin-top:12px;">Limitações: efeito de curto prazo; não substitui exercício e tratamento ativo.</p>
            </section>
            <section class="panel detail-card" id="detail-parameters">
                <h3>Parâmetros de aplicação estudados</h3>
                <p>${resource.parameters}</p>
                <p class="muted small" style="margin-top:12px;">Faixas descritas no conteúdo de referência; confira nas referências. Não constituem prescrição universal.</p>
            </section>
            <section class="panel detail-card" id="detail-safety">
                <h3>Contraindicações e precauções</h3>
                <p><strong>Precauções:</strong> ${resource.precautions}</p>
                <p style="margin-top:8px;"><strong>Contraindicações:</strong> ${resource.contraindications}</p>
            </section>
            ${checklistHTML}
            <section class="panel detail-card" id="detail-references">
                <h3>Referências científicas</h3>
                <p>${resource.references}</p>
            </section>
        `;

        bindChecklistEvents();
    }

    function bindChecklistEvents() {
        const selectEl = document.getElementById("session-patient");
        const checkboxes = document.querySelectorAll("input[type='checkbox']");
        const paramEl = document.getElementById("session-parameters");
        const notesEl = document.getElementById("session-notes");
        const saveBtn = document.getElementById("save-session");
        const progressEl = document.getElementById("check-progress");
        const msgEl = document.getElementById("session-message");

        selectEl.addEventListener("change", e => { selectedCPF = e.target.value; });
        paramEl.addEventListener("input", e => { draftParams = e.target.value; });
        notesEl.addEventListener("input", e => { draftNotes = e.target.value; });

        checkboxes.forEach(cb => {
            cb.addEventListener("change", e => {
                draftChecked[e.target.dataset.index] = e.target.checked;
                progressEl.textContent = `${draftChecked.filter(Boolean).length} de ${steps.length} ações realizadas`;
                
                const labelText = e.target.nextElementSibling;
                if (e.target.checked) {
                    labelText.style.color = "var(--muted)";
                } else {
                    labelText.style.color = "var(--ink)";
                }
            });
        });

        saveBtn.addEventListener("click", () => {
            if (!selectedCPF) {
                msgEl.textContent = "Selecione um paciente antes de salvar.";
                msgEl.style.color = "red";
                return;
            }
            if (!draftChecked.some(Boolean)) {
                msgEl.textContent = "Marque pelo menos uma ação realizada no checklist.";
                msgEl.style.color = "red";
                return;
            }

            const patientIndex = patients.findIndex(p => p.cpf === selectedCPF);
            if (patientIndex === -1) return;

            const storedUser = JSON.parse(localStorage.getItem("termoterapia-user") || '{"name":"Dr. Placeholder"}');

            const session = {
                id: Date.now() + "-" + Math.random().toString(36).slice(2),
                date: new Date().toISOString(),
                professional: storedUser.name,
                resource: resource.name,
                condition: condition.name,
                objective: objective,
                steps: steps.map((text, j) => ({ text, done: draftChecked[j] })),
                parameters: draftParams.trim(),
                notes: draftNotes.trim()
            };

            patients[patientIndex].sessions.unshift(session);
            localStorage.setItem("termoterapia-pacientes-v1", JSON.stringify(patients));

            draftChecked.fill(false);
            draftParams = "";
            draftNotes = "";
            renderContent();

            const newMsgEl = document.getElementById("session-message");
            newMsgEl.textContent = "Sessão salva com sucesso no prontuário. O checklist foi limpo para um novo atendimento.";
            newMsgEl.style.color = "#1d7a4f";
        });
    }

    renderContent();
    
    let hist = client.currentData.history || [];
    client.currentData.history = [index, ...hist.filter(item => item !== index)].slice(0, 30);
    client.SaveLocalData();
});