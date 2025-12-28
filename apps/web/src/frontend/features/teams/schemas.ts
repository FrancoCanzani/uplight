import z from "zod";

export const TeamRoleSchema = z.enum(["owner", "admin", "member"]);

export const CreateTeamSchema = z.object({
  name: z.string().min(1).max(50),
});

export const TeamResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  personal: z.boolean(),
  role: TeamRoleSchema,
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const TeamMemberResponseSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.string(),
  role: TeamRoleSchema,
  createdAt: z.string(),
});

export const UpdateTeamSchema = z.object({
  name: z.string().min(1).max(50),
});

export const InviteMemberSchema = z.object({
  email: z.string().email(),
  role: TeamRoleSchema.default("member"),
});

export const UpdateMemberRoleSchema = z.object({
  role: TeamRoleSchema,
});

export type TeamRole = z.infer<typeof TeamRoleSchema>;
export type CreateTeam = z.infer<typeof CreateTeamSchema>;
export type UpdateTeam = z.infer<typeof UpdateTeamSchema>;
export type TeamResponse = z.infer<typeof TeamResponseSchema>;
export type TeamMemberResponse = z.infer<typeof TeamMemberResponseSchema>;
export type InviteMember = z.infer<typeof InviteMemberSchema>;
export type UpdateMemberRole = z.infer<typeof UpdateMemberRoleSchema>;
