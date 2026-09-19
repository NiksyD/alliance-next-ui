import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropdown } from './Dropdown';

const mockOptions = [
  { value: 'opt-1', label: 'First Event', description: '2026-09-12' },
  { value: 'opt-2', label: 'Second Event', description: '2026-09-18' },
  { value: 'opt-3', label: 'Third Event', description: '2026-09-24', disabled: true },
];

describe('Dropdown', () => {
  it('renders selected option label and chevron', () => {
    render(<Dropdown options={mockOptions} value="opt-1" onChange={vi.fn()} />);

    expect(screen.getByText('First Event')).toBeInTheDocument();
    expect(screen.getByText('2026-09-12')).toBeInTheDocument();
  });

  it('opens desktop custom listbox and triggers onChange when option is clicked', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Dropdown options={mockOptions} value="opt-1" onChange={handleChange} />);

    const triggerButton = screen.getByRole('button', { name: /first event/i });
    await user.click(triggerButton);

    // Should display options in listbox
    const listbox = screen.getByRole('listbox');
    const secondOption = within(listbox).getByRole('option', { name: /second event/i });
    expect(secondOption).toBeInTheDocument();

    await user.click(secondOption);
    expect(handleChange).toHaveBeenCalledWith('opt-2');
  });

  it('renders native select for mobile accessibility', () => {
    render(<Dropdown options={mockOptions} value="opt-1" onChange={vi.fn()} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('opt-1');
  });
});
