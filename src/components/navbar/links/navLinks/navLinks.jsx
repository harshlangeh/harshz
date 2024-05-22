'use client';
import React from 'react'
import styles from './navlinks.module.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Links from "../Links"

const NavLinks = ({item}) => {
    const pathName = usePathname();
    console.log('NavLinks item:', item);
    console.log('NavLinks path:', item.path);
    console.log('NavLinks title:', item.title);
  return (
        <Link 
        href={item.path}  
        className={`${styles.container} ${pathName === item.path && styles.active}`} 
        >
        {item.title}
        </Link>
    
  )
}

export default NavLinks;