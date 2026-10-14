import { ClientModule } from '../modules/client.js';

document.addEventListener("DOMContentLoaded", () => {
    const client = new ClientModule();

    const themeSelect = document.getElementById("theme-select");
    const fontSizeSelect = document.getElementById("font-size-select");

    const labelFav = document.getElementById("label-favoritos");
    const labelHist = document.getElementById("label-historico");
    const btnSair = document.getElementById("btn-sair");
    const btnLimparFav = document.getElementById("btn-limpar-fav");
    const btnLimparHist = document.getElementById("btn-limpar-hist");
    const userNameDisplay = document.getElementById("user-name-display");

    if (themeSelect) {
        themeSelect.value = client.currentData.theme || "auto";
        themeSelect.addEventListener("change", event => { 
            client.currentData.theme = event.target.value; 
            client.SaveLocalData(); 
            client.ApplyUserSettings(); 
        });
    }

    if (fontSizeSelect) {
        fontSizeSelect.value = client.currentData.fontSize || "normal";
        fontSizeSelect.addEventListener("change", event => { 
            client.currentData.fontSize = event.target.value; 
            client.SaveLocalData(); 
            client.ApplyUserSettings(); 
        });
    }

    try {
        const storedUser = JSON.parse(localStorage.getItem("termoterapia-user"));
        if (storedUser && storedUser.name) {
            userNameDisplay.textContent = storedUser.name;
        }
    } catch(e) {}

    function atualizarNumeros() {
        const favs = client.currentData.favorites || [];
        const hist = client.currentData.history || [];
        if(labelFav) labelFav.textContent = `Favoritos (${favs.length})`;
        if(labelHist) labelHist.textContent = `Histórico (${hist.length})`;
    }
    atualizarNumeros();

    if (btnSair) {
        btnSair.addEventListener("click", () => {
            localStorage.removeItem("termoterapia-user");
            window.location.href = "login.html";
        });
    }

    if (btnLimparFav) {
        btnLimparFav.addEventListener("click", () => {
            client.currentData.favorites = [];
            client.SaveLocalData();
            atualizarNumeros();
        });
    }

    if (btnLimparHist) {
        btnLimparHist.addEventListener("click", () => {
            client.currentData.history = [];
            client.SaveLocalData();
            atualizarNumeros();
        });
    }
});