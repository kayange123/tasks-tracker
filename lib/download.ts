// Fetches a file and saves it under the name the server gives it, so
// failures can be shown in a toast instead of an error page
export const downloadFile = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error((await response.text()) || "Download failed");
  }

  const disposition = response.headers.get("Content-Disposition") ?? "";
  const fileName = /filename="([^"]+)"/.exec(disposition)?.[1] ?? "download";
  const href = URL.createObjectURL(await response.blob());

  const link = document.createElement("a");
  link.href = href;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);

  return fileName;
};
