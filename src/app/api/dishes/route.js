import { NextResponse } from "next/server";
import db,{mapDish} from "@/lib/db";
import {isAdmin} from "@/lib/auth";
import {validateDish} from "@/lib/validation";
export const runtime="nodejs";
export async function GET(request){
 const admin=new URL(request.url).searchParams.get("admin")==="1";
 if(admin&&!(await isAdmin()))return NextResponse.json({error:"Unauthorized"},{status:401});
 const rows=db.prepare(`SELECT * FROM dishes ${admin?"":"WHERE visible=1"} ORDER BY position,id`).all();
 return NextResponse.json(rows.map(mapDish));
}
export async function POST(request){
 if(!(await isAdmin()))return NextResponse.json({error:"Unauthorized"},{status:401});
 let d;
 try{d=validateDish(await request.json())}catch(error){return NextResponse.json({error:error.message},{status:400})}
 const max=db.prepare("SELECT COALESCE(MAX(position),0) m FROM dishes").get().m;
 const result=db.prepare("INSERT INTO dishes(category,price,image,visible,position,names,descriptions) VALUES(?,?,?,?,?,?,?)").run(d.category,d.price,d.image,d.visible?1:0,max+1,JSON.stringify(d.names),JSON.stringify(d.descriptions));
 return NextResponse.json(mapDish(db.prepare("SELECT * FROM dishes WHERE id=?").get(result.lastInsertRowid)),{status:201});
}
