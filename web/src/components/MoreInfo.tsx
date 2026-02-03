'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from './Icons';
import styles from '../app/page.module.css';

// Define types for the menu structure
type MenuItemType = 'group' | 'link';

interface MenuItem {
    type: MenuItemType;
    label: string;
    id: string; // Unique ID for toggling
    collection?: string; // Directus collection name (for links)
    items?: MenuItem[]; // Sub-items (for groups)
}

const MENU_DATA: MenuItem[] = [
    {
        type: 'group',
        id: 'aromatherapy',
        label: 'Sobre Aromaterapia',
        items: [
            { type: 'link', id: 'usage_modes', label: 'Modos de Empleo', collection: 'usage_modes' },
            { type: 'link', id: 'aromatherapy_tips', label: 'Tips de Demostración', collection: 'aromatherapy_tips' },
            { type: 'link', id: 'general_precautions', label: 'Precauciones Generales', collection: 'general_precautions' },
            { type: 'link', id: 'faq', label: 'Preguntas frecuentes', collection: 'faq' }
        ]
    },
    {
        type: 'group',
        id: 'vital_just',
        label: 'Sobre Bienestar Dermo-Cosmético',
        items: [
            { type: 'link', id: 'vital_just_content', label: 'Acerca de Vital Just', collection: 'vital_just_content' },
            { type: 'link', id: 'vital_just_flyers', label: 'Flyers Vital Just', collection: 'vital_just_flyers' },
            { type: 'link', id: 'vital_just_tips', label: 'Tips de Demostración Vital Just', collection: 'vital_just_tips' }
        ]
    },
    {
        type: 'link',
        id: 'terminology',
        label: 'Definición de Terminología',
        collection: 'terminology'
    },
    {
        type: 'link',
        id: 'ingredients',
        label: 'Índice de Ingredientes Naturales',
        collection: 'ingredients'
    }
];

export default function MoreInfo() {
    // State to track open groups. Default: both groups open as per screenshot roughly? 
    // Or closed? Screenshot had "Sobre Aromaterapia" expanded. Let's start with first one open.
    const [openIds, setOpenIds] = useState<string[]>(['aromatherapy', 'vital_just']);

    const toggle = (id: string) => {
        setOpenIds(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    return (
        <div className={styles.cardWrapper}>
            {MENU_DATA.map((item, index) => {
                const isLast = index === MENU_DATA.length - 1;

                // Render logic for Group (Accordion)
                if (item.type === 'group') {
                    const isOpen = openIds.includes(item.id);
                    return (
                        <div key={item.id} className={!isLast ? styles.accordionItemBorder : ''}>
                            <button
                                className={styles.accordionHeaderButton}
                                onClick={() => toggle(item.id)}
                            >
                                <span className={styles.categoryTitle}>{item.label}</span>
                                <div className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
                                    <ChevronRight />
                                </div>
                            </button>

                            {isOpen && item.items && (
                                <div className={styles.accordionContent}>
                                    {item.items.map((subItem) => (
                                        <Link
                                            key={subItem.id}
                                            href={`/info/${subItem.collection}`}
                                            className={styles.listItem}
                                            style={{ textDecoration: 'none', color: 'inherit' }}
                                        >
                                            <span className={styles.listLabel}>{subItem.label}</span>
                                            <div className={styles.chevronList}>
                                                <ChevronRight />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                }

                // Render logic for Standalone Link
                return (
                    <div key={item.id} className={!isLast ? styles.accordionItemBorder : ''}>
                        {/* Standalone Link */}
                        <Link
                            href={`/info/${item.collection}`}
                            className={styles.accordionHeaderButton}
                            style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}
                        >
                            <span className={styles.categoryTitle}>{item.label}</span>
                            <div className={styles.chevronList}>
                                <ChevronRight />
                            </div>
                        </Link>
                    </div>
                );
            })}
        </div>
    );
}
