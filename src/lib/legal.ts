import { BRAND } from "./brand";
import { SITE } from "./marketing";

// Legal pages content. Edit texts here; the pages, footer links and sitemap read from this file.
// Have these reviewed by a lawyer before relying on them.

export const LEGAL_UPDATED = "16 September 2026";

export type LegalBlock = string | { list: string[] };

export interface LegalSection {
  id: string;
  title: string;
  body: LegalBlock[];
}

export interface LegalDoc {
  path: string;
  title: string;
  short: string;
  description: string;
  summary: string[];
  sections: LegalSection[];
}

const { company } = SITE;
const email = SITE.contact.email;
const product = BRAND.name;

const contactSection = (extra = ""): LegalSection => ({
  id: "contact",
  title: "Contact us",
  body: [
    `${extra}Email ${email}, call ${SITE.contact.phones.join(" or ")}, or write to ${company}, ${SITE.contact.location}. We aim to reply within 3 business days.`,
  ],
});

const privacy: LegalDoc = {
  path: "/privacy-policy",
  title: "Privacy Policy",
  short: "Privacy",
  description: `How ${company} collects, uses and protects personal information in ${product}.`,
  summary: [
    "We only collect what we need to run the service and talk to you.",
    "Businesses own their assistants' chats and leads; we process them on their behalf.",
    "We never sell personal information or use it for advertising.",
    "You can ask us to see, correct or delete your information at any time.",
  ],
  sections: [
    {
      id: "who-we-are",
      title: "Who we are",
      body: [
        `${product} is an AI chat assistant platform built and operated by ${company}, based in ${SITE.contact.location} ("we", "us"). This policy explains how we handle personal information on our website, in the ${product} dashboard, and in the chat assistants our customers add to their websites and channels.`,
        `When a business ("customer") uses ${product} to chat with its own customers ("end users"), that business decides what its assistant collects and why. For those conversations we act on the business's instructions, and the business's own privacy policy also applies.`,
      ],
    },
    {
      id: "information-we-collect",
      title: "Information we collect",
      body: [
        "Website visitors who request a demo:",
        { list: ["Name, business name, email, phone or WhatsApp number, industry, the plan you are interested in, and your message."] },
        "Customer accounts:",
        {
          list: [
            "Company name, contact details, login email and password (stored only as a secure hash).",
            "Plan, trial dates, usage counts and settings for each assistant.",
            "Documents, website pages and notes you add so your assistant can answer questions.",
          ],
        },
        "End users who chat with an assistant:",
        {
          list: [
            "The messages in the conversation and the page the chat started on.",
            "Contact details the person chooses to share, such as name, phone, email, what they need and a preferred time.",
            "If WhatsApp is connected: the phone number and messages exchanged with the business's WhatsApp number.",
          ],
        },
        "Technical information:",
        {
          list: [
            "IP addresses are used briefly, in memory, to limit repeated login, chat and form requests. We do not store them in our database.",
            "A login cookie and small items in browser storage, described in our Cookie Policy.",
          ],
        },
      ],
    },
    {
      id: "how-we-use",
      title: "How we use information",
      body: [
        {
          list: [
            "To provide the service: generate assistant replies, save leads and show them in the dashboard.",
            "To manage accounts, plans, usage limits and billing.",
            "To send service emails such as password reset links and demo request notifications.",
            "To respond to demo requests and support questions.",
            "To keep the platform secure, prevent abuse and fix problems.",
          ],
        },
        "We do not sell personal information, and we do not use chats, leads or uploaded documents to advertise to anyone.",
      ],
    },
    {
      id: "ai-processing",
      title: "AI processing",
      body: [
        "To write replies, the relevant parts of a conversation and the business's knowledge are sent to an AI model provider. Depending on availability we use Google (Gemini), Groq or Anthropic (Claude). Document text is also converted into search data (embeddings) using Google's models.",
        "These providers process the data to return a result under their own terms for business customers. We do not ask them to use it to train their models.",
      ],
    },
    {
      id: "sharing",
      title: "Who we share information with",
      body: [
        "We share information only with service providers that help us run the platform, and only as needed:",
        {
          list: [
            "Database hosting (Neon) and our application hosting provider.",
            "AI model providers named above.",
            "Email delivery (Google Gmail SMTP, or Resend as a backup).",
            "Meta, when a business connects WhatsApp.",
          ],
        },
        "We may also disclose information if required by law, to protect our rights or users' safety, or as part of a business transfer, in which case this policy continues to apply.",
        "Some providers process data outside Pakistan. We choose providers with appropriate security measures.",
      ],
    },
    {
      id: "retention",
      title: "How long we keep information",
      body: [
        {
          list: [
            "Account, knowledge, conversation and lead data is kept while the customer's account is active, or until the customer deletes it.",
            "Deleting an assistant deletes its conversations and leads. Removing a document removes its search data.",
            "Password reset links expire after 1 hour, and only a hash of the link is stored.",
            "Demo requests are kept for as long as needed to follow up and keep business records.",
          ],
        },
        "When an account is closed, we delete or anonymise its data within a reasonable period, unless we must keep some of it by law.",
      ],
    },
    {
      id: "security",
      title: "Security",
      body: [
        "Passwords are stored as salted hashes, logins use signed cookies, WhatsApp access tokens are encrypted, and data is sent over encrypted connections. Each company can only see its own assistants, chats and leads. No system is perfectly secure, so please keep your password private and tell us straight away if you suspect misuse.",
      ],
    },
    {
      id: "your-rights",
      title: "Your choices and rights",
      body: [
        `You can ask us to access, correct, export or delete your personal information, or to stop contacting you. Email ${email} and we will respond within a reasonable time.`,
        "If you chatted with a business's assistant, please contact that business first, as it controls that conversation. We will help the business respond to your request.",
      ],
    },
    {
      id: "children",
      title: "Children",
      body: [`${product} is intended for businesses and is not directed at children under 13. We do not knowingly collect their information. If you believe a child has shared personal information, contact us and we will delete it.`],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      body: ["We may update this policy as the service changes. We will change the date at the top and, for significant changes, tell customers by email or in the dashboard."],
    },
    contactSection("Questions or requests about privacy? "),
  ],
};

