import { auth } from "../../auth";

export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session.session;

export type TeamRole = "owner" | "admin" | "member";

export type TeamContext = {
  teamId: number;
  role: TeamRole;
};

export type AppVariables = {
  user: User | null;
  session: Session | null;
  team?: TeamContext;
};

export type AppEnv = {
  Bindings: Env;
  Variables: AppVariables;
};
