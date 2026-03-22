import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionEmail } from "@/lib/session-user";
import { apiUserMsg } from "@/lib/api-user-messages";

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
  const sess = await requireSessionEmail();
  if (!sess.ok) return sess.response;

  let body: { name?: unknown; bio?: unknown; profileLink?: unknown };
  try {
    body = (await request.json()) as { name?: unknown; bio?: unknown; profileLink?: unknown };
  } catch {
    return NextResponse.json({ error: apiUserMsg.invalidJson }, { status: 400 });
  }

  const nameRaw = typeof body.name === "string" ? body.name : undefined;
  const name =
    nameRaw !== undefined ? nameRaw.trim().replace(/\s+/g, " ").slice(0, 40) : undefined;
  const bio =
    typeof body.bio === "string" ? body.bio.trim().slice(0, 160) : undefined;
  const linkRaw = typeof body.profileLink === "string" ? body.profileLink : undefined;

  if (name !== undefined && name.length === 0) {
    return NextResponse.json({ error: "表示名を1文字以上入力してください" }, { status: 400 });
  }

  if (bio === undefined && linkRaw === undefined && name === undefined) {
    return NextResponse.json({ error: apiUserMsg.profileNoFields }, { status: 400 });
  }

  let profileLink: string | undefined;
  if (linkRaw !== undefined) {
    const n = normalizeProfileLink(linkRaw);
    if (!n.ok) {
      return NextResponse.json({ error: apiUserMsg.invalidProfileLink }, { status: 400 });
    }
    profileLink = n.value;
  }

  const data: { name?: string; bio?: string; profileLink?: string } = {};
  if (name !== undefined) data.name = name;
  if (bio !== undefined) data.bio = bio;
  if (profileLink !== undefined) data.profileLink = profileLink;

  await prisma.user.update({
    where: { email: sess.email },
    data,
  });

  return NextResponse.json({ ok: true });
}
