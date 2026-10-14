import { ClientModule } from '../modules/client.js';

document.addEventListener("DOMContentLoaded", () => {
    const client = new ClientModule();

    const RECORD_KEY = "termoterapia-pacientes-v1";
    let patients = [];
    let selectedCPF = "";

    const formPaciente = document.getElementById("form-paciente");
    const inputName = document.getElementById("patient-name");
    const inputCpf = document.getElementById("patient-cpf");
    const msgPaciente = document.getElementById("patient-message");
    const selectPaciente = document.getElementById("record-patient");
    const countPacientes = document.getElementById("count-pacientes");
    const patientDetails = document.getElementById("patient-details");

    try {
        const saved = JSON.parse(localStorage.getItem(RECORD_KEY) || "[]");
        if (Array.isArray(saved)) patients = saved;
    } catch (e) {
    }

    const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    const cpfFormat = v => v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");

    function validCPF(cpf) {
        if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
        for (let length = 9; length <= 10; length++) {
            let sum = 0;
            for (let j = 0; j < length; j++) sum += Number(cpf[j]) * (length + 1 - j);
            const digit = (sum * 10 % 11) % 10;
            if (digit !== Number(cpf[length])) return false;
        }
        return true;
    }

    function savePatients() {
        localStorage.setItem(RECORD_KEY, JSON.stringify(patients));
    }

    function updateUI() {
        countPacientes.textContent = patients.length;
        selectPaciente.innerHTML = '<option value="">Selecione…</option>' + 
            patients.map(p => `<option value="${p.cpf}" ${p.cpf === selectedCPF ? "selected" : ""}>${esc(p.name)} · ${cpfFormat(p.cpf)}</option>`).join("");

        const p = patients.find(p => p.cpf === selectedCPF);
        if (!p) {
            patientDetails.innerHTML = `
                <div class="empty-state">
                    <h2>Nenhum paciente selecionado</h2>
                    <p>Cadastre ou selecione um paciente ao lado para consultar seu prontuário.</p>
                </div>`;
            return;
        }

        let sessionsHTML = "";
        if (p.sessions && p.sessions.length > 0) {
            sessionsHTML = p.sessions.map(s => `
                <div class="panel" style="margin-bottom: 16px; padding: 22px;">
                    <h3 style="margin: 0 0 4px; color: var(--navy); font-size: 18px;">${esc(s.resource)}</h3>
                    <p class="muted small" style="margin: 0 0 12px;">${esc(new Date(s.date).toLocaleString("pt-BR"))} · ${esc(s.professional)}</p>
                    <p style="font-size: 14px;"><strong>Condição:</strong> ${esc(s.condition)} · <strong>Objetivo:</strong> ${esc(s.objective)}</p>
                    
                    <div style="margin: 12px 0;">
                        ${s.steps.map(step => `
                            <label style="display:flex; align-items:flex-start; gap:12px; padding:8px 0; margin:0; border-bottom:1px solid var(--border);">
                                <input type="checkbox" disabled ${step.done ? "checked" : ""} style="width:16px; height:16px; margin-top:2px;">
                                <span style="font-size:14px; color: ${step.done ? 'var(--muted)' : 'var(--ink)'};">${esc(step.text)} <small class="muted">(${step.done ? 'realizada' : 'não realizada'})</small></span>
                            </label>
                        `).join("")}
                    </div>

                    <p style="font-size: 14px; margin-top: 12px;"><strong>Parâmetros:</strong> <span style="white-space: pre-wrap;">${esc(s.parameters || "Não informados")}</span></p>
                    <p style="font-size: 14px; margin-top: 8px;"><strong>Evolução:</strong> <span style="white-space: pre-wrap;">${esc(s.notes || "Não informada")}</span></p>
                </div>
            `).join("");
        } else {
            sessionsHTML = `<div class="empty-state"><p>Nenhuma sessão registrada para este paciente.</p></div>`;
        }

        patientDetails.innerHTML = `
            <div class="panel" style="margin-bottom: 24px; padding: 22px;">
                <h2 style="margin: 0 0 4px; color: var(--navy); font-size: 24px;">${esc(p.name)}</h2>
                <p class="muted">CPF: ${cpfFormat(p.cpf)}</p>
                <p style="margin: 12px 0 0; font-weight: 750;">${p.sessions ? p.sessions.length : 0} sessão(ões) registrada(s)</p>
                <a href="index.html" class="button secondary" style="margin-top: 16px;">Buscar recurso para novo atendimento →</a>
            </div>
            ${sessionsHTML}
        `;
    }

    if (formPaciente) {
        formPaciente.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = inputName.value.trim();
            const cpf = inputCpf.value.replace(/\D/g, "");
            
            if (name.length < 2 || !validCPF(cpf)) {
                msgPaciente.textContent = "Informe o nome e um CPF válido (11 dígitos).";
                msgPaciente.style.color = "red";
                return;
            }
            if (patients.some(p => p.cpf === cpf)) {
                msgPaciente.textContent = "Este CPF já está cadastrado. Selecione-o na lista.";
                msgPaciente.style.color = "red";
                return;
            }

            patients.push({ name, cpf, sessions: [] });
            savePatients();
            selectedCPF = cpf;

            inputName.value = "";
            inputCpf.value = "";
            msgPaciente.textContent = "Paciente cadastrado com sucesso!";
            msgPaciente.style.color = "#1d7a4f";
            
            updateUI();
        });
    }

    if (selectPaciente) {
        selectPaciente.addEventListener("change", (e) => {
            selectedCPF = e.target.value;
            msgPaciente.textContent = "";
            updateUI();
        });
    }

    updateUI();
});