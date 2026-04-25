import Styles from './Header.module.css';
import {NavBar} from "./NavBar";
import {Logo} from "../../shared/ui";

const navigationButtons = [
    ["Главная", "/home"],
    ["Экскурсии", "/excursions"],
    ["Исторические личности", "/historical_figures"],
    ["Залы с экспонатами", "/halls"]
]


export function Header() {

    return (
        <header className={Styles.Header}>
            <div className="HeaderContent">
                <Logo/>
                <NavBar navigationButtons={navigationButtons}/>
            </div>
        </header>
    )
}