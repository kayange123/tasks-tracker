import { describe, expect, it } from "vitest";
import { unsplashWidth } from "@/lib/utils";

describe("unsplashWidth", () => {
  it("sets the width on Unsplash image URLs", () => {
    expect(
      unsplashWidth("https://images.unsplash.com/photo-1?ixid=abc&w=200", 640)
    ).toBe("https://images.unsplash.com/photo-1?ixid=abc&w=640");
  });

  it("leaves other URLs and invalid input unchanged", () => {
    expect(unsplashWidth("https://example.com/a.png?w=200", 640)).toBe(
      "https://example.com/a.png?w=200"
    );
    expect(unsplashWidth("not a url", 640)).toBe("not a url");
  });
});
