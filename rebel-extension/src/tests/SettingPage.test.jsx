import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SettingPage from "../pages/SettingPage";
import * as useAuthHook from "../../public/hooks/useAuth";

// mock useAuth
jest.mock("../../public/hooks/useAuth", () => ({
  __esModule: true,
  default: jest.fn()
}));

// mock chrome APIs
beforeAll(() => {
  global.chrome = {
    storage: {
      sync: {
        get: jest.fn((key, callback) => callback({ backgroundColor: "#8b0000" })),
        set: jest.fn()
      }
    },
    runtime: {
      sendMessage: jest.fn()
    }
  };
});

describe("SettingPage", () => {
  beforeEach(() => {
    useAuthHook.default.mockReturnValue(false); // pretend user is not logged in
  });

  const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

  it("renders the color picker and reset button", () => {
    renderWithRouter(<SettingPage />);
    expect(screen.getByLabelText(/choose your background color/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /back to original/i })).toBeInTheDocument();
  });

  it("updates color when color input changes", async () => {
    renderWithRouter(<SettingPage />);
    const colorInput = screen.getByLabelText(/choose your background color/i);
    fireEvent.change(colorInput, { target: { value: "#123456" } });

    await waitFor(() => {
      expect(global.chrome.storage.sync.set).toHaveBeenCalledWith({ backgroundColor: "#123456" });
      expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: "COLOR_UPDATED",
        color: "#123456"
      });
    });
  });

  it("resets color to default when reset button is clicked", async () => {
    renderWithRouter(<SettingPage />);
    const resetButton = screen.getByRole("button", { name: /back to original/i });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(global.chrome.storage.sync.set).toHaveBeenCalledWith({ backgroundColor: "#8b0000" });
      expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: "COLOR_UPDATED",
        color: "#8b0000"
      });
    });
  });
});
