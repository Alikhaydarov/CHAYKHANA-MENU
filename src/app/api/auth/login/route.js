import crypto from "crypto";import {NextResponse} from "next/server";import {setAdminCookie,signSession} from "@/lib/auth";
const attempts=new Map();const WINDOW=15*60*1000,MAX=5;
export async function POST(request){
 const ip=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||request.headers.get("x-real-ip")||"local";
 const now=Date.now(),entry=attempts.get(ip);if(entry&&entry.until>now&&entry.count>=MAX)return NextResponse.json({error:"Juda ko‘p urinish. 15 daqiqadan keyin qayta urinib ko‘ring."},{status:429,headers:{"Retry-After":String(Math.ceil((entry.until-now)/1000))}});
 let password;try{({password}=await request.json())}catch{return NextResponse.json({error:"Noto‘g‘ri so‘rov"},{status:400})}
 const expected=process.env.ADMIN_PASSWORD||(process.env.NODE_ENV==="development"?"chaykahana-admin":"");
 if(!expected)return NextResponse.json({error:"Serverda ADMIN_PASSWORD sozlanmagan"},{status:503});
 const a=Buffer.from(String(password??"")),b=Buffer.from(String(expected));const valid=a.length===b.length&&a.length>0&&crypto.timingSafeEqual(a,b);
 if(!valid){const next=!entry||entry.until<=now?{count:1,until:now+WINDOW}:{count:entry.count+1,until:entry.until};attempts.set(ip,next);return NextResponse.json({error:"Parol noto‘g‘ri"},{status:401})}
 attempts.delete(ip);await setAdminCookie(signSession());return NextResponse.json({ok:true})
}
