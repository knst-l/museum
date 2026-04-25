import Styles from "./ItemCard.module.css"

export function ItemCard({imageUrl, imagePosition = "50% 50%", link, personName}){
    return (
        <div className={Styles.ItemCard}>
            <a href={link}>
                <img src={imageUrl} alt={personName} style={{ objectPosition: imagePosition }}/>
            </a>
            <p>{personName}</p>
        </div>
    )
}
