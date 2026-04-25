import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Breadcrumbs.module.css';

const Breadcrumbs = ({ items = [], links = [] }) => {
  // Поддержка двух форматов:
  // 1. items = [{label: "...", to: "..."}] (новый формат)
  // 2. links = [["Label", "path"], ...] (старый формат)
  
  let breadcrumbsData = [];
  
  if (links.length > 0) {
    // Преобразуем старый формат [["Label", "path"], ...] в новый
    breadcrumbsData = links.map(([label, to], index) => {
      // Последний элемент без ссылки
      const isLast = index === links.length - 1;
      return {
        label,
        to: isLast ? null : to
      };
    });
  } else if (items.length > 0) {
    breadcrumbsData = items;
  }

  if (!breadcrumbsData.length) return null;

  return (
    <nav className={styles.breadcrumbs}>
      {breadcrumbsData.map((item, index) => (
        <span key={index} className={styles.item}>
          {item.to ? (
            <Link to={item.to}>{item.label}</Link>
          ) : (
            <span className={styles.current}>{item.label}</span>
          )}
          {index < breadcrumbsData.length - 1 && <span className={styles.separator}>/</span>}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
