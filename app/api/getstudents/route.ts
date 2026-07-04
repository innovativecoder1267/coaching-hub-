import supabase from "@/lib/supabase/supabase.client";
import { NextResponse } from "next/server";

export async function GET() {
    const { data,error}=await supabase.from("student").select("*");
    if(error){
        console.log("SUPABASE ERROR:", error);
        return NextResponse.json({error:error}, { status: 500 });
    }
    return NextResponse.json(data, { status: 200 })
}