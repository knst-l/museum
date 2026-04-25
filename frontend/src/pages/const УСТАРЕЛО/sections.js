export const museumSections = {
  hardware: {
    title: 'Аппаратное обеспечение',
    description: 'Экспонаты, связанные с вычислительной техникой',
    link: `/halls?hallType=hardware`,
    linkText: 'Смотреть зал',
    sections: [
      { id: 'room-a', title: 'Комната A' },
      { id: 'room-b', title: 'Комната B' },
    ],
  },
  software: {
    title: 'Программное обеспечение',
    description: 'История и развитие ПО',
    link: `/halls?hallType=software`,
    linkText: 'Смотреть зал',
    sections: [
      { id: 'room-c', title: 'Комната C' },
    ],
  },
};

export const excursionSection = {
  title: 'Экскурсии',
  description: 'Подборка тематических экскурсий по музею',
  link: '/excursions',
  linkText: 'Все экскурсии',
  sections: [],
};

export const historicalFiguresSection = [
  {
    title: 'Исторические личности',
    description: 'Люди, изменившие историю вычислительной техники',
    link: '/historical_figures',
    linkText: 'Смотреть всех',
    sections: [],
  },
];


