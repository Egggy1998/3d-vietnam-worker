# HQ Design Cloudflare Worker

Webhook relay worker cho hệ thống marketing.

## 🌐 Giới thiệu

Worker nhận request từ OpenClaw và forward đến n8n webhook, đảm bảo 100% uptime.

## 🚀 Deploy từ GitHub

### Cách 1: Cloudflare Dashboard (khuyến nghị)

1. Vào https://dash.cloudflare.com → Workers & Pages
2. "Create a Worker" → "Deploy from GitHub"
3. Connect repo: `Egggy1998/hq-design-worker`
4. Done!

### Cách 2: Wrangler CLI

```bash
npm install -g wrangler
wrangler login
git clone https://github.com/Egggy1998/hq-design-worker.git
cd hq-design-worker
wrangler deploy
```

## 🔧 Cấu hình Environment Variables

Trên Cloudflare Dashboard → Workers & Pages → `hq-design-worker` → Settings → Variables:

| Variable | Value |
|----------|-------|
| `N8N_WEBHOOK_URL` | URL instance n8n của bạn |
| `N8N_WEBHOOK_ID` | Webhook ID từ n8n |
| `BASEROW_TABLE_ID` | Table ID từ Baserow |

## 🔐 Set Secrets

```bash
# Set Baserow token
wrangler secret put BASEROW_TOKEN
# Nhập token của bạn

# Set n8n URL (nếu cần)
wrangler secret put N8N_WEBHOOK_URL
```

## 📡 API

```
POST https://YOUR_SUBDOMAIN.workers.dev
Content-Type: application/json

{
  "row_id": 297,
  "baserow_row_id": 297,
  "content": "Content...",
  "product_image_url": "https://...",
  "product_name": "Product Name"
}
```

## 📁 Cấu trúc

```
hq-design-worker/
├── index.ts        # Worker code
├── wrangler.toml   # Config
└── README.md
```

## 📚 Tham khảo

- https://developers.cloudflare.com/workers/
- https://developers.cloudflare.com/workers/wrangler/
