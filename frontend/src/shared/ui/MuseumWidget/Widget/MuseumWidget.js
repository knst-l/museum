import { Link } from "react-router-dom"
import Styles from "./MuseumWidget.module.css"

export function MuseumWidget({href, imageUrl, imagePosition = "50% 50%", text}) {

    return (
        <div className={Styles.MuseumWidget} style={{backgroundImage: `url(${imageUrl})`, backgroundPosition: imagePosition}}>
            <Link to={href}>
                <div className={Styles.ContentWrapper}>
                    <p>{text}</p>
                </div>
            </Link>
        </div>
    )
}
