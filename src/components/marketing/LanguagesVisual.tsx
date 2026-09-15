const LANGUAGES = [
  {
    label: "English",
    question: "What are your timings?",
    answer: "We're open Monday to Saturday, 10am to 8pm.",
  },
  {
    label: "Urdu",
    question: "آپ کے اوقات کیا ہیں؟",
    answer: "ہم پیر سے ہفتہ، صبح 10 بجے سے رات 8 بجے تک کھلے ہیں۔",
  },
  {
    label: "Roman Urdu",
    question: "Aap ki timings kya hain?",
    answer: "Hum Monday se Saturday, subah 10 se raat 8 baje tak khule hain.",
  },
];

export default function LanguagesVisual() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {LANGUAGES.map((l) => (
        <div key={l.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">{l.label}</p>
          <div className="mt-4 space-y-2 text-sm">
            <p dir="auto" className="ml-auto w-fit max-w-[90%] rounded-2xl rounded-br-md bg-slate-600 px-3 py-2 text-white">
              {l.question}
            </p>
            <p dir="auto" className="w-fit max-w-[90%] rounded-2xl rounded-bl-md bg-slate-100 px-3 py-2 leading-relaxed text-slate-800">
              {l.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
