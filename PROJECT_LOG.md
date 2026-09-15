# ChatDesk: Project Log

A record of what has been decided and built so far for the chatbot business.
Last updated: 15 September 2026.

---

## 1. The business idea

**Goal:** sell AI chatbots to businesses, starting in Pakistan and expanding later.

**Starting point:** no leads and no product idea yet.

**Decisions made:**

| Topic | Decision |
|---|---|
| Product | One **all-rounder** bot engine, sold as ready-made packages for different business types |
| First channel | Website chat (widget + shareable link), then WhatsApp |
| Market | Pakistan first (English, Urdu, Roman Urdu), then international |
| Budget | Start at zero cost: free AI key (Gemini) and free database (Neon) |
| Tech | Build it ourselves (no no-code platform) |
| Hosting | Deferred. Build everything first, deploy later |

**Target niches (templates built):** general business, clinic/dental, real estate, restaurant/café, school/academy,
online store, salon/gym.

**Sales approach:**
- Find businesses on Google Maps, test how fast they reply, and pitch a personalised demo.
- Create a demo bot with the prospect's real business name and send them the direct chat link.
- Offer a 14-day free trial to the first 2–3 clients in exchange for a testimonial.

---

## 2. Pricing research (from a shared Claude conversation)

**One-time builds, Pakistani market:**

| Type | Price (PKR) |
|---|---|
| Simple FAQ bot | 15,000 – 40,000 |
| AI bot with knowledge base | 40,000 – 150,000 |
| Bot with CRM / booking / payment integrations | 100,000 – 300,000+ |

**Monthly subscription tiers (research):**

| Tier | PKR/month | Includes |
|---|---|---|
| Starter | 3,000 – 6,000 | Basic bot, 500–1,000 messages |
| Standard | 8,000 – 15,000 | AI answers + knowledge base, 2,000–5,000 messages |
| Pro | 20,000 – 40,000 | Multi-channel (WhatsApp + web + Instagram), integrations, analytics |
| Enterprise | 50,000+ | Custom |

**Other advice from that research:**
- Charge a separate setup fee (PKR 5,000–15,000).
- Offer a 7–14 day free trial.
- Give 2 months free on annual plans.
- Put message caps on lower plans, because AI costs eat into profit.
- Charge international clients in USD, since they pay 5–10x more.

**Plans we implemented** (editable in `app/src/lib/plans.ts`):

Plans belong to the **company**. All of a company's bots share the plan, the free trial and the monthly reply limit.

| Plan | PKR/month | Replies/month (shared) | Bots | Documents/websites per bot | WhatsApp |
|---|---|---|---|---|---|
| Starter | 5,000 | 1,000 | 1 | 3 | No |
| Standard | 12,000 | 5,000 | 2 | 15 | No |
| Pro | 30,000 | 20,000 | 5 | 50 | Yes |
| Enterprise | Custom | Unlimited | Unlimited | Unlimited | Yes |

---

## 3. What was built, step by step

### Step 1: Core chatbot platform (MVP)
- **Next.js 16 app** in `E:\Chatbots\app`: dashboard, API and website widget in one project
- **Admin dashboard:** create bots from templates, edit settings, test chat, view leads and chats
- **Website widget:** one `<script>` line adds a chat bubble to any website; there's also a direct chat link for businesses without a website
- **Lead capture:** name, phone, email, what the customer wants, preferred time. Leads can be downloaded as Excel/CSV and have a WhatsApp button.
- **Skills per bot:** lead capture, bookings, orders, human handoff
- **Languages:** replies in the customer's language (English, Urdu, Roman Urdu)
- **AI providers:** Demo mode (works with no key), Google Gemini, Groq, Anthropic Claude, switched with one setting

### Step 2: Knowledge from documents and websites (RAG)
- Upload **PDF, Word (.docx), TXT, CSV** files (up to 15 MB each).
- **Import a website** (up to 50 pages). The crawler reads the sitemap and links on the same domain, and blocks local or private network addresses.
- Text is split into ~900-character sections and indexed two ways:
  - **Keyword search** with Postgres full-text search
  - **Meaning search** with Gemini embeddings and pgvector, so a Roman Urdu question can find an answer in an English document
