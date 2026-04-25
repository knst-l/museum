import { useNavigate } from 'react-router-dom';

import Styles from './ArtifactCard.module.css';

export function ArtifactCard({ artifact }) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/artifact/${artifact.id}`);
    };

    const title = artifact.title || "Без названия";
    const year = artifact.year || "";
    const image = artifact.image || "/logo192.png";
    const imagePosition = artifact.imagePosition || "50% 50%";

    return (
        <div className={Styles.card} onClick={handleClick}>
            <div className={Styles.imageContainer}>
                <img src={image} alt={title} className={Styles.image} style={{ objectPosition: imagePosition }} />
            </div>
            <div className={Styles.content}>
                <h3 className={Styles.title}>{title}</h3>
                {year && <p className={Styles.year}>{year}</p>}
            </div>
        </div>
    );
}
