'use client';
import { SearchIcon, InfoIcon, ArrowBack, KebabIcon, ShareIcon, CalculateIcon, DownloadIcon } from './Icons';
import SearchBar from './SearchBar';
import styles from '../app/page.module.css';
import { useState, useEffect, useRef } from 'react';
import { APP_VERSION } from '@/constants/version';

interface HeaderProps {
    title?: string;
    onBack?: () => void;
    showSearch?: boolean;
    showKebab?: boolean;
    showShare?: boolean;
    children?: React.ReactNode;
    onShare?: () => void;
    onCalculate?: () => void;
    showDatasheet?: boolean;
    showFlyer?: boolean;
    onDownloadDatasheet?: () => void;
    onDownloadFlyer?: () => void;
}

const Header = ({
    title = "Manual de Productos",
    onBack,
    showSearch = true,
    showKebab = false,
    showShare = false,
    children,
    onShare,
    onCalculate,
    showDatasheet = false,
    showFlyer = false,
    onDownloadDatasheet,
    onDownloadFlyer
}: HeaderProps) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isKebabOpen, setIsKebabOpen] = useState(false);
    const lastScrollY = useRef(0);

    const toggleKebab = () => setIsKebabOpen(!isKebabOpen);

    useEffect(() => {
        const handleScroll = () => {
            if (isKebabOpen) return; // Don't hide header if menu is open
            const currentScrollY = window.scrollY;

            // Hide if scrolling DOWN
            if (currentScrollY > lastScrollY.current && currentScrollY > 10) {
                setIsVisible(false);
            } else if (currentScrollY < lastScrollY.current) {
                // Show if scrolling UP
                setIsVisible(true);
            }

            // Special case: Always show if at the very top (optional, but usually desired)
            if (currentScrollY < 10) setIsVisible(true);

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isKebabOpen]);

    return (
        <>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    {/* Back Icon */}
                    {onBack ? (
                        <button onClick={onBack} className={styles.iconBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                            <ArrowBack />
                        </button>
                    ) : (
                        <div className={styles.iconBack}></div>
                    )}

                    <h1 className={styles.headerTitle}>{title}</h1>

                    {/* Help Icon or Kebab Icon or Share Icon */}
                    <div className={styles.iconHelp} style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '12px' }}>
                        {showKebab && (
                            <div
                                onClick={toggleKebab}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', cursor: 'pointer' }}
                            >
                                <KebabIcon />
                            </div>
                        )}
                        {showShare && !showKebab && (
                            <button
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: title,
                                            url: window.location.href
                                        });
                                    }
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                            >
                                <ShareIcon />
                            </button>
                        )}
                    </div>
                </div>

                {isKebabOpen && (
                    <>
                        {/* Overlay */}
                        <div
                            onClick={() => setIsKebabOpen(false)}
                            style={{
                                position: 'fixed',
                                top: '60px',
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(23, 26, 34, 0.4)',
                                zIndex: 95
                            }}
                        />
                        {/* Dropdown Menu */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '0',
                                position: 'absolute',
                                width: '226px',
                                height: 'auto',
                                right: '0',
                                top: '60px',
                                background: '#FFFFFF',
                                borderRadius: '0px 0px 16px 16px',
                                zIndex: 100,
                                boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
                                fontFamily: 'var(--font-museo)',
                                boxSizing: 'border-box'
                            }}
                        >
                            <div
                                onClick={() => {
                                    setIsKebabOpen(false);
                                    if (onShare) onShare();
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', height: '56px', cursor: 'pointer', padding: '0 16px', borderBottom: '1px solid #F0F0F0', boxSizing: 'border-box' }}
                            >
                                <ShareIcon />
                                <span style={{ fontSize: '14px', color: '#171A22', fontWeight: 500 }}>Compartir producto</span>
                            </div>
                            <div
                                onClick={() => {
                                    setIsKebabOpen(false);
                                    if (onCalculate) onCalculate();
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', height: '56px', cursor: 'pointer', padding: '0 16px', borderBottom: (showFlyer || showDatasheet) ? '1px solid #F0F0F0' : 'none', boxSizing: 'border-box' }}
                            >
                                <CalculateIcon />
                                <span style={{ fontSize: '14px', color: '#171A22', fontWeight: 500 }}>Calcular rendimiento</span>
                            </div>

                            {showFlyer && (
                                <div
                                    onClick={() => {
                                        setIsKebabOpen(false);
                                        if (onDownloadFlyer) onDownloadFlyer();
                                    }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', height: '56px', cursor: 'pointer', padding: '0 16px', borderBottom: showDatasheet ? '1px solid #F0F0F0' : 'none', boxSizing: 'border-box' }}
                                >
                                    <DownloadIcon />
                                    <span style={{ fontSize: '14px', color: '#171A22', fontWeight: 500 }}>Descargar flyer en PDF</span>
                                </div>
                            )}

                            {showDatasheet && (
                                <div
                                    onClick={() => {
                                        setIsKebabOpen(false);
                                        if (onDownloadDatasheet) onDownloadDatasheet();
                                    }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', height: '56px', cursor: 'pointer', padding: '0 16px', boxSizing: 'border-box' }}
                                >
                                    <DownloadIcon />
                                    <span style={{ fontSize: '14px', color: '#171A22', fontWeight: 500 }}>Descargar ficha en PDF</span>
                                </div>
                            )}
                            <div style={{
                                padding: '12px 16px',
                                textAlign: 'center',
                                color: '#908F9A',
                                fontSize: '12px',
                                borderTop: '1px solid #F0F0F0',
                                backgroundColor: '#F9FAFB',
                                borderRadius: '0 0 16px 16px',
                                fontFamily: 'var(--font-museo)'
                            }}>
                                Versión {APP_VERSION}
                            </div>
                        </div>
                    </>
                )}
            </header >


            {/* Spacer to prevent content jump since search is fixed */}
            {/* Spacer to prevent content jump since header and search are fixed */}
            <div style={{
                height: showSearch && !children ? 152 : (children ? 132 : 60),
                width: '100%'
            }}></div>

            {
                showSearch && !children && (
                    <div
                        className={`${styles.searchContainer} ${isVisible ? styles.searchVisible : styles.searchHidden}`}
                        style={{
                            position: 'fixed',
                            top: '60px',
                            zIndex: 90,
                            transition: 'transform 0.3s ease-in-out',
                            transform: !isVisible ? 'translateX(-50%) translateY(-100%)' : 'translateX(-50%)'
                        }}
                    >
                        <SearchBar type="all" placeholder="Buscar Producto..." />
                        <div className={styles.searchHint}>
                            <InfoIcon />
                            <span>Puedes buscar por nombre, necesidad y/o ingrediente.</span>
                        </div>
                    </div>
                )
            }

            {
                children && (
                    <div
                        className={`${styles.searchContainer} ${isVisible ? styles.searchVisible : styles.searchHidden}`}
                        style={{
                            position: 'fixed',
                            top: '60px',
                            zIndex: 90,
                            transition: 'transform 0.3s ease-in-out',
                            transform: !isVisible ? 'translateX(-50%) translateY(-100%)' : 'translateX(-50%)'
                        }}
                    >
                        {children}
                    </div>
                )
            }
        </>
    );
};

export default Header;
