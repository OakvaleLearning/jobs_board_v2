import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { auth } from "@/lib/auth";
import { storageRoot } from "@/lib/storage";

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".pdf": "application/pdf",
};

// Uploaded documents (IDs, certificates) are sensitive: any authenticated user
// session is required. Fine-grained per-document ACLs can be added on top.
export async function GET(_req: Request, ctx: RouteContext<"/api/files/[...key]">) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await ctx.params;
  const rel = key.join("/");
  const root = storageRoot();
  const abs = path.resolve(root, rel);

  // Prevent path traversal outside the storage root.
  if (!abs.startsWith(path.resolve(root) + path.sep)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const data = await readFile(abs);
    const type = CONTENT_TYPES[path.extname(abs).toLowerCase()] ?? "application/octet-stream";
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
