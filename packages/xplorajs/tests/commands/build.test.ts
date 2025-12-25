import { describe, it, expect } from "vitest";

function convertToRoute(filePath: string) {
  const relativePath = filePath.replace("src/app/", "");
  const path = relativePath
    .replace(/\.tsx$/, "")
    .replace(/\/page$/, "")
    .replace(/\[([^\]]+)\]/g, ":$1");

  const params = (relativePath.match(/\[([^\]]+)\]/g) || []).map((param) =>
    param.slice(1, -1),
  );

  return {
    path: path === "page" ? "/" : `/${path}`,
    file: filePath,
    isDynamic: params.length > 0,
    params,
  };
}

describe("convertToRoute", () => {
  it("should convert root page", () => {
    const route = convertToRoute("src/app/page.tsx");

    expect(route.path).toBe("/");
    expect(route.file).toBe("src/app/page.tsx");
    expect(route.isDynamic).toBe(false);
    expect(route.params).toEqual([]);
  });

  it("should convert nested page", () => {
    const route = convertToRoute("src/app/about/page.tsx");

    expect(route.path).toBe("/about");
    expect(route.isDynamic).toBe(false);
  });

  it("should convert deep nested page", () => {
    const route = convertToRoute("src/app/blog/posts/page.tsx");

    expect(route.path).toBe("/blog/posts");
    expect(route.isDynamic).toBe(false);
  });

  it("should convert dynamic route", () => {
    const route = convertToRoute("src/app/blog/[slug]/page.tsx");

    expect(route.path).toBe("/blog/:slug");
    expect(route.isDynamic).toBe(true);
    expect(route.params).toEqual(["slug"]);
  });

  it("should convert multiple dynamic params", () => {
    const route = convertToRoute("src/app/[category]/[id]/page.tsx");

    expect(route.path).toBe("/:category/:id");
    expect(route.isDynamic).toBe(true);
    expect(route.params).toEqual(["category", "id"]);
  });
});
