import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { HistoricalFiguresAPI } from '../../shared/const/api';
import Breadcrumbs from '../../shared/ui/Breadcrumbs/Breadcrumbs';
import Styles from './HistoricalFigureDetailPage.module.css';

export function HistoricalFigureDetailPage() {
    const { id } = useParams();
    const [figure, setFigure] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    useEffect(() => {
        let isMounted = true;

        const loadFigure = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await HistoricalFiguresAPI.get(id);
                if (isMounted) {
                    setFigure(data);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Ошибка при загрузке исторической личности:', err);
                if (isMounted) {
                    setError('Не удалось загрузить данные исторической личности.');
                    setLoading(false);
                }
            }
        };

        loadFigure();

        return () => {
            isMounted = false;
        };
    }, [id]);

    const breadcrumbsLinks = [
        ['Главная', '/home'],
        ['Исторические личности', '/historical_figures'],
        ...(figure ? [[figure.full_name, `/historical_figures/${figure.id}`]] : []),
    ];

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

    if (error || !figure) {
        return (
            <>
                <Breadcrumbs links={breadcrumbsLinks} />
                <div className={Styles.HistoricalFigureDetailPage}>
                    <div className={Styles.Content}>
                        <div>{error || 'Историческая личность не найдена'}</div>
                    </div>
                </div>
            </>
        );
    }

    const yearsString = figure.birth_year && figure.death_year
        ? `${figure.birth_year} - ${figure.death_year}`
        : figure.birth_year
            ? `род. ${figure.birth_year}`
            : '';

    const images = figure.images && figure.images.length > 0
        ? figure.images.map(img => ({
            url: img.image_url || img.image || '',
            objectPosition: img.object_position || '50% 50%',
        }))
        : [];

    const mainImage = images[selectedImageIndex] || images[0] || null;

    return (
        <>
            <Breadcrumbs links={breadcrumbsLinks} />
            <div className={Styles.HistoricalFigureDetailPage}>
                <div className={Styles.Content}>
                    <div className={Styles.ImageGallery}>
                        <div className={Styles.MainImage}>
                            {mainImage?.url && (
                                <img
                                    src={mainImage.url}
                                    alt={figure.full_name}
                                    className={Styles.Image}
                                    style={{ objectPosition: mainImage.objectPosition }}
                                />
                            )}
                        </div>
                        {images.length > 1 && (
                            <div className={Styles.Thumbnails}>
                                {images.map((image, index) => (
                                    <div
                                        key={index}
                                        className={`${Styles.Thumbnail} ${selectedImageIndex === index ? Styles.Active : ''}`}
                                        onClick={() => setSelectedImageIndex(index)}
                                    >
                                        <img
                                            src={image.url}
                                            alt={`${figure.full_name} - фото ${index + 1}`}
                                            style={{ objectPosition: image.objectPosition }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className={Styles.Info}>
                        <h1 className={Styles.Name}>{figure.full_name}</h1>
                        {yearsString && <p className={Styles.Years}>{yearsString}</p>}
                        <div className={Styles.Description}>
                            <h2>Биография</h2>
                            <p>{figure.biography || figure.description || 'Биография не указана.'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
