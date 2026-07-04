import supabase from "@/lib/supabase/supabase.client";

export async function POST(req: Request) {
  const { name, email,rollno,subject,studentclass,monthlyFee,admin } = await req.json();
  console.log("Email is",email,name,rollno,subject,studentclass,monthlyFee,admin);
  console.log("REQ RECEIVED");
  const {data,error}=await supabase
  .from("student")
  .insert([{ name, email,rollno,subject,studentclass,monthlyFee,admin_info:admin }]);
    if(error){
        console.log("SUPABASE ERROR:", error);

        return new Response(JSON.stringify({error:error}),{status:500})
    }

  return new Response(JSON.stringify(data), {
    status: 200,
  });
}