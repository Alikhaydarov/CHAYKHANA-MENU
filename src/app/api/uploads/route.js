import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
export const runtime="nodejs";
const TYPES=new Map([["image/png","png"],["image/jpeg","jpg"],["image/webp","webp"]]);
export async function POST(request){if(!(await isAdmin()))return NextResponse.json({error:"Unauthorized"},{status:401});const form=await request.formData(),file=form.get("file");if(!(file instanceof File)||!TYPES.has(file.type)||file.size>5*1024*1024)return NextResponse.json({error:"PNG, JPG yoki WebP rasm 5 MB dan kichik bo‘lishi kerak"},{status:400});const path=`${Date.now()}-${crypto.randomUUID()}.${TYPES.get(file.type)}`;const {error}=await getDb().storage.from("dish-images").upload(path,file,{contentType:file.type,upsert:false});if(error){console.error(error);return NextResponse.json({error:"Rasm yuklanmadi"},{status:500})}const {data}=getDb().storage.from("dish-images").getPublicUrl(path);return NextResponse.json({url:data.publicUrl})}
