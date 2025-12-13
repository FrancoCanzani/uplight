import { z } from "@hono/zod-openapi";

export const TeamRoleSchema = z.enum(["owner", "admin", "member"]);

export const CreateTeamSchema = z
  .object({
    name: z.string().min(1).max(50).openapi({ example: "My Team" }),
  })
  .openapi("CreateTeam");

export const UpdateTeamSchema = z
  .object({
    name: z.string().min(1).max(50).optional(),
  })
  .openapi("UpdateTeam");

export const TeamResponseSchema = z
  .object({
    id: z.number().int().openapi({ example: 1 }),
    name: z.string(),
    personal: z.boolean(),
    role: TeamRoleSchema,
    createdAt: z.number().int(),
    updatedAt: z.number().int(),
  })
  .openapi("TeamResponse");

export const TeamMemberResponseSchema = z
  .object({
    userId: z.string(),
    name: z.string(),
    email: z.string(),
    role: TeamRoleSchema,
    createdAt: z.number().int(),
  })
  .openapi("TeamMemberResponse");

export type TeamRole = z.infer<typeof TeamRoleSchema>;
export type CreateTeam = z.infer<typeof CreateTeamSchema>;
export type UpdateTeam = z.infer<typeof UpdateTeamSchema>;
export type TeamResponse = z.infer<typeof TeamResponseSchema>;
export type TeamMemberResponse = z.infer<typeof TeamMemberResponseSchema>;
