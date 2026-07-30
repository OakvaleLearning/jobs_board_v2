import { prisma } from "@/lib/prisma";
import { sendEmail, emailLayout } from "@/lib/email";

type NotifyArgs = {
  userId: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
  email?: boolean; // also send an email copy
};

/**
 * Creates an in-app notification (bell) and optionally emails the user via Resend.
 */
export async function notify({ userId, type, title, body, link, email }: NotifyArgs) {
  await prisma.notification.create({
    data: { userId, type, title, body, link },
  });

  if (email) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.email) {
      const linkHtml = link
        ? `<p style="margin-top:16px"><a href="${appUrl(link)}" style="background:#1B5E20;color:#fff;padding:10px 18px;border-radius:999px;display:inline-block;font-weight:600">Open in Oakvale Jobs</a></p>`
        : "";
      await sendEmail({
        to: user.email,
        subject: title,
        html: emailLayout(title, `<p>${body ?? ""}</p>${linkHtml}`),
      });
    }
  }
}

function appUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return path.startsWith("http") ? path : `${base}${path}`;
}

/** Notifies every admin/agent — used when something needs internal review. */
export async function notifyAdmins(args: Omit<NotifyArgs, "userId">) {
  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "AGENT"] }, deletedAt: null },
    select: { id: true },
  });
  await Promise.all(admins.map((a) => notify({ ...args, userId: a.id })));
}
