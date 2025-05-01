# Einfache Anleitung zur Einrichtung deines Ollama Multi-Proxy

## 1. Dateien vorbereiten

Behalt deinen Proxy-Code in seinem aktuellen Verzeichnis:
```
ollama-proxy/
├── src/
│   └── index.ts
├── Dockerfile            (Neue Datei)
├── docker-compose.yml    (Neue Datei)
├── package.json
├── tsconfig.json
├── .env                  (Neue Datei basierend auf .env.example)
└── .env.example          (Neue Datei)
```

## 2. Befehle ausführen

```bash
# .env-Datei erstellen
cp .env.example .env

# API-Keys in .env anpassen
nano .env  # oder deinen bevorzugten Editor

# Docker-Container starten
docker-compose up -d

# Überprüfen, ob Container laufen
docker ps
```

## 3. Testen

```bash
# Gemma 4B testen
curl -X GET http://localhost:30001/health -H "Authorization: Bearer DEIN_API_KEY_4B"

# Gemma 12B testen
curl -X GET http://localhost:30002/health -H "Authorization: Bearer DEIN_API_KEY_12B"

# Gemma 27B testen
curl -X GET http://localhost:30003/health -H "Authorization: Bearer DEIN_API_KEY_27B"
```

## 4. Modelle Pullen

```bash
# Gemma 4B-Modell laden
curl -X POST http://localhost:30001/api/pull \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DEIN_API_KEY_4B" \
  -d '{"name": "gemma3:4b"}'

# Gemma 12B-Modell laden
curl -X POST http://localhost:30002/api/pull \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DEIN_API_KEY_12B" \
  -d '{"name": "gemma3:12b"}'

# Gemma 27B-Modell laden
curl -X POST http://localhost:30003/api/pull \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DEIN_API_KEY_27B" \
  -d '{"name": "gemma3:27b"}'
```

## 5. Nützliche Befehle

```bash
# Logs anzeigen (z.B. für Gemma 4B)
docker-compose logs -f gemma3_4b_proxy
docker-compose logs -f gemma3_4b_ollama

# Alle Container stoppen
docker-compose down

# Container neu starten (nach Änderungen)
docker-compose up -d --build
```