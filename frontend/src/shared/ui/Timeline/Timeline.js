import React, { useState, useEffect } from 'react';
import Styles from './Timeline.module.css';

/**
 * Поддерживает два варианта использования:
 * 1. centuries: массив объектов вида { id, label, startYear, endYear }
 *    activeCentury: id активного столетия
 *    onCenturyClick: функция для обработки клика по столетию
 * 2. artifactsByCentury: объект вида { [century]: [artifacts] }
 *    countLabel: строка для отображения количества (опционально)
 */
export function Timeline({ centuries, activeCentury, onCenturyClick, artifactsByCentury, countLabel }) {
  const [computedCenturies, setComputedCenturies] = useState([]);
  const [internalActiveCentury, setInternalActiveCentury] = useState(null);

  useEffect(() => {
    // Если передан artifactsByCentury, преобразуем его в формат centuries
    if (artifactsByCentury && !centuries) {
      const centuryKeys = Object.keys(artifactsByCentury).sort((a, b) => parseInt(a) - parseInt(b));
      const computed = centuryKeys.map((century) => {
        const centuryNum = parseInt(century);
        const count = artifactsByCentury[century].length;
        const label = countLabel 
          ? `${centuryNum / 100 + 1} век (${count} ${countLabel})`
          : `${centuryNum / 100 + 1} век`;
        return {
          id: century,
          label: label,
          startYear: centuryNum,
          endYear: centuryNum + 99
        };
      });
      setComputedCenturies(computed);
      if (computed.length > 0 && !internalActiveCentury) {
        setInternalActiveCentury(computed[0].id);
      }
    } else if (centuries) {
      setComputedCenturies(centuries);
    }
  }, [artifactsByCentury, centuries, countLabel, internalActiveCentury]);

  const handleCenturyClick = (centuryId) => {
    setInternalActiveCentury(centuryId);
    if (onCenturyClick) {
      onCenturyClick(centuryId);
    }
  };

  const currentActiveCentury = activeCentury !== undefined ? activeCentury : internalActiveCentury;
  const centuriesToRender = centuries || computedCenturies;

  if (!centuriesToRender || centuriesToRender.length === 0) {
    return null;
  }

  return (
    <nav className={Styles.timeline}>
      {centuriesToRender.map((century) => (
        <button
          key={century.id}
          className={`${Styles.century} ${currentActiveCentury === century.id ? Styles.active : ''}`}
          onClick={() => handleCenturyClick(century.id)}
        >
          <span className={Styles.centuryLabel}>{century.label}</span>
          <span className={Styles.centuryLine}></span>
        </button>
      ))}
    </nav>
  );
}
