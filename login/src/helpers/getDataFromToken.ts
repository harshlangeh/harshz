import { NextRequest } from "next/server";
import jwt  from "jsonwebtoken";

export const getDataFromToken = (request : NextRequest)  => {
    try {

        // encoded token
        const token  = request.cookies.get('token')?.value || "" ;

        if (!token) {
            console.error("No token found in cookies");
            return null;
        }

        // decoded token
       const decodedToken : any = jwt.verify(token, process.env.TOKEN_SECRET!);
       return decodedToken.id;
    } catch (error: any) {
        throw new Error(error.message)
    }
}