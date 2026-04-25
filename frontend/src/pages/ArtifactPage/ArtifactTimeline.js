import React from 'react';
import Styles from './ArtifactTimeline.module.css';

/**
 * Timeline компонент специально для страницы артефактов
 * centuries: массив объектов вида { id, label, decade }
 * activeCentury: id активного десятилетия
 * onCenturyClick: функция для обработки клика по десятилетию
 */
export function ArtifactTimeline({ centuries, activeCentury, onCenturyClick }) {
  if (!centuries || centuries.length === 0) {
    return null;
  }

  return (
    <nav className={Styles.timeline}>
      {centuries.map((century) => (
        <button
          key={century.id}
          className={`${Styles.century} ${activeCentury === century.id ? Styles.active : ''}`}
          onClick={() => onCenturyClick(century.id)}
        >
          <span className={Styles.centuryLabel}>{century.label}</span>
          <span className={Styles.centuryLine}></span>
        </button>
      ))}
    </nav>
  );
}