const terms: LegalDoc = {
  path: "/terms",
  title: "Terms of Service",
  short: "Terms",
  description: `The terms that apply when you use ${product}, the AI chat assistant platform by ${company}.`,
  summary: [
    "Plans are billed monthly in Pakistani rupees; you can cancel at any time.",
    "You own your content, chats and leads; we only use them to provide the service.",
    "AI answers can be wrong, so check important information your assistant gives.",
    "Use the service lawfully and follow our Acceptable Use Policy.",
  ],
  sections: [
    {
      id: "agreement",
      title: "Agreement",
      body: [
        `These terms are an agreement between you (the business using ${product}) and ${company}. By creating an account, using the dashboard, or adding an assistant to your channels, you accept these terms, our Privacy Policy and our Acceptable Use Policy. If you use ${product} for a company, you confirm you are allowed to accept these terms for it.`,
      ],
    },
    {
      id: "service",
      title: "The service",
      body: [
        `${product} lets you create AI chat assistants that answer customer questions using the information you provide, capture leads and alert your team. Features depend on your plan, as shown on our Pricing page. We may improve, change or retire features over time, and will give reasonable notice of changes that significantly reduce what your plan includes.`,
      ],
    },
    {
      id: "accounts",
      title: "Accounts",
      body: [
        {
          list: [
            "Each company receives its own login. Keep your password secure; you are responsible for activity under your account.",
            "Give us accurate account and contact details and keep them up to date.",
            "Tell us promptly if you suspect unauthorised access.",
          ],
        },
      ],
    },
    {
      id: "plans-billing",
      title: "Plans, trials and payment",
      body: [
        {
          list: [
            "Paid plans are charged monthly in advance in Pakistani rupees, at the prices shown when you subscribe or agreed in writing.",
            "Free trials last for the period we tell you. No charge is made until you choose a paid plan.",
            "Each plan includes a monthly number of assistant replies shared across your assistants. When the limit is reached, your assistants show a polite message asking customers to contact you directly until the next month or an upgrade.",
            "If payment is late, we may pause your assistants after giving notice. Your data is kept while the account is paused.",
            "Prices may change with at least 30 days' notice. Changes apply from your next billing month.",
          ],
        },
        "Cancellations and refunds are covered by our Refund & Cancellation Policy.",
      ],
    },
    {
      id: "your-content",
      title: "Your content and data",
      body: [
        "You keep ownership of the documents, website content, instructions, conversations and leads in your account (\"your content\"). You give us permission to store, process and send your content to our service providers only as needed to run the service for you.",
        "You confirm that you have the right to use your content and that your assistant's use of it is lawful. You are responsible for telling your own customers how you use their chats and contact details, for example in your privacy policy.",
        "You can export your leads and delete your content at any time from the dashboard or by asking us.",
      ],
    },
    {
      id: "ai-answers",
      title: "AI answers",
      body: [
        "Assistants generate replies automatically. Even when they use your information, AI answers can be incomplete, out of date or wrong.",
        {
          list: [
            "Keep your knowledge up to date and review conversations regularly.",
            "Do not rely on an assistant as the only source of medical, legal, financial or safety-critical advice. Direct such questions to a qualified person.",
            "You are responsible for prices, offers and commitments you ask the assistant to share.",
          ],
        },
      ],
    },
    {
      id: "third-parties",
      title: "Third-party services",
      body: [
        "The service relies on providers such as AI model companies, hosting, email and, if you connect it, WhatsApp by Meta. Their availability is outside our control, and your use of channels like WhatsApp must also follow their terms. When a provider fails, we try backup providers so your assistant can keep answering.",
      ],
    },
    {
      id: "availability",
      title: "Availability and support",
      body: [
        "We work to keep the service running around the clock, but we do not guarantee it will always be available or error-free. Planned maintenance and outages of our providers may cause interruptions. Support is provided by email and phone during business hours in Pakistan.",
      ],
    },
    {
      id: "our-property",
      title: "Our intellectual property",
      body: [
        `${company} owns the ${product} platform, software, design and brand. We give you a limited, non-transferable right to use the service during your subscription. Do not copy, resell, reverse engineer or build a competing service from it.`,
      ],
    },
    {
      id: "suspension",
      title: "Suspension and termination",
      body: [
        "You can stop using the service and cancel your plan at any time.",
        "We may suspend or close an account if payment remains unpaid after notice, if these terms or the Acceptable Use Policy are seriously or repeatedly broken, or if needed to protect users, the platform or comply with the law. Where reasonable, we will warn you first and give you a chance to fix the issue and export your data.",
      ],
    },
    {
      id: "liability",
      title: "Limitation of liability",
      body: [
        "The service is provided \"as is\". To the extent the law allows, we are not liable for indirect or consequential losses, such as lost profits, lost business or loss caused by an AI answer, and our total liability for any claim is limited to the fees you paid us in the 3 months before the claim.",
        "Nothing in these terms limits liability that cannot be limited by law.",
      ],
    },
    {
      id: "law",
      title: "Governing law",
      body: ["These terms are governed by the laws of Pakistan. We will first try to resolve any disagreement by talking with you. If that fails, the courts of Lahore will have jurisdiction."],
    },
    {
      id: "changes",
      title: "Changes to these terms",
      body: ["We may update these terms. We will change the date at the top and give customers notice of significant changes. Continuing to use the service after changes take effect means you accept them."],
    },
    contactSection(),
  ],
};

