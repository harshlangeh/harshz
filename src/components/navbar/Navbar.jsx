import Links from "./links/Links.jsx"
import styles from "./navbar.module.css"

const Navbar = () => {
    return (
        <div className={styles.container}>
            <div className="logo">Logo</div>

            <Links/>

        </div>
    )
};

export default Navbar;