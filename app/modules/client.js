import { BridgeModule } from './bridge.js';

export class ClientModule {
    constructor() {
        this.datastore = "termoterapia-site-state-v2";
        this.defaultData = { favorites: [], history: [], theme: "auto", fontSize: "normal" };

        this.currentData = this.defaultData;

        this.bridgeModule = new BridgeModule();

        this.GetLocalData();
        this.ApplyUserSettings();
    }

    GetLocalData() {
        try {
            this.currentData = {
                ...this.defaultData,
                ...JSON.parse(localStorage.getItem(this.datastore) || "{}")
            };
        } catch {
            this.currentData = { ...this.defaultData };
        }

        return this.currentData;
    }

    SaveLocalData() {
        try {
            const finalData = {
                ...this.defaultData,
                ...this.currentData
            };

            localStorage.setItem(
                this.datastore,
                JSON.stringify(finalData)
            );

            this.currentData = finalData;

            return true;
        } catch (error) {
            console.error("Failed to save local data:", error);
            return false;
        }
    }

    ApplyUserSettings() {
        if (this.currentData.theme === "auto") {
            document.documentElement.removeAttribute("data-theme");
        } else {
            document.documentElement.dataset.theme = this.currentData.theme;
        }

        document.body.classList.toggle("large-text", this.currentData.fontSize === "large");

        this.UpdateUserProfile();
    }

    UpdateUserProfile() {
        try {
            const storedUser = JSON.parse(localStorage.getItem("termoterapia-user"));
            
            if (storedUser && storedUser.name) {
                const name = storedUser.name;
                
                const initials = name
                    .split(/[\s._-]+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map(w => w[0].toUpperCase())
                    .join("");

                const userNameElements = document.querySelectorAll(".user-name");
                const userAvatarElements = document.querySelectorAll(".user-avatar");

                userNameElements.forEach(el => el.textContent = name);
                userAvatarElements.forEach(el => el.textContent = initials);
            }
        } catch (e) {
            console.error("Erro ao carregar perfil do usuário:", e);
        }
    }
}