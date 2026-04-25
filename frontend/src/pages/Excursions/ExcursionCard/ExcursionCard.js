import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ExcursionCard.module.css';

export function ExcursionCard({ excursion }) {
    const navigate = useNavigate();

    const handleOpen = () => {
        if (excursion.link) {
            navigate(excursion.link);
        }
    };

    const isVirtualTour = excursion.previewType === 'virtual-tour';

    return (
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                {isVirtualTour ? (
                    <div className={styles.tourPreview}>
                        <div className={styles.tourGlow}></div>
                        <div className={styles.tourGrid}></div>
                        <div className={styles.tourPanel}>
                            <span className={styles.tourBadge}>3D-тур</span>
                            <div className={styles.tourScene}>
                                <span className={styles.tourScenePrimary}>Интерактивный зал</span>
                                <span className={styles.tourSceneSecondary}>Экспонаты и модели</span>
                            </div>
                        </div>
                        <div className={styles.tourHint}>WASD • Мышь • E</div>
                    </div>
                ) : (
                    <img src={excursion.image} alt={excursion.title} className={styles.image} />
                )}
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>{excursion.title}</h3>
                <p className={styles.description}>{excursion.description}</p>
                <div className={styles.details}>
                    <div className={styles.detail}>
                        <span className={styles.label}>Место проведения:</span>
                        <span className={styles.value}>{excursion.location}</span>
                    </div>
                </div>
                <button className={styles.button} onClick={handleOpen}>
                    {excursion.buttonText || 'Начать экскурсию'}
                </button>
            </div>
        </div>
    );
}
