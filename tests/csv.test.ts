import { strFromU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { toCsv, toCsvZip } from "@/lib/csv";

describe("toCsv", () => {
  it("writes a header row and one row per record", () => {
    const csv = toCsv({
      columns: ["id", "title"],
      rows: [
        { id: "1", title: "Spec" },
        { id: "2", title: "Launch" },
      ],
    });

    expect(csv).toBe("id,title\r\n1,Spec\r\n2,Launch\r\n");
  });

  it("quotes commas, quotes and line breaks", () => {
    const csv = toCsv({
      columns: ["title"],
      rows: [{ title: 'Say "hi", then\nleave' }],
    });

    expect(csv).toBe('title\r\n"Say ""hi"", then\nleave"\r\n');
  });

  it("writes dates as ISO strings and leaves empty values blank", () => {
    const csv = toCsv({
      columns: ["at", "note", "missing"],
      rows: [{ at: new Date("2026-10-06T08:00:00Z"), note: null }],
    });

    expect(csv).toBe("at,note,missing\r\n2026-10-06T08:00:00.000Z,,\r\n");
  });

  it("stops spreadsheet apps from running cells as formulas", () => {
    const csv = toCsv({
      columns: ["title"],
      rows: [{ title: "=HYPERLINK(1)" }, { title: "@sum" }, { title: "+1" }],
    });

    expect(csv).toBe("title\r\n'=HYPERLINK(1)\r\n'@sum\r\n'+1\r\n");
  });

  it("keeps the header when there are no rows", () => {
    expect(toCsv({ columns: ["id"], rows: [] })).toBe("id\r\n");
  });
});

describe("toCsvZip", () => {
  it("zips one CSV file per table", () => {
    const zip = toCsvZip({
      boards: { columns: ["id"], rows: [{ id: "b1" }] },
      cards: { columns: ["id"], rows: [] },
    });

    const files = unzipSync(zip);
    expect(Object.keys(files).sort()).toEqual(["boards.csv", "cards.csv"]);
    expect(strFromU8(files["boards.csv"])).toBe("id\r\nb1\r\n");
  });
});
