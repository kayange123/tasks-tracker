"use client";

import { Button } from "@/components/ui/button";
import { downloadFile } from "@/lib/download";
import type { ExportFormat } from "@/lib/dataExport";
import { notify } from "@/lib/notify";
import { Download } from "lucide-react";
import { useState } from "react";

interface ExportButtonsProps {
  // Export route; the format is added as ?format=json|csv
  url: string;
  disabled?: boolean;
}

const FORMATS: { format: ExportFormat; label: string }[] = [
  { format: "json", label: "Download JSON" },
  { format: "csv", label: "Download CSV (zip)" },
];

const ExportButtons = ({ url, disabled }: ExportButtonsProps) => {
  const [pending, setPending] = useState<ExportFormat | null>(null);

  const download = async (format: ExportFormat) => {
    setPending(format);
    try {
      const fileName = await downloadFile(`${url}?format=${format}`);
      notify.success("Export downloaded", { description: fileName });
    } catch (error) {
      notify.error("Couldn’t export data", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {FORMATS.map(({ format, label }) => (
        <Button
          key={format}
          variant="outline"
          disabled={disabled || pending !== null}
          onClick={() => download(format)}
        >
          <Download aria-hidden />
          {pending === format ? "Preparing…" : label}
        </Button>
      ))}
    </div>
  );
};

export default ExportButtons;
