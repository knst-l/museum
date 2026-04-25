import { useState } from "react";
import Styles from "./Header.module.css";

export function NavBar({navigationButtons}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                className={`${Styles.MenuToggle} ${isOpen ? Styles.MenuToggleOpen : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Открыть меню"
                aria-expanded={isOpen}
            >
                <span></span>
                <span></span>
                <span></span>
            </button>
            <div className={`${Styles.NavBar} ${isOpen ? Styles.NavBarOpen : ''}`}>
                <div className={Styles.NavSection}>
                    {navigationButtons.map((element, index) =>
                        <a href={element[1]} key={index} onClick={() => setIsOpen(false)}>
                            <p>{element[0]}</p>
                        </a>
                    )}
                </div>
            </div>
        </>
    )
}