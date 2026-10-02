"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

interface UnsplashImage {
  id: string;
  urls: { thumb: string; full: string };
  links: { html: string };
  user: { name: string };
}

interface FormPickerProps {
  id: string;
  errors?: Record<string, string[] | undefined>;
  onChange?: (selected: boolean) => void;
}

// Value posted for the chosen image; the server action splits it on "|"
const toValue = (image: UnsplashImage) =>
  `${image.id}|${image.urls.thumb}|${image.urls.full}|${image.links.html}|${image.user.name}`;

// Background picker: a radio group of Unsplash photos
const FormPicker = ({ id, errors, onChange }: FormPickerProps) => {
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { pending } = useFormStatus();

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const response = await fetch("/api/images");
      if (!response.ok) throw new Error(`Images request failed`);
      setImages(await response.json());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const select = (imageId: string) => {
    setSelectedId(imageId);
    onChange?.(true);
  };

  const selected = images.find((image) => image.id === selectedId);
  const fieldErrors = errors?.[id];

  return (
    <fieldset className="flex flex-col gap-2" disabled={pending}>
      <legend className="mb-2 text-[13px] font-medium">Background</legend>
      {status === "loading" && (
        <div className="grid grid-cols-3 gap-1.5" aria-busy="true">
          {Array.from({ length: 9 }, (_, index) => (
            <Skeleton key={index} className="h-14 rounded-lg" />
          ))}
        </div>
      )}
      {status === "error" && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-3 py-5 text-center text-xs text-muted-foreground">
          Couldn&apos;t load backgrounds.
          <button
            type="button"
            onClick={load}
            className="font-medium text-primary-text hover:underline"
          >
            Try again
          </button>
        </div>
      )}
      {status === "ready" && (
        <div className="grid grid-cols-3 gap-1.5">
          {images.map((image) => {
            const isSelected = image.id === selectedId;
            return (
              <label
                key={image.id}
                className={cn(
                  "group relative h-14 cursor-pointer overflow-hidden rounded-lg bg-muted",
                  "has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50",
                  isSelected &&
                    "ring-2 ring-primary ring-offset-2 ring-offset-popover",
                  pending && "cursor-not-allowed opacity-60"
                )}
              >
                <input
                  type="radio"
                  name={id}
                  value={toValue(image)}
                  checked={isSelected}
                  onChange={() => select(image.id)}
                  className="sr-only"
                  aria-label={`Photo by ${image.user.name}`}
                />
                <Image
                  src={image.urls.thumb}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover transition-opacity group-hover:opacity-85"
                />
                {isSelected && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex size-5.5 items-center justify-center rounded-full bg-black/55 text-white">
                      <Check aria-hidden strokeWidth={3} className="size-3.5" />
                    </span>
                  </span>
                )}
              </label>
            );
          })}
        </div>
      )}
      {fieldErrors?.length ? (
        <p className="text-xs text-destructive-text" aria-live="polite">
          {fieldErrors[0]}
        </p>
      ) : (
        selected && (
          <p className="truncate text-xs text-muted-foreground">
            Photo by{" "}
            <a
              href={selected.links.html}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 hover:underline"
            >
              {selected.user.name}
            </a>{" "}
            on Unsplash
          </p>
        )
      )}
    </fieldset>
  );
};

export default FormPicker;
