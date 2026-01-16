import { onRequestOptions as __api_messages__id__read_ts_onRequestOptions } from "/Users/abit_hex/Wojak_Projects/wojak-ink/functions/api/messages/[id]/read.ts"
import { onRequest as __api_messages__id__read_ts_onRequest } from "/Users/abit_hex/Wojak_Projects/wojak-ink/functions/api/messages/[id]/read.ts"
import { onRequestOptions as __api_messages_unread_count_ts_onRequestOptions } from "/Users/abit_hex/Wojak_Projects/wojak-ink/functions/api/messages/unread-count.ts"
import { onRequest as __api_leaderboard_submit_ts_onRequest } from "/Users/abit_hex/Wojak_Projects/wojak-ink/functions/api/leaderboard/submit.ts"
import { onRequest as __api_messages_unread_count_ts_onRequest } from "/Users/abit_hex/Wojak_Projects/wojak-ink/functions/api/messages/unread-count.ts"
import { onRequest as __api_leaderboard__gameId__ts_onRequest } from "/Users/abit_hex/Wojak_Projects/wojak-ink/functions/api/leaderboard/[gameId].ts"
import { onRequestOptions as __api_coingecko___path___ts_onRequestOptions } from "/Users/abit_hex/Wojak_Projects/wojak-ink/functions/api/coingecko/[[path]].ts"
import { onRequestOptions as __api_dexie___path___ts_onRequestOptions } from "/Users/abit_hex/Wojak_Projects/wojak-ink/functions/api/dexie/[[path]].ts"
import { onRequestOptions as __api_mintgarden___path___ts_onRequestOptions } from "/Users/abit_hex/Wojak_Projects/wojak-ink/functions/api/mintgarden/[[path]].ts"
import { onRequestOptions as __api_parsebot___path___ts_onRequestOptions } from "/Users/abit_hex/Wojak_Projects/wojak-ink/functions/api/parsebot/[[path]].ts"
import { onRequestOptions as __api_spacescan___path___ts_onRequestOptions } from "/Users/abit_hex/Wojak_Projects/wojak-ink/functions/api/spacescan/[[path]].ts"
import { onRequest as __api_coingecko___path___ts_onRequest } from "/Users/abit_hex/Wojak_Projects/wojak-ink/functions/api/coingecko/[[path]].ts"
import { onRequest as __api_dexie___path___ts_onRequest } from "/Users/abit_hex/Wojak_Projects/wojak-ink/functions/api/dexie/[[path]].ts"
import { onRequest as __api_mintgarden___path___ts_onRequest } from "/Users/abit_hex/Wojak_Projects/wojak-ink/functions/api/mintgarden/[[path]].ts"
import { onRequest as __api_parsebot___path___ts_onRequest } from "/Users/abit_hex/Wojak_Projects/wojak-ink/functions/api/parsebot/[[path]].ts"
import { onRequest as __api_spacescan___path___ts_onRequest } from "/Users/abit_hex/Wojak_Projects/wojak-ink/functions/api/spacescan/[[path]].ts"
import { onRequestOptions as __api_messages_index_ts_onRequestOptions } from "/Users/abit_hex/Wojak_Projects/wojak-ink/functions/api/messages/index.ts"
import { onRequest as __api_auth_debug_ts_onRequest } from "/Users/abit_hex/Wojak_Projects/wojak-ink/functions/api/auth-debug.ts"
import { onRequest as __api_me_ts_onRequest } from "/Users/abit_hex/Wojak_Projects/wojak-ink/functions/api/me.ts"
import { onRequest as __api_messages_index_ts_onRequest } from "/Users/abit_hex/Wojak_Projects/wojak-ink/functions/api/messages/index.ts"
import { onRequest as __api_profile_ts_onRequest } from "/Users/abit_hex/Wojak_Projects/wojak-ink/functions/api/profile.ts"
import { onRequest as __api_trade_values_ts_onRequest } from "/Users/abit_hex/Wojak_Projects/wojak-ink/functions/api/trade-values.ts"

export const routes = [
    {
      routePath: "/api/messages/:id/read",
      mountPath: "/api/messages/:id",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_messages__id__read_ts_onRequestOptions],
    },
  {
      routePath: "/api/messages/:id/read",
      mountPath: "/api/messages/:id",
      method: "",
      middlewares: [],
      modules: [__api_messages__id__read_ts_onRequest],
    },
  {
      routePath: "/api/messages/unread-count",
      mountPath: "/api/messages",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_messages_unread_count_ts_onRequestOptions],
    },
  {
      routePath: "/api/leaderboard/submit",
      mountPath: "/api/leaderboard",
      method: "",
      middlewares: [],
      modules: [__api_leaderboard_submit_ts_onRequest],
    },
  {
      routePath: "/api/messages/unread-count",
      mountPath: "/api/messages",
      method: "",
      middlewares: [],
      modules: [__api_messages_unread_count_ts_onRequest],
    },
  {
      routePath: "/api/leaderboard/:gameId",
      mountPath: "/api/leaderboard",
      method: "",
      middlewares: [],
      modules: [__api_leaderboard__gameId__ts_onRequest],
    },
  {
      routePath: "/api/coingecko/:path*",
      mountPath: "/api/coingecko",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_coingecko___path___ts_onRequestOptions],
    },
  {
      routePath: "/api/dexie/:path*",
      mountPath: "/api/dexie",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_dexie___path___ts_onRequestOptions],
    },
  {
      routePath: "/api/mintgarden/:path*",
      mountPath: "/api/mintgarden",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_mintgarden___path___ts_onRequestOptions],
    },
  {
      routePath: "/api/parsebot/:path*",
      mountPath: "/api/parsebot",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_parsebot___path___ts_onRequestOptions],
    },
  {
      routePath: "/api/spacescan/:path*",
      mountPath: "/api/spacescan",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_spacescan___path___ts_onRequestOptions],
    },
  {
      routePath: "/api/coingecko/:path*",
      mountPath: "/api/coingecko",
      method: "",
      middlewares: [],
      modules: [__api_coingecko___path___ts_onRequest],
    },
  {
      routePath: "/api/dexie/:path*",
      mountPath: "/api/dexie",
      method: "",
      middlewares: [],
      modules: [__api_dexie___path___ts_onRequest],
    },
  {
      routePath: "/api/mintgarden/:path*",
      mountPath: "/api/mintgarden",
      method: "",
      middlewares: [],
      modules: [__api_mintgarden___path___ts_onRequest],
    },
  {
      routePath: "/api/parsebot/:path*",
      mountPath: "/api/parsebot",
      method: "",
      middlewares: [],
      modules: [__api_parsebot___path___ts_onRequest],
    },
  {
      routePath: "/api/spacescan/:path*",
      mountPath: "/api/spacescan",
      method: "",
      middlewares: [],
      modules: [__api_spacescan___path___ts_onRequest],
    },
  {
      routePath: "/api/messages",
      mountPath: "/api/messages",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_messages_index_ts_onRequestOptions],
    },
  {
      routePath: "/api/auth-debug",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_auth_debug_ts_onRequest],
    },
  {
      routePath: "/api/me",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_me_ts_onRequest],
    },
  {
      routePath: "/api/messages",
      mountPath: "/api/messages",
      method: "",
      middlewares: [],
      modules: [__api_messages_index_ts_onRequest],
    },
  {
      routePath: "/api/profile",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_profile_ts_onRequest],
    },
  {
      routePath: "/api/trade-values",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_trade_values_ts_onRequest],
    },
  ]