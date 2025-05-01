# Schnelle Einrichtungsanleitung

## Voraussetzungen
- Docker und Docker Compose sind installiert
- Git-Repository mit deinem Proxy-Code

## Schritt-für-Schritt Anleitung

1. **Im Terminal zum Projektverzeichnis navigieren**
   ```bash
   cd pfad/zu/deinem/proxy-projekt
   ```

2. **Dateien erstellen**
   - Speichere die `docker-compose.yml` im Hauptverzeichnis
   - Speichere den `Dockerfile` im Hauptverzeichnis
   - Erstelle `.env` basierend auf `.env.example`

3. **API-Keys in .env setzen**
   ```bash
   # Erstelle .env-Datei
   cp .env.example .env
   
   # Bearbeite die Datei und setze deine API-Keys
   nano .env  # oder deinen bevorzugten Editor
   ```

4. **Docker-Container starten**
   ```bash
   # Im Hauptverzeichnis deines Projekts ausführen
   docker-compose up -d
   ```

5. **Überprüfen, ob Container laufen**
   ```bash
   docker ps
   ```

## Wichtige Befehle

- **Container starten**: `docker-compose up -d`
- **Container stoppen**: `docker-compose down`
- **Logs anzeigen**: `docker-compose logs -f`
- **Nach Änderungen neu bauen**: `docker-compose up -d --build`
- **Container und Volumes löschen**: `docker-compose down -v`

## Testen der Proxies

```bash
# Gesundheitscheck für 4B
curl -X GET http://localhost:30001/health -H "Authorization: Bearer DEIN_API_KEY_4B"

# Chat-Anfrage an 12B
curl -X POST http://localhost:30002/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DEIN_API_KEY_12B" \
  -d '{
    "model": "gemma3:12b",
    "messages": [
      {"role": "user", "content": "Was ist KI?"}
    ]
  }'
```