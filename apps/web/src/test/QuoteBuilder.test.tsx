import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { QuoteBuilder } from '@/components/quotes/quoteBuilder';

vi.mock('@/lib/tenantBranding', () => {
  const snapshot = JSON.stringify({
    accentColor: '#ff6600',
    businessEmail: 'info@testgarage.co.za',
    businessName: 'Test Garage',
    businessPhone: '051 000 0000',
    primaryColor: '#111111',
    quotePrefix: 'QTE',
  });

  return {
    getTenantBrandingServerSnapshot: () => snapshot,
    getTenantBrandingSnapshot: () => snapshot,
    subscribeToTenantBranding: () => () => {},
  };
});

vi.mock('@/lib/formatting/money', () => ({
  formatMoney: (value: number) => `R${value.toFixed(2)}`,
}));

vi.mock('@/components/tenant/brandedDocumentPreview', () => ({
  BrandedDocumentPreview: () => <div data-testid="invoice-preview" />,
}));

describe('QuoteBuilder', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('starts with the branded quote number and two line items', () => {
    render(<QuoteBuilder />);

    expect(screen.getByLabelText('Quote number')).toHaveValue('QTE-2026-0001');
    expect(screen.getAllByLabelText('Line item description')).toHaveLength(2);
  });

  test('shows the correct starting total', () => {
    render(<QuoteBuilder />);

    // (850 + 1100) = 1950 subtotal, 15% tax = 292.50, total = 2242.50
    const totalRow = screen.getByText('Total', { selector: 'span' }).parentElement;
    expect(totalRow).toHaveTextContent('R2242.50');
  });

  test('add item appends a new empty row', async () => {
    const user = userEvent.setup();
    render(<QuoteBuilder />);

    await user.click(screen.getByRole('button', { name: 'Add item' }));

    expect(screen.getAllByLabelText('Line item description')).toHaveLength(3);
  });

  test('duplicate copies a row', async () => {
    const user = userEvent.setup();
    render(<QuoteBuilder />);

    await user.click(screen.getAllByRole('button', { name: 'Duplicate line item' })[0]);

    expect(screen.getAllByLabelText('Line item description')).toHaveLength(3);
    expect(screen.getAllByDisplayValue('Minor service labor')).toHaveLength(2);
  });

  test('cannot remove the last remaining line item', async () => {
    const user = userEvent.setup();
    render(<QuoteBuilder />);

    await user.click(screen.getAllByRole('button', { name: 'Remove line item' })[0]);

    expect(screen.getAllByLabelText('Line item description')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Remove line item' })).toBeDisabled();
  });

  test('changing a unit price updates the total', () => {
    render(<QuoteBuilder />);

    fireEvent.change(screen.getAllByLabelText('Unit price')[0], { target: { value: '2000' } });

    // (2000 + 1100) = 3100 subtotal, 15% tax = 465, total = 3565
    const totalRow = screen.getByText('Total', { selector: 'span' }).parentElement;
    expect(totalRow).toHaveTextContent('R3565.00');
  });

  test('saving stores the draft in localStorage and shows a status message', async () => {
    const user = userEvent.setup();
    render(<QuoteBuilder />);

    await user.click(screen.getByRole('button', { name: 'Save quote draft' }));

    const saved = JSON.parse(window.localStorage.getItem('blaze-last-quote-draft') ?? '{}');
    expect(saved.quoteNumber).toBe('QTE-2026-0001');
    expect(saved.lineItems).toHaveLength(2);
    expect(saved.totals.total).toBe(2242.5);
    expect(screen.getByText(/saved locally with 2 line items/)).toBeInTheDocument();
  });
});