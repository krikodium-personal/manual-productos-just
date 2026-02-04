'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '@/components/Header';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './calculator.module.css';
import {
    ChevronLeft,
    SearchIcon,
    InfoIcon,
    DeleteOne,
    DropIcon,
    DollarIcon,
    CalendarIcon,
    ChevronDown,
    ShareIcon,
    CloseIcon,
    ChevronRight,
} from '@/components/Icons';
import { directus, getAssetUrl } from '@/lib/directus';
import { readItems } from '@directus/sdk';


// Custom Select Component
interface SelectOption {
    label: string;
    value: string | number;
}

interface SelectGroup {
    label: string;
    options: SelectOption[];
}

interface CustomSelectProps {
    value: string | number;
    onChange: (val: string | number) => void;
    options: (SelectOption | SelectGroup)[];
    placeholder: string;
    disabled?: boolean;
}

function CustomSelect({ value, onChange, options, placeholder, disabled }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (val: string | number) => {
        onChange(val);
        setIsOpen(false);
    };

    // Find label for current value
    let currentLabel = '';

    // Flatten options for search
    const allOptions: SelectOption[] = [];
    options.forEach(opt => {
        if ('options' in opt) {
            allOptions.push(...opt.options);
        } else {
            allOptions.push(opt);
        }
    });

    const found = allOptions.find(o => o.value.toString() === value.toString());
    if (found) currentLabel = found.label;

    return (
        <div
            className={`${styles.customSelectContainer} ${disabled ? styles.disabled : ''}`}
            ref={containerRef}
            onClick={() => !disabled && setIsOpen(!isOpen)}
        >
            <div className={styles.customSelectValue}>
                {value !== '' ? (
                    currentLabel
                ) : (
                    <span className={styles.customSelectPlaceholder}>{placeholder}</span>
                )}
            </div>

            <div style={{ pointerEvents: 'none', display: 'flex' }}>
                <ChevronDown />
            </div>

            {isOpen && !disabled && (
                <div className={styles.dropdownOptions}>
                    {options.map((opt, idx) => {
                        if ('options' in opt) {
                            // Group
                            return (
                                <React.Fragment key={idx}>
                                    <div className={styles.dropdownOptGroup}>{opt.label}</div>
                                    {opt.options.map((subOpt, subIdx) => (
                                        <div
                                            key={`${idx}-${subIdx}`}
                                            className={styles.dropdownItem}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelect(subOpt.value);
                                            }}
                                        >
                                            <span className={styles.dropdownItemText}>{subOpt.label}</span>
                                        </div>
                                    ))}
                                </React.Fragment>
                            );
                        } else {
                            // Single Option
                            return (
                                <div
                                    key={idx}
                                    className={styles.dropdownItem}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelect(opt.value);
                                    }}
                                >
                                    <span className={styles.dropdownItemText}>{opt.label}</span>
                                </div>
                            );
                        }
                    })}
                </div>
            )}
        </div>
    );
}

// Types
interface VariantPrice {
    price: number;
    variant_id: {
        id: number;
        capacity_value: number;
        capacity_unit: string;
    };
}

interface ProductMarket {
    id: number;
    country_id: number;
    prices: VariantPrice[];
}

interface Product {
    id: number;
    name: string;
    slug: string;
    photo: string;
    product_code?: string;
    markets: ProductMarket[];
    usage_modes?: any[];
    ingredients?: any[];
    attributes?: any[];
}

