import { render, screen, fireEvent } from '@testing-library/react';
import Toggle from '../components/Toggle';

describe('Toggle component', () => {
  it('renders with correct label based on isChecked prop', () => {
    const { rerender } = render(<Toggle isChecked={false} onChange={() => {}} />);
    expect(screen.getByText('Daily')).toBeInTheDocument();

    rerender(<Toggle isChecked={true} onChange={() => {}} />);
    expect(screen.getByText('Weekly')).toBeInTheDocument();
  });

  it('calls onChange when clicked', () => {
    const handleChange = jest.fn();
    render(<Toggle isChecked={false} onChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
