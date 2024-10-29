/**
 * vertexnode - Ein VertexAI-Anthropic-Proxy
 * Copyright (C) 2024 fukuro-kun
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const crypto = require("crypto").webcrypto;

// Funktion zum Lesen der service_account.json-Datei
function getServiceAccountInfo() {
    const filePath = path.join(__dirname, "gcp-service-account-key.json");
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
}

async function createSignedJWT(email, privateKey) {
    // Bereinige den Private Key
    privateKey = privateKey.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\r|\n|\\n/g, "");

    // Importiere den Private Key
    const cryptoKey = await crypto.subtle.importKey(
        "pkcs8",
        str2ab(atob(privateKey)),
        {
            name: "RSASSA-PKCS1-v1_5",
            hash: { name: "SHA-256" },
        },
        false,
        ["sign"],
    );

    const authUrl = "https://www.googleapis.com/oauth2/v4/token";
    const issued = Math.floor(Date.now() / 1000);
    const expires = issued + 600; // 10 Minuten

    const header = {
        alg: "RS256",
        typ: "JWT",
    };

    const payload = {
        iss: email,
        aud: authUrl,
        iat: issued,
        exp: expires,
        scope: "https://www.googleapis.com/auth/cloud-platform",
    };

    const encodedHeader = urlSafeBase64Encode(JSON.stringify(header));
    const encodedPayload = urlSafeBase64Encode(JSON.stringify(payload));
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;

    const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, str2ab(unsignedToken));

    const encodedSignature = urlSafeBase64Encode(signature);
    return `${unsignedToken}.${encodedSignature}`;
}

async function exchangeJwtForAccessToken(signedJwt) {
    const authUrl = "https://www.googleapis.com/oauth2/v4/token";
    const params = {
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: signedJwt,
    };

    const response = await fetch(authUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: Object.entries(params)
            .map(([k, v]) => k + "=" + encodeURIComponent(v))
            .join("&"),
    });

    const data = await response.json();

    if (data.access_token) {
        return [data.access_token, null];
    }
    return [null, data];
}

// Hilfsfunktionen
function str2ab(str) {
    const buffer = new ArrayBuffer(str.length);
    const bufferView = new Uint8Array(buffer);
    for (let i = 0; i < str.length; i++) {
        bufferView[i] = str.charCodeAt(i);
    }
    return buffer;
}

function urlSafeBase64Encode(data) {
    let base64;
    if (typeof data === "string") {
        base64 = btoa(
            encodeURIComponent(data).replace(/%([0-9A-F]{2})/g, (match, p1) =>
                String.fromCharCode(parseInt("0x" + p1)),
            ),
        );
    } else {
        base64 = btoa(String.fromCharCode(...new Uint8Array(data)));
    }
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Hauptfunktion zum Abrufen des Access Tokens
async function getGoogleAccessToken() {
    const serviceAccountInfo = getServiceAccountInfo();
    const signedJwt = await createSignedJWT(serviceAccountInfo.client_email, serviceAccountInfo.private_key);
    const [token, error] = await exchangeJwtForAccessToken(signedJwt);

    if (error) {
        throw new Error(`Failed to get access token: ${JSON.stringify(error)}`);
    }

    return token;
}

module.exports = { getGoogleAccessToken };
