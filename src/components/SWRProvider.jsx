'use client';

import { SWRConfig } from 'swr';
import { swrConfig } from '@/hooks/useAPI';

/**
 * Global SWR configuration provider.
 * Wraps the app with production-tuned SWR settings:
 * - 5s dedup window (kills duplicate requests)
 * - keepPreviousData (instant perceived loads)
 * - Smart error retry (3 retries, 5s apart)
 * - Focus throttle (30s minimum between refetches)
 */
export default function SWRProvider({ children }) {
    return (
        <SWRConfig value={swrConfig}>
            {children}
        </SWRConfig>
    );
}
