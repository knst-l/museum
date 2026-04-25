import React from 'react';
import Styles from './BaseLayout.module.css';
import { Header } from '../../../widgets/Header/Header';
import { Footer } from '../../../widgets/Footer/Footer';

export default function BaseLayout({ children, onAdminClick }) {
  return (
    <div className={Styles.Layout}>
      <Header />
      <main className={Styles.Main}>
        {children}
      </main>
      <Footer onAdminClick={onAdminClick || (() => {})} />
    </div>
  );
}