- For each customer message, the best 6 sections plus the "quick notes" from Setup are given to the AI.
- **Test search** on the Knowledge tab shows what the bot will read before answering.

### Step 3: Moved to a real database
- Switched from a local JSON file to **Neon Postgres** with the pgvector extension.
- Tables are created and updated automatically on first use.
- Database calls retry automatically when the connection times out.

### Step 4: Design and formatting fixes
- Replaced all emojis in the app with **icons** (lucide), as requested.
- Chat messages now show **bold**, bullet lists, and tappable phone numbers, emails and links, not raw `**` symbols.
- The AI is told to use light formatting and no emojis.

### Step 5: Bug fixes found while using it
- **Fake template number showing in answers** ("0300-0000000"):
  - Cause: the General template's sample notes were still saved on the bot.
  - Fix: templates no longer contain fake contact details, and the General template starts empty.
- **Setup edits lost when switching tabs:** edits are now kept, with an "Unsaved changes" warning and a warning before leaving the page.
- **Roman Urdu names read wrongly** ("Sara hai" instead of "Sara") in Demo mode: fixed.
- **Retired Gemini model:** `gemini-2.5-flash` is no longer available to new users, so the app now uses `gemini-3.6-flash`.

### Step 6: Selling features (plans, clients, WhatsApp)

**Plans and usage**
- Every AI reply is counted per bot per month (Pakistan time), including AI input/output tokens, to show real cost.
- The admin can set the plan, pause a bot, set a free-trial end date, or set a custom reply limit.
- When the limit is reached, the bot is paused, or the trial has ended, customers see "not available right now" and the AI isn't called.

**Client logins**
- The admin creates client accounts on the **Clients** page. A password is generated and shown once.
- Clients see only their own bots, leads and chats. They can edit Setup and Knowledge and change their password.
- Clients cannot create or delete bots, change plans, or connect WhatsApp.
- Changing or resetting a password logs out old sessions.

**WhatsApp channel**
- Uses Meta's official **WhatsApp Cloud API**, with one webhook for all clients (`/api/whatsapp/webhook`).
- Each bot is linked to its own WhatsApp phone number, and access tokens are stored encrypted.
- Security:
  - Meta's signature is checked on every message.
  - Messages that arrive twice are only answered once.
- Behaviour:
  - Same knowledge, rules and lead capture as the website chat.
  - Every WhatsApp chat is saved as a lead with the customer's number.
- Only works on **Pro** and **Enterprise** plans.
- `WHATSAPP_DRY_RUN=true` writes replies to the log instead of sending them (current setting).

### Step 7: Admin panel (company management)

**Decisions:**
- There is **one admin**: the platform owner, logging in with `admin` and `ADMIN_PASSWORD`. Client companies are never admins.
- Each company has **one login**.

**Admin menu:** Overview · Companies · All bots · New bot

**Overview page** (`/dashboard`)
- **Headline number:** estimated monthly revenue in PKR. This counts active company bots at their plan price and excludes free trials, paused bots and inactive companies.
- **Totals:**
  - companies: active and inactive
  - bots: active, on trial, not answering
  - replies this month, with AI tokens
  - leads, and chats that need a human
- **Needs attention:** bots that hit or are near their reply limit, trials ending within 7 days, ended trials, WhatsApp errors.
- **Top companies by replies**, and **company bots by plan**, shown as simple bar lists.

**Companies page** (`/dashboard/companies`)
- A table of all companies showing status, number of bots, plan, replies this month, leads and date added, with search and an active/inactive filter.
- **New company:**
  - name, login email, and a password you type (or leave empty to generate one)
  - optionally create their first bot from a template with a chosen plan
  - login details are shown once, ready to copy

**Company detail page** (`/dashboard/companies/[id]`)
- **Make active / inactive:** an inactive company can't log in, its current sessions end, and all its bots reply "not available right now".
- **Company details:** change the name and login email.
- **Password:** set an exact password or generate one. Old logins are signed out.
- **Plan:** apply one plan to all of the company's bots, or change a single bot on its Plan & usage tab.
- **Bots:** each bot with its status and usage meter. **Open** a bot to use all its services (setup, knowledge, test chat, leads, chats, WhatsApp) exactly like the company, and add a new bot for the company.
- **Delete company:** removes the login. Their bots, chats and leads are kept and become admin-owned.

