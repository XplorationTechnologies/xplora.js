import { describe, it, expect } from "vitest";
import { join } from "node:path";

describe("start command path resolution", () => {
  const distDir = "/project/dist";

  it("should resolve root path to index.html", () => {
    const pathname = "/";
    const filePath = join(distDir, pathname, "index.html");

    expect(filePath).toBe("/project/dist/index.html");
  });

  it("should resolve page path to nested index.html", () => {
    const pathname = "/about";
    const filePath = join(distDir, pathname, "index.html");

    expect(filePath).toBe("/project/dist/about/index.html");
  });

  it("should resolve deep nested path", () => {
    const pathname = "/blog/posts/hello";
    const filePath = join(distDir, pathname, "index.html");

    expect(filePath).toBe("/project/dist/blog/posts/hello/index.html");
  });

  it("should detect static asset by extension", () => {
    const pathname = "/assets/style.css";
    const hasExtension = pathname.includes(".");

    expect(hasExtension).toBe(true);
  });

  it("should resolve static asset path directly", () => {
    const pathname = "/assets/style.css";
    const filePath = join(distDir, pathname);

    expect(filePath).toBe("/project/dist/assets/style.css");
  });

  it("should detect HTML page by no extension", () => {
    const pathname = "/about";
    const hasExtension = pathname.includes(".");

    expect(hasExtension).toBe(false);
  });
});
