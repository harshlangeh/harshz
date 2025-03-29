"use client";
import Link from "next/link";
import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function SignupPage () {

    const router = useRouter()

    const [user, setUser] = React.useState({
        email : "",
        password : "",
        username : ""
    })

    const [buttonDisabled, setbuttonDisabled] = useState(false);
    const [loading, setLoading] = useState(false)


    // const onSignup = async () => {
    //     // if(user.email.length <= 0 && user.password.length <= 0 && user.username.length <= 0){
    //     //     alert("Add valid Username and password")
    //     // }

    //     try {
    //         setLoading(true)
    //         // const response = await axios.post("api/users/signup", user);
    //         const response = await axios.post("/api/users/signup", user);
    //         console.log("Signup Success", response.data)
    //         router.push("/login")
              
    //     } catch (error : any) {
    //         console.log("Signup failed ",error.message)
    //         toast.error(error.response?.data?.error || "Something went wrong while signup!")
    //     } finally {
    //         setLoading(false)
    //     }
    // }


    const validateInputs = () => {
        if (!/^\S+@\S+\.\S+$/.test(user.email)) {
            toast.error("Please enter a valid email");
            return false;
        }
        if (user.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return false;
        }
        if (user.username.length < 3) {
            toast.error("Username must be at least 3 characters");
            return false;
        }
        return true;
    };

    const onSignup = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!validateInputs()) return;

        try {
            setLoading(true);
            const response = await axios.post("/api/users/signup", user);
            console.log("Signup Success", response.data);
            toast.success("Signup successful!" , {position: "bottom-center"});
            router.push("/login");
        } catch (error: any) {
            console.log("Signup failed", error);
            toast.error(error.response?.data?.error || "Something went wrong!" , {position: "bottom-center"});
        } finally {
            setLoading(false);
        }
    };

   


    

    useEffect(() => {

       

        if(user.email.length > 0 && user.password.length > 0 && user.username.length > 0){
            setbuttonDisabled(false)
        } else {
            setbuttonDisabled(true)
        }
        
    }, [user])

    return (

        <div className="flex flex-col items-center justify-center min-h-screen py-2 ">
            <h1>Sign Up</h1>
            <hr />

            <label htmlFor="username">Username</label>
            <input
            className="p-2 rounded-lg mb-4 text-black"
            id="username"
            type="text"
            value={user.username}
            onChange={(e)=> setUser({...user, username : e.target.value})}
            placeholder="Username"
            />

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
            onClick={onSignup}
            >
            {loading ? "Processing..." : "Sign Up"}
            </button>

            <Link href="/login">Visit Login Page</Link>

            <Toaster/>


        </div>
    )
}