import { getDataFromToken } from "@/helpers/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig"; 


// database connect
connect() ;


export async function GET(request:NextRequest) {

    try {

        console.log("Cookies:", request.headers.get("cookie"));  // Debugging

        const userId = await getDataFromToken(request);
        const user = await User.findOne({_id : userId}).select("-password");

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        
        return NextResponse.json({message:"User Found", data:user});
        
    } catch (error:any) {
        return NextResponse.json({error:error.message}, {status:400});
    }
    
}