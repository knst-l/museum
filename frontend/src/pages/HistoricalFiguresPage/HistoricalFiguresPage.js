import React, { useState, useEffect } from 'react';
import Styles from './HistoricalFiguresPage.module.css';
import {HistoricalFiguresAPI} from '../../shared/const/api';
import {ArtifactTimeline} from '../ArtifactPage/ArtifactTimeline';
import {HistoricalFigureCard} from './HistoricalFigureCard/HistoricalFigureCard';
import Breadcrumbs from '../../shared/ui/Breadcrumbs/Breadcrumbs';

export function HistoricalFiguresPage() {
    const [figures, setFigures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadFigures = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await HistoricalFiguresAPI.list();
                if (isMounted) {
                    setFigures(Array.isArray(data) ? data : []);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Ошибка при загрузке исторических личностей:', err);
                if (isMounted) {
                    setError('Не удалось загрузить данные исторических личностей.');
                    setLoading(false);
                }
            }
        };

        loadFigures();

        return () => {
            isMounted = false;
        };
    }, []);

    // Преобразуем данные для отображения
    const transformedFigures = figures.map(figure => {
        // Извлекаем год из birth_date (формат может быть "YYYY-MM-DD" или Date объект)
        let birthYear = null;
        if (figure.birth_date) {
            if (typeof figure.birth_date === 'string') {
                birthYear = parseInt(figure.birth_date.split('-')[0]);
            } else if (figure.birth_date instanceof Date) {
                birthYear = figure.birth_date.getFullYear();
            }
        }

        const firstImage = figure.images && figure.images.length > 0 
            ? figure.images[0] 
            : null;
        const imageUrl = firstImage?.image_url || "/logo192.png";

        return {
            id: figure.id,
            title: figure.full_name || "Без имени",
            year: birthYear ? birthYear.toString() : "",
            image: imageUrl,
            figure: figure 
        };
    });

    // Группируем по десятилетиям
    const figuresByDecade = {};
    
    transformedFigures.forEach(figure => {
        const year = parseInt(figure.year);
        if (isNaN(year)) {
            return;
        }
        
        const decade = Math.floor(year / 10) * 10;
        const decadeKey = String(decade);
        
        if (!figuresByDecade[decadeKey]) {
            figuresByDecade[decadeKey] = [];
        }
        figuresByDecade[decadeKey].push(figure);
    });

    // Сортируем фигуры внутри каждого десятилетия
    Object.keys(figuresByDecade).forEach(decadeKey => {
        if (figuresByDecade[decadeKey] && Array.isArray(figuresByDecade[decadeKey])) {
            figuresByDecade[decadeKey].sort((a, b) => {
                const yearA = parseInt(a.year) || 0;
                const yearB = parseInt(b.year) || 0;
                return yearA - yearB;
            });
        }
    });

    const decades = Object.keys(figuresByDecade)
        .map(d => {
            if (d === "no-year") return null;
            const decadeNum = parseInt(d);
            return isNaN(decadeNum) ? null : decadeNum;
        })
        .filter(d => d !== null)
        .sort((a, b) => a - b);

    const timelineDecades = decades.map(decade => ({
        id: decade,
        label: `${decade}е`,
        decade: decade
    }));

    const breadcrumbsLinks = [
        ["Главная", "/home"],
        ["Исторические личности", "/historical_figures"]
    ]

    if (loading) {
        return (
            <>
                <Breadcrumbs links={breadcrumbsLinks} />
                <div className={Styles.LoadingOverlay}>
                    <div className={Styles.Spinner}></div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Breadcrumbs links={breadcrumbsLinks} />
                <div className={Styles.HistoricalFiguresPage}>
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        <p>{error}</p>
                    </div>
                </div>
            </>
        );
    }

    if (transformedFigures.length === 0) {
        return (
            <>
                <Breadcrumbs links={breadcrumbsLinks} />
                <div className={Styles.HistoricalFiguresPage}>
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        <p>Исторические личности не найдены</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Breadcrumbs links={breadcrumbsLinks} />
            <div className={Styles.HistoricalFiguresPage}>
                <div className={Styles.PageHeader}>
                    <h1 className={Styles.PageTitle}>
                        Исторические личности:
                    </h1>
                </div>
                <div className={Styles.PageContent}>
                    {timelineDecades.length > 0 && (
                        <div className={Styles.TimelineContainer}>
                            <ArtifactTimeline 
                                centuries={timelineDecades} 
                                activeCentury={null}
                                onCenturyClick={(decadeId) => {
                                    const element = document.querySelector(`[data-decade="${decadeId}"]`);
                                    if (element) {
                                        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                                        const offsetPosition = elementPosition - 100; // 100px отступ сверху
                                        
                                        window.scrollTo({
                                            top: offsetPosition,
                                            behavior: 'smooth'
                                        });
                                    }
                                }}
                            />
                        </div>
                    )}
                    <div className={Styles.FiguresContainer}>
                        {decades.map(decade => {
                            const decadeKey = String(decade);
                            const decadeFigures = figuresByDecade[decadeKey] || [];
                            
                            if (!decadeFigures || !Array.isArray(decadeFigures) || decadeFigures.length === 0) {
                                return null;
                            }
                            
                            return (
                                <div key={decade} className={Styles.DecadeSection} data-decade={decade}>
                                    <h2 className={Styles.DecadeTitle}>{decade}е</h2>
                                    <div className={Styles.FigureGrid}>
                                        {decadeFigures.map(figure => (
                                            <HistoricalFigureCard key={figure.id} figure={figure.figure} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
} 