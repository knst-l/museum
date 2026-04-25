import React from 'react';
import Styles from './VirtualTourPage.module.css';
import Breadcrumbs from '../../shared/ui/Breadcrumbs/Breadcrumbs';

export function VirtualTourPage() {
  const breadcrumbsLinks = [
    ['Главная', '/home'],
    ['Экскурсии', '/excursions'],
    ['Виртуальная экскурсия', '/virtual-tour'],
  ];

  return (
    <>
      <Breadcrumbs links={breadcrumbsLinks} />
      <section className={Styles.VirtualTourPage}>
        <div className={Styles.Header}>
          <div>
            <h1 className={Styles.Title}>Виртуальная экскурсия</h1>
            <p className={Styles.Description}>
              Это интерактивный 3D-зал. Внутри можно перемещаться, подходить к экспонатам и открывать модели для отдельного просмотра.
            </p>
          </div>
          <a
            href="/tour/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className={Styles.OpenButton}
          >
            Открыть отдельно
          </a>
        </div>

        <div className={Styles.Hints}>
          <span>Клик по туру — начать</span>
          <span>WASD — перемещение</span>
          <span>Мышь — обзор</span>
          <span>E — открыть экспонат</span>
          <span>Esc — выйти</span>
        </div>

        <div className={Styles.FrameWrap}>
          <iframe
            title="Виртуальная экскурсия по музею"
            src="/tour/index.html"
            className={Styles.Frame}
            allow="fullscreen; xr-spatial-tracking"
          />
        </div>
      </section>
    </>
  );
}
