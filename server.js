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

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const { getGoogleAccessToken } = require("./auth");

const API_KEY = process.env.API_KEY || "dein-api-key";
const PROJECT = process.env.PROJECT || "dein-projekt";

// Überprüfung, ob Crypto API verfügbar ist
if (typeof crypto !== "undefined" && crypto.subtle) {
    console.log("Web Crypto API ist verfügbar");
} else {
    console.log("Web Crypto API ist nicht verfügbar");
}

// MODELS Definition hinzugefügt
const MODELS = {
    "claude-3-opus": {
        vertexName: "claude-3-opus@20240229",
        region: "europe-west1",
    },
    "claude-3-sonnet": {
        vertexName: "claude-3-sonnet@20240229",
        region: "europe-west1",
    },
    "claude-3-haiku": {
        vertexName: "claude-3-haiku@20240307",
        region: "europe-west1",
    },
    "claude-3-5-sonnet": {
        vertexName: "claude-3-5-sonnet@20240620",
        region: "europe-west1",
    },
    "claude-3-opus-20240229": {
        vertexName: "claude-3-opus@20240229",
        region: "europe-west1",
    },
    "claude-3-sonnet-20240229": {
        vertexName: "claude-3-sonnet@20240229",
        region: "europe-west1",
    },
    "claude-3-haiku-20240307": {
        vertexName: "claude-3-haiku@20240307",
        region: "europe-west1",
    },
    "claude-3-5-sonnet-20240620": {
        vertexName: "claude-3-5-sonnet@20240620",
        region: "europe-west1",
    },
    "claude-3-5-sonnet-v2": {
        vertexName: "claude-3-5-sonnet-v2@20241022",
        region: "us-east5",
    },
};

console.log("Umgebungsvariablen:", {
    API_KEY: process.env.API_KEY,
    PROJECT: process.env.PROJECT,
});

const app = express();

app.use(cors());
app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ limit: "12mb", extended: true }));

// Längenkontroll Middleware
app.use((req, res, next) => {
    let contentLength = parseInt(req.headers["content-length"], 10);
    console.log(`Incoming request size: ${contentLength} bytes`);
    next();
});

// Authentication middleware
app.use((req, res, next) => {
    const apiKey = req.headers["x-api-key"];
    console.log("Received API Key:", apiKey);
    console.log("Expected API Key:", process.env.API_KEY);

    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({
            type: "error",
            error: {
                type: "authentication_error",
                message: "Invalid API key",
            },
        });
    }
    next();
});

// Messages endpoint
app.post("/v1/messages", async (req, res) => {
    try {
        const model = req.body.model;
        if (!model) {
            return res.status(400).json({
                type: "error",
                error: {
                    type: "invalid_request_error",
                    message: "Model ist erforderlich",
                },
            });
        }

        const modelData = MODELS[model];
        if (!modelData) {
            return res.status(400).json({
                type: "error",
                error: {
                    type: "invalid_request_error",
                    message: `Model ${model} nicht gefunden`,
                },
            });
        }

        const payload = {
            ...req.body,
            anthropic_version: "vertex-2023-10-16",
        };
        delete payload.model;

        const accessToken = await getGoogleAccessToken();

        const url = `https://${modelData.region}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${modelData.region}/publishers/anthropic/models/${modelData.vertexName}:streamRawPredict`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Vertex AI error: ${response.statusText} - ${errorData}`);
        }

        if (req.body.stream) {
            response.body.pipe(res);
        } else {
            const data = await response.json();
            res.json(data);
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            type: "error",
            error: {
                type: "api_error",
                message: error.message || "Internal server error",
            },
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
