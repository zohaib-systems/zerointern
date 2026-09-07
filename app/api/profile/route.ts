import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
const schema = z.object({name:z.string().trim().min(1).max(100)});
export async function PATCH(request:Request) {
 if(request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({error:"Invalid request origin"},{status:403});
 try {
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.json({error:"Sign in to update your profile"},{status:401});
  const parsed=schema.safeParse(await request.json());if(!parsed.success) return NextResponse.json({error:"Enter a name between 1 and 100 characters"},{status:400});
  const {error:authError}=await supabase.auth.updateUser({data:{name:parsed.data.name,full_name:parsed.data.name}});
  if(authError) return NextResponse.json({error:"Unable to save your profile"},{status:500});
  const {data:profile,error}=await supabase.from("users").update({name:parsed.data.name,updated_at:new Date().toISOString()}).eq("id",user.id).select("id").maybeSingle();
  if(error || !profile) return NextResponse.json({error:"Your account name was saved, but the certificate profile could not be updated. Please try saving again."},{status:500});
  return NextResponse.json({success:true});
 } catch {return NextResponse.json({error:"Unable to update your profile"},{status:500});}
}
