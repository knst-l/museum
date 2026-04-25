import Styles from './MuseumWidgetList.module.css';
import { Link } from 'react-router-dom';

export function MuseumWidgetList({ widgets }) {
    return (
        <div className={Styles.MuseumWidgetList}>
            {widgets.map((widget, index) => (
                <Link to={widget.link} key={index} className={Styles.widget}>
                    <div className={Styles.imageContainer}>
                        <img src={widget.imageUrl} alt={widget.text} className={Styles.image} />
                    </div>
                    <p className={Styles.text}>{widget.text}</p>
                </Link>
            ))}
        </div>
    );
} 