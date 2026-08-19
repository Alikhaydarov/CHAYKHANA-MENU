import { NextResponse } from "next/server";
import db,{mapDish} from "@/lib/db";
import {isAdmin} from "@/lib/auth";
export const runtime="nodejs";
export async function GET(request){
 const admin=new URL(request.url).searchParams.get("admin")==="1";
 if(admin&&!(await isAdmin()))return NextResponse.json({error:"Unauthorized"},{status:401});
 const rows=db.prepare(`SELECT * FROM dishes ${admin?"":"WHERE visible=1"} ORDER BY position,id`).all();
 return NextResponse.json(rows.map(mapDish));
}
export async function POST(request){
 if(!(await isAdmin()))return NextResponse.json({error:"Unauthorized"},{status:401});
 const d=await request.json();
 const max=db.prepare("SELECT COALESCE(MAX(position),0) m FROM dishes").get().m;
 const result=db.prepare("INSERT INTO dishes(category,price,image,visible,position,names,descriptions) VALUES(?,?,?,?,?,?,?)").run(d.category||"Osh",Number(d.price)||0,d.image||"/assets/osh.png",d.visible===false?0:1,max+1,JSON.stringify(d.names||{uz:"Yangi taom",ko:"",ru:"",en:""}),JSON.stringify(d.descriptions||{uz:"",ko:"",ru:"",en:""}));
 return NextResponse.json(mapDish(db.prepare("SELECT * FROM dishes WHERE id=?").get(result.lastInsertRowid)),{status:201});
}
