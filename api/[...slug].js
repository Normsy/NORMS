import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
});

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-secret-key, x-username"
};

function json(res, data, status = 200) {
  return res.status(status).json(data);
}

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateSecretKey() {
  return "NORMS-" +
    crypto.randomUUID()
    .replace(/-/g, "")
    .substring(0, 16)
    .toUpperCase();
}

export default async function handler(req, res) {
  for (const [key, value] of Object.entries(cors)) {
    res.setHeader(key, value);
  }

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { slug = [] } = req.query;
  const pathname = "/" + slug.join("/");
  const client = await pool.connect();

  try {
    // HOME ROUTE
    if (pathname === "/") {
      return json(res, { success: true, name: "NORMS API", status: "online" });
    }

    // LOGIN ROUTE
    if (pathname === "/login" && req.method === "POST") {
      const body = req.body || {};
      const username = body.username?.trim();
      const password = body.password;

      if (!username || !password) {
        return json(res, { success: false, message: "Username and password are required." }, 400);
      }

      const result = await client.query("SELECT * FROM users WHERE username = $1", [username]);
      const user = result.rows[0];

      if (!user) return json(res, { success: false, message: "Invalid username or password." }, 401);

      if (Number(user.is_banned) === 1) {
        return json(res, { success: false, message: "This account has been banned." }, 403);
      }

      const passwordHash = await hashPassword(password);
      if (passwordHash !== user.password) {
        return json(res, { success: false, message: "Invalid username or password." }, 401);
      }

      return json(res, {
        success: true,
        username: user.username,
        secret_key: user.secret_key
      });
    }

    // REGISTER ROUTE
    if (pathname === "/register" && req.method === "POST") {
      const body = req.body || {};
      const username = body.username?.trim();
      const password = body.password;

      if (!username || !password) {
        return json(res, { success: false, message: "Username and password are required." }, 400);
      }

      const existsRes = await client.query("SELECT id FROM users WHERE username = $1", [username]);
      if (existsRes.rows.length > 0) {
        return json(res, { success: false, message: "Username already exists." }, 409);
      }

      const passwordHash = await hashPassword(password);
      const secretKey = generateSecretKey();
      const createdAt = new Date().toISOString();

      await client.query(`
        INSERT INTO users (username, password, secret_key, created_at, is_premium, is_banned, is_admin)
        VALUES ($1, $2, $3, $4, 0, 0, 0)
      `, [username, passwordHash, secretKey, createdAt]);

      return json(res, {
        success: true,
        message: "Account created.",
        secret_key: secretKey
      });
    }

    // UPDATE ROUTE (ROBLOX INVENTORY UPLOAD)
    if (pathname === "/update" && req.method === "POST") {
      const body = req.body || {};
      const secretKey = body.secret_key || body.secret || req.headers["x-secret-key"] || req.query.secret_key || req.query.secret;
      const username = body.username || req.headers["x-username"] || req.query.username;

      if (!secretKey) {
        return json(res, { success: false, message: "Secret key is required." }, 400);
      }

      const userRes = await client.query(`
        SELECT username, secret_key, is_admin, is_banned, is_premium
        FROM users
        WHERE secret_key = $1
      `, [secretKey]);
      const user = userRes.rows[0];

      if (!user) return json(res, { success: false, message: "Invalid secret key." }, 401);

      if (Number(user.is_banned) === 1) {
        return json(res, { success: false, message: "Account is banned." }, 403);
      }

      if (!username) return json(res, { success: false, message: "Roblox username is required." }, 400);

      const owner = user.username;
      const userid = body.userid || req.headers["x-userid"] || req.query.userid || "";
      const sheckles = body.sheckles ?? req.headers["x-sheckles"] ?? req.query.sheckles ?? 0;
      
      let inventory = {};
      if (body.inventory) {
        inventory = body.inventory;
      } else if (req.query.inventory) {
        try { inventory = JSON.parse(req.query.inventory); } catch (e) {}
      }

      const updated = new Date().toISOString();

      await client.query(`
        INSERT INTO inventory (owner_username, roblox_username, roblox_userid, sheckles, inventory_json, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (roblox_username) DO UPDATE SET
          owner_username = EXCLUDED.owner_username,
          roblox_userid = EXCLUDED.roblox_userid,
          sheckles = EXCLUDED.sheckles,
          inventory_json = EXCLUDED.inventory_json,
          updated_at = EXCLUDED.updated_at
      `, [owner, username, userid, sheckles, JSON.stringify(inventory), updated]);

      return json(res, { success: true, message: "Inventory saved successfully." });
    }

    // ACCOUNTS LIST ROUTE (FOR DASHBOARD)
    if (pathname === "/accounts") {
      const secretKey = req.query.secret_key || req.query.secret;
      if (!secretKey) {
        return json(res, { success: false, message: "Secret key is required." }, 400);
      }

      const userRes = await client.query(`
        SELECT username, secret_key, created_at, is_admin, is_banned, is_premium
        FROM users
        WHERE secret_key = $1
      `, [secretKey]);
      const user = userRes.rows[0];

      if (!user) {
        return json(res, { success: false, message: "Invalid secret key." }, 401);
      }

      if (Number(user.is_banned) === 1) {
        return json(res, { success: false, message: "Account is banned." }, 403);
      }

      const isAdmin = user.username === "Admin" || user.username === "Admin1" || Number(user.is_admin) === 1;
      let isPremium = isAdmin || Number(user.is_premium) === 1;
      if (user.username === "Admin" || user.username === "Admin1") {
        isPremium = true;
      }

      let accounts = [];
      try {
        const result = await client.query(`
          SELECT roblox_username, roblox_userid, sheckles, inventory_json, updated_at
          FROM inventory
          WHERE owner_username = $1
          ORDER BY sheckles DESC
        `, [user.username]);
        accounts = result.rows || [];
      } catch (e) {
        accounts = [];
      }

      const parsedAccounts = accounts.map(acc => {
        let parsedInventory = {};
        try {
          parsedInventory = JSON.parse(acc.inventory_json || "{}");
        } catch (e) {
          parsedInventory = {};
        }
        return {
          roblox_username: acc.roblox_username,
          roblox_userid: acc.roblox_userid,
          sheckles: acc.sheckles,
          inventory: parsedInventory,
          updated_at: acc.updated_at
        };
      });

      return json(res, {
        success: true,
        user: {
          username: user.username,
          created_at: user.created_at,
          is_admin: isAdmin,
          is_premium: isPremium
        },
        accounts: parsedAccounts
      });
    }

    // ADMIN: GET ALL USERS
    if (pathname === "/admin/users" || pathname === "/admin/get-users" || pathname === "/admin/list-users" || pathname === "/admin/users-list") {
      let secretKey = req.query.secret_key || req.query.secret;
      if (!secretKey && req.method === "POST") {
        const body = req.body || {};
        secretKey = body.secret_key || body.secret;
      }

      if (!secretKey) return json(res, { success: false, message: "Secret key is required." }, 400);

      const userRes = await client.query(`
        SELECT username, secret_key, created_at, is_admin, is_banned, is_premium
        FROM users
        WHERE secret_key = $1
      `, [secretKey]);
      const user = userRes.rows[0];

      if (!user || (user.username !== "Admin" && user.username !== "Admin1" && Number(user.is_admin) !== 1)) {
        return json(res, { success: false, message: "Unauthorized." }, 403);
      }

      let allUsers = [];
      try {
        const resList = await client.query("SELECT username, created_at, is_premium, is_banned, is_admin FROM users");
        allUsers = resList.rows || [];
      } catch (e) {
        allUsers = [];
      }

      return json(res, { success: true, users: allUsers });
    }

    // ADMIN GRANT PREMIUM ROUTE
    if (pathname === "/admin/grant-premium" || pathname === "/admin/grant" || pathname === "/admin/premium") {
      const body = req.body || {};
      const secretKey = body.secret_key || body.secret || req.query.secret_key;
      const targetUsername = (body.target_username || body.username || req.query.target_username)?.trim();

      if (!secretKey) return json(res, { success: false, message: "Secret key is required." }, 400);

      const userRes = await client.query(`
        SELECT username, secret_key, created_at, is_admin, is_banned, is_premium
        FROM users
        WHERE secret_key = $1
      `, [secretKey]);
      const user = userRes.rows[0];

      if (!user || (user.username !== "Admin" && user.username !== "Admin1" && Number(user.is_admin) !== 1)) {
        return json(res, { success: false, message: "Unauthorized." }, 403);
      }

      if (!targetUsername) return json(res, { success: false, message: "Target username is required." }, 400);

      await client.query(`UPDATE users SET is_premium = 1 WHERE username = $1`, [targetUsername]);

      return json(res, { success: true, message: `Successfully granted premium to ${targetUsername}` });
    }

    // ADMIN BAN / UNBAN USER ROUTE
    if (pathname === "/admin/ban" || pathname === "/admin/unban" || pathname === "/admin/ban-user") {
      const body = req.body || {};
      const secretKey = body.secret_key || body.secret || req.query.secret_key;
      const targetUsername = (body.target_username || body.username || req.query.target_username)?.trim();
      
      let banStatus = 1;
      if (pathname === "/admin/unban") {
        banStatus = 0;
      } else if (body.banned !== undefined) {
        banStatus = body.banned ? 1 : 0;
      } else if (body.ban !== undefined) {
        banStatus = body.ban ? 1 : 0;
      } else if (body.action === "unban") {
        banStatus = 0;
      } else if (body.status !== undefined) {
        banStatus = Number(body.status);
      }

      if (!secretKey) return json(res, { success: false, message: "Secret key is required." }, 400);

      const userRes = await client.query(`
        SELECT username, secret_key, created_at, is_admin, is_banned, is_premium
        FROM users
        WHERE secret_key = $1
      `, [secretKey]);
      const user = userRes.rows[0];

      if (!user || (user.username !== "Admin" && user.username !== "Admin1" && Number(user.is_admin) !== 1)) {
        return json(res, { success: false, message: "Unauthorized." }, 403);
      }

      if (!targetUsername) return json(res, { success: false, message: "Target username is required." }, 400);
      if (targetUsername === "Admin" || targetUsername === "Admin1") {
        return json(res, { success: false, message: "Cannot ban main admin accounts." }, 400);
      }

      await client.query(`UPDATE users SET is_banned = $1 WHERE username = $2`, [banStatus, targetUsername]);

      return json(res, { success: true, message: `Successfully updated ban status for ${targetUsername}` });
    }

    // DELETE ACCOUNT ROUTE
    if (pathname === "/delete-account" && req.method === "POST") {
      const body = req.body || {};
      const secretKey = body.secret_key;
      const robloxUsername = body.roblox_username;

      if (!secretKey) return json(res, { success: false, message: "Secret key is required." }, 400);

      const userRes = await client.query(`
        SELECT username, secret_key, created_at, is_admin, is_banned, is_premium
        FROM users
        WHERE secret_key = $1
      `, [secretKey]);
      const user = userRes.rows[0];

      if (!user) return json(res, { success: false, message: "Invalid secret key." }, 401);
      if (!robloxUsername) return json(res, { success: false, message: "Roblox username is required." }, 400);

      await client.query(`
        DELETE FROM inventory 
        WHERE owner_username = $1 AND roblox_username = $2
      `, [user.username, robloxUsername]);

      return json(res, { success: true, message: "Account deleted successfully." });
    }

    // CHANGE PASSWORD ROUTE
    if ((pathname === "/change-password" || pathname === "/api/change-password") && req.method === "POST") {
      const body = req.body || {};
      const secretKey = body.secret_key;
      const oldPassword = body.old_password;
      const newPassword = body.new_password;

      if (!secretKey || !oldPassword || !newPassword) {
        return json(res, { success: false, message: "Missing fields." }, 400);
      }

      const userRes = await client.query("SELECT * FROM users WHERE secret_key = $1", [secretKey]);
      const user = userRes.rows[0];

      if (!user) {
        return json(res, { success: false, message: "Invalid secret key." }, 401);
      }

      const oldPasswordHash = await hashPassword(oldPassword);
      if (oldPasswordHash !== user.password) {
        return json(res, { success: false, message: "Wrong current password." }, 401);
      }

      const newPasswordHash = await hashPassword(newPassword);

      await client.query("UPDATE users SET password = $1 WHERE secret_key = $2", [newPasswordHash, secretKey]);

      return json(res, { success: true, message: "Password updated." });
    }

    // ACCOUNT SETTINGS
    if (pathname === "/account/settings") {
      let secretKey = req.query.secret_key || req.headers["x-secret-key"];

      if (req.method === "POST") {
        const body = req.body || {};
        secretKey = body.secret_key || secretKey;

        if (!secretKey) {
          return json(res, { success: false, message: "Secret key is required." }, 400);
        }

        const userRes = await client.query(`
          SELECT settings_json FROM users WHERE secret_key = $1
        `, [secretKey]);
        const user = userRes.rows[0];

        if (!user) {
          return json(res, { success: false, message: "Invalid secret key." }, 401);
        }

        let settings = user.settings_json
          ? JSON.parse(user.settings_json)
          : { AutoBuySeeds: false, AutoBuyGears: false, AutoCatchPets: false };

        if (body.feature === "seeds") settings.AutoBuySeeds = body.enabled;
        if (body.feature === "gears") settings.AutoBuyGears = body.enabled;
        if (body.feature === "pets") settings.AutoCatchPets = body.enabled;

        await client.query(`
          UPDATE users SET settings_json = $1 WHERE secret_key = $2
        `, [JSON.stringify(settings), secretKey]);

        return json(res, { success: true, settings });
      }

      if (!secretKey) {
        return json(res, { success: false, message: "Secret key is required." }, 400);
      }

      const userRes = await client.query(`
        SELECT settings_json FROM users WHERE secret_key = $1
      `, [secretKey]);
      const user = userRes.rows[0];

      if (!user) {
        return json(res, { success: false, message: "Invalid secret key." }, 401);
      }

      let settings = user.settings_json
        ? JSON.parse(user.settings_json)
        : { AutoBuySeeds: false, AutoBuyGears: false, AutoCatchPets: false };

      return json(res, { success: true, settings });
    }

    return json(res, {
      success: false,
      message: "Endpoint not found.",
      path: pathname,
      method: req.method
    }, 404);

  } catch (err) {
    console.error(err);
    return json(res, { success: false, message: "Internal server error" }, 500);
  } finally {
    client.release();
  }
}

