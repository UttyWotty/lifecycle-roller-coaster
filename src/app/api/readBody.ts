/**
 * Reads a request body as text while counting its bytes, for the app's route handlers.
 * It stops as soon as the body passes the given size, so an oversized request cannot fill memory.
 * It returns null for a body that is too large, and the caller answers with its own error.
 */

export async function readBodyWithinLimit(request: Request, maxBytes: number): Promise<string | null> {
  if (request.body === null) {
    return "";
  }
  const decoder = new TextDecoder();
  const reader = request.body.getReader();
  let text = "";
  let bytes = 0;
  for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
    bytes += chunk.value.byteLength;
    if (bytes > maxBytes) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(chunk.value, { stream: true });
  }
  return text + decoder.decode();
}
