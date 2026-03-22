import "server-only";

import type { Prisma, User } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export async function getOptionalSessionUser<S extends Prisma.UserSelect>(
  select: S,
): Promise<Prisma.UserGetPayload<{ select: S }> | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return prisma.user.findUnique({
    where: { email: session.user.email },
    select,
  });
}

export async function getOptionalUserId(): Promise<string | undefined> {
  const row = await getOptionalSessionUser({ id: true });
  return row?.id;
}

export async function requireApiUser(): Promise<
  { ok: true; user: User } | { ok: false; response: NextResponse }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "User not found" }, { status: 401 }),
    };
  }
  return { ok: true, user };
}

export async function requireSessionEmail(): Promise<
  { ok: true; email: string } | { ok: false; response: NextResponse }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true, email: session.user.email };
}
