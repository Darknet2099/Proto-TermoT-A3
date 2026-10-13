import { ClientModule } from '../modules/client.js';

(async () => {

    const themeSelect = document.getElementById("theme-select");
    const fontSizeSelect = document.getElementById("font-size-select");

    const client = new ClientModule()

    themeSelect.addEventListener("change", event => { client.currentData.theme = event.target.value; client.SaveLocalData(); client.ApplyUserSettings(); });
    fontSizeSelect.addEventListener("change", event => { client.currentData.fontSize = event.target.value; client.SaveLocalData(); client.ApplyUserSettings(); });
})();