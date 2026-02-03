
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // In Next.js 15/16 params is a Promise
) {
    const { id } = await params;

    if (!id) {
        return new NextResponse('Missing asset ID', { status: 400 });
    }

    // Ensure no trailing slash
    const directusUrl = (process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055').replace(/\/$/, "");
    const assetUrl = `${directusUrl}/assets/${id}`;

    // console.log(`[Proxy] Fetching asset: ${assetUrl}`);

    try {
        const response = await fetch(assetUrl);

        if (!response.ok) {
            console.error(`[Proxy] Upstream error: ${response.status} ${response.statusText}`);
            return new NextResponse(`Upstream Error: ${response.statusText} (${assetUrl})`, { status: response.status });
        }

        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        const buffer = await response.arrayBuffer();

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });

    } catch (error: any) {
        console.error('[Proxy] Internal server error:', error);
        return new NextResponse(`Internal Server Error: ${error.message} (Trying to reach: ${assetUrl})`, { status: 500 });
    }
}
