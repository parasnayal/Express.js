import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./database.ts";

const pgSession = connectPgSimple(session);

const isProduction = process.env.NODE_ENV === "production";

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error("SESSION_SECRET must be configured securely");
}

export const cookieName = isProduction ? "__Host-sid" : "sid";

export const sessionMiddleware = session({
  name: cookieName,
  secret: sessionSecret,
  store: new pgSession({
    pool: pool,
    tableName: "user_sessions",
    createTableIfMissing: !isProduction,
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: false,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 60 * 1000,
  },
});