**Other changes**
- "Clients" was renamed to "Companies"; the old address redirects.
- Every bot page shows at the top when the bot is not answering (paused, trial ended, company inactive).
- Usage meters use a lighter track of the same colour, per the chart design guidelines.

### Step 8: Company plans, companies create their own bots, locked features

**Problem reported:** choosing Pro when creating a company showed a different plan afterwards.

**Cause:** plans were stored per bot, so a company created without a bot had nowhere to keep its plan.

**Fixes and changes:**
- **The plan is now a company setting**, together with the free-trial end date and the custom reply limit. Every bot of the company follows it automatically.
- **Codeaex** was set to the Pro plan that was chosen.
- **The reply limit is shared** across all of a company's bots. Creating more bots does not add more replies.
- **Companies create their own bots** (New assistant), up to their plan's bot limit, and can delete their own bots. The admin can still create bots for any company.
- **Features follow the plan, with a lock icon on anything not included:**
  - WhatsApp tab: lock on the tab, and a locked screen for companies without WhatsApp in their plan
  - New assistant: locked page when the bot limit is reached
  - Knowledge: upload and import are locked when the documents/websites limit is reached
  - Plan cards: every feature is listed with a check or a lock
- **Company dashboard** shows the plan, the shared replies meter, "x of y assistants", and a New assistant button (locked at the limit).
- **Admin company page:** one plan form (plan, free trial end, custom reply limit) with a live feature preview. The bot list shows each bot's replies.
- **Admin overview:**
  - Revenue is counted per company at its plan price (trials and inactive companies excluded).
  - "Companies by plan" is shown.
  - Limit and trial alerts are per company.
- **Demo bots** (not linked to a company) keep their own plan settings.

### Step 9: The bot keeps answering when the AI fails

**Problem reported:** a customer asked "how can i contact?" and got "Sorry, I'm having trouble answering right now."

**Cause:** Gemini's free quota for `gemini-3.6-flash` is only **20 requests**, and it was used up (error 429).

**Fixes:**
- **Fallback order:** the main AI (Gemini), then any other AI that has a key (for example a free `GROQ_API_KEY`), then **answers taken straight from the bot's knowledge (RAG)**. Customers always get a reply.
- **Knowledge-only answers:**
  - Contact questions (contact, phone, email, address, WhatsApp, "rabta") reply with the real phone numbers, emails and address found in the bot's notes and imported website/documents.
  - Other questions reply with the 2–3 best matching sentences as short bullets. Words like prices, timings and services are understood (e.g. "fees kitni" also matches "Price: Rs.").
  - Lead capture, human handoff and greetings still work.
- **Admin warning:** every AI failure is saved in the database (`ai_failures`, kept 30 days). The Overview shows "AI failed N times in the last 24 hours" with the error and how to fix it.
- **Model settings:** changing `GEMINI_MODEL` / `GROQ_MODEL` / `CLAUDE_MODEL` now takes effect without restarting.

**Lighter model:** the default Gemini model is now `gemini-3.5-flash-lite`.
- In testing it was the fastest (about 1.4 s against 7.5 s for `gemini-3.1-flash-lite`) and used the fewest tokens.
- Through the app it answered contact, services (Roman Urdu) and address questions correctly from the bots' knowledge, with no failures.
- Set `GEMINI_MODEL=gemini-3.6-flash` for smarter but slower answers.

**Groq backup AI** (`GROQ_API_KEY` added locally and in production):
- The old default model `llama-3.3-70b-versatile` no longer exists on Groq, so the default is now `qwen/qwen3.8-27b`. It keeps the customer's language (Roman Urdu stays Roman Urdu) and uses few tokens. Other models available: `openai/gpt-oss-20b`, `openai/gpt-oss-120b`.
- Free plan limits, per model: **1,000 requests/day**, **8,000 tokens/minute** and, for Qwen, **1,000 output tokens/minute**.
- Groq counts the `max_tokens` setting against the output limit up front. It was 2,048, so every request was rejected as "too large". It is now 512, which is plenty for chat replies of about 60–150 tokens.
- Each chat reply uses about 1,600–1,800 input tokens (instructions + knowledge), so Groq alone handles roughly 4 chats per minute.
- Tested with Gemini forced to fail: Groq answered both bots correctly (Roman Urdu contact details for Codeaex, real product names for Poultry).

