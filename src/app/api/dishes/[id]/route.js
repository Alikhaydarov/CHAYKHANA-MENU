import { NextResponse } from "next/server";
import db,{mapDish} from "@/lib/db";
import {isAdmin} from "@/lib/auth";
import {validateDish} from "@/lib/validation";
export const runtime="nodejs";
export async function PUT(request,{params}){
 if(!(await isAdmin()))return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await params;
 if(!/^\d+$/.test(id))return NextResponse.json({error:"Noto‘g‘ri ID"},{status:400});
 let d;try{d=validateDish(await request.json(),{partial:true})}catch(error){return NextResponse.json({error:error.message},{status:400})}
 db.prepare(`UPDATE dishes SET category=?,price=?,image=?,visible=?,position=?,names=?,descriptions=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(d.category,d.price,d.image,d.visible?1:0,d.position,JSON.stringify(d.names),JSON.stringify(d.descriptions),id);
 const row=db.prepare("SELECT * FROM dishes WHERE id=?").get(id);
 return row?NextResponse.json(mapDish(row)):NextResponse.json({error:"Not found"},{status:404});
}
export async function DELETE(_request,{params}){if(!(await isAdmin()))return NextResponse.json({error:"Unauthorized"},{status:401});const {id}=await params;if(!/^\d+$/.test(id))return NextResponse.json({error:"Noto‘g‘ri ID"},{status:400});const result=db.prepare("DELETE FROM dishes WHERE id=?").run(id);return result.changes?NextResponse.json({ok:true}):NextResponse.json({error:"Topilmadi"},{status:404});}
