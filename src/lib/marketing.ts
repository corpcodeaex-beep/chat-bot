import {
  BookOpen,
  ChartColumn,
  Clock,
  Headset,
  Languages,
  Moon,
  MousePointerClick,
  ShieldCheck,
  Target,
  Timer,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { TemplateIconKey } from "./templates";

// Content for the public website. Edit texts, contact details and industries here.

export const SITE = {
  company: "Codeaex",
  /** Turn on once the WhatsApp channel is live for customers; until then it shows as "coming soon". */
  whatsappLive: false,
  contact: {
    email: "corp@codeaex.com",
    phones: ["+92 316 429 2124", "+92 313 422 1746"],
    location: "Lahore, Pakistan",
  },
};

export const currentYear = () => new Date().getFullYear();

export interface DemoMessage {
  from: "customer" | "bot";
  text: string;
}

export interface Feature {
  icon: LucideIcon;
  title: string;
  text: string;
}

export const FEATURES: Feature[] = [
  {
    icon: BookOpen,
    title: "Learns your business",
    text: "Upload PDFs and Word files or import your website. Your assistant answers from your real prices, timings and policies.",
  },
  {
    icon: Languages,
    title: "Speaks like your customers",
    text: "Replies in English, Urdu or Roman Urdu, matching the way each customer writes.",
  },
  {
    icon: Target,
    title: "Captures every lead",
    text: "Collects name, phone and what the customer needs, and saves it to your dashboard with one-tap WhatsApp follow-up.",
  },
  {
    icon: Clock,
    title: "Awake 24/7",
    text: "Answers at 2am, on Eid and during rush hour. No missed messages and no customers left waiting.",
  },
  {
    icon: UserRound,
    title: "Hands over to your team",
    text: "When a customer asks for a real person, the chat is flagged so your team can step in.",
  },
  {
    icon: ChartColumn,
    title: "Shows what's working",
    text: "Chats and leads per day, reply usage and alerts, all in one clean dashboard.",
  },
  {
    icon: MousePointerClick,
    title: "One line to install",
    text: "Add a chat bubble to WordPress, Shopify, Wix or any website, or share a direct chat link on Instagram and Google.",
  },
  {
    icon: ShieldCheck,
    title: "Private and secure",
    text: "Each business sees only its own chats and leads. Passwords are stored hashed and every login is protected.",
  },
];

export const PAINS: Feature[] = [
  { icon: Moon, title: "Messages arrive after hours", text: "Customers ask questions at night and on weekends, and book with whoever answers first." },
  { icon: Timer, title: "Slow replies lose sales", text: "A customer who waits too long for a price simply moves on to the next business." },
  { icon: Headset, title: "Your team repeats itself", text: "Prices, timings, location, delivery: the same questions, answered by hand, all day." },
];

export const STEPS = [
  { title: "Share your business details", text: "Choose your industry and send your website, price list or brochure." },
  { title: "Your assistant learns it", text: "It reads your documents and website and learns your services, prices and FAQs. Test it before going live." },
  { title: "Go live and collect leads", text: "Add the chat bubble to your website or share the chat link. New leads land in your dashboard." },
];

export const FAQS = [
  {
    q: "Do I need a website?",
    a: "No. Besides the website chat bubble, every assistant has its own chat link you can put in your Instagram bio, Facebook page or Google Business profile.",
  },
  {
    q: "Which languages does it speak?",
    a: "English, Urdu and Roman Urdu. It replies in the language the customer writes in, so nobody has to switch.",
  },
  {
    q: "Will it make up prices or answers?",
    a: "Your assistant is instructed to answer only from the information you give it. When it doesn't know, it says so and offers to have your team get in touch.",
  },
  {
    q: "How long does setup take?",
    a: "Once we have your website or documents, an assistant is usually ready within a day. You can test it before it goes live.",
  },
  {
    q: "What happens when we reach the monthly reply limit?",
    a: "Customers see a polite message asking them to contact you directly, and you get a notification. You can move to a bigger plan at any time.",
  },
  {
    q: "Does it work on WhatsApp?",
    a: SITE.whatsappLive
      ? "Yes. On the Pro and Enterprise plans your assistant also answers customers on your WhatsApp Business number."
      : "WhatsApp is coming soon for the Pro and Enterprise plans. Today your assistant works on your website and through its shareable chat link.",
  },
  {
    q: "Who can see our chats and leads?",
    a: "Only your business. Each company has its own login, and its knowledge, chats and leads are private to it.",
  },
];

export interface Industry {
  slug: string;
  name: string;
  icon: TemplateIconKey;
  color: string;
  business: string;
  headline: string;
  subheadline: string;
  pains: string[];
  wins: string[];
  chat: DemoMessage[];
}

export const INDUSTRIES: Industry[] = [
  {
    slug: "clinics",
    name: "Clinics & dental",
    icon: "clinic",
    color: "#2f6f73",
    business: "Smile Dental Clinic",
    headline: "Book more patients and answer fewer phone calls",
    subheadline: "An AI receptionist that answers fee and treatment questions and collects appointment requests day and night.",
    pains: [
      "Calls go unanswered while doctors are with patients",
      "Patients message after hours and book somewhere else",
      "Staff repeat the same fee and timing answers all day",
    ],
    wins: [
      "Answers fees, treatments and timings instantly",
      "Collects name, phone and preferred appointment time",
      "Flags urgent requests for your team",
      "Replies in Urdu, Roman Urdu or English",
    ],
    chat: [
      { from: "customer", text: "Root canal ki fees kitni hai?" },
      { from: "bot", text: "Root canal treatment starts from **Rs. 15,000**, depending on the tooth. Would you like to book a checkup?" },
      { from: "customer", text: "Haan, kal shaam 6 baje. Ayesha, 0300-1234567" },
      { from: "bot", text: "Thank you Ayesha! We've noted **tomorrow at 6pm**. Our team will confirm on WhatsApp shortly." },
    ],
  },
  {
    slug: "real-estate",
    name: "Real estate",
    icon: "realestate",
    color: "#3f6b4f",
    business: "Prime Estate & Builders",
    headline: "Qualify buyers while you're out on a site visit",
    subheadline: "Your assistant asks the right questions about area, budget and size, and hands you ready-to-call leads.",
    pains: [
      "Enquiries come in while you're showing a property",
      "Time goes on people who were never serious buyers",
      "Listings questions repeat across every portal and page",
    ],
    wins: [
      "Finds out buy, sell or rent, area, budget and size",
      "Shares matching listings from your information",
      "Collects name and phone and offers a site visit",
      "Never promises prices that aren't in your listings",
    ],
    chat: [
      { from: "customer", text: "5 marla house Bahria Town mein kitne ka hai?" },
      { from: "bot", text: "We have a 5 marla, 3-bed house in Bahria Town for **Rs. 1.9 crore**. Are you buying or renting, and what's your budget?" },
      { from: "customer", text: "Buying, budget 2 crore. Bilal, 0321-7654321" },
      { from: "bot", text: "Great, Bilal! An agent will call you today to arrange a site visit." },
    ],
  },
  {
    slug: "restaurants",
    name: "Restaurants & cafés",
    icon: "restaurant",
    color: "#a8623a",
    business: "Karachi Grill House",
    headline: "Take orders and reservations without picking up the phone",
    subheadline: "Menu questions, deals, delivery areas and table bookings, handled instantly even at the busiest hour.",
    pains: [
      "Phones ring nonstop during lunch and dinner rush",
      "Menu and delivery questions pile up in your inbox",
      "Customers give up when nobody answers",
    ],
    wins: [
      "Shares your menu, deals and delivery charges",
      "Takes orders with items, quantity and address",
      "Books tables with party size and time",
      "Repeats the order total before your team confirms",
    ],
    chat: [
      { from: "customer", text: "Family deal mein kya hai?" },
      { from: "bot", text: "Our **Family Deal** has a full chicken karahi, 6 naan and a 1.5L drink for **Rs. 3,400**. Delivery or dine-in?" },
      { from: "customer", text: "Delivery, Gulberg" },
      { from: "bot", text: "Perfect! Please share your name, phone number and full address to confirm your order." },
    ],
  },
  {
    slug: "schools",
    name: "Schools & academies",
    icon: "school",
    color: "#3d5a80",
    business: "Bright Future Academy",
    headline: "Answer every admission question, even at midnight",
    subheadline: "Fees, schedules and admission steps explained to parents and students the moment they ask.",
    pains: [
      "Admission season floods your phones and inbox",
      "Parents ask about fees and timings late at night",
      "Interested students drift away before you call back",
    ],
    wins: [
      "Explains courses, fees, batches and admission steps",
      "Offers a free demo class or campus visit",
      "Collects student name, class and phone number",
      "Talks to parents in Urdu or English",
    ],
    chat: [
      { from: "customer", text: "MDCAT prep ki fee kitni hai?" },
      { from: "bot", text: "Our full **MDCAT preparation course is Rs. 45,000**, with morning and evening batches. Would you like a free demo class?" },
      { from: "customer", text: "Yes please" },
      { from: "bot", text: "Wonderful! Please share the student's name and your phone number and we'll book it." },
    ],
  },
  {
    slug: "online-stores",
    name: "Online stores",
    icon: "store",
    color: "#3f4a5a",
    business: "Style Hub PK",
    headline: "Sell more with instant answers on sizes, delivery and returns",
    subheadline: "Your assistant helps shoppers choose, explains delivery and returns, and takes the order.",
    pains: [
      "Shoppers leave when a size or delivery question goes unanswered",
      "DMs and comments ask the same things again and again",
      "Order details get lost across chats",
    ],
    wins: [
      "Answers sizes, prices, delivery time and charges",
      "Explains your exchange and return policy",
      "Takes orders with product, size and address",
      "Hands order-status questions to your team",
    ],
    chat: [
      { from: "customer", text: "Delivery Karachi kitne din mein?" },
      { from: "bot", text: "We deliver all over Pakistan in **3–5 working days**, free above Rs. 5,000. Cash on delivery is available." },
      { from: "customer", text: "Kurta size L available hai?" },
      { from: "bot", text: "Yes! The **men's cotton kurta** comes in S, M, L and XL for Rs. 3,200. Shall I take your order?" },
    ],
  },
  {
    slug: "salons",
    name: "Salons, spas & gyms",
    icon: "salon",
    color: "#6b5b4e",
    business: "Glow Salon & Spa",
    headline: "Fill your appointment book on autopilot",
    subheadline: "Services, packages and prices answered instantly, with bookings collected for your team to confirm.",
    pains: [
      "Stylists can't answer the phone while working",
      "Bridal and party bookings need quick replies",
      "No-shows and back-and-forth waste the day",
    ],
    wins: [
      "Shares services, packages and prices",
      "Collects name, service and preferred date and time",
      "Handles bridal and event enquiries with care",
      "Sends your team every booking request",
    ],
    chat: [
      { from: "customer", text: "Bridal makeup ki booking kaise hogi?" },
      { from: "bot", text: "Bridal makeup starts from **Rs. 60,000** and needs advance booking. Which date are you looking at?" },
      { from: "customer", text: "15 December" },
      { from: "bot", text: "Lovely! Share your name and phone number and we'll confirm availability on WhatsApp." },
    ],
  },
];

export const getIndustry = (slug: string) => INDUSTRIES.find((i) => i.slug === slug);

export const HERO_CHAT = { title: INDUSTRIES[0].business, color: "#1e2a3a", messages: INDUSTRIES[0].chat };
