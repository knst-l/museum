import React from 'react';
import styles from './Excursions.module.css';
import { excursions } from '../const УСТАРЕЛО/excursions';
import { ExcursionCard } from './ExcursionCard/ExcursionCard';
import Breadcrumbs from '../../shared/ui/Breadcrumbs/Breadcrumbs';

export function Excursions() {
    const breadcrumbsLinks = [
        ["Главная", "/home"],
        ["Экскурсии", "/excursions"]
    ]

    return (
        <>
            <Breadcrumbs links={breadcrumbsLinks} />
            <div className={styles.Excursions}>
                <h1>Экскурсии</h1>
                <p className={styles.description}>
                    Приглашаем вас на увлекательные экскурсии по музею вычислительной техники. 
                    Наши опытные экскурсоводы помогут вам погрузиться в историю развития технологий 
                    и узнать много интересного о компьютерах и их создателях.
                </p>
                <div className={styles.grid}>
                    {excursions.map(excursion => (
                        <ExcursionCard key={excursion.id} excursion={excursion} />
                    ))}
                </div>
            </div>
        </>
    );
} 