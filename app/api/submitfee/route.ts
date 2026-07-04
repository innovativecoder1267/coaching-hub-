import { createClient } from "@/lib/supabase/supabase.client";


export async function POST(request:Request){
    const supabase=createClient()
    const {student,amount,method}=await request.json();
    const {data,error}=await supabase.from("fees").insert({
        student,
        amount,
        method
    })
    if(error){
        console.log("SUPABASE ERROR:", error);
        return new Response(JSON.stringify({error:error}), { status: 500 });
    }
    return new Response(JSON.stringify({message:"Fees recorded successfully"}), { status: 200 })
}
