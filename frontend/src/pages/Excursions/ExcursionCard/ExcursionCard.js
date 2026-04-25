import React from 'react';
import styles from './ExcursionCard.module.css';

export function ExcursionCard({ excursion }) {
    return (
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                <img src={excursion.image} alt={excursion.title} className={styles.image} />
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
                <button className={styles.button}>Начать экскурсию</button>
            </div>
        </div>
    );
} 