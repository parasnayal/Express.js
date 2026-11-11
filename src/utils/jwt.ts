import { SignJWT, jwtVerify } from "jose";

const secret = process.env.JWT_ACCESS_SECRET;

if (!secret) {
  throw new Error("JWT_ACCESS_SECRET is required");
}

const key = new TextEncoder().encode(secret);

const ISSUER = "task-api";
const AUDIENCE = "task-api-users";

export const generateAccessToken = (userId: number): Promise<string> => {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime("2m")
    .sign(key);
};

export const verifyAccessToken = async (token:string):Promise<number> => {
    const {payload} = await jwtVerify(token,key,{
        algorithms:["HS256"],
        issuer:ISSUER,
        audience:AUDIENCE,
        clockTolerance:"5s"
    })

    const userId = Number(payload.sub);

    if(typeof payload.sub !== "string" || !/^[1-9]\d*$/.test(payload.sub) ||
    !Number.isSafeInteger(userId)){
        throw new Error("Invalid token subject");
    }

    return userId;
}
