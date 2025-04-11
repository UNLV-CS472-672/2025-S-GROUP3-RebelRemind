/**
 * Preferences.test.jsx
 *
 * This test suite validates the Preferences component, which allows users to
 * view, toggle, and persist user preferences including:
 * - Interests
 * - Club affiliations
 * - Rebel sports coverage
 * 
 * The component uses Chrome Extension APIs (`chrome.storage.sync`) to
 * persist settings and dynamically renders sections based on user preference toggles.
 *
 * Covered Features:
 * - Initial state loading and checkbox rendering
 * - Dynamic visibility of Interests, Clubs, and Sports
 * - Interactions: toggling checkboxes, adding/removing items, saving and resetting
 * - UI state: unsaved changes banner, conditional rendering
 *
 * CODE AND DOCUMENTATION GENERATED BY CHATGPT 4o
 * Authored by: Sebastian Yepez
 */

import React from 'react';
import Preferences from '../components/Preferences';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';

/* 🔧 Set up mock Chrome extension APIs */
beforeAll(() => {
  global.chrome = {
    runtime: {
      sendMessage: jest.fn(),
    },
    storage: {
      sync: {
        get: jest.fn(),
        set: jest.fn(),
        remove: jest.fn()
      },
      local: {
        get: jest.fn()
      }
    },
  };
  global.alert = jest.fn();
});

/* 🧹 Clear mocks and set default Chrome state before each test */
beforeEach(() => {
  jest.clearAllMocks();
  global.alert = jest.fn();

  chrome.storage.sync.get.mockImplementation((_, callback) => {
    callback({
      preferences: {
        academicCalendar: false,
        UNLVCalendar: true,
        involvementCenter: true,
        rebelCoverage: true,
        canvasIntegration: false,
        userEvents: false
      },
      involvedClubs: ["Finance Club"],
      rebelMenSports: ["Basketball"],
      rebelWomenSports: [],
      selectedInterests: ["Art"]
    });
  });

  chrome.storage.sync.set.mockImplementation((_, cb) => cb?.());
  chrome.storage.sync.remove.mockImplementation((_, cb) => cb?.());
});

