export type SkillKey = "leads" | "booking" | "orders" | "handoff";

export type LanguageMode = "auto" | "english" | "urdu" | "roman-urdu";

export type BotStatus = "active" | "paused";

export type Channel = "web" | "whatsapp";

/** What the business edits on the Setup tab. */
export interface BotContent {
  name: string;
  businessName: string;
  template: string;
  color: string;
  welcome: string;
  instructions: string;
  knowledge: string;
  skills: Record<SkillKey, boolean>;
  language: LanguageMode;
}

/**
 * Billing and ownership. For a company bot, plan / trialEndsAt / messageLimit are the
 * company's values (all its bots share them); demo bots without a company use their own.
 */
export interface BotPlanSettings {
  clientId?: string;
  plan: string;
  status: BotStatus;
  trialEndsAt?: string;
  /** Overrides the plan's monthly reply limit. */
  messageLimit?: number;
  /** Set for company bots. */
  companyStatus?: "active" | "inactive";
}

export interface Bot extends BotContent, BotPlanSettings {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  at: string;
}

export interface Conversation {
  id: string;
  botId: string;
  channel: Channel;
  /** Customer's phone number for WhatsApp chats. */
  contact?: string;
  messages: ChatMessage[];
  needsHuman: boolean;
  pageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  botId: string;
  conversationId: string;
  name?: string;
  phone?: string;
  email?: string;
  need?: string;
  time?: string;
  createdAt: string;
  updatedAt: string;
}
