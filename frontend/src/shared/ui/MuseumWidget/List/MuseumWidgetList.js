import Styles from "./MuseumWidgetList.module.css"
import {MuseumWidget} from "../Widget/MuseumWidget";

export function MuseumWidgetList({widgets}) {

    return (
        <div className={Styles.MuseumWidgetList}>
            {widgets.map((section, index) =>
                <MuseumWidget
                    key={index}
                    href={section.link}
                    imageUrl={section.imageUrl}
                    imagePosition={section.imagePosition}
                    text={section.text}
                />
            )}
        </div>
    )
}
