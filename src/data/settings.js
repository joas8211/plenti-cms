export async function getSettings() {
    const response = await fetch('/plenti-cms.json');
    const settings = await response.json();
    return settings;
}