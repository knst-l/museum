import React, { useState, useEffect } from "react";
import Styles from "./HomePage.module.css";
import { MuseumSection, MuseumWidgetList, ItemCardList } from "../../shared/ui";
import { HallsAPI, HistoricalFiguresAPI } from "../../shared/const/api";
import { excursions } from "../const УСТАРЕЛО/excursions";
import { ExcursionCard } from "../Excursions/ExcursionCard/ExcursionCard";

// Когда в базе данных что-то будет, то моковые данные можно будет убрать
// Используйте функции api.js для получения реальных данных
// Например для этого файла надо HallsAPI.list() и HistoricalFiguresAPI.getFigures()

export function HomePage() {
  const [halls, setHalls] = useState([]);
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    // Загрузка данных через промисы
    const loadData = () => {
      setLoading(true);
      setError(null);

      Promise.all([
        HallsAPI.list(),              // Получаем список залов
        HistoricalFiguresAPI.list(),  // Получаем список исторических личностей
      ])
        .then(([hallsData, figuresData]) => {
          if (!isMounted) return;

          // Убеждаемся, что данные - это массивы
          const hallsArray = hallsData.results || hallsData || [];
          const figuresArray = figuresData.results || figuresData || [];

          // --- Обработка залов (максимум 6) ---
          const hallsWidgets = hallsArray.slice(0, 6).map((hall) => ({
            id: hall.id,
            text: hall.name,
            imageUrl: hall.image?.image_url || hall.image?.image || "",
            imagePosition: hall.image?.object_position || "50% 50%",
            link: `/artifacts?hallId=${hall.id}`,
          }));

          // --- Обработка исторических личностей ---
          const mappedPersons = figuresArray.map((f) => ({
            imageUrl: f.images?.[0]?.image_url || f.images?.[0]?.image || "",
            imagePosition: f.images?.[0]?.object_position || "50% 50%",
            personName: f.full_name,
            link: `/historical_figures/${f.id}`,
          }));

          // --- Устанавливаем в состояние ---
          if (isMounted) {
            setHalls(hallsWidgets);
            setPersons(mappedPersons.slice(0, 12));
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error("Ошибка при загрузке данных:", err);
          if (isMounted) {
            setError("Не удалось загрузить данные. Попробуйте обновить страницу.");
            setLoading(false);
          }
        });
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // ЕСЛИ ПИСАТЬ НА ЗАГЛУШКАХ, ТО ЭТО ВЫГЛЯДИТ ТАК:
  /*
   useEffect(() => {
        let isMounted = true;
        const loadData = () => {
            if (!isMounted) return;

            // --- Заглушки для залов ---
            const mockHalls = [
                { id: 1, name: "Аппаратный зал 1", category: { name: "Аппаратное" }, image: { url: "/images/hardware1.jpg" } },
                { id: 2, name: "Аппаратный зал 2", category: { name: "Аппаратное" }, image: { url: "/images/hardware2.jpg" } },
                { id: 3, name: "Программный зал 1", category: { name: "Программное" }, image: { url: "/images/software1.jpg" } },
                { id: 4, name: "Программный зал 2", category: { name: "Программное" }, image: { url: "/images/software2.jpg" } },
            ];

            // --- Заглушки для исторических личностей ---
            const mockPersons = [
                { id: 1, full_name: "Алан Тьюринг", images: [{ url: "/images/turing.jpg" }] },
                { id: 2, full_name: "Грейс Хоппер", images: [{ url: "/images/hopper.jpg" }] },
                { id: 3, full_name: "Конрад Цузе", images: [{ url: "/images/tsuse.jpg" }] },
                { id: 4, full_name: "Джон фон Нейман", images: [{ url: "/images/nyeman.jpg" }] },
                { id: 5, full_name: "Никлаус Вирт", images: [{ url: "/images/wirth.jpg" }] },
                { id: 6, full_name: "Дональд Кнут", images: [{ url: "/images/knuth.jpg" }] },
            ];

            // Группировка залов
            const grouped = { hardware: [], software: [] };
            mockHalls.forEach((hall) => {
                const widget = {
                    id: hall.id,
                    text: hall.name,
                    imageUrl: hall.image?.url || "",
                    link: `/artifacts?hallId=${hall.id}`,
                };
                const category = hall.category?.name?.toLowerCase() || "";
                if (category.includes("программ")) grouped.software.push(widget);
                else grouped.hardware.push(widget);
            });

            const mappedPersons = mockPersons.map((f) => ({
                imageUrl: f.images?.[0]?.url || "",
                personName: f.full_name,
                link: `/historical_figures/${f.id}`,
            }));

            // Ограничение на главную страницу
            setWidgetsByMuseum({
                hardware: grouped.hardware.slice(0, 6),
                software: grouped.software.slice(0, 6),
            });
            setPersons(mappedPersons.slice(0, 12));
            setLoading(false);
        };

        loadData();
        return () => { isMounted = false; };
    }, []);
  */


  // --- Состояние ошибки ---
  if (error) {
    return (
      <div className={Styles.HomePage}>
        <div className={Styles.ErrorMessage}>{error}</div>
      </div>
    );
  }

  return (
    <div className={`${Styles.HomePage} ${loading ? Styles.Loading : ""}`}>
      {loading && <div className={Styles.LoadingOverlay}><div className={Styles.Spinner}></div></div>}
      <section className={Styles.WelcomeSection}>
        <div className={Styles.WelcomeImage}></div>
        <div className={Styles.WelcomeText}>
          <h1>Музей вычислительной техники</h1>
          <p>Приветствуем вас в Музее вычислительной техники ИрНИТУ!</p>
          <p>
            Здесь вы сможете погрузиться в историю развития цифровой электроники: от первых вычислительных
            машин до современных технологий. Вас ждут экспонаты, демонстрирующие путь от ламповых
            компьютеров до современных процессоров.
          </p>
          <p>
            Также вы узнаете о выдающихся учёных, чьи открытия заложили основу современной IT-индустрии.
            Приглашаем вас на увлекательное путешествие по этапам эволюции техники, которые определили облик
            сегодняшнего цифрового мира!
          </p>
        </div>
      </section>

      {halls.length > 0 && (
        <MuseumSection
          title="Аппаратная экспозиция"
          description="Залы с экспонатами аппаратного обеспечения и вычислительной техники."
          link="/halls"
          linkText="Перейти к залам"
        >
          <MuseumWidgetList widgets={halls} />
        </MuseumSection>
      )}


      {persons.length > 0 && (
        <MuseumSection
          title="Исторические личности"
          description="Учёные и инженеры, внёсшие ключевой вклад в развитие вычислительной техники."
          link="/historical_figures"
          linkText="Смотреть всех"
        >
          <ItemCardList persons={persons} />
        </MuseumSection>
      )}

      {excursions.length > 0 && (
        <MuseumSection
          title="Приглашаем на цифровую экскурсию"
          description="Увлекательные экскурсии по музею вычислительной техники."
          link="/excursions"
          linkText="Все экскурсии"
        >
          <div className={Styles.ExcursionsGrid}>
            {excursions.map(excursion => (
              <ExcursionCard key={excursion.id} excursion={excursion} />
            ))}
          </div>
        </MuseumSection>
      )}
    </div>
  );
}
