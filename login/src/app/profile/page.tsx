"use client"

import axios from "axios"
import Link from "next/link"
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function ProfilePage(){

    const router = useRouter()

    const [data, setData] = useState("nothing")

    const logout = async () => {
        try {

            await axios.get('api/users/logout')
            toast.success("Logout Successful", {position: "bottom-center"})
            router.push("/login")

        } catch (error:any) {
            console.log(error.message)
            toast.error(error.message, {position: "bottom-center"})
        }

    }

    const getUserDetails = async () => {
        const res = await axios.get('/api/users/me');
        console.log("res.data=>",res.data);
        console.log("res.data.data._id=>", res.data.data._id);
        setData(res.data.data._id)

    }



    return (
        <div>
            <h1>Profile</h1>
            <hr />
            <h2>Profile Page</h2>
            <h3 className=" p-3 rounded bg-green-300">
                {data === "nothing" ? "nothing" : <Link href={`/profile/${data}`}>{data}</Link>}
            </h3>
            <hr />
            <button onClick={logout} className="bg-blue-500 text-white">Logout</button>
            <button onClick={getUserDetails} className="bg-green-500 text-white">Get User Details</button>
            <Toaster/>     
        </div>

    )
}