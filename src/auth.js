import { session } from './session.js';
import { getSettings } from './settings.js';

const parameters = Object.fromEntries(
    location.search.slice(1).split('&').map(
        p => p.split('=').map(c => decodeURIComponent(c))
    )
);

function randomInteger(min, max) {
    return Math.round(Math.random() * (max - min)) + min
}

/**
 * Generates string between 43 and 128 characters in length, which use the
 * characters A-Z, a-z, 0-9, -, ., _, and ~.
 */
function generateString() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const characters = (letters + letters.toLowerCase() + '-._~').split('');
    const length = randomInteger(43, 128);
    let string = '';
    for (let i = 0; i < length; i++) {
        string += characters[randomInteger(0, characters.length)];
    }
    return string;
}

async function hash(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const array = new Uint8Array(await crypto.subtle.digest('SHA-256', data));
    let binary = '';
    for (let i = 0; i < array.length; i++) {
        binary += array[i];
    }
    return btoa(binary);
}

async function start() {
    const state = generateString();
    session.set('gitlab_state', state);

    const codeVerifier = generateString();
    session.set('gitlab_code_verifier', codeVerifier);
    const codeChallenge = await hash(codeVerifier);

    const { gitlab } = await getSettings();
    const { server, appId } = gitlab;
    location.href = `https://${server}/oauth/authorize` +
        `?client_id=${encodeURIComponent(appId)}` +
        `&redirect_uri=${encodeURIComponent(location.origin + '?cms')}` +
        `&response_type=code` +
        `&state=${encodeURIComponent(state)}` +
        `&code_challenge=${encodeURIComponent(codeChallenge)}` +
        '&code_challenge_method=S256';
}

async function capture() {
    const { gitlab } = await getSettings();
    const { server, appId } = gitlab;
    const codeVerifier = session.get(gitlab_code_verifier);
    const response = await fetch(
        `https://${server}/oauth/token` +
        `?client_id=${encodeURIComponent(appId)}` +
        `&code=${encodeURIComponent(parameters.code)}` +
        '&grant_type=authorization_code' +
        `&redirect_uri=${encodeURIComponent(location.origin + '?cms')}` +
        `&code_verifier=${encodeURIComponent(codeVerifier)}`
    );
    const tokens = await response.json();
    session.set('gitlab_tokens', tokens);
}

async function refresh() {
    const {
        created_at: createdAt, 
        expires_in: expiresIn,
        refresh_token: refreshToken,
    } = session.get('gitlab_tokens');
    const expiresAt = (createdAt + expiresIn) * 1000;
    if (Date.now() < expiresAt) return;

    const response = await fetch(
        `https://${server}/oauth/token` +
        `?client_id=${encodeURIComponent(appId)}` +
        `&refresh_token=${encodeURIComponent(refreshToken)}` +
        '&grant_type=refresh_token' +
        `&redirect_uri=${encodeURIComponent(location.origin + '?cms')}` +
        `&code_verifier=${encodeURIComponent(codeVerifier)}`
    );
    const tokens = await response.json();
    session.set('gitlab_tokens', tokens);
}

export async function authenticate() {
    const state = session.get('gitlab_state');
    const tokens = session.get('gitlab_tokens');
    if (
        parameters.code &&
        parameters.state &&
        state &&
        parameters.state == state
    ) {
        await capture();
    } else if (tokens) {
        try {
            await refresh();
        } catch (error) {
            await start();
        }
    } else {
        await start();
    }
}