import { createClient } from "@supabase/supabase-js";
let client;
export function getDb(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error("Supabase environment variables are missing");client??=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});return client}
export function mapDish(row){return {...row,visible:Boolean(row.visible),names:row.names||{},descriptions:row.descriptions||{}}}
export async function listDishes(admin=false){let query=getDb().from("dishes").select("*").order("position").order("id");if(!admin)query=query.eq("visible",true);const {data,error}=await query;if(error)throw error;return data.map(mapDish)}
