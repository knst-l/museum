import Styles from "./Logo.module.css";

export function Logo() {
    return (
        <div className={Styles.Logo}>
            <a href="/">
                <img src="/logo512.png" alt="Логотип"></img>
            </a>
            <p>Музей вычислительной техники ИрНИТУ</p>
        </div>
    )
}