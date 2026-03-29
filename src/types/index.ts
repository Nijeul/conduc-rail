import type { User, Projet, ProjetMember } from "@prisma/client";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type ProjetWithMembers = Projet & {
  members: (ProjetMember & { user: Pick<User, "id" | "name" | "email"> })[];
  _count?: {
    members: number;
    rapports: number;
    lignesDE: number;
    soudures: number;
  };
};

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
