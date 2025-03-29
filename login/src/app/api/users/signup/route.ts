// import { connect } from "../../dbConfig/dbConfig";
import { connect } from "@/dbConfig/dbConfig";

import User from "@/models/userModel"
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs"
import { sendEmail } from "@/helpers/mailer";





connect()


export async function POST( request: NextRequest) {
    try {
        const reqBody = await request.json()
        const {username, email, password} = reqBody
        console.log(reqBody) // not for production
        
        

         // Input validation
        //  if (!username || username.trim().length < 3) {
        //     return NextResponse.json({ success: false, error: "Invalid username" }, { status: 400 });
        // }
        // if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        //     return NextResponse.json({ success: false, error: "Invalid email" }, { status: 400 });
        // }
        // if (!password || password.length < 6) {
        //     return NextResponse.json({ success: false, error: "Password must be at least 6 characters long" }, { status: 400 });
        // }

        
        
        
        
        //check if user already exist
        const userEmail = await User.findOne({email})
        const userName = await User.findOne({username})

        
        
        
        if (userEmail) {
            return NextResponse.json({ success: false, error: "Email already exists" }, { status: 400 });
        }
        if (userName) {
            return NextResponse.json({ success: false, error: "Username already exists" }, { status: 400 });
        }
        

        //hash passward
        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password, salt)

        
        
        
        //save user in database

        const newUser = new User({
            username,
            email,
            password:hashedPassword
        })

        const savedUser = await newUser.save()

        console.log(savedUser) //nfp


        // Exclude sensitive fields from response
        // const { password: _, ...userWithoutPassword } = savedUser.toObject();

        // return NextResponse.json({
        //     message: "User Created Successfully",
        //     success: true,
        //     user: userWithoutPassword,
        // });


        // send verification email

        await sendEmail({
            email, // extracted from newUser
            emailType : "VERIFY", 
            userId : savedUser._id,
        })



        return NextResponse.json({
            message:"User Created Successfully",
            success:true,
            savedUser
        })

    } catch (error : any) {
        return NextResponse.json({success: false, error:error.message}, {status:500})
    }
}