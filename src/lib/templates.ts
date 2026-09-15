import type { SkillKey } from "./types";

export type TemplateIconKey = "bot" | "clinic" | "realestate" | "restaurant" | "school" | "store" | "salon";

export interface BotTemplate {
  key: string;
  label: string;
  icon: TemplateIconKey;
  description: string;
  color: string;
  businessName: string;
  welcome: string;
  instructions: string;
  knowledge: string;
  skills: Record<SkillKey, boolean>;
}

const ALL_OFF: Record<SkillKey, boolean> = { leads: false, booking: false, orders: false, handoff: false };

// Each template is only a starting point: the business owner edits the knowledge
// and instructions in the dashboard. Sample details are placeholders.
export const TEMPLATES: BotTemplate[] = [
  {
    key: "general",
    label: "General business",
    icon: "bot",
    description: "Answers questions about any business and collects leads.",
    color: "#4f46e5",
    businessName: "My Business",
    welcome: "Assalam o Alaikum! How can I help you today?",
    instructions:
      "You are the friendly assistant for this business. Answer questions using the business information. When a customer is interested, politely ask for their name and phone number so the team can follow up.",
    // Left empty on purpose: placeholder text here would be treated as real facts by the AI.
    knowledge: "",
    skills: { ...ALL_OFF, leads: true, handoff: true },
  },
  {
    key: "clinic",
    label: "Clinic / Dental / Skin care",
    icon: "clinic",
    description: "Answers treatment and fee questions, and books appointments.",
    color: "#0891b2",
    businessName: "Smile Dental Clinic",
    welcome: "Assalam o Alaikum! Welcome to Smile Dental Clinic. Would you like to book an appointment or ask about a treatment?",
    instructions:
      "You are the receptionist assistant for a clinic. Help patients with treatments, fees, timings and appointment booking. Never give a medical diagnosis or prescribe medicine; for pain, bleeding or emergencies ask them to call the clinic immediately. To book, collect name, phone number, treatment needed, and preferred day/time, then tell them the clinic will confirm on WhatsApp.",
    knowledge: `Smile Dental Clinic

Timings: Monday to Saturday 11am to 9pm. Sunday closed.

Treatments and starting fees:
- Checkup and consultation: Rs. 1,500
- Scaling and polishing (cleaning): Rs. 4,000
- Tooth filling: from Rs. 3,500
- Root canal: from Rs. 15,000
- Teeth whitening: Rs. 25,000
- Braces: from Rs. 120,000 (installments available)

Payment: cash, card, JazzCash, EasyPaisa.`,
    skills: { ...ALL_OFF, leads: true, booking: true, handoff: true },
  },
  {
    key: "realestate",
    label: "Real estate",
    icon: "realestate",
    description: "Qualifies buyers and renters and books property visits.",
    color: "#15803d",
    businessName: "Prime Estate & Builders",
    welcome: "Assalam o Alaikum! Looking to buy, sell or rent a property? Tell me what you need.",
    instructions:
      "You are the assistant for a real estate agency. Find out whether the customer wants to buy, sell or rent, their preferred area, budget, property size (marla/kanal) and timeline. Share matching options from the business information. Then collect name and phone number and offer a site visit. Never promise a price or availability that is not in the information.",
    knowledge: `Prime Estate & Builders

Areas we deal in: DHA, Bahria Town, Gulberg, Johar Town.

Services: buying, selling, renting, property investment advice, file transfers.

Sample listings:
- 5 marla house, Bahria Town, 3 beds: Rs. 1.9 crore
- 10 marla plot, DHA Phase 9: Rs. 1.4 crore
- 2-bed apartment for rent, Gulberg: Rs. 85,000 per month

Commission: 1% for buying/selling, one month rent for rentals.

Office timings: 10am to 7pm, all days except Friday afternoon.`,
    skills: { ...ALL_OFF, leads: true, booking: true, handoff: true },
  },
  {
    key: "restaurant",
    label: "Restaurant / Café",
    icon: "restaurant",
    description: "Shares the menu, takes orders and table reservations.",
    color: "#ea580c",
    businessName: "Karachi Grill House",
    welcome: "Assalam o Alaikum! Hungry? I can show you the menu, take your order, or reserve a table.",
    instructions:
      "You are the assistant for a restaurant. Help with the menu, deals, delivery and table reservations. For an order, collect items with quantities, name, phone number and delivery address, repeat the order with the total price, and tell them the restaurant will call to confirm. For a reservation, collect name, phone, number of people and date/time.",
    knowledge: `Karachi Grill House

Timings: 12pm to 1am daily.

Delivery: free delivery above Rs. 1,500 within 5 km. Delivery time 35-45 minutes.

Menu:
- Chicken Tikka: Rs. 650
- Seekh Kabab (4 pcs): Rs. 900
- Chicken Karahi (half): Rs. 1,600 / (full): Rs. 3,000
- Mutton Karahi (half): Rs. 2,900
- Zinger Burger: Rs. 550
- Naan: Rs. 50
- Soft drink 1.5L: Rs. 250

Deals:
- Family Deal: full chicken karahi, 6 naan, 1.5L drink: Rs. 3,400`,
    skills: { ...ALL_OFF, leads: true, orders: true, booking: true, handoff: true },
  },
  {
    key: "school",
    label: "School / Academy / Courses",
    icon: "school",
    description: "Answers admission, fee and schedule questions.",
    color: "#7c3aed",
    businessName: "Bright Future Academy",
    welcome: "Assalam o Alaikum! Ask me about admissions, fees, classes or timings.",
    instructions:
      "You are the admissions assistant for an education institute. Answer questions about courses, fees, schedules and the admission process. For interested students or parents, collect the student's name, phone number, class/course interested in, and offer a free demo class or campus visit.",
    knowledge: `Bright Future Academy

Programs:
- Matric (9th-10th) tuition: Rs. 8,000/month
- FSc Pre-Medical / Pre-Engineering: Rs. 10,000/month
- MDCAT / ECAT preparation: Rs. 45,000 full course
- Spoken English (3 months): Rs. 15,000

Timings: morning batch 8am-1pm, evening batch 3pm-8pm.

Admission: fill form at campus with 2 photos and B-form/CNIC copy. Free demo class available.

Discounts: 10% sibling discount.`,
    skills: { ...ALL_OFF, leads: true, booking: true, handoff: true },
  },
  {
    key: "ecommerce",
    label: "Online store",
    icon: "store",
    description: "Answers product, delivery and return questions; takes orders.",
    color: "#db2777",
    businessName: "Style Hub PK",
    welcome: "Hi! Welcome to Style Hub. Looking for something, or need help with an order?",
    instructions:
      "You are the shopping assistant for an online store. Help customers find products, explain prices, sizes, delivery and returns. For an order, collect product and size, quantity, name, phone number and full address, confirm the total including delivery, and say the team will confirm by call/WhatsApp. For order status questions, collect the order number and phone and hand over to the team.",
    knowledge: `Style Hub PK

Delivery: all over Pakistan in 3-5 working days. Delivery charges Rs. 250, free above Rs. 5,000. Cash on delivery available.

Returns: exchange within 7 days if unused with tags. No cash refunds on sale items.

Products:
- Men's cotton kurta: Rs. 3,200 (S, M, L, XL)
- Women's 3-piece lawn suit: Rs. 4,800
- Leather sneakers: Rs. 6,500 (sizes 7-11)`,
    skills: { ...ALL_OFF, leads: true, orders: true, handoff: true },
  },
  {
    key: "salon",
    label: "Salon / Gym / Spa",
    icon: "salon",
    description: "Shares services and prices and books appointments.",
    color: "#be185d",
    businessName: "Glow Salon & Spa",
    welcome: "Assalam o Alaikum! Would you like to see our services or book an appointment?",
    instructions:
      "You are the booking assistant for a salon/gym. Share services, packages and prices. To book, collect name, phone number, service, and preferred date/time, then say the team will confirm on WhatsApp.",
    knowledge: `Glow Salon & Spa (ladies only)

Timings: 11am to 9pm, Tuesday to Sunday. Monday closed.

Services:
- Haircut and blow dry: Rs. 2,500
- Facial (whitening): Rs. 4,000
- Mani-pedi: Rs. 3,000
- Party makeup: Rs. 12,000
- Bridal makeup: from Rs. 60,000 (advance booking required)`,
    skills: { ...ALL_OFF, leads: true, booking: true, handoff: true },
  },
];

export function getTemplate(key: string): BotTemplate {
  return TEMPLATES.find((t) => t.key === key) ?? TEMPLATES[0];
}

export const SKILL_LABELS: Record<SkillKey, { label: string; help: string }> = {
  leads: { label: "Lead capture", help: "Collects name, phone and email of interested customers." },
  booking: { label: "Appointments & visits", help: "Collects a preferred date and time for a booking." },
  orders: { label: "Orders", help: "Takes orders with items, quantity and delivery address." },
  handoff: { label: "Human handoff", help: "Flags the chat when the customer wants a real person." },
};
