# Parse.bot API Proxy Worker

Cloudflare Worker that proxies requests to Parse.bot API, keeping the API key secure on the server side.

## Setup

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Set the API Key Secret

```bash
cd workers/parsebot-proxy
wrangler secret put PARSEBOT_API_KEY
```

When prompted, paste your Parse.bot API key.

### 4. Deploy

```bash
wrangler deploy
```

The worker will be deployed to: `https://wojak-parsebot-proxy.<your-subdomain>.workers.dev`

## Endpoints

All endpoints use POST method:

### `POST /collection-stats`
Fetches collection statistics (floor price, volume, trade count, etc.)

**Request:** No body required (collection URL is hardcoded)

**Response:**
```json
{
  "collection_id": "col10hfq4hml2z0z0wutu3a9hvt60qy9fcq4k4dznsfncey4lu6kpt3su7u9ah",
  "name": "Wojak Farmers Plot",
  "nft_count": 4210,
  "trade_count": 744,
  "floor_price": 0.95,
  "volume": 513.3
}
```

### `POST /nft-details`
Fetches full NFT details including owner, attributes, and events.

**Request:**
```json
{
  "nft_url": "https://mintgarden.io/nfts/nft1v8lqzdxvaz0mcufals2vg7xlaq6kfa40lvdxhlqvptrrq8kfsz3sjqd9e6"
}
```

**Response:** Full NFT details object

### `POST /nft-owner`
Fetches just the owner information for an NFT.

**Request:**
```json
{
  "nft_url": "https://mintgarden.io/nfts/nft1v8lqzdxvaz0mcufals2vg7xlaq6kfa40lvdxhlqvptrrq8kfsz3sjqd9e6"
}
```

**Response:**
```json
{
  "address": "xch1s5lv5sylcpx096wkcwrcjj8farcza3pxwhw645k3v0sgd3p7qh6qqztafk",
  "name": "FLEXicanPapa",
  "avatar_uri": "https://...",
  "twitter_handle": "HEXicanPapa"
}
```

### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "scraper_id": "3e7e6f3c-882b-4235-a9df-d1c183f09db9"
}
```

## Local Development

```bash
wrangler dev
```

This starts a local server at `http://localhost:8787`. You'll need to set the API key locally:

```bash
wrangler secret put PARSEBOT_API_KEY --local
```

## CORS

The worker allows requests from:
- `https://wojak.ink`
- `https://www.wojak.ink`
- `http://localhost:5173`
- `http://localhost:3000`

Update the `ALLOWED_ORIGINS` array in `worker.js` if you need additional origins.