const refunds: LegalDoc = {
  path: "/refund-policy",
  title: "Refund & Cancellation Policy",
  short: "Refunds",
  description: `How cancellations, plan changes and refunds work for ${product} subscriptions.`,
  summary: [
    "Try it free first: no payment is taken during the trial.",
    "Cancel any time; your plan stays active until the end of the paid month.",
    "Charged by mistake or twice? We refund it in full.",
  ],
  sections: [
    {
      id: "trial",
      title: "Free trial",
      body: ["We set up a trial so you can see your assistant answer real questions before paying. Nothing is charged during the trial, so no refund is needed if you decide not to continue."],
    },
    {
      id: "cancel",
      title: "Cancelling your plan",
      body: [
        `Tell us by email at ${email} or by phone that you want to cancel. Your plan remains active until the end of the month you have already paid for, and you will not be charged again.`,
        "Before your account closes you can export your leads. After closing, your data is deleted as described in our Privacy Policy.",
      ],
    },
    {
      id: "plan-changes",
      title: "Upgrading or downgrading",
      body: [
        {
          list: [
            "Upgrades take effect straight away. We charge the difference for the rest of the current month, or include it in your next bill.",
            "Downgrades take effect from the next billing month. Your usage must fit the smaller plan's limits by then.",
          ],
        },
      ],
    },
    {
      id: "refunds",
      title: "Refunds",
      body: [
        "Monthly subscriptions are paid in advance. We do not give partial refunds for unused days or unused replies in a month that has started. We do give a full refund when:",
        {
          list: [
            "you were charged after cancelling in time, or charged twice for the same month;",
            "you were charged the wrong amount; or",
            "the service was unavailable for most of a month because of a problem on our side.",
          ],
        },
        "Setup, customisation or integration work agreed separately is refundable only for work that has not yet started.",
      ],
    },
    {
      id: "how-to-request",
      title: "How to request a refund",
      body: [
        `Email ${email} within 14 days of the charge with your company name, the payment date and amount, and the reason. We reply within 3 business days, and approved refunds are sent back by the original payment method or bank transfer within 14 business days.`,
      ],
    },
    contactSection(),
  ],
};

