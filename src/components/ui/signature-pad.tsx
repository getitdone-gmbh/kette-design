'use client';

import { Eraser } from 'lucide-react';
import * as React from 'react';

import { focusRing } from '../../lib/recipes';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { useLabels } from './labels-context';

export interface SignaturePadHandle {
  clear: () => void;
  // PNG data URL of the drawn signature, or null while the pad is empty.
  toDataURL: () => string | null;
  isEmpty: () => boolean;
}

export interface SignaturePadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  // Called with the PNG data URL after each finished stroke, and with null after clearing.
  onChange?: (dataUrl: string | null) => void;
  // Accessible name of the drawing area. Defaults to the provider text for `signature`.
  label?: string;
  // Hint shown while the pad is empty.
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
}

// Freehand signature field on a canvas (mouse, finger, stylus). Drawing is a pointer gesture, so offer a typed alternative such as a name field next to it. Ink uses the current text colour.
const SignaturePad = React.forwardRef<SignaturePadHandle, SignaturePadProps>(
  ({ className, onChange, label: labelProp, placeholder: placeholderProp, disabled = false, invalid = false, ...props }, ref) => {
    const l = useLabels();
    const label = labelProp ?? l.signature;
    const placeholder = placeholderProp ?? l.signHere;
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const drawing = React.useRef(false);
    const moved = React.useRef(false);
    const [empty, setEmpty] = React.useState(true);

    // Match the bitmap to the displayed size and the device pixel ratio.
    React.useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext('2d')?.scale(ratio, ratio);
    }, []);

    const clear = React.useCallback(() => {
      const canvas = canvasRef.current;
      canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
      setEmpty(true);
      onChange?.(null);
    }, [onChange]);

    React.useImperativeHandle(
      ref,
      () => ({
        clear,
        toDataURL: () => (empty ? null : (canvasRef.current?.toDataURL('image/png') ?? null)),
        isEmpty: () => empty,
      }),
      [clear, empty],
    );

    const position = (event: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (disabled) return;
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      drawing.current = true;
      moved.current = false;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = getComputedStyle(event.currentTarget).color;
      const { x, y } = position(event);
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawing.current) return;
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      const { x, y } = position(event);
      ctx.lineTo(x, y);
      ctx.stroke();
      moved.current = true;
      setEmpty(false);
    };

    const end = () => {
      if (!drawing.current) return;
      drawing.current = false;
      if (moved.current) onChange?.(canvasRef.current?.toDataURL('image/png') ?? null);
    };

    return (
      <div
        data-state={empty ? 'empty' : 'signed'}
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
        className={cn(
          'relative w-full rounded-dialog border border-dashed border-border-default bg-background',
          invalid && 'border-border-destructive',
          disabled && 'opacity-disabled',
          className,
        )}
        {...props}
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={label}
          tabIndex={disabled ? -1 : 0}
          className={cn('block h-40 w-full touch-none rounded-dialog text-foreground', ...focusRing, disabled ? 'cursor-not-allowed' : 'cursor-crosshair')}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
        />
        {empty ? (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center typography-ui text-text-subtle">{placeholder}</span>
        ) : null}
        {!empty && !disabled ? (
          <Button type="button" variant="ghost" size="control-sm" icon={<Eraser aria-hidden="true" />} className="absolute right-2 top-2" onClick={() => {
              clear();
              // The button unmounts with the signature, so hand focus to the drawing surface instead of dropping it to the page or dialog.
              canvasRef.current?.focus();
            }}
          >
            {l.clear}
          </Button>
        ) : null}
      </div>
    );
  },
);
SignaturePad.displayName = 'SignaturePad';

export { SignaturePad };
