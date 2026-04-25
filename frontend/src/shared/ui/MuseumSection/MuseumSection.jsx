import Styles from "./MuseumSection.module.css"

export function MuseumSection({title, description, link, linkText, children}) {
    return (
        <div className={Styles.MuseumSection}>
            <h2 className="title">{title}</h2>
            <div className={Styles.SectionMainContent}>
                <p className="text">{description}</p>
                {children}
            </div>
            <a href={link} className="link">
                {linkText}
            </a>
        </div>
    )
}