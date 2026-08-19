import crypto from "crypto";
import { cookies } from "next/headers";
const COOKIE="chaykahana_admin";
const secret=()=>{const value=process.env.AUTH_SECRET||(process.env.NODE_ENV==="development"?"dev-only-change-this-secret":"");if(!value)throw new Error("AUTH_SECRET is not configured");return value};
export function signSession(){
 const exp=Date.now()+1000*60*60*12;
 const body=String(exp);const sig=crypto.createHmac("sha256",secret()).update(body).digest("hex");
 return body+"."+sig;
}
export function verifySession(token){
 if(!token)return false;const [body,sig]=token.split(".");if(!body||!sig||Number(body)<Date.now())return false;
 const expected=crypto.createHmac("sha256",secret()).update(body).digest("hex");
 try{return crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected))}catch{return false}
}
export async function isAdmin(){const store=await cookies();return verifySession(store.get(COOKIE)?.value)}
export async function setAdminCookie(token){const store=await cookies();store.set(COOKIE,token,{httpOnly:true,sameSite:"strict",secure:process.env.NODE_ENV==="production",path:"/",maxAge:60*60*12})}
export async function clearAdminCookie(){const store=await cookies();store.set(COOKIE,"",{httpOnly:true,path:"/",maxAge:0})}
export {COOKIE};
