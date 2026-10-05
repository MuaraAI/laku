// PM2 ecosystem — Laku API (production VPS)
// Usage: pm2 start deploy/ecosystem.config.js && pm2 save
//
// Requirements on the VPS:
//   - Repo cloned to ~/laku
//   - venv at backend/.venv (python 3.12): python -m venv .venv && .venv/bin/pip install -r backend/requirements.txt
//   - .env at repo root (see .env.example)
//   - Port 8400 bound to 127.0.0.1 only (Caddy terminates TLS)
//
// NOTE: this VPS also runs UBSI-API (port 8300) — do NOT change that app.

module.exports = {
  apps: [
    {
      name: "laku-api",
      cwd: __dirname + "/../backend",
      script: "./.venv/bin/uvicorn",
      // --env-file: uvicorn loads ../.env natively (PM2 has no env_file support)
      args: "app.main:app --host 127.0.0.1 --port 8400 --workers 2 --env-file ../.env",
      interpreter: "none", // script is the venv binary itself
      env: {
        ALLOWED_ORIGINS: "https://laku.muaraai.com,http://localhost:3000",
      },
      max_memory_restart: "512M", // VPS shares 2GB with UBSI-API + Redis
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      time: true,
    },
  ],
};
