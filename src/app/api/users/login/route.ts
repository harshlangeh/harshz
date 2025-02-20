import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel"
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"


connect()


export async function POST(request:NextRequest) {
    try {


        console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("TOKEN_SECRET:", process.env.TOKEN_SECRET);
console.log("DOMAIN:", process.env.DOMAIN);




        const reqBody = await request.json()
        const {email,password} = reqBody
        console.log(reqBody)

         // check if user exist
        const user = await User.findOne({email});
        if (!user) {
            return NextResponse.json({error:"User does not exist"}, {status:400})
        }


        // check if passward is correct
        const validPassword = await bcryptjs.compare(password, user.password)

        if (!validPassword) {
            return NextResponse.json({error: "Invalid password"}, {status:400})
        }

        //create token data
        const tokenData = {
            id : user._id,
            username : user.usernmae,
            email : user.email
        }

        // create token
        const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET!, {expiresIn : "1d" })

        const response = NextResponse.json({message: "Login Successful", success: "true"})

        response.cookies.set("token", token, {httpOnly: true})

        return response

       
    } catch (error:any) {
        return NextResponse.json({error: error.messsage}, {status:500})
        
    }

   





}