import Styles from "./ItemCardList.module.css";
import {ItemCard} from "../Card/ItemCard";

export function ItemCardList({persons, noWrap = false}) {

    return (
        <div className={`${Styles.ItemCardList} ${noWrap ? Styles.ItemCardListNoWrap : ''}`}>
            {persons.map((personData, index) =>
                <ItemCard
                    key={index}
                    imageUrl={personData.imageUrl}
                    imagePosition={personData.imagePosition}
                    personName={personData.personName}
                    link={personData.link}
                />
            )}
        </div>
    )
}
