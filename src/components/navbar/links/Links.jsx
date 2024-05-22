
import React from 'react'
import Link from 'next/link'
import NavLinks from './navLinks/navLinks'
import styles from "./links.module.css"

const Links = () => {

    const links = [
        {
            title : "Homepage",
            path: "/"
        },
        {
            title : "About",
            path: "/About"
        },
        {
            title : "Contact",
            path: "/Contact"
        },
        {
            title : "Blog",
            path: "/Blog"
        },
        {
            title : "Terms",
            path: "/Terms"
        },
    ]

    console.log("pppp",links)


    return (
        <div className={styles.links}>
            {links.map((link)=>(
                <NavLinks item={link} key={link.title}/>
            ))}
        </div>
    )
}

export default Links;


// <Link href={link.path} key={link.title} >{link.title}</Link>