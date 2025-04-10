/**
 * SettingsPage.test.jsx
 *
 * This test suite validates the functionality of the `SettingsPage` component,
 * which includes navigation, background color customization, and Chrome storage integration.
 *
 * ✅ Features tested:
 * - ColorPicker visibility within the "Appearance" section
 * - Background color input updates and is saved via chrome.storage
 * - Reset button restores default background color
 * - Back button returns user to the home screen using `useNavigate`
 *
 * 🧪 Mocks used:
 * - `react-router-dom`'s `useNavigate`
 * - Custom `useAuth` hook
 * - Chrome Extension APIs: `chrome.storage.sync` and `chrome.runtime.sendMessage`
 *
 * CODE AND DOCUMENTATION GENERATED BY ChatGPT
 * Authored by: Sebastian Yepez
 */

import { act, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SettingsPage from "../pages/SettingsPage";
import * as useAuthHook from "../../public/hooks/useAuth";

// 🧪 Mock useNavigate before anything else
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// 🧪 Mock useAuth
jest.mock("../../public/hooks/useAuth", () => ({
  __esModule: true,
  default: jest.fn()
}));

// 🧪 Setup mock chrome APIs before all tests
let storageChangeListener;

beforeAll(() => {
  global.chrome = {
    storage: {
      sync: {
        get: jest.fn((_, cb) =>
          cb({
            backgroundColor: "#8b0000",
            preferences: {
              academicCalendar: false,
              canvasIntegration: false,
              UNLVCalendar: false,
            },
          })
        ),
        set: jest.fn(),
      },
      onChanged: {
        addListener: jest.fn((listener) => {
          storageChangeListener = listener;
        }),
        removeListener: jest.fn(),
      },
    },
    runtime: {
      sendMessage: jest.fn(),
    },
  };
});


describe("SettingsPage", () => {
  beforeEach(() => {
    useAuthHook.default.mockReturnValue(false); // simulate user not logged in
    mockNavigate.mockClear();
  });

  const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

  it("renders the color picker and reset button", async () => {
    renderWithRouter(<SettingsPage />);

    // Expand Appearance section first
    fireEvent.click(screen.getByText("Appearance"));

    expect(await screen.findByLabelText(/choose your background color/i)).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /back to original/i })).toBeInTheDocument();
  });

  it("updates color when color input changes", async () => {
    renderWithRouter(<SettingsPage />);
    fireEvent.click(screen.getByText("Appearance")); // open section

    fireEvent.change(await screen.findByLabelText(/choose your background color/i), {
      target: { value: "#123456" }
    });

    await waitFor(() => {
      expect(global.chrome.storage.sync.set).toHaveBeenCalledWith(
        expect.objectContaining({
          backgroundColor: "#123456"
        })
      );
      expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "COLOR_UPDATED",
          color: "#123456"
        })
      );
    });

  });
  it("updates preferences when storage changes", async () => {
    renderWithRouter(<SettingsPage />);

    // Simulate storage change event from Preferences component
    act(() => {
      storageChangeListener(
        {
          preferences: {
            newValue: {
              academicCalendar: true,
              canvasIntegration: true,
              UNLVCalendar: false,
            },
          },
        },
        "sync"
      );
    });

    // Expand Canvas section to confirm it shows up
    fireEvent.click(screen.getByText("Canvas Integration"));
    expect(await screen.findByText(/your canvas integration pat/i)).toBeInTheDocument();
  });


  it("resets color to default when reset button is clicked", async () => {
    renderWithRouter(<SettingsPage />);
    fireEvent.click(screen.getByText("Appearance")); // open section

    fireEvent.click(await screen.findByRole("button", { name: /back to original/i }));

    await waitFor(() => {
      expect(global.chrome.storage.sync.set).toHaveBeenCalledWith(
        expect.objectContaining({
          backgroundColor: "#dc143c",
          selectedThemeKey: "custom", // instead of ""
          textColor: "#ffffff",
        })
      );
      expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "COLOR_UPDATED",
          color: "#dc143c",
          textColor: "#ffffff",
        })
      );
    });
  });

  it("updates theme when theme is selected", async () => {
    renderWithRouter(<SettingsPage />);
    fireEvent.click(screen.getByText("Appearance"));
    fireEvent.change(await screen.findByRole("combobox"), {
      target: { value: "blackRed" },
    });


    await waitFor(() => {
      expect(global.chrome.storage.sync.set).toHaveBeenCalledWith(
        expect.objectContaining({
          backgroundColor: "#000000",
          textColor: "#ff1c1c",
          selectedThemeKey: "blackRed",
        })
      );
      expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "COLOR_UPDATED",
          color: "#000000",
          textColor: "#ff1c1c",
        })
      );
    });
  });

  it("navigates back to home when back button is clicked", () => {
    renderWithRouter(<SettingsPage />);
    fireEvent.click(screen.getByRole("button", { name: /⬅️/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