/* 🧪 Tests for rendering and default state */
describe('Preferences Component', () => {
  test("loads data and checks if Basketball is selected under Men's Sports", async () => {
    render(<Preferences />);

    await waitFor(() => {
      expect(screen.getByText("Your Interests")).toBeInTheDocument();
    });

    const mensSportsSection = screen.getByText((text) =>
      text.includes("Men") && text.includes("Sports")
    ).closest("div");

    const basketballCheckbox = within(mensSportsSection).getByLabelText("Basketball");
    expect(basketballCheckbox).toBeChecked();
  });

  test('renders checkboxes and dynamic sections from storage', async () => {
    render(<Preferences />);

    await waitFor(() => {
      expect(screen.getByText(/Academic Calendar/)).toBeInTheDocument();
      expect(screen.getByText(/Your Interests/)).toBeInTheDocument();
      expect(screen.getByText(/Your Organizations/)).toBeInTheDocument();
      expect(screen.getByText(/Rebel Sports Coverage/)).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Art')).toBeChecked();
    expect(screen.getByText('Finance Club')).toBeInTheDocument();

    const mensSection = screen.getByText((text) =>
      text.includes("Men") && text.includes("Sports")
    ).closest("div");

    const menBasketball = within(mensSection).getByLabelText("Basketball");
    expect(menBasketball).toBeChecked();
  });

  test('saves preferences using chrome.storage.sync.set', async () => {
    render(<Preferences />);
    await waitFor(() => screen.getByText(/Save Preferences/));
    fireEvent.click(screen.getByText(/Save Preferences/));

    await waitFor(() => {
      expect(chrome.storage.sync.set).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith("Preferences saved!");
    });
  });

  test('saves preferences with Canvas integration enabled', async () => {
    chrome.storage.sync.get.mockImplementation((_, callback) => {
      callback({
        preferences: {
          canvasIntegration: true,
        }
      });
    });
    global.chrome.storage.local.get.mockImplementation((key, callback) => { // mock chrome.storage with token
      callback({ canvasPAT: "test_access_token"});
    })
    render(<Preferences />);
    await waitFor(() => screen.getByText(/Save Preferences/));
    fireEvent.click(screen.getByText(/Save Preferences/));

    await waitFor(() => {
      expect(chrome.storage.local.get).toHaveBeenCalled();
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ type: "UPDATE_ASSIGNMENTS" });
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ type: "START_CANVAS_ALARM" });
    });
  });

  test('saves preferences with Canvas integration enabled and no Canvas PAT stored', async () => {
    chrome.storage.sync.get.mockImplementation((_, callback) => {
      callback({
        preferences: {
          canvasIntegration: true,
        }
      });
    });
    global.chrome.storage.local.get.mockImplementation((key, callback) => callback({}));
    render(<Preferences />);
    await waitFor(() => screen.getByText(/Save Preferences/));
    fireEvent.click(screen.getByText(/Save Preferences/));

    await waitFor(() => {
      expect(chrome.storage.local.get).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith("Please enter a Canvas Access Token!");
    });
  });

  test('resets all preferences when reset is confirmed', async () => {
    window.confirm = jest.fn(() => true);
    render(<Preferences />);
    await waitFor(() => screen.getByText(/Reset Preferences/));
    fireEvent.click(screen.getByText(/Reset Preferences/));

    await waitFor(() => {
      expect(chrome.storage.sync.remove).toHaveBeenCalled();
    });
  });

  test('canceling reset does not clear preferences', async () => {
    window.confirm = jest.fn(() => false);
    render(<Preferences />);
    await waitFor(() => screen.getByText(/Reset Preferences/));
    fireEvent.click(screen.getByText(/Reset Preferences/));

    expect(chrome.storage.sync.remove).not.toHaveBeenCalled();
  });

  test('search filters clubs correctly', async () => {
    render(<Preferences />);
    await waitFor(() => screen.getByPlaceholderText(/Search for orgs/i));

    fireEvent.change(screen.getByPlaceholderText(/Search for orgs/i), {
      target: { value: 'hack' }
    });

    expect(screen.queryByText(/Hackathon Society/i)).toBeInTheDocument();
    expect(screen.queryByText(/IEEE/i)).not.toBeInTheDocument();
  });

  /* 💡 Grouped: Additional UI interactions and toggling logic */
  describe("Preferences additional interactions", () => {
    test("adds and removes a club from involvedClubs", async () => {
      render(<Preferences />);
      await waitFor(() => screen.getByText("UNLV ACM"));
      fireEvent.click(screen.getByText("UNLV ACM"));

      expect(screen.getByLabelText("Remove UNLV ACM")).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText("Remove UNLV ACM"));
      expect(screen.queryByLabelText("Remove UNLV ACM")).not.toBeInTheDocument();
    });

    test("toggles club section visibility", async () => {
      render(<Preferences />);
      await waitFor(() => screen.getByText("Your Organizations"));

      const toggle = screen.getByText("Your Organizations");
      fireEvent.click(toggle);
      expect(screen.queryByPlaceholderText(/Search for orgs/i)).not.toBeInTheDocument();

      fireEvent.click(toggle);
      expect(screen.getByPlaceholderText(/Search for orgs/i)).toBeInTheDocument();
    });

    test("toggles sports section visibility", async () => {
      render(<Preferences />);
      await waitFor(() => screen.getByText("Rebel Sports Coverage"));

      const toggle = screen.getByText("Rebel Sports Coverage");
      fireEvent.click(toggle);
      expect(screen.queryByText("Men’s Sports")).not.toBeInTheDocument();

      fireEvent.click(toggle);
      expect(screen.getByText("Men’s Sports")).toBeInTheDocument();
    });

    test("toggles men’s and women’s sports checkboxes", async () => {
      render(<Preferences />);
      await waitFor(() => screen.getByText("Men’s Sports"));

      const menCheckbox = screen.getAllByLabelText("Tennis")[0];
      const womenCheckbox = screen.getAllByLabelText("Tennis")[1];

      fireEvent.click(menCheckbox);
      fireEvent.click(womenCheckbox);

      expect(menCheckbox).toBeChecked();
      expect(womenCheckbox).toBeChecked();
    });

    test("toggles interest checkboxes", async () => {
      render(<Preferences />);
      await waitFor(() => screen.getByLabelText("Science"));

      const interestCheckbox = screen.getByLabelText("Science");
      fireEvent.click(interestCheckbox);
      expect(interestCheckbox).toBeChecked();

      fireEvent.click(interestCheckbox);
      expect(interestCheckbox).not.toBeChecked();
    });

    test("clicking filtered club buttons adds them to involvedClubs", async () => {
      render(<Preferences />);
      await waitFor(() => screen.getByPlaceholderText(/Search for orgs/i));

      fireEvent.change(screen.getByPlaceholderText(/Search for orgs/i), {
        target: { value: "acm" }
      });

      fireEvent.click(screen.getByText(/UNLV ACM/i));
      expect(screen.getByText("UNLV ACM")).toBeInTheDocument();
    });

    test("reset preferences sets unsaved flag to false", async () => {
      window.confirm = jest.fn(() => true);
      render(<Preferences />);
      await waitFor(() => screen.getByText(/Reset Preferences/));
      fireEvent.click(screen.getByText(/Reset Preferences/));

      await waitFor(() => {
        expect(screen.queryByText(/You have unsaved changes/)).not.toBeInTheDocument();
      });
    });

    test("shows unsaved changes message", async () => {
      render(<Preferences />);
      await waitFor(() => screen.getByLabelText(/Academic Calendar/));

      fireEvent.click(screen.getByLabelText(/Academic Calendar/));
      expect(screen.getByText(/You have unsaved changes/)).toBeInTheDocument();
    });

    test("toggles right-column preferences (e.g., Canvas Integration)", async () => {
      render(<Preferences />);
      await waitFor(() => screen.getByLabelText("Canvas Integration"));

      fireEvent.click(screen.getByLabelText("Canvas Integration"));
      expect(screen.getByText(/You have unsaved changes/)).toBeInTheDocument();
    });
  });
});
