// PM2 ecosystem — Laku API (production VPS)
// Usage: pm2 start deploy/ecosystem.config.js && pm2 save
//
// Requirements on the VPS:
//   - Repo cloned to ~/laku
//   - venv at backend/.venv (Python >= 3.12 — lihat catatan versi di bawah)
//   - .env at repo root (see .env.example)
//   - Port 8400 bound to 127.0.0.1 only (Caddy terminates TLS)
//
// AUDIT 6 Okt (Yuken):
//   - VPS punya python3.10 bawaan; 3.12 harus di-install terpisah
//     (deadsnakes PPA atau uv). Runbook step 0 mencover ini.
//   - --workers 2 dibuang: fork 2 worker di RAM 2GB yang sama dengan
//     UBSI-API + Redis = OOM risk tanpa manfaat (traffic demo).
//
// NOTE: this VPS also runs UBSI-API (port 8300) — do NOT change that app.

module.exports = {
  apps: [
    {
      name: "laku-api",
      cwd: __dirname + "/../backend",
      script: "./.venv/bin/uvicorn",
      // --env-file: uvicorn loads ../.env natively (PM2 has no env_file support)
      args: "app.main:app --host 127.0.0.1 --port 8400 --env-file ../.env",
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
