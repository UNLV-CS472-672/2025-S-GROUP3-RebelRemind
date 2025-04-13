import { render, screen, fireEvent } from "@testing-library/react";
import ColorPicker from "../components/ColorChanging";
import useApplyBackgroundColor from "../hooks/useApplyBackgroundColor";

// Mock the hook used by the component
jest.mock("../hooks/useApplyBackgroundColor");

describe("ColorPicker", () => {
  const mockHandleColorChange = jest.fn();
  const mockHandleResetColor = jest.fn();
  const mockHandleThemeSelection = jest.fn();

  beforeEach(() => {
    useApplyBackgroundColor.mockReturnValue({
      selectedColor: "#8b0000",
      themeKey: "custom",
      handleColorChange: mockHandleColorChange,
      handleResetColor: mockHandleResetColor,
      handleThemeSelection: mockHandleThemeSelection,
    });
  });

  it("renders the color input and reset button", () => {
    render(<ColorPicker />);
    expect(screen.getByLabelText(/choose your background color/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /back to original/i })).toBeInTheDocument();
  });

  it("calls handleColorChange when the color input changes", () => {
    render(<ColorPicker />);
    fireEvent.change(screen.getByLabelText(/choose your background color/i), {
      target: { value: "#123456" },
    });
    expect(mockHandleColorChange).toHaveBeenCalled();
  });

  it("calls handleResetColor when the reset button is clicked", () => {
    render(<ColorPicker />);
    fireEvent.click(screen.getByRole("button", { name: /back to original/i }));
    expect(mockHandleResetColor).toHaveBeenCalled();
  });

  it("renders theme gallery and responds to theme card click", () => {
    render(<ColorPicker />);

    // Open theme gallery
    fireEvent.click(screen.getByText(/choose a preset theme/i));

    // Find theme cards
    const themeCards = screen.getAllByText(/.+/).filter(el => el.className.includes("theme-label"));
    expect(themeCards.length).toBeGreaterThan(0);

    // Click the first theme card
    fireEvent.click(themeCards[0]);
    expect(mockHandleThemeSelection).toHaveBeenCalled();
  });
});
