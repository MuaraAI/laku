# Deploy Runbook — Laku API (VPS)

Target: FastAPI jalan via PM2 di `127.0.0.1:8400`, TLS via Caddy, publik di
`https://api.muaraai.com/v1/laku` (kontrak `docs/api.md`).

> VPS ini share 2GB RAM dengan UBSI-API (:8300) + Redis + Caddy + PM2.
> JANGAN menyentuh app/db milik UBSI-API. Redis Laku pakai db3 (db2 = UBSI-API).

> AUDIT 6 Okt: runbook ini sudah diverifikasi terhadap kondisi live VPS
> (PM2 proses existing, port terpakai, Caddyfile aktif, python bawaan).

## 0. Python >= 3.12 (WAJIB — bawaan VPS cuma 3.10)

Kode backend dipakai `int | None` (PEP 604) dan dependensi yang butuh
Python modern. Python 3.10 bawaan Ubuntu VPS TIDAK cukup.

```bash
# Opsi cepat & resmi: deadsnakes PPA
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt update && sudo apt install -y python3.12 python3.12-venv
python3.12 --version   # expect: Python 3.12.x
```

## 1. Persiapan (sekali)

```bash
# folder + repo
mkdir -p ~/laku && cd ~/laku
git clone https://github.com/MuaraAI/laku.git .

# venv python 3.12
cd backend
python3.12 -m venv .venv
.venv/bin/pip install -r requirements.txt

# env
cp ../.env.example ../.env
nano ../.env   # isi SUPABASE_URL/KEYS dari Yuken, REDIS_URL=redis://127.0.0.1:6379/3, ALLOWED_ORIGINS
chmod 600 ../.env
```

## 2. Smoke test tanpa PM2

```bash
cd ~/laku/backend
.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8400 --env-file ../.env &
curl -s http://127.0.0.1:8400/health
# expect: {"status":"ok","service":"laku-api",...}
kill %1
```

## 3. PM2

```bash
cd ~/laku
pm2 start deploy/ecosystem.config.js
pm2 save
pm2 startup    # ikuti instruksi print-nya (sekali saja)

pm2 logs laku-api --lines 50   # cek error
curl -s http://127.0.0.1:8400/health
```

## 4. Caddy (HATI-HATI — blok site SUDAH ADA)

`api.muaraai.com` sudah terdefinisi di Caddyfile aktif (gateway Muara AI:
`/v1/ubsi-api/*` -> :8300). **Caddy menolak duplikat site address** — jadi
`deploy/Caddyfile.laku` TIDAK di-paste sebagai site block baru. Yang
ditambahkan hanya satu blok `handle_path` DI DALAM site block existing,
**sebelum** catch-all `handle { ... }` milik gateway.

```bash
sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak.$(date +%s)
sudo nano /etc/caddy/Caddyfile
#   -> cari blok `api.muaraai.com {`
#   -> paste isi `handle_path` dari deploy/Caddyfile.laku di dalamnya,
#      di atas catch-all `handle { respond ... 200 }`

sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

## 5. Verifikasi publik

```bash
curl -s https://api.muaraai.com/v1/laku/health
# expect 200 {"status":"ok",...,"demo_mode":...}
curl -s -o /dev/null -w "%{http_code}\n" https://api.muaraai.com/v1/laku/
# expect 404
curl -s https://api.muaraai.com/v1/ubsi-api/health
# expect tetap 200 — gateway UBSI tidak terganggu
```

DNS: `api.muaraai.com` sudah resolve (via Cloudflare) dan site block sudah
ada — tidak ada perubahan DNS yang perlu dilakukan.

## 6. Health check terjadwal (opsional, FR-34 keep-alive)

```bash
crontab -e
# ping Supabase + API tiap 30 menit biar project free-tier tidak pause
*/30 * * * * curl -fsS https://api.muaraai.com/v1/laku/health >/dev/null 2>&1
```

## Rollback

```bash
cd ~/laku && git log --oneline -5
git checkout <tag/sha yang dikenal-baik>
pm2 restart laku-api
```

## Port & konflik

| Service  | Bind               | Catatan                                     |
|----------|--------------------|---------------------------------------------|
| laku-api | 127.0.0.1:8400     | PM2 `laku-api`                              |
| UBSI-API | 127.0.0.1:8300     | JANGAN disentuh                             |
| Caddy    | 0.0.0.0:80/443     | TLS terminate, path-prefix strip `/v1/laku` |
| Redis    | 127.0.0.1:6379     | Laku = db3, bukan db2                       |
| Gateway 9Router | 0.0.0.0:20128 | next-server existing, JANGAN disentuh      |
