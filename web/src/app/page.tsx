import Link from 'next/link';
import ProductFamily from '@/components/ProductFamily';
import MoreInfo from '@/components/MoreInfo';
import { SearchIcon, ChevronRight, InfoIcon, CalculatorCardIcon, GuideIcon } from '@/components/Icons';
import styles from './page.module.css';

// Componente Header (Simplificado para esta vista)
import Header from '@/components/Header';
import { APP_VERSION } from '@/constants/version';

import { useCountry } from '@/context/CountryContext';

export default function Home() {
  const { selectedCountry } = useCountry();

  return (
    <main className={styles.main}>
      <Header />

      <div className={styles.contentScroll}>
        {/* Sección Familia de Productos con el nuevo componente acordeón */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Familia de productos</h2>
          <ProductFamily />
        </section>

        {/* Card Calculador */}
        <Link href="/calculador-rendimientos" className={styles.calculatorCard}>
          <div className={styles.calcLeftContent}>
            <div className={styles.calcHeader}>
              <CalculatorCardIcon className={styles.calcIcon} />
              <h3 className={styles.calcTitle}>Calculador de Rendimientos</h3>
            </div>
            <p className={styles.calcDesc}>Calcula el rendimiento de un producto según cantidad y frecuencia de uso</p>
          </div>
          <div className={styles.calcChevron}>
            <ChevronRight />
          </div>
        </Link>

        {/* Card Guía de Referencia Rápida */}
        <Link href="/guia-referencia-rapida" className={styles.guideCard}>
          <div className={styles.calcLeftContent}>
            <div className={styles.calcHeader}>
              <GuideIcon className={styles.calcIcon} />
              <h3 className={styles.calcTitle}>Guía de Referencia Rápida</h3>
            </div>
            <p className={styles.calcDesc}>Encuentra el producto Just que mejor se adapte a necesidades específicas.</p>
          </div>
          <div className={styles.calcChevron}>
            <ChevronRight />
          </div>
        </Link>

        {/* Sección Para saber más con el nuevo componente acordeón */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Para saber más</h2>
          <MoreInfo />
        </section>

        <div style={{
          padding: '40px 16px 20px',
          textAlign: 'center',
          color: '#C7C7CC',
          fontSize: '11px',
          fontFamily: 'var(--font-museo)',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {selectedCountry && (
            <div style={{ marginBottom: '8px', color: '#908F9A', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span>País: {selectedCountry.name}</span>
              <Link href="/select-country" style={{ color: '#5AAFF1', textDecoration: 'none', fontWeight: 600 }}>
                Cambiar
              </Link>
            </div>
          )}
          Versión {APP_VERSION}
        </div>
      </div>
    </main>
  );
}
