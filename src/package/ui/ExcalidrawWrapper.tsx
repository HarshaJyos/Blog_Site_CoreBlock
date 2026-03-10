'use client';

import { Excalidraw } from '@excalidraw/excalidraw';
//import '@excalidraw/excalidraw/index.css';
import './ExcalidrawModal.css';
import type { ExcalidrawProps } from '@excalidraw/excalidraw/types/types';

export default function ExcalidrawWrapper(props: ExcalidrawProps) {
    return (
        <div style={{ height: '100%', width: '100%' }} suppressHydrationWarning>
            <Excalidraw {...props} />
        </div>
    );
}