**To avoid quota problems for real clients:**
- Turn on billing in Google AI Studio (paid tier, much higher limits), or
- Add a free `GROQ_API_KEY` as a backup AI.

### Step 10: Notifications, company privacy, cleaner login

**Notification bell** (top bar, admin and companies):
- Alerts moved out of the page into a bell with a count badge: red if something is critical, amber for warnings.
- **Admin alerts:** AI failures (with a **Clear** button), AI settings problems, no-AI-key mode, companies at or near their reply limit, trials ending or ended, WhatsApp errors.
- **Company alerts:** their own reply limit (80% and 100%), trial ending or ended, chats that need a human.
- **Mark all as read** hides the badge until something new happens. Alerts disappear by themselves once the problem is fixed.
- The big AI failure banner and the "Needs attention" card were removed from the Overview.

**Company privacy:** the admin sees only a **summary** of a company's bot.
- **Shown:** name, business type, company, plan, status, reply language, skills turned on, replies this month, WhatsApp status, created date, and the **number of documents**.
- **Document count:** each file or pasted text is 1 document, and **each imported website page is 1 document**.
- **Hidden:** the company's knowledge (notes, files, website content), leads and chats. The Setup, Knowledge, Test chat, Leads and Chats tabs are not shown.
- **Enforced on the server:** those API routes return 403 for the admin on company bots.
- **Still available to the admin:** WhatsApp connection, Plan & usage (company link, pause), and deleting the bot.
- **Admin's own demo bots** (not linked to a company) keep the full workspace.
- **Company-level pages:** the admin Companies table, company page and All bots cards show documents instead of leads and chats. The Overview "Leads" tile became "Documents". The "chats need a human" alert goes to the company only.

**Login page:** the "Admin login: admin / admin123" hint was removed, so the login page no longer reveals the admin credentials.

### Step 11: Forgot password, hidden AI tokens, activity charts

**Forgot password (companies):**
- The login page has a **Forgot password?** link to `/forgot-password`, where the company enters its email.
- The company gets an email with a **one-time link valid for 1 hour** (`/reset-password?token=...`) to choose a new password. All old logins are signed out.
- **Security:**
  - The reply is the same whether or not the email exists.
  - Only one request per company per minute, and 5 per IP per 10 minutes.
  - Only a hash of the link token is stored.
  - A link works once, and older open links stop working after a reset.
- **Email service:** emails are sent through **Gmail SMTP with an app password**, using `nodemailer`.
  - Settings: `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USE_TLS=true`, `SMTP_USER=corp.codeaex@gmail.com`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`.
  - A From address other than the Gmail account only works if it is added in Gmail under "Send mail as". Resend (`RESEND_API_KEY`) is the alternative when SMTP isn't set.
  - The admin **Account** page shows whether the email login works. It checks the login without sending anything.
  - Gmail needs 2-Step Verification on the account, then an app password from https://myaccount.google.com/apppasswords. Free Gmail allows roughly a few hundred emails per day, plenty for password resets.
  - Without it, no email is sent and the **admin gets a notification** "Company X asked for a password reset", so they can set a password on the company page.
  - The notification disappears once the password is reset.
- The admin login is not affected (the admin password is set in the environment).

**AI tokens hidden from companies:** input/output token numbers on the Plan & usage tab are shown to the admin only. For companies they are not even sent to the browser.

**Activity charts (company dashboard):**
- "Chats per day" and "Leads per day", with a **Last 7 / 30 / 90 days** switch.
- Totals, a tooltip on hover or keyboard arrows, and a "Show as table" view.
- The company's own test chats from the dashboard are not counted. Days follow Pakistan time.
- Bar colour `#2a78d6` passed the chart palette validator on white.

### Step 12: Public website and landing pages

A full marketing website, built into the same app (`src/app/(marketing)`):
- **Home (`/`):**
  - hero with an animated example chat (Roman Urdu) and floating "new lead" and "replied in Roman Urdu" cards
  - moving industry strip
  - problem section, features, how it works in 3 steps
  - "trained on your business" (PDF, Word, website), languages side by side
  - dark dashboard illustration, industries, pricing, FAQ, final call-to-action
