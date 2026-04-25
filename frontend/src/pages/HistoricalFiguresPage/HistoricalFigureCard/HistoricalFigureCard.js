import Styles from './HistoricalFigureCard.module.css';
import {Link} from "react-router-dom";
import { resolveMediaUrl } from '../../../shared/const/api';

export function HistoricalFigureCard({figure}) {
    // Извлекаем год из birth_date
    let birthYear = null;
    if (figure.birth_date) {
        if (typeof figure.birth_date === 'string') {
            birthYear = figure.birth_date.split('-')[0];
        } else if (figure.birth_date instanceof Date) {
            birthYear = figure.birth_date.getFullYear().toString();
        }
    }

    // Извлекаем год из death_date
    let deathYear = null;
    if (figure.death_date) {
        if (typeof figure.death_date === 'string') {
            deathYear = figure.death_date.split('-')[0];
        } else if (figure.death_date instanceof Date) {
            deathYear = figure.death_date.getFullYear().toString();
        }
    }

    // Формируем строку с годами жизни
    const yearsString = birthYear && deathYear 
        ? `${birthYear} - ${deathYear}`
        : birthYear 
        ? `род. ${birthYear}`
        : '';

    // Получаем первое изображение из массива images
    const imageData = figure.images && figure.images.length > 0
        ? figure.images[0]
        : null;
    const imageUrl = imageData
        ? resolveMediaUrl(imageData.image_url || imageData.image || '')
        : '';
    const imageStyle = imageData?.object_position
        ? { objectPosition: imageData.object_position }
        : undefined;

    // Получаем описание (биографию)
    const description = figure.biography || figure.description || '';

    return (
        <Link to={`/historical_figures/${figure.id}`} className={Styles.Card}>
            <div className={Styles.ImageContainer}>
                {imageUrl && (
                    <img src={imageUrl} alt={figure.full_name} className={Styles.Image} style={imageStyle}/>
                )}
            </div>
            <div className={Styles.Content}>
                <h3 className={Styles.Name}>{figure.full_name}</h3>
                {yearsString && <p className={Styles.Years}>{yearsString}</p>}
                {description && <p className={Styles.Description}>{description}</p>}
            </div>
        </Link>
    );
} 
