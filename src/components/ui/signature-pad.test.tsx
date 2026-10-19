import { vi } from 'vitest';
import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SignaturePad, type SignaturePadHandle } from './signature-pad';

const ctx = { scale: vi.fn(), clearRect: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(), lineWidth: 0, lineCap: '', lineJoin: '', strokeStyle: '' };

beforeEach(() => {
  Object.values(ctx).forEach((fn) => typeof fn === 'function' && fn.mockClear());
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,AAA');
});

afterEach(() => vi.restoreAllMocks());

const draw = (canvas: HTMLElement) => {
  fireEvent.pointerDown(canvas, { clientX: 1, clientY: 1, pointerId: 1 });
  fireEvent.pointerMove(canvas, { clientX: 10, clientY: 12, pointerId: 1 });
  fireEvent.pointerUp(canvas, { pointerId: 1 });
};

describe('SignaturePad', () => {
  it('shows a named drawing area with a hint while empty and no clear button', () => {
    render(<SignaturePad />);
    expect(screen.getByRole('img', { name: 'Signature' })).toBeInTheDocument();
    expect(screen.getByText('Sign here')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
  });

  it('draws with pointer events, reports the PNG and offers Clear', async () => {
    const onChange = vi.fn();
    render(<SignaturePad onChange={onChange} />);
    draw(screen.getByRole('img', { name: 'Signature' }));
    expect(ctx.moveTo).toHaveBeenCalled();
    expect(ctx.lineTo).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith('data:image/png;base64,AAA');
    expect(screen.queryByText('Sign here')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(ctx.clearRect).toHaveBeenCalled();
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(screen.getByText('Sign here')).toBeInTheDocument();
  });

  it('exposes clear, toDataURL and isEmpty through the ref', () => {
    const ref = createRef<SignaturePadHandle>();
    render(<SignaturePad ref={ref} />);
    expect(ref.current?.isEmpty()).toBe(true);
    expect(ref.current?.toDataURL()).toBeNull();
    draw(screen.getByRole('img'));
    expect(ref.current?.isEmpty()).toBe(false);
    expect(ref.current?.toDataURL()).toBe('data:image/png;base64,AAA');
  });

  it('ignores drawing while disabled', () => {
    const onChange = vi.fn();
    render(<SignaturePad disabled onChange={onChange} />);
    draw(screen.getByRole('img'));
    expect(ctx.moveTo).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('SignaturePad focus', () => {
  it('is a focusable, named drawing surface', () => {
    render(<SignaturePad />);
    const canvas = screen.getByRole('img', { name: 'Signature' });
    expect(canvas).toHaveAttribute('tabindex', '0');
    canvas.focus();
    expect(canvas).toHaveFocus();
  });

  it('is not tabbable when disabled', () => {
    render(<SignaturePad disabled />);
    expect(screen.getByRole('img', { name: 'Signature' })).toHaveAttribute('tabindex', '-1');
  });

  it('moves focus to the canvas after Clear instead of dropping it', async () => {
    render(
      <div role="dialog" aria-label="Sign">
        <SignaturePad />
      </div>,
    );
    const canvas = screen.getByRole('img', { name: 'Signature' });
    draw(canvas);
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
    expect(canvas).toHaveFocus();
  });
});
