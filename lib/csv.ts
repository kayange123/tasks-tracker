import { strToU8, zipSync } from "fflate";

export type Table = {
  columns: string[];
  rows: Record<string, unknown>[];
};

// Spreadsheet apps run cells starting with these as formulas
const FORMULA_START = /^[=+\-@\t\r]/;

const cell = (value: unknown) => {
  if (value === null || value === undefined) return "";
  let text = value instanceof Date ? value.toISOString() : String(value);
  if (FORMULA_START.test(text)) text = `'${text}`;
  // RFC 4180: quote fields containing separators, quotes or line breaks
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const toCsv = ({ columns, rows }: Table) =>
  [columns, ...rows.map((row) => columns.map((column) => row[column]))]
    .map((values) => values.map(cell).join(","))
    .join("\r\n") + "\r\n";

// One CSV file per table, e.g. { boards: … } becomes boards.csv
export const toCsvZip = (tables: Record<string, Table>) =>
  zipSync(
    Object.fromEntries(
      Object.entries(tables).map(([name, table]) => [
        `${name}.csv`,
        strToU8(toCsv(table)),
      ])
    )
  );
