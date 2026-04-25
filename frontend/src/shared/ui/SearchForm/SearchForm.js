import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Styles from './SearchForm.module.css';

export function SearchForm({
  className = '',
  inputClassName = '',
  buttonClassName = '',
  placeholder = 'Поиск по сайту',
  compact = false,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('q') || '';
  }, [location.search]);

  const [value, setValue] = useState(currentQuery);

  useEffect(() => {
    setValue(currentQuery);
  }, [currentQuery]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedValue = value.trim();

    if (!trimmedValue) {
      navigate('/search');
      return;
    }

    navigate(`/search?q=${encodeURIComponent(trimmedValue)}`);
  };

  return (
    <form
      className={[
        Styles.Form,
        compact ? Styles.FormCompact : '',
        className,
      ].filter(Boolean).join(' ')}
      onSubmit={handleSubmit}
      role="search"
    >
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={[Styles.Input, inputClassName].filter(Boolean).join(' ')}
      />
      <button type="submit" className={[Styles.Button, buttonClassName].filter(Boolean).join(' ')}>
        Найти
      </button>
    </form>
  );
}