// Main Content Component
function CalculatorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Data
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedVariantIndex, setSelectedVariantIndex] = useState<number | string>('');
    const [applicationType, setApplicationType] = useState<string>('');
    const [usageFrequency, setUsageFrequency] = useState<string>('');

    // Search View State
    const [showResultsView, setShowResultsView] = useState(false);

    // Calculation State
    const [isCalculating, setIsCalculating] = useState(false);
    const [calculationResult, setCalculationResult] = useState<{
        applications: number;
        days: number;
        costPerApp: string;
        amountDescription: string;
    } | null>(null);

    // Validation State
    const [errors, setErrors] = useState({
        variant: false,
        type: false,
        frequency: false
    });

    // Fetch Products
    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await directus.request(readItems('products', {
                    fields: [
                        'id',
                        'name',
                        'slug',
                        'photo',
                        'markets.id',
                        'markets.country_id',
                        'markets.prices.price',
                        'markets.prices.variant_id.id',
                        'markets.prices.variant_id.capacity_value',
                        'markets.prices.variant_id.capacity_unit',
                        // usage modes
                        'usage_modes.usage_mode_id.id',
                        'usage_modes.usage_mode_id.title',
                        'usage_modes.usage_mode_id.default_drops',
                        'usage_modes.usage_mode_id.application_amount.id',
                        'usage_modes.usage_mode_id.application_amount.name',
                        'usage_modes.usage_mode_id.application_amount.amount',
                        'usage_modes.usage_mode_id.application_amount.unit',
                        // Custom Usage Modes
                        'custom_usage_modes.id',
                        'custom_usage_modes.description',
                        'custom_usage_modes.title',
                        'custom_usage_modes.application_amount.id',
                        // Search extensions
                        'ingredients.ingredient_id.id',
                        'ingredients.ingredient_id.name',
                        'attributes.attribute_id.id',
                        'attributes.attribute_id.name',
                        'custom_usage_modes.application_amount.name',
                        'custom_usage_modes.application_amount.amount',
                        'custom_usage_modes.application_amount.unit',
                    ]
                }));
                // @ts-ignore
                setProducts(res);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    // Auto-select product from URL param
    const productParam = searchParams.get('product');

    useEffect(() => {
        if (products.length > 0 && productParam) {
            // Find by slug (preferred) or ID
            const found = products.find(p => p.slug === productParam || p.id.toString() === productParam);
            if (found && (!selectedProduct || selectedProduct.id !== found.id)) {
                handleSelectProduct(found);
            }
        }
    }, [products, productParam]);

    // Filter Logic
    // Derived State for Search
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return [];
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, products]);


    const handleSearchSubmit = (e?: React.KeyboardEvent) => {
        if (e && e.key !== 'Enter') return;
        if (searchTerm.length >= 3) {
            setShowResultsView(true);
        }
    };

    // Helper to get variants
    const getVariants = (product: Product) => {
        if (!product.markets) return [];
        const market = product.markets[0]; // TODO: Filter by current user country
        if (!market || !market.prices) return [];
        return market.prices;
    };

    // Helper to get usage modes
    interface ApplicationAmount {
        id: number;
        name: string;
        amount: number;
        unit: string;
    }

    interface UsageMode {
        id: string | number;
        title: string;
        default_drops?: number;
        application_amount?: ApplicationAmount;
    }

    const getUsageModes = (product: Product): UsageMode[] => {
        let modes: UsageMode[] = [];

        // 1. Standard Usage Modes
        if (product.usage_modes) {
            modes = product.usage_modes.map((m: any) => m.usage_mode_id).filter((u: any) => u && u.id);
        }

        // 2. Custom Usage Modes (Only if product has 'gr' variant)
        const variants = getVariants(product);
        const hasGramVariant = variants.some(v => v.variant_id.capacity_unit.toLowerCase().includes('g'));

        if (hasGramVariant && (product as any).custom_usage_modes) {
            const customModes = (product as any).custom_usage_modes.map((m: any) => ({
                id: `custom_${m.id}`,
                title: m.title || m.description,
                application_amount: m.application_amount
            }));
            modes = [...modes, ...customModes];
        }

        return modes;
    };

    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);
        setSearchTerm('');
        setSelectedVariantIndex('');
        setApplicationType('');
        setUsageFrequency('');
        setErrors({ variant: false, type: false, frequency: false });
        setCalculationResult(null);
    };

    const handleBack = () => {
        setSelectedProduct(null);
        setErrors({ variant: false, type: false, frequency: false });
        setCalculationResult(null);
        setIsCalculating(false);
    };

    // Calculation Logic
    const performCalculation = (
        p_variantIndex: number | string,
        p_appType: string,
        p_frequency: string
    ) => {
        if (p_variantIndex === '' || p_appType === '' || p_frequency === '' || !selectedProduct) {
            return null;
        }

        const variants = getVariants(selectedProduct);
        const variant = variants[Number(p_variantIndex)];
        const usageModes = getUsageModes(selectedProduct);
        const usageMode = usageModes.find((m: UsageMode) => m.id.toString() === p_appType.toString());

        if (!variant || !usageMode) return null;

        const ml = variant.variant_id.capacity_value;
        let amountPerApp = 0;
        let amountName = '';

        if (usageMode.application_amount) {
            amountPerApp = usageMode.application_amount.amount;
            amountName = `${usageMode.application_amount.amount} ${usageMode.application_amount.unit}`;
        } else {
            const drops = usageMode.default_drops || 5;
            amountPerApp = drops * 0.05;
            amountName = `${drops} gotas`;
        }

        let usesPerWeek = 0;
        if (p_frequency === 'daily_1') usesPerWeek = 7;
        else if (p_frequency === 'daily_2') usesPerWeek = 14;
        else if (p_frequency === 'daily_3') usesPerWeek = 21;
        else if (p_frequency === 'weekly_1') usesPerWeek = 1;
        else if (p_frequency === 'weekly_2') usesPerWeek = 2;
        else if (p_frequency === 'weekly_3') usesPerWeek = 3;
        else if (p_frequency === 'weekly_4') usesPerWeek = 4;
        else if (p_frequency === 'weekly_5') usesPerWeek = 5;
        else if (p_frequency === 'weekly_6') usesPerWeek = 6;

        const applications = Math.floor(ml / amountPerApp);
        const days = Math.ceil((applications / usesPerWeek) * 7);

        const price = parseFloat(variant.price.toString());
        const costPerApp = applications > 0 ? (price / applications).toFixed(2) : '0.00';

        return {
            applications,
            days,
            costPerApp,
            amountDescription: amountName
        };
    };

    const resultRef = React.useRef<HTMLDivElement>(null);

    const handleCalculate = (e?: React.MouseEvent) => {
        if (e) e.preventDefault();

        const newErrors = {
            variant: selectedVariantIndex === '',
            type: applicationType === '',
            frequency: usageFrequency === ''
        };
        setErrors(newErrors);

        if (!newErrors.variant && !newErrors.type && !newErrors.frequency) {
            const res = performCalculation(selectedVariantIndex, applicationType, usageFrequency);
            setCalculationResult(res);
            // Scroll to result after state update (setTimeout helps ensure render)
            setTimeout(() => {
                resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    };

    // Auto-calc triggers
    useEffect(() => {
        // Trigger calculation if ANY field changes AND we have values AND we already have a calculation displayed (or implied user intent)
        if (usageFrequency !== '' && selectedVariantIndex !== '' && applicationType !== '') {
            if (calculationResult !== null) {
                // Trigger "skeletor" update
                setIsCalculating(true);
                const timer = setTimeout(() => {
                    const res = performCalculation(selectedVariantIndex, applicationType, usageFrequency);
                    setCalculationResult(res);
                    setIsCalculating(false);
                }, 400); // 400ms delay for faster skeleton effect
                return () => clearTimeout(timer);
            }
        }
    }, [usageFrequency, selectedVariantIndex, applicationType]);


    const currentVariants = selectedProduct ? getVariants(selectedProduct) : [];
    const currentVariant = (selectedVariantIndex !== '') ? currentVariants[Number(selectedVariantIndex)] : null;
    const usageModes = selectedProduct ? getUsageModes(selectedProduct) : [];
    const isFrequencyDisabled = applicationType === '';

    const formatCurrency = (val: string | number) => `$ ${val.toString().replace('.', ',')}`;

    const frequencyMap: { [key: string]: string } = {
        'daily_1': '1 vez al día',
        'daily_2': '2 veces al día',
        'daily_3': '3 veces al día',
        'weekly_1': '1 vez por semana',
        'weekly_2': '2 veces por semana',
        'weekly_3': '3 veces por semana',
        'weekly_4': '4 veces por semana',
        'weekly_5': '5 veces por semana',
        'weekly_6': '6 veces por semana'
    };

    const handleShare = async () => {
        if (!selectedProduct || !calculationResult) return;

        const variant = currentVariant;
        const usageMode = usageModes.find((m: UsageMode) => m.id.toString() === applicationType.toString());
        const freqLabel = frequencyMap[usageFrequency] || usageFrequency;

        const productName = `${selectedProduct.name}${variant ? ` de ${variant.variant_id.capacity_value}${variant.variant_id.capacity_unit}` : ''}`;
        const price = variant ? formatCurrency(variant.price) : '';
        const modeLabel = usageMode ? usageMode.title : '';
        const amountPerApp = calculationResult.amountDescription; // e.g. "5 gotas"
        const productUrl = `${window.location.origin}/products/${selectedProduct.slug || selectedProduct.id}`;

        const message = `¡Hola!
Como sé que te interesó el ${productName}, te comparto los rendimientos para su uso y vas a ver que es muy conveniente en relación al precio.

${productName}
${price}

Modo de uso: ${modeLabel}
Frecuencia de uso: ${freqLabel}
Cantidad por aplicación: ${amountPerApp}
Duración del producto: ${calculationResult.applications} aplicaciones
Costo por aplicación: ${formatCurrency(calculationResult.costPerApp)}

Te dejo el enlace para que lo compres en nuestra Tienda Online Just
${productUrl}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    text: message,
                });
            } catch (err) {
                console.error('Error sharing', err);
            }
        } else {
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(message);
                alert('Información copiada al portapapeles');
            } catch (err) {
                console.error('Failed to copy', err);
            }
        }
    };

    return (
        <div className={styles.main}>
            <Header
                title="Calculador de rendimiento"
                onBack={() => router.back()}
                showSearch={false}
                showShare={false}
            />

            {showResultsView ? (
                <div className={styles.searchResultsPage}>
                    {/* Reuse Header? Or Custom layout as per CSS */}
                    <div style={{ width: '100%', marginBottom: '16px' }}>
                        <div className={styles.searchInputWrapper}>
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Buscar Producto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearchSubmit}
                            />
                            <div className={styles.searchIcon} onClick={() => { setSearchTerm(''); setShowResultsView(false); }}>
                                <CloseIcon />
                            </div>
                        </div>
                    </div>



                    <div className={styles.resultsList}>
                        <div className={styles.resultsCount}>
                            {filteredProducts.length} Resultados para tu búsqueda:
                        </div>

                        {filteredProducts.map((item: any) => (
                            <div key={item.id} className={styles.resultItem} onClick={() => {
                                handleSelectProduct(item);
                            }}>
                                <div className={styles.resultImageContainer}>
                                    {item.photo ? (
                                        <img src={getAssetUrl(item.photo)} alt={item.name} className={styles.resultImage} />
                                    ) : (
                                        <div style={{ color: '#908F9A', fontSize: '10px' }}>IMG</div>
                                    )}
                                </div>

                                <div className={styles.resultDetails}>
                                    <div className={styles.resultTitle}>{item.name}</div>
                                    <div className={styles.resultMetaRow}>
                                        <span className={styles.resultMetaText}>ID: {item.product_code || '---'}</span>
                                    </div>
                                </div>

                                <div className={styles.chevronRight}>
                                    <ChevronRight />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : !selectedProduct ? (
                /* SEARCH VIEW */
                <div className={styles.content}>
                    <div className={styles.helperText}>
                        Aquí puedes calcular el rendimiento de un producto según la cantidad y frecuencia de su uso.
                    </div>

                    <div className={styles.searchContainer}>
                        <label className={styles.label}>Producto</label>
                        <div className={styles.searchInputWrapper}>
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Buscar Producto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearchSubmit}
                            />
                            <div className={styles.searchIcon} onClick={() => setSearchTerm('')}>
                                {searchTerm.length > 0 ? <CloseIcon /> : <SearchIcon />}
                            </div>
                        </div>

                        {searchTerm.length > 0 && (
                            <div className={styles.searchResults}>
                                {(filteredProducts.length > 0) ? (
                                    <>
                                        {/* Products */}
                                        {filteredProducts.map(product => (
                                            <div
                                                key={`prod-${product.id}`}
                                                className={styles.searchItem}
                                                onClick={() => handleSelectProduct(product)}
                                            >
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span>{product.name}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className={styles.searchItem} style={{ cursor: 'default', color: '#908F9A' }}>
                                        No se encontraron resultados
                                    </div>
                                )}
                            </div>
                        )}

                        <div className={styles.hintContainer}>
                            <div className={styles.hintIcon}><InfoIcon /></div>
                            <div className={styles.hintText}>
                                <div>Para empezar escribe al menos 3 caracteres.</div>
                                <div>Puedes buscar un producto por su nombre.</div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* DETAIL VIEW */
                <div className={styles.detailContainer}>
                    <div className={styles.backButtonRow} onClick={handleBack}>
                        <div style={{ width: '16px', height: '16px', marginRight: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ChevronLeft />
                        </div>
                        <span className={styles.backButtonText}>Elegir otro producto</span>
                    </div>

                    <div className={styles.productHeader}>
                        <div className={styles.productThumb}>
                            {selectedProduct.photo ? (
                                <img
                                    src={getAssetUrl(selectedProduct.photo)}
                                    alt={selectedProduct.name}
                                    className={styles.productImage}
                                />
                            ) : (
                                <span style={{ color: '#999' }}>Sin imagen</span>
                            )}
                        </div>

                        <div className={styles.productTitleSection}>
                            <h2 className={styles.productTitle}>{selectedProduct.name}</h2>

                            <div className={styles.inputGroup}>
                                <div className={`${styles.inputWrapper} ${errors.variant ? styles.inputWrapperError : ''}`}>
                                    <CustomSelect
                                        value={selectedVariantIndex}
                                        onChange={(val) => {
                                            setSelectedVariantIndex(val);
                                            setErrors({ ...errors, variant: false });
                                        }}
                                        placeholder="Selecciona un tamaño de producto"
                                        options={currentVariants.map((v, idx) => ({
                                            label: `${v.variant_id.capacity_value} ${v.variant_id.capacity_unit}`,
                                            value: idx
                                        }))}
                                    />
                                </div>
                                {errors.variant && (
                                    <div className={styles.errorHint}>
                                        <div className={styles.errorIcon}><DeleteOne /></div>
                                        <span>Tienes que seleccionar un tamaño</span>
                                    </div>
                                )}
                                <div className={styles.priceDisplay}>
                                    {currentVariant ? formatCurrency(currentVariant.price) : ''}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.calculatorForm}>
                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Tipo de aplicación</label>
                            <div className={`${styles.inputWrapper} ${errors.type ? styles.inputWrapperError : ''}`}>
                                <CustomSelect
                                    value={applicationType}
                                    onChange={(val) => {
                                        setApplicationType(val.toString());
                                        setErrors({ ...errors, type: false });
                                    }}
                                    placeholder="Selecciona un tipo de aplicación"
                                    options={usageModes.map((mode: UsageMode) => ({
                                        label: mode.title,
                                        value: mode.id
                                    }))}
                                />
                            </div>
                            {errors.type && (
                                <div className={styles.errorHint}>
                                    <div className={styles.errorIcon}><DeleteOne /></div>
                                    <span>Tienes que seleccionar un tipo de aplicación</span>
                                </div>
                            )}
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Frecuencia de aplicación recomendada</label>
                            <div className={`${styles.inputWrapper} 
                                ${errors.frequency ? styles.inputWrapperError : ''} 
                                ${isFrequencyDisabled ? styles.disabled : ''}`}
                            >
                                <CustomSelect
                                    value={usageFrequency}
                                    onChange={(val) => {
                                        setUsageFrequency(val.toString());
                                        setErrors({ ...errors, frequency: false });
                                    }}
                                    placeholder="Selecciona frecuencia de aplicación..."
                                    disabled={isFrequencyDisabled}
                                    options={[
                                        {
                                            label: 'Diaria',
                                            options: [
                                                { label: '1 vez al día', value: 'daily_1' },
                                                { label: '2 veces al día', value: 'daily_2' },
                                                { label: '3 veces al día', value: 'daily_3' },
                                            ]
                                        },
                                        {
                                            label: 'Semanal',
                                            options: [
                                                { label: '1 vez por semana', value: 'weekly_1' },
                                                { label: '2 veces por semana', value: 'weekly_2' },
                                                { label: '3 veces por semana', value: 'weekly_3' },
                                                { label: '4 veces por semana', value: 'weekly_4' },
                                                { label: '5 veces por semana', value: 'weekly_5' },
                                                { label: '6 veces por semana', value: 'weekly_6' },
                                            ]
                                        }
                                    ]}
                                />
                            </div>
                            {errors.frequency && (
                                <div className={styles.errorHint}>
                                    <div className={styles.errorIcon}><DeleteOne /></div>
                                    <span>Tienes que seleccionar una frecuencia de aplicación</span>
                                </div>
                            )}
                        </div>

                        {!calculationResult && (
                            <button type="button" className={styles.calculateButton} onClick={handleCalculate} disabled={isCalculating}>
                                <span className={styles.calculateButtonText}>
                                    {isCalculating ? 'Calculando...' : 'Calcular rendimiento'}
                                </span>
                            </button>
                        )}
                    </div>

                    {(calculationResult || isCalculating) && (
                        <div ref={resultRef} className={styles.resultContainer}>
                            {isCalculating ? (
                                /* SKELETON LOADER */
                                <>
                                    <div className={styles.resultRow}>
                                        <div className={styles.resultCol}>
                                            <div className={`${styles.resultIconWrapper} ${styles.skeleton}`} />
                                            <div className={`${styles.resultValue} ${styles.skeleton} ${styles.skeletonValue}`} style={{ width: 120 }} />
                                            <div className={`${styles.resultLabel} ${styles.skeleton} ${styles.skeletonText}`} style={{ width: 100 }} />
                                        </div>
                                        <div className={styles.resultDivider}></div>
                                        <div className={styles.resultCol}>
                                            <div className={`${styles.resultIconWrapper} ${styles.skeleton}`} />
                                            <div className={`${styles.resultValue} ${styles.skeleton} ${styles.skeletonValue}`} style={{ width: 80 }} />
                                            <div className={`${styles.resultLabel} ${styles.skeleton} ${styles.skeletonText}`} style={{ width: 100 }} />
                                        </div>
                                    </div>
                                    <div className={styles.resultRowSingle}>
                                        <div className={`${styles.resultIconWrapper} ${styles.skeleton}`} />
                                        <div className={`${styles.resultValue} ${styles.skeleton} ${styles.skeletonValue}`} style={{ width: 80 }} />
                                        <div className={`${styles.resultLabel} ${styles.skeleton} ${styles.skeletonText}`} style={{ width: 140 }} />
                                    </div>
                                </>
                            ) : (
                                /* RESULTS */
                                calculationResult && (
                                    <>
                                        <div className={styles.resultRow}>
                                            <div className={styles.resultCol}>
                                                <div className={styles.resultIconWrapper}><DropIcon /></div>
                                                <div className={styles.resultValue}>{calculationResult.applications} aplicaciones</div>
                                                <div className={styles.resultLabel}>{calculationResult.amountDescription} por aplicación</div>
                                            </div>
                                            <div className={styles.resultDivider}></div>
                                            <div className={styles.resultCol}>
                                                <div className={styles.resultIconWrapper}><DollarIcon /></div>
                                                <div className={styles.resultValue}>{formatCurrency(calculationResult.costPerApp)}</div>
                                                <div className={styles.resultLabel}>costo por aplicación</div>
                                            </div>
                                        </div>
                                        <div className={styles.resultRowSingle}>
                                            <div className={styles.resultIconWrapper}><CalendarIcon /></div>
                                            <div className={styles.resultValue}>{calculationResult.days} días</div>
                                            <div className={styles.resultLabel}>de duración de producto</div>
                                        </div>
                                        <div className={styles.resultDisclaimer}>
                                            *Se toma como referencia que la cantidad seleccionada es la estándar
                                        </div>
                                        <button className={styles.calculateButton} style={{ marginTop: '24px' }} onClick={handleShare}>
                                            <ShareIcon />
                                            <span className={styles.calculateButtonText} style={{ marginLeft: '8px' }}>Compartir rendimiento</span>
                                        </button>
                                    </>
                                )
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function CalculatorPage() {
    return (
        <React.Suspense fallback={<div className={styles.main}><Header title="Calculador..." /></div>}>
            <CalculatorContent />
        </React.Suspense>
    );
}
