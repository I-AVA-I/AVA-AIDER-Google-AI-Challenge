export function splitText(text: string, maxLength: number, overlap: number): string[] {
  if (maxLength <= 0) {
    throw new Error('maxLength must be greater than 0');
  }
  if (overlap >= maxLength) {
    throw new Error('overlap must be less than maxLength');
  }

  const chunks: string[] = [];
  let start = 0;
  const textLength = text.length;

  while (start < textLength) {
    let end = start + maxLength;
    if (end > textLength) {
      end = textLength;
    }

    const chunk = text.substring(start, end);
    chunks.push(chunk);

    if (end === textLength) {
      break; // Reached the end of the text
    }

    start = end - overlap;
    // Ensure that start always increases
    if (start >= end) {
      start = end;
    }
  }

  return chunks;
}