- **Features (`/features`):** knowledge, languages, leads and handoff (animated chat), channels, dashboard, security.
- **Pricing (`/pricing`):** plan cards read from `src/lib/plans.ts` (prices always match the app), a comparison table, pricing FAQ.
- **Industries (`/industries`)** plus **6 landing pages:** `/industries/clinics`, `real-estate`, `restaurants`, `schools`, `online-stores`, `salons`. Each has its own headline, before/after, an example chat, steps, pricing and FAQ.
- **Contact (`/contact`):** a "Book a free demo" form (plan and industry can be preselected from links).
  - Requests are saved (`site_inquiries` table) and emailed to `NOTIFY_EMAIL` or `SMTP_USER`, with reply-to set to the person.
  - They show in the admin notification bell and on the new admin **Inquiries** page, where each can be marked handled.
  - Spam protection: a hidden field for bots, and at most 5 requests per IP per 10 minutes.
- **Sitewide:**
  - sticky frosted header with a mobile menu, and a footer with contact details
  - page titles and descriptions, share previews, `sitemap.xml`, and `robots.txt` (dashboard, API and embed pages hidden from search engines)
  - animations switch off for people who prefer reduced motion
- **Live chat bubble:** set `SITE_BOT_ID` to a bot's ID to show that assistant on the website (set locally to the Codeaex Chatbot).
- **Honest content:** no fake testimonials or invented customer numbers; example chats and the dashboard are labelled as examples or illustrations. WhatsApp shows as "coming soon" until `SITE.whatsappLive` is set to `true` in `src/lib/marketing.ts`.
- **Editing:** texts, contact details, FAQs and industries live in `src/lib/marketing.ts`.

### Step 13: 3D-style motion redesign of the website

The website was redesigned to feel 3D and animated, in a light and clean theme. It uses no photos and no three.js scenes; the existing chat, dashboard and knowledge visuals are kept.
- **Motion (Motion Primitives style):** built on the `motion` package in `src/components/marketing/motion.tsx`.
  - headlines reveal word by word
  - cards tilt in 3D towards the mouse and have a spotlight glow
  - hero layers move at different depths as the mouse moves (parallax)
  - the dashboard tilts upright as you scroll to it
  - buttons are magnetic, and sections fade and stagger in
  - a line draws itself under "how it works", numbers count up, and a progress bar sits at the top of the page
- **Backgrounds (Haikei style):** layered SVG waves between sections and blurred blob shapes, in `src/components/marketing/Backgrounds.tsx`.
- **Colours (Realtime Colors style):** one elegant palette as `mk-*` tokens in `globals.css`: ink text `#1a1f2b`, cool off-white background `#f7f8fa`, deep navy primary `#1e2a3a`, cool grey-blue secondary `#e3e8ef`, steel blue accent `#5b7a99`, sage `#a9b8ad`.
  - An earlier gold and sand version was also removed at the user's request, so there is no gold anywhere in the app.
  - The first purple and pink version was replaced at the user's request.
  - Industry colours were muted to match: teal, forest, copper, slate blue, charcoal and taupe.
- **Pages:** home, features, pricing, industries, all 6 industry pages and contact use the new style. Inner pages share a `PageHero`.
- **Shared parts:** header, footer, section headings, pricing cards and the call-to-action banner were restyled.
- **Accessibility:** all motion follows the visitor's "reduce motion" setting, and the word-by-word headlines keep the full text for screen readers.
- **Login and password pages:** `/login`, `/forgot-password` and `/reset-password` share a split-screen `AuthShell` (`src/components/auth`).
  - left: a deep navy brand panel (fits the screen height, no page scroll on desktop) with the example chat and floating cards that move with the mouse (hidden on phones)
  - right: a frosted form card with icon fields, a show/hide password button, clear error and success messages, and a strength bar for new passwords
  - these pages are hidden from search engines
  - the form uses a CSS fade-in, so it always shows even before scripts load
  - the page fits the screen with no scroll on desktop, with no background circles; the chat preview is shorter on short screens

### Step 14: Legal and company pages

