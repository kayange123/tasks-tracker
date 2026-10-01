import { unsplash } from "@/lib/unsplash";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Proxies Unsplash so the access key never reaches the browser
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const result = await unsplash.photos.getRandom({
      collectionIds: ["317099"],
      count: 9,
    });

    if (!result.response) {
      return new NextResponse("Failed to get images", { status: 502 });
    }

    const photos = Array.isArray(result.response)
      ? result.response
      : [result.response];

    return NextResponse.json(
      photos.map((photo) => ({
        id: photo.id,
        urls: { thumb: photo.urls.thumb, full: photo.urls.full },
        links: { html: photo.links.html },
        user: { name: photo.user.name },
      })),
    );
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
