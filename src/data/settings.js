export async function getSettings() {
    const response = await fetch('/assets/plenti-cms.json');
    const settings = await response.json();
    return settings;
}