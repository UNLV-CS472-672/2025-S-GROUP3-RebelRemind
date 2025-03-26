import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SettingPage from "../pages/SettingPage";
import * as useAuthHook from "../../public/hooks/useAuth";

// Mock useNavigate before anything else
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

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
        get: jest.fn((key, cb) => cb({ backgroundColor: "#8b0000" })),
        set: jest.fn()
      }
    },
    runtime: { sendMessage: jest.fn() }
  };
});

describe("SettingPage", () => {
  beforeEach(() => {
    useAuthHook.default.mockReturnValue(false);
    mockNavigate.mockClear();
  });

  const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

  it("renders the color picker and reset button", () => {
    renderWithRouter(<SettingPage />);
    expect(screen.getByLabelText(/choose your background color/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /back to original/i })).toBeInTheDocument();
  });

  it("updates color when color input changes", async () => {
    renderWithRouter(<SettingPage />);
    fireEvent.change(screen.getByLabelText(/choose your background color/i), { target: { value: "#123456" } });

    await waitFor(() => {
      expect(global.chrome.storage.sync.set).toHaveBeenCalledWith({ backgroundColor: "#123456" });
      expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({ type: "COLOR_UPDATED", color: "#123456" });
    });
  });

  it("resets color to default when reset button is clicked", async () => {
    renderWithRouter(<SettingPage />);
    fireEvent.click(screen.getByRole("button", { name: /back to original/i }));

    await waitFor(() => {
      expect(global.chrome.storage.sync.set).toHaveBeenCalledWith({ backgroundColor: "#dc143c" });
      expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({ type: "COLOR_UPDATED", color: "#dc143c"});
    });
  });

  it("navigates back to home when back button is clicked", () => {
    renderWithRouter(<SettingPage />);
    fireEvent.click(screen.getByRole("button", { name: /⬅️ Back/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
