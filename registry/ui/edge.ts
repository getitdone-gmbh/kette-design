'use client';

import { usePreset } from '@/components/ui/labels-context';

// Divider and frame colour of data surfaces. The zero preset draws them in the default border colour (semantic/border/default), other presets keep the quieter hairline.
export const edgeClass = (zero: boolean) => (zero ? 'border-border-default' : 'border-hairline');

export const useEdge = () => edgeClass(usePreset() === 'zero');
