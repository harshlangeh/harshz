// creating api for email verification at backend

import { connect } from "@/dbConfig/dbConfig";
import { NextResponse, NextRequest } from "next/server";
import User from "@/models/userModel";
import { error } from "console";




connect()

export async function POST(request : NextRequest) {
    try {

        const reqBody = await request.json()
        const {token} = reqBody
        console.log(token)

        const user = User.findOne({verifyToken : token, 
            verifyTokenExpiry : {$gt : Date.now()}
        });

        if(!user){
            return NextResponse.json({error:"Invalid Token"}, {status:400})
        }

        user.isVerified = true;
        user.verifyToken = undefined;
        user.verifyTokenExpiry = undefined;
        await user.save()

        console.log(user)

        return NextResponse.json({
            message : "Email verified Successfully",
            success : true
        })
        
    } catch (error:any) {
        return NextResponse.json({error:error.message}, {status:500})
    }
}