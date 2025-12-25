import type React from "react";

export function renderToStream(
  element: React.ReactElement,
): Promise<ReadableStream | string>;

export function generateStaticPage(options: {
  component: React.ReactElement;
  outputPath: string;
  props?: Record<string, unknown>;
}): Promise<void>;

export function getStaticProps(
  fn: () => Promise<Record<string, unknown>>,
): Promise<{
  props: Record<string, unknown>;
  revalidate: number;
}>;
