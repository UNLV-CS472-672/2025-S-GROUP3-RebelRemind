/**
 * Preferences.test.jsx
 *
 * This test suite validates the Preferences component, which allows users to
 * view, toggle, and persist user preferences including:
 * - Interests
 * - Club affiliations
 * - Rebel sports coverage
 * - Canvas integration
 * 
 * The component uses Chrome Extension APIs (`chrome.storage.sync`) to
 * persist settings and dynamically renders sections based on user preference toggles.
 *
 * Covered Features:
 * - Initial state loading and checkbox rendering
 * - Dynamic visibility of Interests, Clubs, Sports, and Canvas token UI
 * - Interactions: toggling checkboxes, adding/removing clubs, saving and resetting
 * - Filtering: club search results and exclusion of already joined clubs
 * - UI state: unsaved changes banner, collapsible sections, conditional rendering
 * - Setup mode: disabled preference highlights, tooltip opening/closing, CanvasTokenManager visibility
 * - Outside click detection for tooltips
 * - Full preference reset in both regular and setup modes
 *
 * CODE AND DOCUMENTATION GENERATED BY CHATGPT 4o
 * Authored by: Sebastian Yepez
 */

import React from 'react';
import Preferences from '../components/Preferences';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { act } from 'react';

// ✅ Add fetch mock
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      { id: 1, name: "UNLV Association for Computing Machinery" },
      { id: 2, name: "AI and Data Science Club" },
      { id: 3, name: "Institute of Electrical and Electronics Engineers at UNLV" },
      { id: 4, name: "Girls Who Code College Loop" },
    ]),
  })
);

/* 🔧 Mock Chrome extension APIs */
beforeAll(() => {
  global.chrome = {
    storage: {
      sync: {
        get: jest.fn(),
        set: jest.fn(),
        remove: jest.fn(),
      },
      local: {
        get: jest.fn(),
        set: jest.fn(),
        remove: jest.fn(),
      },
    },
  };  
  global.alert = jest.fn();
});

/* 🧹 Reset mocks before each test */
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
      involvedClubs: ["AI and Data Science Club"],
      rebelMenSports: ["Basketball"],
      rebelWomenSports: [],
      selectedInterests: ["Arts"]
    });
  });

  chrome.storage.sync.set.mockImplementation((_, cb) => cb?.());
  chrome.storage.sync.remove.mockImplementation((_, cb) => cb?.());
});
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  console.error.mockRestore();
});


// Only define scrollIntoView if not present
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = jest.fn();
}

