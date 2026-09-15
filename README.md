# ChatDesk: AI chatbots for any business

One app to create, sell and manage AI assistants for many clients (clinics, real estate, restaurants, schools,
online stores, salons...). Each assistant:

- answers customers on the **website** (chat bubble or link) and on **WhatsApp**
- learns from the business's notes, **PDF and Word documents, and websites**
- replies in English, Urdu or Roman Urdu
- collects leads (name, phone, what they want), bookings and orders, and flags chats that need a person

You sell it as monthly **plans** with message limits, and each business gets its **own login**.

## Run it on your computer

```bash
cd E:\Chatbots\app
npm install        # first time only
npm run dev
```

Open http://localhost:3000/dashboard. Admin login: email **admin**, password from `ADMIN_PASSWORD` (default **admin123**).

## Settings (`.env.local`)

Copy `.env.example` to `.env.local`.

| Setting | What it does |
|---|---|
| `DATABASE_URL` | **Required.** Postgres connection string (free at https://neon.tech). Tables are created automatically. |
| `ADMIN_PASSWORD` / `ADMIN_EMAIL` | Admin login (email defaults to `admin`). Change the password before going live. |
| `SESSION_SECRET` | **Required in production.** Signs logins and encrypts saved WhatsApp tokens. Don't change it after connecting WhatsApp numbers. |
| `PUBLIC_APP_URL` | Your deployed address, used in the install code and WhatsApp webhook URL |
| `AI_PROVIDER` | `auto` (default), `demo`, `gemini`, `anthropic` or `groq` |
| `GEMINI_API_KEY` | Free key from https://aistudio.google.com/apikey. Also turns on smart (meaning) search. |
| `GROQ_API_KEY` / `ANTHROPIC_API_KEY` | Other AI providers |
| `WHATSAPP_VERIFY_TOKEN` | Any random text; paste the same value in Meta's webhook settings |
| `WHATSAPP_APP_SECRET` | Meta app secret; needed to accept incoming WhatsApp messages |
| `WHATSAPP_DRY_RUN` | `true` logs WhatsApp replies instead of sending them (testing) |

Restart `npm run dev` after changing `.env.local`.

## Clients and plans

- **Clients page** (admin): add a business with name + email. A password is generated and shown once; send the login
  details to the client. Reset passwords or delete logins there too.
- **Bot → Plan & usage** (admin): link the bot to a client, choose the plan, pause it (e.g. unpaid), set a free-trial end
  date, or override the monthly reply limit.
- Clients see only their own bots, can edit Setup and Knowledge, view leads and chats, and change their password. They
  cannot create or delete bots or change plans.

Plans are defined in `src/lib/plans.ts` (edit prices and limits there):

| Plan | Price/month | Replies/month | Knowledge sources | WhatsApp |
|---|---|---|---|---|
| Starter | PKR 5,000 | 1,000 | 3 | No |
| Standard | PKR 12,000 | 5,000 | 15 | No |
| Pro | PKR 30,000 | 20,000 | 50 | Yes |
| Enterprise | Custom | Unlimited | Unlimited | Yes |

Every AI reply is counted per bot per month (Pakistan time), with AI input/output tokens so you can see your real cost.
When a bot is paused, its trial has ended, or its limit is reached, customers get "not available right now" and no AI
is called.

## WhatsApp (Meta WhatsApp Cloud API)

One Meta app serves all your clients; each bot is linked to one WhatsApp phone number.

1. Deploy the app (Meta must reach it over HTTPS) and set `PUBLIC_APP_URL`.
2. At https://developers.facebook.com/apps create a Business app and add **WhatsApp**.
3. Copy **App settings → Basic → App Secret** into `WHATSAPP_APP_SECRET`.
4. **WhatsApp → Configuration → Webhook:** Callback URL `https://YOUR-APP/api/whatsapp/webhook`, Verify token =
   `WHATSAPP_VERIFY_TOKEN`. Subscribe to the **messages** field.
5. Add the business phone number, then create a permanent access token (Business settings → System users, with
   `whatsapp_business_messaging` permission).
6. In the dashboard: bot → **WhatsApp** tab → paste the **Phone number ID** and **access token** → Save. The bot must be
   on a plan that includes WhatsApp.
7. Set `WHATSAPP_DRY_RUN=false`.

Incoming messages are checked with Meta's signature, handled once even if Meta sends them twice, answered with the same
knowledge and rules as the website chat, and saved as leads with the customer's number. Access tokens are stored
encrypted.

## Knowledge (RAG)

On a bot's **Knowledge** tab upload PDF, Word (.docx), TXT or CSV files, or import a website (up to 50 pages). Text is
extracted, split into ~900-character sections, and indexed in Postgres (full-text + pgvector embeddings when
`GEMINI_API_KEY` is set). For each customer message the best 6 sections plus the Setup quick notes are given to the AI.
Use **Test search** to see what the bot will read. Scanned PDFs need OCR first.

## How it is built

- **Next.js 16 + TypeScript + Tailwind**, **Neon Postgres** (+ pgvector)
- `src/lib/engine.ts`: plan check, knowledge retrieval, prompt, AI call, saving chats, leads and usage
- `src/lib/ai/`: AI providers (demo, gemini, groq, anthropic)
- `src/lib/rag/`: extract, crawl, chunk, embed, store and search knowledge
- `src/lib/session.ts`, `auth.ts`, `clients.ts`: logins and permissions
- `src/lib/plans.ts`, `usage.ts`: plans, limits and monthly usage
- `src/lib/whatsapp.ts` + `src/app/api/whatsapp/webhook`: WhatsApp channel
- `src/lib/db.ts` + `schema.ts`: database
- `public/widget.js`: website chat bubble; `src/app/embed/[id]`: chat page

## Going live

Deploy to Vercel: import the project, add all environment variables (with a new `SESSION_SECRET` and a strong
`ADMIN_PASSWORD`), set `PUBLIC_APP_URL`, then connect WhatsApp as above.
