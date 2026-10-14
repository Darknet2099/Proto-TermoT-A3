import { ClientModule } from '../modules/client.js';

document.addEventListener("DOMContentLoaded", () => {
    const client = new ClientModule();

    const formLogin = document.getElementById("form-login");
    const btnToggleSenha = document.getElementById("btn-toggle-senha");
    const inputSenha = document.getElementById("senha");
    const btnDemo = document.getElementById("btn-demo");
    const iconeAberto = document.getElementById("icone-olho-aberto");
    const iconeFechado = document.getElementById("icone-olho-fechado");

    if (btnToggleSenha && inputSenha) {
        btnToggleSenha.addEventListener("click", () => {
            if (inputSenha.type === "password") {
                inputSenha.type = "text";
                iconeAberto.style.display = "none";
                iconeFechado.style.display = "block";
                btnToggleSenha.title = "Ocultar senha";
            } else {
                inputSenha.type = "password";
                iconeAberto.style.display = "block";
                iconeFechado.style.display = "none";
                btnToggleSenha.title = "Mostrar senha";
            }
        });
    }

    function performLogin(name) {
        localStorage.setItem("termoterapia-user", JSON.stringify({ name }));
        window.location.href = "index.html";
    }

    if (btnDemo) {
        btnDemo.addEventListener("click", () => {
            performLogin("Dr. Placeholder");
        });
    }

    if (formLogin) {
        formLogin.addEventListener("submit", (evento) => {
            evento.preventDefault();
            
            const email = document.getElementById("email").value;
            const senha = inputSenha.value;

            if (email && senha) {
                const nameParts = email.includes("@") ? email.split("@")[0] : email;
                const formattedName = nameParts.replace(/\b\w/g, c => c.toUpperCase());
                performLogin(`Dr. ${formattedName}`);
            }
        });
    }
});