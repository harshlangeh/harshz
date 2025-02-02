"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage () {

    const router = useRouter();

    const [user, setUser] = useState({
        email : "",
        password : "",
    })

    const [buttonDisabled, setbuttonDisabled] = useState(false);

    const [loading, setLoading] = useState(false);


    const onLogin = async () => {
        try {
            setLoading(true)
            const response = await axios.post("/api/users/login", user);
            console.log("Login Success", response.data);
            toast.success("Login Successful");
            router.push("/profile");

            
        } catch (error:any) {
            console.log("Login Failed", error.message);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if(user.email.length >0 && user.password.length>0){
            setbuttonDisabled(false);
        } else {
            setbuttonDisabled(true);
        }
    }, [user])

    return (

        <div className="flex flex-col items-center justify-center min-h-screen py-2 ">
            <h1>Sign Up</h1>
            <hr />

            <label htmlFor="email">Email</label>
            <input 
            className="p-2 rounded-lg mb-4 text-black"
            type="text" 
            id="email" 
            value={user.email}
            onChange={(e) => setUser({...user, email : e.target.value})}
            placeholder="Email"
            />

            <label htmlFor="password">Password</label>
            <input 
            className="p-2 rounded-lg mb-4 text-black"
            type="password" 
            id="password" 
            value={user.password}
            onChange={(e) => setUser({...user, password : e.target.value})}
            placeholder="Password"
            />

            <button
            className="p-2 rounded-lg mb-4 border border-gray-300 "
            onClick={onLogin}
            >
            {loading? "Processing" : "Login"}
            </button>

            <Link href="/signup">Visit Sign Up Pge</Link>

            <Toaster/>


        </div>
    )
}