- **Policies:**
  - Pages: `/privacy-policy`, `/terms`, `/refund-policy`, `/cookie-policy`, `/acceptable-use`.
  - All five share one layout (`LegalPage`): a "short version" summary, a sticky contents list, numbered sections and links to the other policies.
  - The texts live in `src/lib/legal.ts` (with `LEGAL_UPDATED`). They describe what the app really does: the `cb_session` login cookie, chat history in the visitor's browser, IPs only in memory for rate limits, hashed passwords, encrypted WhatsApp tokens, and the providers used (Neon, Gemini/Groq/Anthropic, Gmail SMTP/Resend, Meta).
  - Terms and refunds: monthly PKR billing, cancel any time, full refunds for mistaken or duplicate charges, Pakistani law with Lahore courts.
  - **They should be reviewed by a lawyer before launch.**
- **About (`/about`):** mission, principles and a call-to-action, with no invented numbers or team details.
- **404 page:** a branded "page not found" page with links home and to features.
- **Links:**
  - footer bottom bar links to all policies, and "About us" is in the Product column
  - the demo form links to the Privacy Policy, and the login card links to Terms and Privacy
  - the sitemap includes the new pages

---

## 4. Testing done

| Area | Result |
|---|---|
| Login protection, wrong password, forged cookie | Passed |
| Bot creation, chat, lead capture, handoff | Passed |
| PDF / Word / TXT upload, website import, private-address blocking | Passed |
| Roman Urdu question matched to English document (meaning search) | Passed |
| Real Gemini answers using uploaded documents | Passed |
| Client permissions (other bots hidden, no plan/bot changes) | Passed |
| Plan limit of 2 replies (3rd blocked), pause blocking | Passed |
| Usage and token counting (1,212 input / 201 output tokens for 2 replies) | Passed |
| Password change and admin reset log out old sessions | Passed |
| WhatsApp: verify token, signature check, reply, lead saved, no duplicate reply | Passed (simulated, dry-run) |
| Admin panel: create company with chosen password and first bot, edit name/email, duplicate email rejected | Passed |
| Apply plan to all company bots; revenue shown on Overview (PKR 5,000 for one Starter bot) | Passed |
| Company inactive: login refused, session ended, bots not answering; reactivate restores all | Passed |
| Admin sets company password: old sessions and old password stop working | Passed |
| Admin opens and edits a company's bot; deleting a company keeps its bots | Passed |
| Company created with a plan and no bot keeps its plan (the reported bug) | Passed |
| Company creates its own bot; 2nd bot blocked on Starter (1 bot) with clear message; locked page and lock icons shown | Passed |
| Upgrade company to Pro: its bots follow the plan, a 2nd bot is allowed, WhatsApp unlocks | Passed |
| Shared reply limit across a company's bots; trial end blocks bots; clearing trial restores | Passed |
| Revenue per company (two Pro companies = PKR 60,000); company deletes own bot, not others' | Passed |
| Gemini forced to fail: customers still answered (HTTP 200) from knowledge; contact questions (English + Roman Urdu) return real phones, emails and exact address | Passed |
| Services/pricing questions answered with short relevant bullets when AI fails | Passed |
| AI failures saved and shown on Overview ("AI failed N times in the last 24 hours"); real Gemini 429 quota errors recorded | Passed |
| Login page no longer shows admin credentials; notification bell for admin and companies; old banners removed | Passed |
| Admin sees company bot summary only (documents count, no notes/test chat/leads); API refuses company bot details, leads, knowledge list/search and setup edits (403) | Passed |
| Admin still manages WhatsApp and plan for company bots; admin's own demo bot keeps full access | Passed |
| Company still sees its own knowledge, leads and full workspace; only admin can clear AI failure alerts | Passed |
| Forgot password: same reply for real/unknown email, 1 request per minute, only token hashes stored, admin notified without email service | Passed |
| Reset link: form shown, short password rejected, reset works, link single-use, expired link refused, old sessions and old password stop working | Passed |
| AI token numbers not shown or sent to companies | Passed |
| Company dashboard shows chats/leads per day charts with range switch and table; a real chat is counted | Passed |
| Website: all pages and 6 industry pages load, unknown industry 404, sitemap and robots.txt correct, key content and prices shown, plan preselected from links | Passed |
| Contact form: bad email/phone rejected, bot submissions ignored, valid request saved and emailed, shown on Inquiries page and in the bell, alert clears when handled, update requires login | Passed |
| Live chat bubble: `widget.js` with the Codeaex bot ID is loaded on the website (added after the page loads) | Verified in page data |
| TypeScript check and lint | Clean |

