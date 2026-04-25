import Styles from './Footer.module.css';
import { Link } from 'react-router-dom';
import { API } from '../../shared/const/api';

const adminUrl = API.baseURL.replace(/\/api\/?$/, '') + '/admin/';

const linkColumns = [
  [
    ['Главная', '/home'],
    ['Экскурсии', '/excursions'],
    ['Исторические личности', '/historical_figures'],
    ['Залы с экспонатами', '/halls'],
  ],
  [
    ['Оставить отзыв', '/survey'],
    ['Контакты', '/contacts'],
    ['Поиск по сайту', '/search'],
    ['Войти как администратор', '/admin'],
  ],
];

export function Footer() {
  return (
    <footer className={Styles.Footer}>
      <div className="FooterContent">
        <div className={Styles.BrandBlock}>
          <Link to="/home" className={Styles.BrandLink}>
            <img src="/logo512.png" alt="Логотип музея" className={Styles.BrandLogo} />
            <div className={Styles.BrandText}>
              <p className={Styles.BrandTitle}>Музей вычислительной техники ИрНИТУ</p>
            </div>
          </Link>
        </div>
        <div className={Styles.LinksBlock}>
          <div className={Styles.Links}>
            {linkColumns.map((column, columnIndex) => (
              <div className={Styles.LinkColumn} key={columnIndex}>
                {column.map(([label, href], index) => (
                  href === '/admin' ? (
                    <a href={adminUrl} key={`${columnIndex}-${index}`} target="_blank" rel="noopener noreferrer">
                      {label}
                    </a>
                  ) : (
                    <Link to={href} key={`${columnIndex}-${index}`}>
                      {label}
                    </Link>
                  )
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
