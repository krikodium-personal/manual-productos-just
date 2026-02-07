'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { readItem, readItems } from '@directus/sdk';
import { directus } from '@/lib/directus';
import Header from '@/components/Header';
import { useCountry } from '@/context/CountryContext';
import { ArrowBack, ChevronDown, ChevronRight, WarningBadge, InfoCircle, ArrowRightIcon, PlayIcon, StarBadgeIcon, SuggestedIcon, NotSuggestedIcon, LightbulbIcon, CloseIcon } from '@/components/Icons';
import styles from './product.module.css';

// Interfaces based on Data Model
interface Product {
    id: string;
    slug: string;
    name: string;
    description: string; // The subtitle! But verify if DB returns description or description_short
    description_short?: string; // Add this just in case
    description_long?: string;
    photo?: string;
    custom_usage_mode?: string; // Legacy string
    custom_usage_modes?: any[]; // New O2M list

    // Relations
    usage_modes?: any[];
    attributes?: any[];
    ingredients?: any[];
    related_products?: any[];
    variants?: any[]; // [NEW] Replace markets with variants hierarchy

    // JSON Fields or O2M
    benefits?: any[] | null;
    uses_suggestions?: any[] | null;
    specific_precautions?: any[] | null;
    intro_questions?: string;

    // Tradition Herbal
    tradition_image?: string;
    tradition_title?: string;
    tradition_divider?: string;
    tradition_text?: string;
    tradition_extraction?: string;

    demo_tips?: any[] | null;

    // [NEW] Boolean Visibility Flags
    show_hero?: boolean;
    show_benefits?: boolean;
    show_ingredients?: boolean;
    show_calculator?: boolean;
    show_usage_modes?: boolean;
    show_custom_usage_modes?: boolean;
    show_uses_suggestions?: boolean;
    show_demo_tips?: boolean;
    show_combinations?: boolean;
    show_precautions?: boolean;

    // files
    datasheet?: string;
    flyer?: string;

    // External
    ecommerce_url?: string;
}

