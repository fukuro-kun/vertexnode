# vertexnode - Ein VertexAI-Anthropic-Proxy

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-GPL--3.0-green.svg)
![Maintenance](https://img.shields.io/badge/Maintained%3F-passively-yellowgreen.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)

vertexnode ist ein leistungsstarker Proxy-Server, der eine nahtlose Integration zwischen Anthropic's Claude-Modellen und Google's Vertex AI ermöglicht. Dieses Projekt bietet eine Anthropic-kompatible API, die es Entwicklern erlaubt, Claude-Modelle über Vertex AI zu nutzen, ohne ihre bestehenden Anthropic-basierten Anwendungen grundlegend umschreiben zu müssen.

[![Made with Node.js](https://img.shields.io/badge/Made%20with-Node.js-1f425f.svg)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

vertexnode übernimmt die komplexe Aufgabe der Authentifizierung und Kommunikation mit der Vertex AI-Plattform und stellt eine einfach zu nutzende Schnittstelle bereit, die mit der ursprünglichen Anthropic-API kompatibel ist. Dadurch wird der Übergang zu Vertex AI erheblich vereinfacht und Entwickler können die Vorteile beider Plattformen optimal nutzen.

## Inspiration und Danksagung

Dieses Projekt wurde inspiriert durch [vertexai-cf-workers](https://github.com/cg-dot/vertexai-cf-workers/) von cg-dot. Wir möchten den ursprünglichen Autoren für ihre Arbeit und die Bereitstellung einer soliden Grundlage danken, auf der wir aufbauen konnten. Teile unserer Dokumentation, insbesondere die Abschnitte zu den Voraussetzungen und Umgebungsvariablen, basieren auf ihrer ausgezeichneten README.

## Voraussetzungen

1. GCP-Konto erstellen:

    - Besuchen Sie [https://cloud.google.com/vertex-ai](https://cloud.google.com/vertex-ai) und erstellen Sie ein GCP-Konto.
    - Sie können 150$ Guthaben ohne Kreditkarte oder 300$ Guthaben mit Kreditkarte erhalten. (Beachten Sie, dass das Guthaben nach 90 Tagen verfällt)

2. Vertex AI API aktivieren:

    - Gehen Sie zu [https://console.cloud.google.com/marketplace/product/google/aiplatform.googleapis.com](https://console.cloud.google.com/marketplace/product/google/aiplatform.googleapis.com), um die Vertex AI API für Ihr Projekt zu aktivieren.

3. Zugang zu Claude-Modellen beantragen:

    - Besuchen Sie [https://console.cloud.google.com/vertex-ai](https://console.cloud.google.com/vertex-ai) und beantragen Sie Zugang zu den Claude-Modellen.

4. [Dienstkonto erstellen](https://console.cloud.google.com/projectselector/iam-admin/serviceaccounts/create?walkthrough_id=iam--create-service-account#step_index=1):

    - Wählen Sie die zuvor erstellte Projekt-ID aus.
    - Stellen Sie sicher, dass Sie dem Dienstkonto die Rolle "Vertex AI User" oder "Vertex AI Administrator" zuweisen.
    - Gehen Sie auf der Seite des erstellten Dienstkontos zum Reiter "Schlüssel" und klicken Sie auf "Schlüssel hinzufügen".
    - Wählen Sie "Neuen Schlüssel erstellen" und wählen Sie "JSON" als Schlüsseltyp.
    - Die Schlüsseldatei wird automatisch heruntergeladen. Diese Datei enthält die erforderlichen Variablen für den Worker, wie project_id, private_key und client_email. Speichern Sie die heruntergeladene JSON-Datei im Projektverzeichnis unter dem Namen `gcp-service-account-key.json`.
    - Fügen Sie `gcp-service-account-key.json` zu Ihrer `.gitignore` Datei hinzu, um versehentliches Hochladen zu verhindern.

    WICHTIG: Teilen Sie diese Schlüsseldatei niemals öffentlich und fügen Sie sie nicht zu Ihrem Git-Repository hinzu.

## Quota-Erhöhung für das neueste Anthropic-Modell

Um das neueste Anthropic-Modell nutzen zu können, müssen Sie möglicherweise Ihre Quota erhöhen lassen:

1. Besuchen Sie die [Google Cloud Console](https://console.cloud.google.com/).
2. Navigieren Sie zu "IAM & Admin" > "Quotas".
3. Suchen Sie nach "Vertex AI API" und wählen Sie das entsprechende Kontingent für das gewünschte Modell aus.
4. Klicken Sie auf "Limit erhöhen" und folgen Sie den Anweisungen, um eine Erhöhung zu beantragen.
5. Geben Sie eine Begründung für Ihren Antrag an und warten Sie auf die Genehmigung durch Google.

Beachten Sie, dass die Bearbeitung des Antrags einige Zeit in Anspruch nehmen kann. Planen Sie dies bei Ihrer Projektplanung ein.

## Umgebungsvariablen

Der Worker benötigt mehrere Umgebungsvariablen:

-   `CLIENT_EMAIL`: Die E-Mail-Adresse Ihres GCP-Dienstkontos. Sie finden diese in der JSON-Schlüsseldatei Ihres Dienstkontos.
-   `PRIVATE_KEY`: Der private Schlüssel Ihres GCP-Dienstkontos. Sie finden diesen in der JSON-Schlüsseldatei Ihres Dienstkontos.
-   `PROJECT`: Die ID Ihres GCP-Projekts. Sie finden diese in der JSON-Schlüsseldatei Ihres Dienstkontos.
-   `API_KEY`: Ein von Ihnen definierter String. Er wird zur Authentifizierung von Anfragen an den Worker verwendet.

## Installation und Einrichtung

### Voraussetzungen

-   Node.js (Version 14.x oder höher)
-   npm (normalerweise mit Node.js installiert)
-   Git

### Schritte

1. **Node.js installieren**

    Falls noch nicht geschehen, laden Sie Node.js von [nodejs.org](https://nodejs.org/) herunter und installieren Sie es. Wählen Sie die LTS-Version für die beste Stabilität.

2. **Projekt klonen**

    Klonen Sie das Repository auf Ihren lokalen Computer:

    ```
    git clone https://github.com/fukuro-kun/vertexnode.git
    cd vertexnode
    ```

3. **Abhängigkeiten installieren**

    Führen Sie im Projektverzeichnis den folgenden Befehl aus:

    ```
    npm install
    ```

    Dies installiert alle notwendigen Abhängigkeiten, die in der `package.json` Datei definiert sind:

    - cors
    - dotenv
    - express
    - google-auth-library
    - node-fetch

4. **Umgebungsvariablen konfigurieren**

    Erstellen Sie eine `.env` Datei im Projektroot und fügen Sie die erforderlichen Umgebungsvariablen hinzu:

    ```
    API_KEY=Ihr_API_Schlüssel
    PROJECT=Ihre_GCP_Projekt_ID
    ```

5. **Server starten**

    Starten Sie den Server mit:

    ```
    npm start
    ```

    Der Server sollte nun auf dem Port 3000 laufen (oder dem in der Umgebungsvariable PORT definierten Port).

## API-Schnittstellen

Der vertexnode-Server stellt folgende API-Schnittstelle bereit:

### POST http://localhost:3000/v1/messages

Diese Schnittstelle ermöglicht die Kommunikation mit den Claude-Modellen über Vertex AI.

#### Beispielanfrage mit cURL

```bash
curl -X POST http://localhost:3000/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: dein-api-key" \
  -d '{
    "model": "claude-3-5-sonnet-20240620",
    "messages": [
      {
        "role": "user",
        "content": "Hallo, wie geht es dir?"
      }
    ],
    "max_tokens": 1024,
    "stream": false
  }'
```

Ersetzen Sie `dein-api-key` durch Ihren tatsächlichen API-Schlüssel.

**Anfrage-Format:**

```json
{
    "model": "claude-3-5-sonnet-20240620",
    "messages": [
        {
            "role": "user",
            "content": "Hallo, wie geht es dir?"
        }
    ],
    "max_tokens": 1024,
    "stream": false
}
```

**Parameter:**

-   `model`: (erforderlich) Der Name des zu verwendenden Claude-Modells.
-   `messages`: (erforderlich) Ein Array von Nachrichten, die den Konversationsverlauf darstellen.
-   `max_tokens`: (optional) Die maximale Anzahl von Tokens in der Antwort.
-   `stream`: (optional) Boolean-Wert, der angibt, ob die Antwort gestreamt werden soll.

**Antwort:**
Bei Erfolg gibt die API eine JSON-Antwort mit der generierten Nachricht zurück.

**Authentifizierung:**
Alle Anfragen müssen einen gültigen API-Schlüssel im `x-api-key` Header enthalten.

**Verfügbare Modelle:**

-   claude-3-opus
-   claude-3-sonnet
-   claude-3-haiku
-   claude-3-5-sonnet
-   claude-3-opus-20240229
-   claude-3-sonnet-20240229
-   claude-3-haiku-20240307
-   claude-3-5-sonnet-20240620
-   claude-3-5-sonnet-v2

Bitte beachten Sie die spezifischen Eigenschaften und Einschränkungen jedes Modells bei der Verwendung.

### Hinweise

-   Stellen Sie sicher, dass Sie die nötigen Berechtigungen und Zugänge für Google Cloud Platform und Vertex AI eingerichtet haben, wie im Abschnitt "Voraussetzungen" beschrieben.
-   Die URL `http://localhost:3000` gilt für lokale Entwicklungsumgebungen. In Produktionsumgebungen sollte die entsprechende Server-URL verwendet werden.

## Docker-Deployment

![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)
![Deployment Method](https://img.shields.io/badge/Deployment-Docker-informational?logo=docker)
![Node Version](https://img.shields.io/badge/Node-20.9.0-brightgreen?logo=node.js)

Für ein einfaches Deployment in einer Docker-Umgebung folgen Sie diesen Schritten:

### Voraussetzungen

-   Docker installiert auf Ihrem System
-   Git installiert auf Ihrem System
-   Zugang zu einem Terminal/Kommandozeile

### Schritte zum Deployment

1. **Projekt klonen**

    ```
    git clone https://github.com/fukuro-kun/vertexnode.git
    cd vertexnode
    ```

2. **Konfiguration vorbereiten**

    - Kopieren Sie Ihre `gcp-service-account-key.json` in das Projektverzeichnis.
    - Erstellen Sie eine `.env` Datei im Projektverzeichnis mit folgendem Inhalt:
        ```
        API_KEY=Ihr_API_Schlüssel
        PROJECT=Ihre_GCP_Projekt_ID
        ```

3. **Docker-Image bauen**

    ```
    docker build --network host -t vertexnode:latest .
    ```

4. **Docker-Container starten**

    ```
    docker run -d \
      --name vertexnode \
      -p 3000:3000 \
      -v $(pwd)/.env:/usr/src/app/.env \
      -v $(pwd)/gcp-service-account-key.json:/usr/src/app/gcp-service-account-key.json \
      vertexnode:latest
    ```

    Soll der Server automatisch neu starten, so fügt man hier die Option `--restart always` hinzu. Z. B. wenn:

    - Der Docker-Daemon neu gestartet wird
    - Der Container aus irgendeinem Grund abstürzt
    - Der Host-Server neu gestartet wird

5. **Überprüfen der Installation**

    ```
    docker logs vertexnode
    ```

    Sie sollten eine Ausgabe sehen, die bestätigt, dass der Server läuft und das Web Crypto API verfügbar ist.

6. **Testen der API**
   Verwenden Sie den curl-Befehl aus dem API-Schnittstellen-Abschnitt, um die Funktionalität zu testen.

### Wartung und Updates

Um den Container zu aktualisieren:

1. Ziehen Sie die neuesten Änderungen aus dem Repository:
    ```
    git pull origin main
    ```
2. Stoppen und entfernen Sie den alten Container und wiederholen Sie die Schritte 3-5 des Deployments:
    ```
    docker stop vertexnode
    docker rm vertexnode
    docker build --network host -t vertexnode:latest .
    docker run -d \
      --name vertexnode \
      --restart always \
      -p 3000:3000 \
      -v $(pwd)/.env:/usr/src/app/.env \
      -v $(pwd)/gcp-service-account-key.json:/usr/src/app/gcp-service-account-key.json \
      vertexnode:latest
    ```

### Hinweise

-   Stellen Sie sicher, dass Ports nicht bereits belegt sind.
-   Passen Sie den Port in Schritt 4 an, falls 3000 bereits verwendet wird.
-   Für Produktionsumgebungen sollten zusätzliche Sicherheitsmaßnahmen getroffen werden.

## Unterstützung und Wartung

Dieses Projekt wird passiv gewartet. Bitte beachten Sie folgende Hinweise:

-   **Issues:** Sie können bei Problemen oder Fragen gerne ein Issue in diesem Repository eröffnen. Bitte haben Sie jedoch Verständnis dafür, dass Antworten möglicherweise verzögert erfolgen oder ausbleiben können.

-   **Fehlerbehebungen:** Kritische Fehler werden nach Möglichkeit behoben, aber es kann keine Garantie für zeitnahe Korrekturen gegeben werden.

-   **Funktionserweiterungen:** Neue Funktionen werden in der Regel nicht aktiv entwickelt. Vorschläge sind willkommen, aber ihre Umsetzung kann nicht garantiert werden.

-   **Community-Unterstützung:** Nutzer werden ermutigt, sich gegenseitig zu unterstützen. Wenn Sie eine Lösung für ein Problem gefunden haben, teilen Sie diese bitte in den entsprechenden Issues.

-   **Keine direkte Unterstützung:** Individueller Support oder direkte Kontaktaufnahme mit den Projektbetreuern ist leider nicht möglich.

-   **Forks und Pull Requests:** Forks des Projekts sind willkommen. Wenn Sie Verbesserungen vornehmen, können Sie gerne einen Pull Request einreichen. Bitte haben Sie Verständnis, wenn die Überprüfung und Integration Zeit in Anspruch nimmt.

Wir danken für Ihr Verständnis und Ihre Geduld. Dieses Projekt wird als Open-Source-Ressource zur Verfügung gestellt, mit der Hoffnung, dass es nützlich ist, aber ohne Garantie auf aktive Wartung oder Support.

## Lizenz

Dieses Projekt ist unter der GNU General Public License v3.0 lizenziert - siehe die [LICENSE](LICENSE) Datei für Details.
