export class GitLabAuthentication {
  #server: string;
  #appId: string;

  constructor(server: string, appId: string) {
    this.#server = server;
    this.#appId = appId;
  }

  async authenticate() {
    const state = sessionStorage.getItem("PLENTI_CMS_GITLAB_STATE");
    const tokens = JSON.parse(
      sessionStorage.getItem("PLENTI_CMS_GITLAB_TOKENS") || "null",
    );
    const parameters = Object.fromEntries(
      location.search.slice(1).split("&").map(
        (p) => p.split("=").map((c) => decodeURIComponent(c)),
      ),
    );
    if (
      parameters.code &&
      parameters.state &&
      state &&
      parameters.state == state
    ) {
      await this.#capture(parameters.code);
      return true;
    } else if (tokens) {
      try {
        await this.#refresh();
        return true;
      } catch (_) {
        await this.#start();
        return false;
      }
    } else {
      await this.#start();
      return false;
    }
  }

  #generateString() {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.";
    const randomValues = Array.from(
      crypto.getRandomValues(new Uint8Array(128)),
    );
    return randomValues
      .map((val) => chars[val % chars.length])
      .join("");
  }

  async #hash(text: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const digest = await crypto.subtle.digest("SHA-256", data);
    const binary = String.fromCharCode(...new Uint8Array(digest));
    return btoa(binary)
      .split("=")[0]
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  }

  async #start() {
    const state = this.#generateString();
    sessionStorage.setItem("PLENTI_CMS_GITLAB_STATE", state);

    const codeVerifier = this.#generateString();
    sessionStorage.setItem("PLENTI_CMS_GITLAB_CODE_VERIFIER", codeVerifier);
    const codeChallenge = await this.#hash(codeVerifier);

    location.href = `https://${this.#server}/oauth/authorize` +
      `?client_id=${encodeURIComponent(this.#appId)}` +
      `&redirect_uri=${encodeURIComponent(location.origin)}` +
      `&response_type=code` +
      `&state=${encodeURIComponent(state)}` +
      `&code_challenge=${encodeURIComponent(codeChallenge)}` +
      "&code_challenge_method=S256";
  }

  async #capture(code: string) {
    const codeVerifier = sessionStorage.getItem(
      "PLENTI_CMS_GITLAB_CODE_VERIFIER",
    );
    if (!codeVerifier) {
      throw new Error("Code verifier not saved to session storage");
    }
    const response = await fetch(
      `https://${this.#server}/oauth/token` +
        `?client_id=${encodeURIComponent(this.#appId)}` +
        `&code=${encodeURIComponent(code)}` +
        "&grant_type=authorization_code" +
        `&redirect_uri=${encodeURIComponent(location.origin)}` +
        `&code_verifier=${encodeURIComponent(codeVerifier)}`,
      { method: "POST" },
    );
    const tokens = await response.json();
    if (tokens.error) {
      throw new Error(tokens.error_description);
    }
    sessionStorage.setItem("PLENTI_CMS_GITLAB_TOKENS", JSON.stringify(tokens));
    history.replaceState(null, "", location.pathname);
  }

  async #refresh() {
    const {
      created_at: createdAt,
      expires_in: expiresIn,
      refresh_token: refreshToken,
    } = JSON.parse(
      sessionStorage.getItem("PLENTI_CMS_GITLAB_TOKENS") || "null",
    );
    const expiresAt = (createdAt + expiresIn) * 1000;
    if (Date.now() > expiresAt) return;

    const codeVerifier = sessionStorage.getItem(
      "PLENTI_CMS_GITLAB_CODE_VERIFIER",
    );
    if (!codeVerifier) {
      throw new Error("Code verifier not saved to session storage");
    }
    const response = await fetch(
      `https://${this.#server}/oauth/token` +
        `?client_id=${encodeURIComponent(this.#appId)}` +
        `&refresh_token=${encodeURIComponent(refreshToken)}` +
        "&grant_type=refresh_token" +
        `&redirect_uri=${encodeURIComponent(location.origin)}` +
        `&code_verifier=${encodeURIComponent(codeVerifier)}`,
      { method: "POST" },
    );
    const tokens = await response.json();
    if (tokens.error) {
      throw new Error(tokens.error_description);
    }
    sessionStorage.setItem("PLENTI_CMS_GITLAB_TOKENS", JSON.stringify(tokens));
  }
}