export default function ProductPage() {
    const params = useParams();
    const router = useRouter();
    const { selectedCountry } = useCountry();
    const slug = params.slug as string;
    console.log("Rendering ProductPage with slug:", slug);

    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    // State for Collapsible Tradition Section
    const [isTraditionExpanded, setIsTraditionExpanded] = useState(false);

    // Toggle function
    const toggleTradition = () => {
        setIsTraditionExpanded(!isTraditionExpanded);
    };

    // State for Ingredients
    const [isMainIngredientsExpanded, setIsMainIngredientsExpanded] = useState(true);
    const [isSecondaryIngredientsExpanded, setIsSecondaryIngredientsExpanded] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState<any>(null);

    const toggleMainIngredients = () => setIsMainIngredientsExpanded(!isMainIngredientsExpanded);
    const toggleSecondaryIngredients = () => setIsSecondaryIngredientsExpanded(!isSecondaryIngredientsExpanded);

    const openIngredientModal = (ingredient: any) => {
        setSelectedIngredient(ingredient);
        document.body.style.overflow = 'hidden'; // Prevent scroll
    };

    const closeIngredientModal = () => {
        setSelectedIngredient(null);
        document.body.style.overflow = 'auto'; // Restore scroll
    };

    useEffect(() => {
        async function fetchProduct() {
            try {
                // Fetch by Slug using filtered readItems
                const result = await directus.request(readItems('products', {
                    filter: {
                        slug: { _eq: slug }
                    },
                    limit: 1,
                    fields: [
                        '*',
                        'usage_modes.usage_mode_id.*',
                        'usage_modes.is_recommended',
                        'usage_modes.custom_text', // [NEW] Fetch custom text
                        'attributes.attribute_id.*',
                        'demo_tips',
                        'show_intro_questions',
                        // Boolean Visibility
                        'show_hero',
                        'show_benefits',
                        'show_ingredients',
                        'show_calculator',
                        'show_usage_modes',
                        'show_custom_usage_modes',
                        'show_uses_suggestions',
                        'show_demo_tips',
                        'show_combinations',
                        'show_tradition',
                        'show_attributes',
                        'show_precautions',
                        // Ingredients
                        'ingredients.is_main',
                        'ingredients.ingredient_id.*',
                        // Related Products (Detailed)
                        'related_products', // Explicit root
                        'related_products.*', // Wildcard for junction
                        'related_products.related_products_id.name',
                        'related_products.related_products_id.photo',
                        'related_products.related_products_id.id',
                        'related_products.related_products_id.slug', // Fetch SLUG for links
                        'related_products.related_products_id.product_code',
                        'related_products.related_products_id.variants.code',
                        'related_products.related_products_id.variants.prices.price',
                        'related_products.related_products_id.variants.prices.country_id',
                        'intro_questions',
                        // Tradition Herbal
                        'tradition_image',
                        'tradition_title',
                        'tradition_text',
                        'tradition_extraction',
                        // Country-First Prices via Variants
                        'variants.code',
                        'variants.variant_id.*',
                        'variants.prices.*',
                        'variants.prices.country_id', // keeping just in case old code relies on it, but likely should be market
                        'variants.prices.market.*',   // [NEW] fetch market details including domain
                        'custom_usage_mode',
                        'custom_usage_modes.description',
                        'custom_usage_modes.application_amount.amount',
                        'custom_usage_modes.application_amount.unit',
                        'custom_usage_modes.application_amount.amount',
                        'custom_usage_modes.application_amount.unit',
                        'custom_usage_modes.application_amount.name',
                        'datasheet', // [NEW] Fetch datasheet file ID
                        'flyer',     // [NEW] Fetch flyer file ID
                        'ecommerce_url' // [NEW] Fetch ecommerce URL
                    ]
                }));

                if (result && result.length > 0) {
                    setProduct(result[0] as any);
                } else {
                    setProduct(null); // Not found
                }

            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        }

        if (slug) fetchProduct();
    }, [slug]);

    useEffect(() => {
        if (product) {
            console.log("DEBUG: Product Data:", product);
            console.log("DEBUG: Related Products Raw:", product.related_products);
        }
    }, [product]);

    if (loading) return <div className={styles.loading}>Cargando...</div>;
    if (!product) return <div className={styles.error}>Producto no encontrado</div>;

    // --- Data Flattening/Helpers ---
    const usageList = product.usage_modes?.map((m: any) => ({
        ...m.usage_mode_id,
        is_recommended: m.is_recommended,
        custom_text: m.custom_text // [NEW]
    })).filter((u: any) => u && u.id) || [];
    const attributeList = product.attributes?.map((a: any) => a.attribute_id).filter(Boolean) || [];
    const benefitsData = product.benefits || [];

    // Helper for Section Visibility
    // If visible_sections is null/empty, we assume ALL are visible (legacy behavior)
    // Helper for Section Visibility
    // We check explicit false to hide, otherwise show (backward compat / default)
    const isVisible = (sectionKey: string) => {
        const key = `show_${sectionKey}` as keyof Product;
        return product[key] !== false;
    };

    // Handle description: try description_short first, then description
    const subtitle = product.description_short || product.description;

    const handleShare = async () => {
        if (!product) return;

        // Try to FIND domain in markets first
        // Assuming we want the first available market or a specific logic?
        // Since we don't have a global country selector, we'll try to find any market with a domain.
        let domain = "";

        if (product.variants && product.variants.length > 0) {
            // Find first variant that has a price with a valid country domain
            for (const v of product.variants) {
                const priceWithDomain = v.prices?.find((pr: any) => {
                    const m = pr.market || pr.country_id; // Support both just in case
                    return m && m.domain;
                });
                if (priceWithDomain) {
                    domain = (priceWithDomain.market || priceWithDomain.country_id).domain;
                    break;
                }
            }
        }

        // Fallback: If we can't find it in markets (maybe data is incomplete), we might want a default or just use the ecommerce_url if it's absolute.
        // But the requirement says "domain + ecommerce_url".
        // If domain is missing, the URL will be incomplete if ecommerce_url is relative.

        const ecommerceUrl = product.ecommerce_url || "";
        const externalUrl = `${domain}${ecommerceUrl}`;

        const message = `¡Hola!
Te comparto el enlace para que puedas ver y comprar el ${product.name} en nuestra Tienda Online
${externalUrl}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Ver ${product.name}`,
                    text: message,
                    // url: externalUrl // Some apps prefer URL in text vs dedicated field, the prompt asked for a specific message structure.
                });
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(message);
                alert("Enlace copiado al portapapeles!");
            } catch (err) {
                console.error("Error copying to clipboard:", err);
            }
        }
    };

    const handleCalculate = () => {
        router.push(`/calculador-rendimientos?product=${product.slug || slug}`);
    };

    const handleDownloadDatasheet = () => {
        if (product.datasheet) {
            window.open(`${directusUrl}/assets/${product.datasheet}?download`, '_blank');
        }
    };

    const handleDownloadFlyer = () => {
        if (product.flyer) {
            window.open(`${directusUrl}/assets/${product.flyer}?download`, '_blank');
        }
    };

    return (
        <div className={styles.main}>
            <Header
                title="Detalle de producto"
                onBack={() => router.back()}
                showSearch={false}
                showKebab={true}
                onShare={handleShare}
                onCalculate={handleCalculate}
                showDatasheet={!!product.datasheet}
                showFlyer={!!product.flyer}
                onDownloadDatasheet={handleDownloadDatasheet}
                onDownloadFlyer={handleDownloadFlyer}
                showCalculator={product.show_calculator !== false}
            />
            <div className={styles.content}>

                {/* HERO */}
                {isVisible('hero') && (
                    <section className={styles.hero}>
                        {product.photo && (
                            <div className={styles.imageContainer}>
                                <img
                                    src={`${directusUrl}/assets/${product.photo}`}
                                    alt={product.name}
                                    className={styles.productImage}
                                />
                            </div>
                        )}

                        <div className={styles.titleSection}>
                            <h2 className={styles.productTitle}>{product.name}</h2>
                            <p className={styles.productSubtitle}>
                                {subtitle}
                            </p>
                            <div className={styles.productDescription} dangerouslySetInnerHTML={{ __html: product.description_long || '' }} />
                        </div>
                    </section>
                )}



                {/* INGREDIENTS */}
                {isVisible('ingredients') && (() => {
                    if (!product.ingredients || product.ingredients.length === 0) return null;

                    const mainIngredients = product.ingredients.filter((i: any) => i.is_main);
                    const secondaryIngredients = product.ingredients.filter((i: any) => !i.is_main);

                    const shouldShowMainToggle = mainIngredients.length > 4;
                    const visibleMainIngredients = isMainIngredientsExpanded ? mainIngredients : mainIngredients.slice(0, 4);

                    const shouldShowSecondaryToggle = secondaryIngredients.length > 4;
                    const visibleSecondaryIngredients = isSecondaryIngredientsExpanded ? secondaryIngredients : secondaryIngredients.slice(0, 4);

                    return (
                        <section className={styles.ingredientsSection}>
                            {/* Main Active Ingredient */}
                            {mainIngredients.length > 0 && (
                                <div className={styles.ingredientGroup}>
                                    <h3
                                        className={styles.ingredientHeader}
                                        onClick={shouldShowMainToggle ? toggleMainIngredients : undefined}
                                        style={{ cursor: shouldShowMainToggle ? 'pointer' : 'default' }}
                                    >
                                        INGREDIENTE ACTIVO PRINCIPAL
                                        {shouldShowMainToggle && (
                                            <div style={{ transform: isMainIngredientsExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'flex' }}>
                                                <ChevronDown color="#5AAFF1" />
                                            </div>
                                        )}
                                    </h3>
                                    <div className={styles.ingredientList}>
                                        {visibleMainIngredients.map((item: any, idx: number) => (
                                            <div key={idx} className={styles.ingredientItem} onClick={() => openIngredientModal(item.ingredient_id)}>
                                                <PlayIcon color="#5AAFF1" />
                                                <span>{item.ingredient_id?.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Secondary Ingredients */}
                            {secondaryIngredients.length > 0 && (
                                <div className={styles.ingredientGroup}>
                                    <div
                                        className={styles.ingredientHeader}
                                        onClick={shouldShowSecondaryToggle ? toggleSecondaryIngredients : undefined}
                                        style={{ cursor: shouldShowSecondaryToggle ? 'pointer' : 'default' }}
                                    >
                                        INGREDIENTES SECUNDARIOS
                                        {shouldShowSecondaryToggle && (
                                            <div style={{ transform: isSecondaryIngredientsExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'flex' }}>
                                                <ChevronDown color="#5AAFF1" />
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.secondaryList}>
                                        {visibleSecondaryIngredients.map((item: any, idx: number) => (
                                            <div key={idx} className={styles.ingredientItem} onClick={() => openIngredientModal(item.ingredient_id)}>
                                                <PlayIcon color="#5AAFF1" />
                                                <span>{item.ingredient_id?.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    );
                })()}

                {/* BENEFITS */}
                {isVisible('benefits') && benefitsData.length > 0 && (
                    <section className={styles.benefitsSection}>
                        <h3 className={styles.sectionTitle}>Beneficios</h3>
                        {benefitsData.map((benefit: any, idx: number) => {
                            const benefitTitle = benefit.benefit || benefit.title || "Beneficio";
                            // Handle cases where benefit might be just a string if structure changed
                            const benefitDesc = typeof benefit === 'string' ? '' : (benefit.description || benefit.benefit_description || '');

                            return (
                                <div key={idx} className={styles.benefitItem}>
                                    <div className={styles.benefitHeader}>
                                        <div className={styles.benefitIconBox}>
                                            <PlayIcon color="#456ECE" />
                                        </div>
                                        <span className={styles.benefitTitle}>{benefitTitle}</span>
                                    </div>

                                    {benefitDesc && (
                                        <div className={styles.benefitContent}>
                                            <div dangerouslySetInnerHTML={{ __html: benefitDesc }}></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </section>
                )}




                {/* CALCULATOR BANNER */}
                {isVisible('calculator') && (
                    <div className={styles.calculatorBanner}>
                        <button
                            className={styles.calcButton}
                            onClick={() => router.push(`/calculador-rendimientos?product=${product.slug || slug}`)}
                        >
                            Calculador de Rendimientos
                        </button>
                    </div>
                )}

                {/* USOS Y SUGERENCIAS */}
                {isVisible('uses_suggestions') && product.uses_suggestions && product.uses_suggestions.length > 0 && (
                    <section className={styles.usesSuggestionsSection}>
                        <h3 className={styles.sectionTitle}>Usos y sugerencias</h3>
                        <div className={styles.usesCard}>
                            {product.uses_suggestions.map((item: any, idx: number) => (
                                <div key={idx} className={styles.usesItem}>
                                    <div className={styles.usesIcon}>
                                        <StarBadgeIcon />
                                    </div>
                                    <p className={styles.usesText}>
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* USAGE MODES - Aromatherapy */}
                {isVisible('usage_modes') && usageList.length > 0 && (
                    <section className={styles.usageSection}>
                        <h3 className={styles.sectionTitle} style={{ padding: 0 }}>Modos de empleo</h3>
                        <div className={styles.usageGrid}>
                            {usageList.map((usage: any) => (
                                <div key={usage.id} className={styles.usageItem}>
                                    <div className={styles.usageIcon}>
                                        {usage.is_recommended !== false ? <SuggestedIcon /> : <NotSuggestedIcon />}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span className={styles.usageText}>{usage.title || usage.name}</span>
                                        {usage.custom_text && (
                                            <span style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                                                {usage.custom_text}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <a className={styles.usageLink} href="#">
                            Ver modos de empleo de aceites esenciales <ArrowRightIcon />
                        </a>
                    </section>
                )}

                {/* USAGE MODES - Other Products (Custom) */}
                {isVisible('custom_usage_modes') && (product.custom_usage_mode || (product.custom_usage_modes && product.custom_usage_modes.length > 0)) && (
                    <section className={styles.usageSection} style={{ marginTop: '16px' }}>
                        {/* Custom Usage Modes (List) */}
                        {product.custom_usage_modes && product.custom_usage_modes.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                                <h3 className={styles.sectionTitle} style={{ padding: 0 }}>Modo de empleo</h3>
                                {product.custom_usage_modes.map((mode: any, idx: number) => (
                                    <div key={idx} className={styles.usageItem}>
                                        <div className={styles.usageIcon}>
                                            <SuggestedIcon />
                                        </div>
                                        <span className={styles.usageText}>
                                            {typeof mode === 'string' ? mode : (mode.description || mode.name)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Legacy String Fallback */}
                        {product.custom_usage_mode && !product.custom_usage_modes && (
                            <div className={styles.usageText} style={{ display: 'block', width: '100%' }}>
                                <span style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Modos de uso particulares</span>
                                {product.custom_usage_mode}
                            </div>
                        )}
                    </section>
                )}

                {/* INTRO QUESTIONS */}
                {isVisible('intro_questions') && product.intro_questions && (
                    <section className={
                        (Array.isArray(product.intro_questions) && product.intro_questions.length > 1)
                            ? styles.introQuestionsMultiple
                            : styles.introQuestionsSingle
                    }>
                        <h3 className={styles.introTitle}>Preguntas introductivas</h3>
                        {Array.isArray(product.intro_questions) ? (
                            product.intro_questions.map((q: any, i: number) => (
                                <div key={i} className={styles.introItem}>{typeof q === 'string' ? q : q.question || q}</div>
                            ))
                        ) : (
                            // Fallback for legacy string (single question)
                            <div className={styles.introText}>{product.intro_questions}</div>
                        )}
                    </section>
                )}

                {/* DEMO TIPS [NEW] */}
                {isVisible('demo_tips') && product.demo_tips && product.demo_tips.length > 0 && (
                    <section className={styles.usesSuggestionsSection} style={{ marginTop: '24px' }}>
                        <h3 className={styles.sectionTitle}>Tips de demostración</h3>
                        <div className={styles.demoTipsCard}>
                            {product.demo_tips.map((item: any, idx: number) => (
                                <div key={idx} className={styles.demoTipsItem}>
                                    <div className={styles.usesIcon}>
                                        <LightbulbIcon />
                                    </div>
                                    <p className={styles.usesText}>
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* COMBINATIONS CAROUSEL */}
                {isVisible('combinations') && (
                    <section className={styles.combinationsSection}>
                        <h3 className={styles.sectionTitle} style={{ paddingLeft: '24px' }}>Combinaciones sugeridas</h3>
                        <div className={styles.carousel}>
                            {product.related_products?.map((rel: any) => {
                                const p = rel.related_products_id;
                                if (!p) return null;

                                return (
                                    <div key={p.id} className={styles.productCard} onClick={() => router.push(`/products/${p.slug || p.id}`)}>
                                        <div className={styles.cardImageWrapper}>
                                            {p.photo ? (
                                                <img
                                                    src={`${directusUrl}/assets/${p.photo}`}
                                                    className={styles.cardImage}
                                                    alt={p.name}
                                                />
                                            ) : (
                                                /* Placeholder or generic image? */
                                                <div style={{ width: '100%', height: '100%' }} />
                                            )}
                                        </div>
                                        <div className={styles.cardBody}>
                                            <span className={styles.cardTitle}>{p.name}</span>

                                            {/* Product Code */}
                                            {(() => {
                                                let code = null;
                                                if (selectedCountry && p.variants) {
                                                    const relevantVariant = p.variants.find((v: any) =>
                                                        v.prices?.some((pr: any) => (pr.market === selectedCountry.id || pr.market?.id === selectedCountry.id))
                                                    );
                                                    code = relevantVariant?.code;
                                                }
                                                // Fallback
                                                if (!code) code = p.product_code;

                                                return code ? <span className={styles.cardCode}>{code}</span> : null;
                                            })()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* TRADITION HERBAL */}
                {isVisible('tradition') && (
                    <section className={styles.traditionSection}>
                        <h3 className={styles.sectionTitle}>Tradición Herbal</h3>
                        <div className={styles.traditionCard}>
                            {product.tradition_image ? (
                                <img
                                    src={`${directusUrl}/assets/${product.tradition_image}`}
                                    className={styles.traditionImage}
                                />
                            ) : (
                                <div style={{ height: 200, background: '#eee' }}></div>
                            )}
                            <div className={styles.traditionContent}>
                                <div>
                                    <span className={styles.traditionLabel}>{product.tradition_title || "INFORMACIÓN"}</span>
                                    {/* Use collapsed class if not expanded */}
                                    <div
                                        className={isTraditionExpanded ? styles.traditionText : styles.traditionTextCollapsed}
                                        dangerouslySetInnerHTML={{ __html: product.tradition_text || '' }}
                                    ></div>
                                </div>

                                {/* Show Extraction only if Expanded */}
                                {isTraditionExpanded && product.tradition_extraction && (
                                    <div style={{ marginTop: 16 }}>
                                        <span className={styles.traditionLabel}>MÉTODO DE EXTRACCIÓN</span>
                                        <p className={styles.traditionText}>{product.tradition_extraction}</p>
                                    </div>
                                )}

                                {/* Toggle Button */}
                                <button className={styles.toggleButton} onClick={toggleTradition}>
                                    {isTraditionExpanded ? 'Ver menos' : 'Ver más'}
                                    <ChevronDown color={isTraditionExpanded ? "#456ECE" : "#222"} />
                                </button>
                            </div>
                        </div>
                    </section>
                )}
                {/* ATTRIBUTES */}
                {isVisible('attributes') && attributeList.length > 0 && (
                    <section className={styles.attributesSection}>
                        <h3 className={styles.sectionTitle} style={{ alignSelf: 'flex-start', padding: 0 }}>Atributos</h3>
                        <div className={styles.attributesGrid}>
                            {attributeList.map((attr: any) => (
                                <div key={attr.id} className={styles.attributeItem}>
                                    <div className={styles.attributeIcon}>
                                        {attr.icon ? (
                                            <img src={`${directusUrl}/assets/${attr.icon}`} style={{ width: '60%', height: '60%', borderRadius: '50%' }} />
                                        ) : (
                                            <span>ICON</span>
                                        )}
                                    </div>
                                    <span className={styles.attributeLabel}>{attr.name}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}


                {/* SPECIFIC PRECAUTIONS */}
                {isVisible('precautions') && product.specific_precautions && product.specific_precautions.length > 0 && (
                    <section className={styles.precautionsSection}>
                        <h3 className={styles.sectionTitle}>Precauciones Específicas</h3>
                        <div className={styles.precautionCard}>
                            {(product.specific_precautions as any[]).map((prec, idx) => (
                                <div key={idx} className={styles.precautionItem}>
                                    <WarningBadge className={styles.warningIcon} />
                                    <p className={styles.precautionText}>
                                        {typeof prec === 'string' ? prec : prec.precaution}
                                    </p>
                                </div>
                            ))}
                            {/* Link at bottom of card */}
                            <a href="#" className={styles.precautionLink}>
                                Ver precauciones de aceites esenciales <ArrowRightIcon />
                            </a>
                        </div>
                    </section>
                )}

                {/* CARE MESSAGE */}
                <div className={styles.careMessage}>
                    <div className={styles.careTitle}>
                        <InfoCircle className={styles.careIcon} />
                        CUIDADO Y CONSERVACIÓN
                    </div>
                    <p className={styles.careText}>
                        Mantener los envases en un lugar oscuro, bien cerrados y alejados del frío y del calor extremo.
                    </p>
                </div>
                {/* Modal for Ingredient Details */}
                {selectedIngredient && (
                    <div className={styles.modalOverlay} onClick={closeIngredientModal}>
                        <style>{`
                            .custom-modal-header {
                                height: 56px !important;
                                min-height: 56px !important;
                                padding: 0 24px !important;
                                display: flex !important;
                                alignItems: center !important;
                            }
                            .custom-modal-image-container {
                                height: 156px !important;
                                min-height: 156px !important;
                                padding: 0 !important;
                                width: 100% !important;
                                background: #FDFBF4 !important;
                                display: flex !important;
                                align-items: center !important;
                                justify-content: center !important;
                            }
                            .custom-modal-image {
                                height: 100% !important;
                                width: auto !important;
                                display: block !important;
                                object-fit: contain !important;
                            }
                            .custom-modal-description, 
                            .custom-modal-description * {
                                font-family: 'Museo Sans', sans-serif !important;
                                font-weight: 500 !important;
                                font-size: 14px !important;
                                line-height: 20px !important;
                                color: #908F9A !important;
                            }
                            .custom-modal-button {
                                box-sizing: border-box !important;
                                display: flex !important;
                                flex-direction: row !important;
                                justify-content: center !important;
                                align-items: center !important;
                                padding: 16px 24px !important;
                                gap: 4px !important;
                                width: 100% !important;
                                height: 56px !important;
                                border: 1.5px solid #5AAFF1 !important;
                                border-radius: 12px !important;
                                background: transparent !important;
                                color: #5AAFF1 !important;
                                font-family: 'Museo Sans', sans-serif !important;
                                font-weight: 600 !important;
                                font-size: 14px !important;
                                text-decoration: none !important;
                            }
                        `}</style>
                        <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                            <div className={`${styles.modalHeader} custom-modal-header`}>
                                <div style={{ width: 24 }} /> {/* Spacer */}
                                <h3 className={styles.modalHeaderTitle} style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{selectedIngredient.name}</h3>
                                <div className={styles.modalClose} onClick={closeIngredientModal} style={{ cursor: 'pointer' }}>
                                    <CloseIcon />
                                </div>
                            </div>

                            {selectedIngredient.photo && (
                                <div className={`${styles.modalImageContainer} custom-modal-image-container`}>
                                    <img
                                        src={`${directusUrl}/assets/${selectedIngredient.photo}`}
                                        alt={selectedIngredient.name}
                                        className={`${styles.modalImage} custom-modal-image`}
                                    />
                                </div>
                            )}

                            <div className={styles.modalBody} style={{ padding: '24px' }}>
                                <h4 className={styles.modalIngredientName} style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 700 }}>{selectedIngredient.name}</h4>
                                <div
                                    className="custom-modal-description"
                                    dangerouslySetInnerHTML={{ __html: selectedIngredient.description || '' }}
                                />
                            </div>

                            <div className={styles.modalFooter}>
                                <a
                                    href={`/ingredients/${selectedIngredient.id}`}
                                    onClick={(e) => e.preventDefault()} // Keep as placeholder for now
                                    className="custom-modal-button"
                                >
                                    Ver detalle completo
                                </a>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
