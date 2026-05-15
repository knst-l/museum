import React, { useEffect, useMemo, useState } from 'react';
import Breadcrumbs from '../../shared/ui/Breadcrumbs/Breadcrumbs';
import { GalleryFoldersAPI, MediaArchiveAPI, resolveMediaUrl } from '../../shared/const/api';
import Styles from './GraduatesArchivePage.module.css';

export function GraduatesArchivePage() {
  const [activeItem, setActiveItem] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const breadcrumbsLinks = useMemo(
    () => [
      ['Главная', '/home'],
      ['Фотоархив', '/graduates-archive'],
    ],
    []
  );

  useEffect(() => {
    let isMounted = true;

    const loadArchive = async () => {
      try {
        setLoading(true);
        setError(null);

        const [foldersData, itemsData] = await Promise.all([
          GalleryFoldersAPI.list({ ordering: 'display_order,id' }),
          MediaArchiveAPI.list({ ordering: 'display_order,id' }),
        ]);

        if (!isMounted) {
          return;
        }

        const folders = Array.isArray(foldersData) ? foldersData : foldersData?.results || [];
        const items = Array.isArray(itemsData) ? itemsData : itemsData?.results || [];

        const itemsByFolder = items.reduce((acc, item) => {
          const folderId = item.folder?.id;
          if (!folderId) return acc;
          if (!acc[folderId]) acc[folderId] = [];
          acc[folderId].push(item);
          return acc;
        }, {});

        const mappedSections = folders
          .map((folder) => ({
            id: folder.id,
            title: folder.name,
            description: folder.description,
            items: itemsByFolder[folder.id] || [],
          }))
          .filter((section) => section.items.length > 0);

        setSections(mappedSections);
      } catch (err) {
        if (!isMounted) return;
        console.error('Ошибка загрузки фотоархива:', err);
        setError('Не удалось загрузить фотоархив. Попробуйте обновить страницу.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadArchive();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <Breadcrumbs links={breadcrumbsLinks} />
      <section className={Styles.Page}>
        <div className={Styles.Intro}>
          <h1 className={Styles.Title}>Фотоархив</h1>
          <p className={Styles.Description}>
            Приглашаем вас познакомиться с фотографиями выпускников разных лет и кадрами из жизни института.
            Здесь собраны памятные снимки, которые помогают увидеть историю университета через лица, события и атмосферу разных лет.
          </p>
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

        {!loading && !error && sections.length === 0 && (
          <div className={Styles.StateBlock}>
            <p>Разделы фотоархива пока не заполнены.</p>
          </div>
        )}

        {!loading &&
          !error &&
          sections.map((section) => (
            <section key={section.id} className={Styles.Section}>
              <div className={Styles.SectionIntro}>
                <h2 className={Styles.SectionTitle}>{section.title}</h2>
                {section.description && <p className={Styles.SectionDescription}>{section.description}</p>}
              </div>
              <div className={Styles.Grid}>
                {section.items.map((item) => (
                  <article key={item.id} className={Styles.Card} onClick={() => setActiveItem(item)}>
                    <div className={Styles.ImageWrap}>
                      <img
                        src={resolveMediaUrl(item.image?.image_url || item.image?.image)}
                        alt={item.title}
                        className={Styles.Image}
                        style={{ objectPosition: item.image?.object_position || '50% 50%' }}
                        loading="lazy"
                      />
                      {item.year_label && <span className={Styles.YearBadge}>{item.year_label}</span>}
                    </div>
                    <div className={Styles.Content}>
                      <h3 className={Styles.CardTitle}>{item.title}</h3>
                      {item.description && <p className={Styles.CardCaption}>{item.description}</p>}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
      </section>

      {activeItem && (
        <div className={Styles.Lightbox} onClick={() => setActiveItem(null)}>
          <div className={Styles.LightboxDialog} onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className={Styles.CloseButton}
              onClick={() => setActiveItem(null)}
              aria-label="Закрыть"
            >
              ×
            </button>
            <img
              src={resolveMediaUrl(activeItem.image?.image_url || activeItem.image?.image)}
              alt={activeItem.title}
              className={Styles.LightboxImage}
              style={{ objectPosition: activeItem.image?.object_position || '50% 50%' }}
            />
            <div className={Styles.LightboxMeta}>
              {activeItem.year_label && <p className={Styles.LightboxYear}>{activeItem.year_label}</p>}
              <h3 className={Styles.LightboxTitle}>{activeItem.title}</h3>
              {activeItem.description && <p className={Styles.LightboxCaption}>{activeItem.description}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
