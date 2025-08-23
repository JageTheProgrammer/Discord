## Discord Bot - SSH Hosting Guide

1) Requirements
- Node.js 18.x (recommended), npm
- A Linux server with SSH access

2) Setup
```bash
git clone <your-repo> bot && cd bot
cp .env.example .env
# edit .env with your BOT_TOKEN and CLIENT_ID
npm install --no-audit --no-fund
```

3) Deploy slash commands
```bash
export BOT_TOKEN=your_token
export CLIENT_ID=your_client_id
node deploy-commands.js
```

4) Run the bot
```bash
npm run start
# or with PM2 (recommended for SSH hosting)
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 status
```

5) Keep-alive web endpoint
- The bot exposes GET / and /ping on PORT (default 8080). Configure your host/uptime monitor to ping /ping.

6) Logs
```bash
pm2 logs discord-bot
```

7) Updating
```bash
git pull
npm install --no-audit --no-fund
node deploy-commands.js
pm2 restart discord-bot
```