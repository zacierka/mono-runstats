import { sql } from "bun";

export type DiscordUser = {
  uid: string;
  username: string;
  avatarURL: string | null;
};

export async function registerUserReq(
  discordUser: DiscordUser,
  fromGuildID: string,
  fromChannelID: string
) {
  try {
    return await sql.begin(async (tx) => {
      const [user] = await tx`
        INSERT INTO users (discord_id, discord_username, discord_avatar)
        VALUES (${discordUser.uid}, ${discordUser.username}, ${discordUser.avatarURL})
        ON CONFLICT (discord_id) DO UPDATE
          SET discord_username = EXCLUDED.discord_username,
              discord_avatar   = EXCLUDED.discord_avatar,
              updated_at       = now()
        RETURNING id
      `;

      if (!user?.id) {
        throw new Error("Failed to create or fetch user");
      }

      const state = crypto.randomUUID();

      await tx`
        INSERT INTO oauth_states (user_id, state, discord_guild_id, discord_channel_id)
        VALUES (${user.id}, ${state}, ${fromGuildID}, ${fromChannelID})
      `;

      return state;
    });
  } catch (err: any) {
    console.error("Database error in registerUserReq:", {
      message: err.message,
      code: err.code,
      detail: err.detail,
      constraint: err.constraint,
    });

    throw new Error("Failed to register user");
  }
}