const refSpy = jest.spyOn(Element.prototype, "scrollIntoView").mockImplementation(() => {});

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

    expect(screen.getByLabelText('Arts')).toBeChecked();
    expect(screen.getByText('AI and Data Science Club')).toBeInTheDocument();

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
      target: { value: 'girls' }
    });
    
    expect(screen.queryByText(/Girls Who Code College Loop/i)).toBeInTheDocument();
    expect(screen.queryByText(/UNLV Association for Computing Machinery/i)).not.toBeInTheDocument();
  });

  /* 🧪 Grouped interactions */
  describe("Preferences interactions", () => {
    test("adds and removes a club from involvedClubs", async () => {
      render(<Preferences />);
      await waitFor(() => screen.getByText("UNLV Association for Computing Machinery"));
      fireEvent.click(screen.getByText("UNLV Association for Computing Machinery"));

      expect(screen.getByLabelText("Remove UNLV Association for Computing Machinery")).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText("Remove UNLV Association for Computing Machinery"));
      expect(screen.queryByLabelText("Remove UNLV Association for Computing Machinery")).not.toBeInTheDocument();
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

    test("toggles interest checkboxes", async () => {
      render(<Preferences />);
      await waitFor(() => screen.getByLabelText("Tech"));

      const interestCheckbox = screen.getByLabelText("Tech");
      fireEvent.click(interestCheckbox);
      expect(interestCheckbox).toBeChecked();

      fireEvent.click(interestCheckbox);
      expect(interestCheckbox).not.toBeChecked();
    });

    test("toggles sports checkboxes", async () => {
      render(<Preferences />);
      await waitFor(() => screen.getAllByLabelText("Tennis"));
    
      const [menTennis, womenTennis] = screen.getAllByLabelText("Tennis");
    
      fireEvent.click(menTennis);   // Toggle men's
      fireEvent.click(womenTennis); // Toggle women's
    
      expect(menTennis).toBeChecked();
      expect(womenTennis).toBeChecked();
    });
    

    test("clicking filtered club buttons adds them to involvedClubs", async () => {
      render(<Preferences />);
      await waitFor(() => screen.getByPlaceholderText(/Search for orgs/i));

      fireEvent.change(screen.getByPlaceholderText(/Search for orgs/i), {
        target: { value: "association" }
      });

      fireEvent.click(screen.getByText(/UNLV Association for Computing Machinery/i));
      expect(screen.getByText("UNLV Association for Computing Machinery")).toBeInTheDocument();
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

    test("fetches clubs and sets allClubs state", async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { id: 1, name: "Chess Club UNLV" },
              { id: 2, name: "Girls Who Code College Loop" },
            ]),
        })
      );
    
      await act(async () => {
        render(<Preferences />);
      });
    
      expect(await screen.findByText('Chess Club UNLV')).toBeInTheDocument();
      expect(screen.getByText('Girls Who Code College Loop')).toBeInTheDocument();
    
      global.fetch.mockClear();
    });    
    
    test('highlightPreference flashes and scrolls preference into view', async () => {
      render(<Preferences setupMode={true} />);
    
      const canvasCheckbox = await screen.findByLabelText('Canvas Integration');
      const targetDiv = canvasCheckbox.closest('label');
    
      // Add mock methods
      if (targetDiv) {
        targetDiv.scrollIntoView = jest.fn();
        targetDiv.classList.add = jest.fn();
        targetDiv.classList.remove = jest.fn();
      }
    
      fireEvent.click(screen.getByText('Canvas Personal Access Token'));
    
      await waitFor(() => {
        expect(targetDiv?.scrollIntoView).toHaveBeenCalled();
        expect(targetDiv?.classList.add).toHaveBeenCalledWith('highlight-flash');
      });
    });

    test('excludes already involved clubs from filtered results', async () => {
      render(<Preferences />);
      await waitFor(() => screen.getByText('Your Organizations'));
    
      // It should appear in the user's involved list
      expect(screen.getByText('AI and Data Science Club')).toBeInTheDocument();
    
      // It should NOT appear as an addable button (the ones with gray background)
      const filteredButton = screen.queryByRole('button', { name: 'AI and Data Science Club' });
      expect(filteredButton).not.toBeInTheDocument();
    });
    

    test('renders setup mode UI when setupMode is true', async () => {
      render(<Preferences setupMode={true} />);
    
      await waitFor(() => {
        expect(screen.getByText('Canvas Personal Access Token')).toBeInTheDocument();
        expect(screen.getByText(/Rebel Sports Coverage/)).toBeInTheDocument();
        expect(screen.getByText(/Clear Preferences/)).toBeInTheDocument();
        expect(screen.getByText(/Save Preferences/)).toBeInTheDocument();
      });
    });

    test("shows and hides tooltip when help icon is clicked", async () => {
      render(<Preferences setupMode={true} />);
    
      const helpIcon = screen.getAllByTitle("What is this?")[0];
      fireEvent.click(helpIcon);
    
      await waitFor(() => {
        expect(screen.getByText(/Shows important academic deadlines/i)).toBeInTheDocument();
      });
    
      const closeButton = screen.getByText("Close");
      fireEvent.click(closeButton);
    
      await waitFor(() => {
        expect(screen.queryByText(/Shows important academic deadlines/i)).not.toBeInTheDocument();
      });
    });

    test("closes tooltip when clicking outside help popup", async () => {
      render(<Preferences setupMode={true} />);
      const helpIcon = screen.getAllByTitle("What is this?")[0];
      fireEvent.click(helpIcon);
    
      // Click elsewhere in the document to trigger outside-click logic
      fireEvent.mouseDown(document.body);
    
      await waitFor(() => {
        expect(screen.queryByText(/Shows important academic deadlines/i)).not.toBeInTheDocument();
      });
    });

    test("clicking disabled interests section triggers highlight", async () => {
      chrome.storage.sync.get.mockImplementation((_, callback) => {
        callback({
          preferences: {
            academicCalendar: false,
            UNLVCalendar: false, // ❗️disable this
            involvementCenter: false,
            canvasIntegration: false,
            rebelCoverage: true,
            userEvents: false,
          },
          involvedClubs: [],
          rebelMenSports: [],
          rebelWomenSports: [],
          selectedInterests: [],
        });
      });
      render(<Preferences setupMode={true} />);
      const interestHeader = screen.getByText("Your Interests");
    
      const refSpy = jest.spyOn(Element.prototype, "scrollIntoView").mockImplementation(() => {});
      fireEvent.click(interestHeader);
    
      expect(refSpy).toHaveBeenCalled();
      refSpy.mockRestore();
    });
    
    test("clicking disabled club section triggers highlight", async () => {
      chrome.storage.sync.get.mockImplementation((_, callback) => {
        callback({
          preferences: {
            academicCalendar: false,
            UNLVCalendar: true,
            involvementCenter: false, // ❗️disable this
            canvasIntegration: false,
            rebelCoverage: true,
            userEvents: false,
          },
          involvedClubs: [],
          rebelMenSports: [],
          rebelWomenSports: [],
          selectedInterests: [],
        });
      });
    
      render(<Preferences setupMode={true} />);
      await waitFor(() => screen.getByText("Your Organizations"));
    
      const clubHeader = screen.getByText("Your Organizations");
    
      const refSpy = jest
        .spyOn(Element.prototype, "scrollIntoView")
        .mockImplementation(() => {});
    
      fireEvent.click(clubHeader);
    
      expect(refSpy).toHaveBeenCalled();
      refSpy.mockRestore();
    });
    
    
    test("clicking disabled sports section triggers highlight", async () => {
      chrome.storage.sync.get.mockImplementation((_, callback) => {
        callback({
          preferences: {
            academicCalendar: false,
            UNLVCalendar: true,
            involvementCenter: true,
            canvasIntegration: false,
            rebelCoverage: false, // ❗️disabled
            userEvents: false,
          },
          involvedClubs: [],
          rebelMenSports: [],
          rebelWomenSports: [],
          selectedInterests: [],
        });
      });
    
      render(<Preferences setupMode={true} />);
      await waitFor(() => screen.getByText("Rebel Sports Coverage"));
    
      const sportsHeader = screen.getByText("Rebel Sports Coverage");
    
      const refSpy = jest
        .spyOn(Element.prototype, "scrollIntoView")
        .mockImplementation(() => {});
    
      fireEvent.click(sportsHeader);
    
      expect(refSpy).toHaveBeenCalled();
      refSpy.mockRestore();
    });
    
    test("renders CanvasTokenManager when canvasIntegration is enabled", async () => {
      chrome.storage.sync.get.mockImplementation((_, callback) => {
        callback({
          preferences: {
            academicCalendar: false,
            UNLVCalendar: false,
            involvementCenter: false,
            canvasIntegration: true,
            rebelCoverage: false,
            userEvents: false
          },
          involvedClubs: [],
          rebelMenSports: [],
          rebelWomenSports: [],
          selectedInterests: []
        });
      });
    
      render(<Preferences setupMode={true} />);
    
      await waitFor(() => {
        expect(screen.getAllByText(/Canvas Personal Access Token/i)[0]).toBeInTheDocument();
        expect(screen.getByText(/New Access Token/i)).toBeInTheDocument();
      });
    });

    test("resets preferences in setupMode when Clear Preferences is clicked", async () => {
      window.confirm = jest.fn(() => true);
    
      render(<Preferences setupMode={true} />);
      fireEvent.click(screen.getByText("Clear Preferences"));
    
      await waitFor(() => {
        expect(chrome.storage.sync.remove).toHaveBeenCalled();
      });
    });
        
    
  });
});
