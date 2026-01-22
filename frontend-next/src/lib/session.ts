import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getSessionUserId() {
  const session = await getServerSession(authOptions);
  const rawId = session?.user?.id;
  const userId = rawId ? Number(rawId) : NaN;
  if (!Number.isInteger(userId)) {
    return null;
  }
  return userId;
}