const cookies: LegalDoc = {
  path: "/cookie-policy",
  title: "Cookie Policy",
  short: "Cookies",
  description: `The cookies and browser storage ${product} uses, and why.`,
  summary: [
    "We only use what is needed for the service to work.",
    "No advertising or cross-site tracking cookies.",
    "Chat history can be cleared from the chat window or your browser.",
  ],
  sections: [
    {
      id: "what",
      title: "What cookies and browser storage are",
      body: ["Cookies and browser storage are small pieces of information saved by your browser. They let a website remember things, such as that you are logged in."],
    },
    {
      id: "what-we-use",
      title: "What we use",
      body: [
        {
          list: [
            "Login cookie (cb_session): keeps company users and administrators signed in to the dashboard. It is signed so it cannot be changed, is not readable by page scripts, and is removed when you log out or it expires.",
            "Chat history (browser storage): the chat window remembers the current conversation for each assistant, so a visitor can continue after reloading the page. It stays on the visitor's device until they clear the chat or their browser data.",
            "Notification state (browser storage): remembers which dashboard notifications you have already read.",
          ],
        },
        "These are strictly necessary for features you use, so they do not require consent under most cookie rules.",
      ],
    },
    {
      id: "not-used",
      title: "What we don't use",
      body: [`${product} does not use advertising cookies, and does not track visitors across other websites. If we add analytics in future, we will update this policy first.`],
    },
    {
      id: "businesses",
      title: "For businesses adding the chat bubble",
      body: [`When you add a ${product} assistant to your website, mention it in your own privacy or cookie notice, including that chats are processed by an AI service and that visitors may choose to share contact details.`],
    },
    {
      id: "control",
      title: "Your control",
      body: ["You can delete cookies and site data in your browser settings at any time. Blocking the login cookie will stop you from logging in to the dashboard, and clearing site data will reset saved chat history."],
    },
    contactSection(),
  ],
};

const acceptableUse: LegalDoc = {
  path: "/acceptable-use",
  title: "Acceptable Use Policy",
  short: "Acceptable use",
  description: `What businesses may and may not do with ${product} assistants.`,
  summary: [
    "Use assistants to help real customers honestly.",
    "No illegal, harmful, deceptive or spam activity.",
    "Only ask for personal information you actually need.",
  ],
  sections: [
    {
      id: "purpose",
      title: "Why this policy exists",
      body: [`This policy keeps ${product} safe and trustworthy for businesses and their customers. It forms part of our Terms of Service and applies to everything you and your assistants do on the platform.`],
    },
    {
      id: "not-allowed",
      title: "You must not use the service to",
      body: [
        {
          list: [
            "break any law, including laws on consumer protection, privacy, electronic crimes and intellectual property;",
            "share content that is hateful, harassing, threatening, sexually explicit, violent, or that exploits or endangers children;",
            "deceive people, for example by impersonating another business or person, making false claims, or running scams or phishing;",
            "sell or promote illegal goods and services, weapons, drugs, or gambling where it is not permitted;",
            "send spam or unsolicited bulk messages, including on WhatsApp against Meta's rules;",
            "collect sensitive information the conversation does not need, such as full card numbers, passwords, CNIC numbers or health details, or collect any information without a lawful reason;",
            "upload content you do not have the right to use.",
          ],
        },
      ],
    },
    {
      id: "platform",
      title: "Protecting the platform",
      body: [
        {
          list: [
            "Do not try to access other companies' accounts or data, or get around plan limits and security controls.",
            "Do not overload the service, run automated attacks, or probe for vulnerabilities without our written permission.",
            "Do not copy, resell or reverse engineer the platform.",
          ],
        },
        `If you find a security issue, please report it to ${email}.`,
      ],
    },
    {
      id: "responsible-ai",
      title: "Responsible use of AI",
      body: [
        {
          list: [
            "Do not present your assistant as a human when a customer sincerely asks.",
            "Offer a way to reach a person; the built-in handoff feature helps with this.",
            "Do not use an assistant as the only source of medical, legal or financial advice.",
          ],
        },
      ],
    },
    {
      id: "enforcement",
      title: "Enforcement",
      body: ["If we believe this policy has been broken, we may remove content, pause an assistant, or suspend or close the account, depending on how serious the issue is. Where reasonable we will contact you first. We may report illegal activity to the authorities."],
    },
    contactSection("To report misuse of an assistant, "),
  ],
};

export const LEGAL = { privacy, terms, refunds, cookies, acceptableUse };
export const LEGAL_DOCS: LegalDoc[] = [privacy, terms, refunds, cookies, acceptableUse];
