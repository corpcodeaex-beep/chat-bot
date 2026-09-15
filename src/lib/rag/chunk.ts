// Splits long text into overlapping pieces (~900 characters) at paragraph and
// sentence boundaries, so each piece is a self-contained bit of information.

const CHUNK_SIZE = 900;
const OVERLAP = 150;

export function cleanText(text: string) {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitLong(paragraph: string): string[] {
  if (paragraph.length <= CHUNK_SIZE) return [paragraph];
  const sentences = paragraph.match(/[^.!?۔\n]+[.!?۔]*\s*|\n/g) ?? [paragraph];
  const pieces: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (current && current.length + sentence.length > CHUNK_SIZE) {
      pieces.push(current.trim());
      current = "";
    }
    // A single "sentence" longer than the limit (e.g. a table dump) is hard-split.
    for (let i = 0; i < sentence.length; i += CHUNK_SIZE) {
      const part = sentence.slice(i, i + CHUNK_SIZE);
      if (current && current.length + part.length > CHUNK_SIZE) {
        pieces.push(current.trim());
        current = "";
      }
      current += part;
    }
  }
  if (current.trim()) pieces.push(current.trim());
  return pieces;
}

function tail(text: string) {
  if (text.length <= OVERLAP) return text;
  const cut = text.slice(-OVERLAP);
  const boundary = cut.search(/[.!?۔\n]\s/);
  return boundary >= 0 ? cut.slice(boundary + 2) : cut.slice(cut.indexOf(" ") + 1);
}

export function chunkText(text: string): string[] {
  const paragraphs = cleanText(text)
    .split(/\n\n/)
    .flatMap(splitLong)
    .filter((p) => p.trim().length > 0);

  const chunks: string[] = [];
  let current = "";
  for (const paragraph of paragraphs) {
    if (current && current.length + paragraph.length + 2 > CHUNK_SIZE) {
      chunks.push(current);
      current = tail(current);
    }
    current = current ? `${current}\n\n${paragraph}` : paragraph;
  }
  if (current.trim()) chunks.push(current);
  // Drop tiny fragments that carry no information (e.g. lone page numbers).
  return chunks.filter((c) => c.replace(/[\s\d\W]/g, "").length >= 20 || chunks.length === 1);
}
