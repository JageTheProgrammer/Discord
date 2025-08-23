## Discord Status & Community Bot

A modern Discord bot for status monitoring, utilities, and community features. Built on `discord.js` v14 with ESM modules and an Express keep-alive server.

### Features
- **Status updater**: periodic ping, website checks, member counter, and welcome embeds
- **Reminders**: background reminders processed every ~15s
- **Fun & community**: memes, quotes, ranks, polls, trivia, help, roles
- **Dev tools**: GitHub lookups, npm/pypi, regex test, IP/DNS/SSL, etc.
- **New commands**:
  - `/uptime` – process uptime, memory, and WS ping
  - `/invite` – bot invite link
  - `/shorten <url>` – shortens URLs via is.gd
  - `/qr <text>` – generates a PNG QR code
- **Health endpoints**: `GET /`, `/ping`, `/healthz`

### Requirements
- Node.js 18+ and npm
- Discord application with Bot + applications.commands enabled
- BOT token and CLIENT_ID

### Quick Start
```bash
git clone <your-repo> bot && cd bot
cp .env.example .env
# Edit .env with: BOT_TOKEN, CLIENT_ID, GUILD_ID, channel IDs and website URLs
npm install --no-audit --no-fund
node deploy-commands.js
npm run start
```

### Alwaysdata.com SSH Hosting
- SSH into your account: `ssh <user>@ssh-alwaysdata.com`
- Ensure Node 18+: `node -v` (use `nvm` if needed)
- Deploy:
```bash
cd ~/www   # or your chosen directory
git clone <your-repo> bot && cd bot
cp .env.example .env && nano .env  # set tokens, IDs, URLs
npm install --no-audit --no-fund
node deploy-commands.js
```
- Start in background using PM2 (recommended):
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 status
pm2 logs discord-bot
```
- Web access: configure an Alwaysdata HTTP site pointing to your Node.js app (port is managed by Alwaysdata). The bot also exposes `/healthz` for monitoring.

### Environment (.env)
See `.env.example`. Minimum required:
- `BOT_TOKEN`, `CLIENT_ID`, `GUILD_ID`
- `YOUR_PING_CHANNEL_ID`, `YOUR_WEBSITE_1_CHANNEL_ID`, `YOUR_WEBSITE_2_CHANNEL_ID`, `YOUR_MEMBER_COUNTER_CHANNEL_ID`, `YOUR_WELCOME_CHANNEL_ID`
- `YOUR_WEBSITE_1_URL`, `YOUR_WEBSITE_2_URL`
- Optional: `BOT_ACTIVITY`, `PORT`

### Scripts
- `npm run start` – start the bot
- `npm run dev` – auto-reload with nodemon
- `npm run deploy-commands` – register slash commands globally

### Troubleshooting
- Commands not visible: run `node deploy-commands.js`, ensure `CLIENT_ID` and `BOT_TOKEN` are correct
- Missing intents: enable Message Content and Server Members intents in the Discord Developer Portal
- Welcome/status channels not updating: verify channel IDs and bot permissions
- Alwaysdata port: the Express server provides keep-alive and health endpoints; follow Alwaysdata Node app guide to bind correctly

### License
MIT