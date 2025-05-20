import { renderToReadableStream, renderToString } from "react-dom/server";
import type React from "react";

/**
 * Render React element ke stream HTML.
 * Otomatis fallback ke string jika Streaming tidak didukung.
 */
export async function renderToStream(element: React.ReactElement) {
  if (typeof renderToReadableStream === "function") {
    return renderToReadableStream(element);
  }
  return renderToString(element);
}
