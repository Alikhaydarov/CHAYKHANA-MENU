import { NextResponse } from "next/server";
import {getDb,listDishes,mapDish} from "@/lib/db";
import {isAdmin} from "@/lib/auth";
import {validateDish} from "@/lib/validation";
export const runtime="nodejs";
export async function GET(request){
 const admin=new URL(request.url).searchParams.get("admin")==="1";
 if(admin&&!(await isAdmin()))return NextResponse.json({error:"Unauthorized"},{status:401});
 try{return NextResponse.json(await listDishes(admin))}catch(error){console.error(error);return NextResponse.json({error:"Database unavailable"},{status:503})}
}
export async function POST(request){
 if(!(await isAdmin()))return NextResponse.json({error:"Unauthorized"},{status:401});
 let d;
 try{d=validateDish(await request.json())}catch(error){return NextResponse.json({error:error.message},{status:400})}
 const database=getDb(),{data:maxRows}=await database.from("dishes").select("position").order("position",{ascending:false}).limit(1);d.position=(maxRows?.[0]?.position||0)+1;
 const {data,error}=await database.from("dishes").insert(d).select().single();if(error){console.error(error);return NextResponse.json({error:"Saqlashda xato"},{status:500})}
 return NextResponse.json(mapDish(data),{status:201});
}
