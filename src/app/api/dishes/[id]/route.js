import { NextResponse } from "next/server";
import db,{mapDish} from "@/lib/db";
import {isAdmin} from "@/lib/auth";
export const runtime="nodejs";
export async function PUT(request,{params}){
 if(!(await isAdmin()))return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params,d=await request.json();
 db.prepare(`UPDATE dishes SET category=?,price=?,image=?,visible=?,position=?,names=?,descriptions=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(d.category,Number(d.price)||0,d.image,d.visible?1:0,Number(d.position)||0,JSON.stringify(d.names),JSON.stringify(d.descriptions),id);
 const row=db.prepare("SELECT * FROM dishes WHERE id=?").get(id);
 return row?NextResponse.json(mapDish(row)):NextResponse.json({error:"Not found"},{status:404});
}
export async function DELETE(_request,{params}){if(!(await isAdmin()))return NextResponse.json({error:"Unauthorized"},{status:401});const {id}=await params;db.prepare("DELETE FROM dishes WHERE id=?").run(id);return NextResponse.json({ok:true});}
