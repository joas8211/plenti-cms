import { session } from './data/session.js';
import { getSettings } from './data/settings.js';
import { storage } from './data/storage.js';

const parameters = Object.fromEntries(
    location.search.slice(1).split('&').map(
        p => p.split('=').map(c => decodeURIComponent(c))
    )
);

function randomInteger(min, max) {
    return Math.round(Math.random() * (max - min)) + min
}

function generateString() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.';
    const randomValues = Array.from(crypto.getRandomValues(new Uint8Array(128)));
    return randomValues
        .map(val => chars[val % chars.length])
        .join('');
}

async function hash(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const binary = String.fromCharCode(...new Uint8Array(digest));
    return btoa(binary)
        .split('=')[0]
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
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
        `&redirect_uri=${encodeURIComponent(location.origin)}` +
        `&response_type=code` +
        `&state=${encodeURIComponent(state)}` +
        `&code_challenge=${encodeURIComponent(codeChallenge)}` +
        '&code_challenge_method=S256';
}

async function capture() {
    const { gitlab } = await getSettings();
    const { server, appId } = gitlab;
    const codeVerifier = session.get('gitlab_code_verifier');
    const response = await fetch(
        `https://${server}/oauth/token` +
        `?client_id=${encodeURIComponent(appId)}` +
        `&code=${encodeURIComponent(parameters.code)}` +
        '&grant_type=authorization_code' +
        `&redirect_uri=${encodeURIComponent(location.origin)}` +
        `&code_verifier=${encodeURIComponent(codeVerifier)}`,
        { method: 'POST' }
    );
    const tokens = await response.json();
    if (tokens.error) {
        throw new Error(tokens.error_description);
    }
    storage.set('gitlab_tokens', tokens);
    history.replaceState(null, '', location.pathname);
}

async function refresh() {
    const {
        created_at: createdAt, 
        expires_in: expiresIn,
        refresh_token: refreshToken,
    } = storage.get('gitlab_tokens');
    const expiresAt = (createdAt + expiresIn) * 1000;
    if (Date.now() > expiresAt) return;

    const response = await fetch(
        `https://${server}/oauth/token` +
        `?client_id=${encodeURIComponent(appId)}` +
        `&refresh_token=${encodeURIComponent(refreshToken)}` +
        '&grant_type=refresh_token' +
        `&redirect_uri=${encodeURIComponent(location.origin + '?cms')}` +
        `&code_verifier=${encodeURIComponent(codeVerifier)}`,
        { method: 'POST' }
    );
    const tokens = await response.json();
    if (tokens.error) {
        throw new Error(tokens.error_description);
    }
    storage.set('gitlab_tokens', tokens);
}

export async function authenticate() {
    const state = session.get('gitlab_state');
    const tokens = storage.get('gitlab_tokens');
    if (
        parameters.code &&
        parameters.state &&
        state &&
        parameters.state == state
    ) {
        await capture();
        return true;
    } else if (tokens) {
        try {
            await refresh();
            return true;
        } catch (error) {
            await start();
            return false;
        }
    } else {
        await start();
        return false;
    }
}