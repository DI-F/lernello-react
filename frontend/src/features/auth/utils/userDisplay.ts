import type { User } from "@/schemas/user/user.ts";

export interface SidebarUser {
  email: string;
  avatar?: string;
  initial: string;
}

export const toSidebarDisplay = (
  user: User | null | undefined,
): SidebarUser => {
  if (!user) {
    return { email: "Guest", initial: "G", avatar: undefined };
  }
  const email = user.username;
  const initial = email?.[0]?.toUpperCase() ?? "U";
  const avatar = undefined as string | undefined; // no avatar in user schema
  return { email, avatar, initial };
};
