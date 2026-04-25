import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Styles from './SearchPage.module.css';
import Breadcrumbs from '../../shared/ui/Breadcrumbs/Breadcrumbs';
import { SearchForm } from '../../shared/ui/SearchForm';
import { ArtifactsAPI, HistoricalFiguresAPI, HallsAPI, resolveMediaUrl } from '../../shared/const/api';
import { excursions } from '../const УСТАРЕЛО/excursions';

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
    .trim();

const buildImage = (item) => {
  if (!item) {
    return { src: '/logo192.png', position: '50% 50%' };
  }

  return {
    src: resolveMediaUrl(item.image_url || item.image || '/logo192.png'),
    position: item.object_position || '50% 50%',
  };
};

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').trim();

  const [figures, setFigures] = useState([]);
  const [artifacts, setArtifacts] = useState([]);
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadSearchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [figuresData, artifactsData, hallsData] = await Promise.all([
          HistoricalFiguresAPI.list(),
          ArtifactsAPI.list(),
          HallsAPI.list(),
        ]);

        if (!isMounted) {
          return;
        }

        setFigures(Array.isArray(figuresData) ? figuresData : figuresData?.results || []);
        setArtifacts(Array.isArray(artifactsData) ? artifactsData : artifactsData?.results || []);
        setHalls(Array.isArray(hallsData) ? hallsData : hallsData?.results || []);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        console.error('Ошибка при загрузке данных для поиска:', err);
        setError('Не удалось загрузить данные для поиска. Попробуйте обновить страницу.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSearchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const results = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
      return {
        figures: [],
        artifacts: [],
        halls: [],
        excursions: [],
        total: 0,
      };
    }

    const figureResults = figures
      .filter((figure) => {
        const haystack = normalizeText([
          figure.full_name,
          figure.biography,
          figure.description,
          ...(figure.science_fields || []).map((field) => field.name),
        ].join(' '));

        return haystack.includes(normalizedQuery);
      })
      .map((figure) => {
        const firstImage = figure.images?.[0];
        const image = buildImage(firstImage);

        return {
          id: `figure-${figure.id}`,
          title: figure.full_name || 'Историческая личность',
          description: figure.biography || figure.description || 'Открыть карточку исторической личности.',
          href: `/historical_figures/${figure.id}`,
          subtitle: 'Историческая личность',
          image,
        };
      });

    const artifactResults = artifacts
      .filter((artifact) => {
        const haystack = normalizeText([
          artifact.name,
          artifact.description,
          artifact.creation_year,
          artifact.category?.name,
          artifact.hall?.name,
        ].join(' '));

        return haystack.includes(normalizedQuery);
      })
      .map((artifact) => {
        const firstImage = artifact.images?.[0];
        const image = buildImage(firstImage);

        return {
          id: `artifact-${artifact.id}`,
          title: artifact.name || 'Экспонат',
          description: artifact.description || 'Открыть карточку экспоната.',
          href: `/artifact/${artifact.id}`,
          subtitle: artifact.hall?.name ? `Экспонат, зал: ${artifact.hall.name}` : 'Экспонат',
          image,
        };
      });

    const hallResults = halls
      .filter((hall) => {
        const haystack = normalizeText([
          hall.name,
          hall.description,
          hall.category?.name,
        ].join(' '));

        return haystack.includes(normalizedQuery);
      })
      .map((hall) => {
        const image = buildImage(hall.image);

        return {
          id: `hall-${hall.id}`,
          title: hall.name || 'Зал',
          description: hall.description || 'Перейти к экспонатам этого зала.',
          href: `/artifacts?hallId=${hall.id}`,
          subtitle: 'Зал с экспонатами',
          image,
        };
      });

    const excursionResults = excursions
      .filter((excursion) => {
        const haystack = normalizeText([
          excursion.title,
          excursion.description,
          excursion.location,
        ].join(' '));

        return haystack.includes(normalizedQuery);
      })
      .map((excursion) => ({
        id: `excursion-${excursion.id}`,
        title: excursion.title,
        description: excursion.description || 'Перейти к разделу экскурсий.',
        href: '/excursions',
        subtitle: excursion.location ? `Экскурсия, место: ${excursion.location}` : 'Экскурсия',
        image: {
          src: excursion.image || '/logo192.png',
          position: '50% 50%',
        },
      }));

    const total = figureResults.length + artifactResults.length + hallResults.length + excursionResults.length;

    return {
      figures: figureResults,
      artifacts: artifactResults,
      halls: hallResults,
      excursions: excursionResults,
      total,
    };
  }, [artifacts, figures, halls, query]);

  const breadcrumbsLinks = [
    ['Главная', '/home'],
    ['Поиск по сайту', '/search'],
  ];

  const sections = [
    ['Исторические личности', results.figures],
    ['Экспонаты', results.artifacts],
    ['Залы', results.halls],
    ['Экскурсии', results.excursions],
  ];

  return (
    <>
      <Breadcrumbs links={breadcrumbsLinks} />
      <section className={Styles.SearchPage}>
        <div className={Styles.Intro}>
          <h1 className={Styles.Title}>Поиск по сайту</h1>
          <p className={Styles.Description}>
            Найти можно исторические личности, экспонаты, залы и экскурсии.
          </p>
          <div className={Styles.FormWrap}>
            <SearchForm placeholder="Введите имя, название экспоната или зала" />
          </div>
        </div>

        {loading && (
          <div className={Styles.StateBlock}>
            <div className={Styles.Spinner}></div>
          </div>
        )}

        {!loading && error && (
          <div className={Styles.StateBlock}>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && !query && (
          <div className={Styles.StateBlock}>
            <p>Введите запрос в строке поиска.</p>
          </div>
        )}

        {!loading && !error && query && results.total === 0 && (
          <div className={Styles.StateBlock}>
            <p>По запросу «{query}» ничего не найдено.</p>
          </div>
        )}

        {!loading && !error && query && results.total > 0 && (
          <div className={Styles.ResultsWrap}>
            <p className={Styles.ResultsMeta}>
              Найдено результатов: {results.total}
            </p>

            {sections.map(([sectionTitle, items]) => (
              items.length > 0 ? (
                <section key={sectionTitle} className={Styles.Section}>
                  <h2 className={Styles.SectionTitle}>{sectionTitle}</h2>
                  <div className={Styles.ResultsGrid}>
                    {items.map((item) => (
                      <Link to={item.href} key={item.id} className={Styles.ResultItem}>
                        <div className={Styles.ResultImageWrap}>
                          <img
                            src={item.image.src}
                            alt={item.title}
                            className={Styles.ResultImage}
                            style={{ objectPosition: item.image.position }}
                          />
                        </div>
                        <div className={Styles.ResultContent}>
                          <p className={Styles.ResultSubtitle}>{item.subtitle}</p>
                          <h3 className={Styles.ResultTitle}>{item.title}</h3>
                          <p className={Styles.ResultDescription}>{item.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null
            ))}
          </div>
        )}
      </section>
    </>
  );
}