**Not yet tested:** real WhatsApp messages through Meta. This needs the app deployed online.

---

## 5. How the project is organised

```
E:\Chatbots\
  PROJECT_LOG.md           <- this file
  app\                     <- the ChatDesk application
    README.md              <- setup and usage guide
    .env.local             <- secrets (never share or commit)
    .env.example           <- list of all settings
    public\widget.js       <- website chat bubble
    src\
      app\                 <- pages and API routes
        dashboard\         <- overview, companies, all bots, bot workspace, account
        embed\[id]\        <- chat page (widget + direct link)
        api\chat\          <- public chat endpoint
        api\whatsapp\      <- WhatsApp webhook
        api\admin\         <- dashboard APIs (bots, knowledge, plan, clients, WhatsApp)
      components\          <- screens: BotWorkspace, KnowledgeManager, PlanUsagePanel, WhatsAppPanel, ChatWindow...
      lib\
        engine.ts          <- plan check -> knowledge search -> prompt -> AI -> save chat, lead, usage
        ai\                <- AI providers (demo, gemini, groq, anthropic)
        rag\               <- extract, crawl, chunk, embed, store, search
        db.ts, schema.ts   <- database
        session.ts, auth.ts, clients.ts, crypto.ts  <- logins and permissions
        plans.ts, usage.ts <- plans and monthly usage
        admin-stats.ts     <- numbers for the admin Overview page
        whatsapp.ts        <- WhatsApp channel
        templates.ts       <- business templates
```

**Tech stack:**
- Next.js 16, React 19, TypeScript, Tailwind CSS 4, lucide icons
- Neon Postgres + pgvector
- Google Gemini (chat + embeddings), optional Groq / Claude
- unpdf, mammoth, cheerio (document and website reading)

---

## 6. How to run it

```bash
cd E:\Chatbots\app
npm run dev
```

- Dashboard: http://localhost:3000/dashboard
- Admin login: email `admin`, password from `ADMIN_PASSWORD` (currently the default)

---

## 7. Current state

- **Existing bot:** "Poultry" (General template), with the website `noors-lp.vercel.app` imported as knowledge.
  - Quick notes were cleared of the template text.
  - Still to do: add real WhatsApp number and timings in Setup.
- **AI:** Gemini is active, with smart (meaning) search on.
- **Database:** Neon Postgres is connected.
- **WhatsApp:** built, in dry-run mode. No Meta app is connected yet.
- **Hosting:** not deployed yet.

---

## 8. Next steps

**Before deploying**
1. **Rotate secrets** that were shared in chat:
   - Neon database password (Neon dashboard > Roles > Reset password)
   - Gemini API key (create a new key in AI Studio and delete the old one)
2. Change `ADMIN_PASSWORD` from the default.

**Deploy (Vercel)**
3. Import the project and add all environment variables, with a **new** `SESSION_SECRET`.
4. Set `PUBLIC_APP_URL` to the live address.

**Connect WhatsApp**
5. Create a Meta Business app and add the WhatsApp product.
6. Set the webhook URL and verify token, and subscribe to "messages".
7. Set `WHATSAPP_APP_SECRET`, and set `WHATSAPP_DRY_RUN=false`.
8. Paste the Phone number ID and access token in the bot's WhatsApp tab.

**Start selling**
9. Put 2–3 clients on the Standard plan with a 14-day free trial.
10. Check the Plan & usage tab after the first week to see real AI cost per client and adjust limits.

**Possible future features**
- Instagram channel
- Booking / CRM integrations (Pro plan)
- Analytics dashboard
- OCR for scanned PDFs
- Online payment / invoices for subscriptions

---

## 9. Security notes

- Secrets live only in `app/.env.local`, which git ignores. Never paste them into chats, documents or code.
- `SESSION_SECRET` also encrypts saved WhatsApp tokens. Don't change it after WhatsApp numbers are connected, or they must be re-entered.
- Client passwords are stored hashed (scrypt), and WhatsApp tokens are stored encrypted (AES-256-GCM).
