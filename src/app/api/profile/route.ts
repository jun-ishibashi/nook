import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function normalizeProfileLink(raw: string): { ok: true; value: string } | { ok: false } {
  const t = raw.trim();
  if (!t) return { ok: true, value: "" };
  try {
    const withScheme = /^https?:\/\//i.test(t) ? t : `https://${t}`;
    const u = new URL(withScheme);
    if (u.protocol !== "http:" && u.protocol !== "https:") return { ok: false };
    return { ok: true, value: u.href };
  } catch {
    return { ok: false };
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { bio?: unknown; profileLink?: unknown };
  try {
    body = (await request.json()) as { bio?: unknown; profileLink?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const bio =
    typeof body.bio === "string" ? body.bio.trim().slice(0, 160) : undefined;
  const linkRaw = typeof body.profileLink === "string" ? body.profileLink : undefined;

  if (bio === undefined && linkRaw === undefined) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  let profileLink: string | undefined;
  if (linkRaw !== undefined) {
    const n = normalizeProfileLink(linkRaw);
    if (!n.ok) {
      return NextResponse.json({ error: "Invalid profile link URL" }, { status: 400 });
    }
    profileLink = n.value;
  }

  const data: { bio?: string; profileLink?: string } = {};
  if (bio !== undefined) data.bio = bio;
  if (profileLink !== undefined) data.profileLink = profileLink;

  await prisma.user.update({
    where: { email: session.user.email },
    data,
  });

  return NextResponse.json({ ok: true });
}
