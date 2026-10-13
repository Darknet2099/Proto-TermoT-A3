import { BridgeModule } from './bridge.js';

export class ClientModule {
    constructor() {
        this.datastore = "termoterapia-site-state-v2"
        this.defaultData = { favorites: [], history: [], theme: "dark", fontSize: "normal" };

        this.currentData = this.defaultData

        this.bridgeModule = new BridgeModule()

        this.GetLocalData()
        this.ApplyUserSettings()
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

        const themeSelect = document.getElementById("theme-select");
        const fontSelect = document.getElementById("font-size-select");

        if (this.currentData.theme === "auto") {
            document.documentElement.removeAttribute("data-theme");
        } else {
            document.documentElement.dataset.theme = this.currentData.theme;
        }

        document.body.classList.toggle("large-text", this.currentData.fontSize === "large");

        if (themeSelect) themeSelect.value = this.currentData.theme;
        if (fontSelect) fontSelect.value = this.currentData.fontSize;
    }
}
