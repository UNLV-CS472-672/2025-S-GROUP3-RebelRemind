/**
 * CanvasAssignments Component Tests
 * 
 * This test suite validates the functionality of the Canvas Assignments component.
 * This component allows users to view their upcoming Canvas assignments within the accordion menu on the main extension popup.
 * 
 * Features Tested:
 * - All 3 assignment categories are displayed properly (today, tomorrow, and future due dates)
 * - No assignments found response
 * - Displayed assignments are sorted by due date
 * 
 * Authored by: Gunnar Dalton
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import CanvasAssignments from "../components/CanvasAssignments";

beforeAll(() => {
    global.chrome = {
      runtime:{
        onMessage: {
            addListener: jest.fn(),
            removeListener: jest.fn()
        }
      },
      storage: {
        local: {
          get: jest.fn()
        },
      },
    };
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

test("No assignments in storage", async () => {
    global.chrome.storage.local.get.mockImplementation((key, callback) => { // mock chrome.storage with token
        callback([]);
    })
    render(<CanvasAssignments />);
    await waitFor(() => {
        expect(screen.getByText(/No assignments found./)).toBeInTheDocument(); // proper response if no assignments have been fetched
    });
});

test("Today assignment", async() => { // check for proper text if an assignment is due today
    const today = new Date();
    today.setHours(22, 30);
    const dateString = today.toLocaleString();
    global.chrome.storage.local.get.mockImplementation((key, callback) => { 
        callback({Canvas_Assignments: [{ context_name: "CS 101", title: "Assignment 1", due_at: dateString}]});
    })
    render(<CanvasAssignments />);
    await waitFor(() => {
        // ai-gen start (ChatGPT-4o, 1)
        const matches = screen.getAllByText((_, element) => // check if text is displayed
            element?.textContent === "CS 101: Assignment 1 due at 10:30 PM today"
        );
        expect(matches.length).toBeGreaterThan(0);
        // ai-gen end
    });
});

test("Tomorrow assignment", async() => { // check for proper text if an assignment is due tomorrow
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(22, 30);
    const dateString = tomorrow.toLocaleString();
    global.chrome.storage.local.get.mockImplementation((key, callback) => { 
        callback({Canvas_Assignments: [{ context_name: "CS 102", title: "Assignment 2", due_at: dateString}]});
    })
    render(<CanvasAssignments />);
    await waitFor(() => {
        const matches = screen.getAllByText((_, element) =>
            element?.textContent === "CS 102: Assignment 2 due at 10:30 PM tomorrow"
        );
        expect(matches.length).toBeGreaterThan(0);
    });
});

test("Future assignment", async() => { // check for proper text if an assignment is due after tomorrow
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 5); // assignment is due 5 days after today
    dueDate.setHours(22, 30);
    const dateString = dueDate.toLocaleString();
    const dueDateString = dueDate.toLocaleDateString(undefined, { 
        month: "long",
        day: "numeric"
    });
    global.chrome.storage.local.get.mockImplementation((key, callback) => { 
        callback({Canvas_Assignments: [{ context_name: "CS 103", title: "Assignment 3", due_at: dateString}]});
    })
    render(<CanvasAssignments />);
    await waitFor(() => {
        const matches = screen.getAllByText((_, element) =>
            element?.textContent === `CS 103: Assignment 3 due on ${dueDateString} at 10:30 PM`
        );
        expect(matches.length).toBeGreaterThan(0);
    });
});

test("Combination of assignments", async() => { // check that assignments are sorted in proper order when displayed
    const today = new Date();
    today.setHours(22, 30);
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(23, 30);
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 5);
    futureDate.setHours(21, 30);
    const todayString = today.toLocaleString();
    const tomorrowString = tomorrow.toLocaleString();
    const futuredateString = futureDate.toLocaleString();
    const futureDateDateOnlyString = futureDate.toLocaleDateString(undefined, { 
        month: "long",
        day: "numeric"
    });
    global.chrome.storage.local.get.mockImplementation((key, callback) => { 
        callback({Canvas_Assignments: [{ context_name: "CS 104", title: "Assignment 4", due_at: futuredateString}, 
            { context_name: "CS 105", title: "Assignment 5", due_at: todayString},
            { context_name: "CS 106", title: "Assignment 6", due_at: tomorrowString}
        ]});
    })
    render(<CanvasAssignments />);

    const items = screen.getAllByRole("listitem");

    const expectedOrder = [
      "CS 105: Assignment 5 due at 10:30 PM today",
      "CS 106: Assignment 6 due at 11:30 PM tomorrow",
      `CS 104: Assignment 4 due on ${futureDateDateOnlyString} at 9:30 PM`, 
    ];
  
    items.forEach((item, index) => {
      const actualText = item.textContent.trim();
      const expected = expectedOrder[index];
      expect(actualText).toBe(expected);
    });
});