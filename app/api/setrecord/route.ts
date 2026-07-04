import supabase from "@/lib/supabase/supabase.client";
export async function POST(req:Request){
    try {
        const { student,amount,status,paymentMethod}=await req.json()
        const {data,error}=await supabase.from("payments").insert({
            student,
            amount,
            status,
            method:paymentMethod,
            payment_date:new Date().toISOString(),
            month:new Date().toLocaleString('default', { month: 'long' }),
        })
        if(error){
            console.error("Error inserting payment:", error)
            return new Response('Failed to record payment', { status: 500 })
        }   
        return new Response('Payment recorded successfully', { status: 200 })
    } catch (error) {
        console.error('Error recording payment:', error)
        return new Response('Failed to record payment', { status: 500 })
    }
}