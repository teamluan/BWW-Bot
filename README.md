# Discord Bot

Ein einfacher Discord.js-Bot ohne Website und ohne Datenbank.

## Funktionen

- `/nachricht text:<Text> bild:<Bild>` sendet ein Embed in den Channel, in dem der Command ausgeführt wurde.
- Text und Bild sind beide optional, aber mindestens eines muss angegeben werden.
- `/nachricht` darf nur mit **Nachrichten verwalten** ausgeführt werden.
- Welcome-Embed bei neuen Mitgliedern.
- Leave-Embed bei verlassenen Mitgliedern.
- Optional automatische Rolle beim Beitritt.
- Optional Welcome-DM.
- Keine Datenbank.
- Keine Website.
- Alle Einstellungen kommen aus Umgebungsvariablen.

## Start

1. Node.js 20 oder neuer installieren.
2. `npm install` ausführen.
3. `.env.example` nach `.env` kopieren.
4. Bot-Token, Application ID und Channel-IDs eintragen.
5. `npm start` ausführen.

## Discord Developer Portal

Der Bot benötigt mindestens den **Server Members Intent**, damit Welcome- und Leave-Events zuverlässig funktionieren.

Beim Einladen sollte der Bot die Scopes `bot` und `applications.commands` erhalten. Für das Senden und Begrüßen braucht er passende Rechte, insbesondere **Nachrichten senden**, **Embeds verwenden** und für Auto-Rollen **Rollen verwalten**.

## Umgebungsvariablen

- `DISCORD_TOKEN` – Bot-Token
- `CLIENT_ID` – Application ID des Bots
- `GUILD_ID` – optional, für sofortige Slash-Command-Registrierung auf einem Server
- `WELCOME_CHANNEL_ID` – Channel für Begrüßungen
- `LEAVE_CHANNEL_ID` – Channel für Verabschiedungen
- `AUTO_ROLE_ID` – optional, Rolle für neue Mitglieder
- `WELCOME_DM=true` – optional, zusätzliche DM an neue Mitglieder
