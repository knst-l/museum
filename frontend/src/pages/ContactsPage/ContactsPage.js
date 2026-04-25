import Styles from './ContactsPage.module.css';

export function ContactsPage() {
  return (
    <div className={Styles.ContactsPage}>
      <h1>Контакты</h1>
      
      <div className={Styles.ContactInfo}>
        {/* Левая колонка: телефон, email, режим работы */}
        <div className={Styles.LeftColumn}>
          <div className={Styles.ContactBlock}>
            <h2>Телефон</h2>
            <p>+7 (3952) 40-50-00</p>
          </div>
          
          <div className={Styles.ContactBlock}>
            <h2>Email</h2>
            <p>museum@istu.edu</p>
          </div>
          
          <div className={Styles.ContactBlock}>
            <h2>Режим работы</h2>
            <p>Понедельник — Пятница: 9:00 — 18:00</p>
            <p>Суббота: 10:00 — 16:00</p>
            <p>Воскресенье: выходной</p>
          </div>
        </div>

        {/* Правая колонка: адрес и карта */}
        <div className={Styles.RightColumn}>
          <div className={Styles.ContactBlock}>
            <h2>Адрес</h2>
            <p>Иркутский национальный исследовательский технический университет</p>
            <p>664074, г. Иркутск, ул. Лермонтова, 83</p>
          </div>
          
          {/* Карта Яндекса через iframe */}
          <iframe
            className={Styles.MapContainer}
            src="https://yandex.ru/map-widget/v1/?um=constructor%3A918d71acfc081f820512c283af625205a68c5f1cf5c86bd78de4dce490309433&source=constructor"
            width="100%"
            height="350px"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}
