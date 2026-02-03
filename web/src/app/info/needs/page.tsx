'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NeedsRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the main guide which contains the alphabetical list of needs
        router.replace('/guia-referencia-rapida');
    }, [router]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#908F9A' }}>
            Redirigiendo...
        </div>
    );
}
