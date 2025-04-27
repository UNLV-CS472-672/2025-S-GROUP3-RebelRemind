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
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
          get: jest.fn(),
          set: jest.fn()
        },
        sync: {
            get: jest.fn()
        }
      },
    };
    const now = new Date();
    const fakeTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);
    jest.useFakeTimers().setSystemTime(fakeTime); // ensure test is ran at same time every time
});

afterAll(() => {
  jest.useRealTimers();
})

beforeEach(() => {
  jest.clearAllMocks();
});

test("Valid fetch but no assignments returned", async () => {
    global.chrome.storage.local.get.mockImplementation((key, callback) => { // mock chrome.storage as being empty
        callback({ Canvas_Assignments: [],  CanvasFetchStatus: { success: true, error: null }, canvasPAT: "test_access_token"});
    });
    global.chrome.storage.sync.get.mockImplementation((key, callback) => {
        callback({preferences: { canvasIntegration: true }});
    });

    render(<CanvasAssignments />);
    await waitFor(() => {
        expect(screen.getByText(/No assignments due this week./)).toBeInTheDocument(); // proper response if no assignments have been fetched
    });
});

test("No assignments in storage", async () => {
    global.chrome.storage.local.get.mockImplementation((key, callback) => { // mock chrome.storage as being empty
        callback({ CanvasFetchStatus: { success: true, error: null }, canvasPAT: "test_access_token"});
    });
    global.chrome.storage.sync.get.mockImplementation((key, callback) => {
        callback({preferences: { canvasIntegration: true }});
    });

    render(<CanvasAssignments />);
    await waitFor(() => {
        expect(screen.getByText(/No assignments due this week./)).toBeInTheDocument(); // proper response if no assignments have been fetched
    });
});

test("Today assignment", async() => { // check for proper text if an assignment is due today
    const today = new Date();
    today.setHours(22, 30);
    const dateString = today.toLocaleString();
    global.chrome.storage.local.get.mockImplementation((key, callback) => { 
        callback({ Canvas_Assignments: [{ context_name: "CS 101", title: "Assignment 1", due_at: dateString, id: 1, user_submitted: false }], 
            CanvasFetchStatus: { success: true, error: null },
            canvasPAT: "test_access_token"});
    });
    global.chrome.storage.sync.get.mockImplementation((key, callback) => {
        callback({preferences: { canvasIntegration: true }});
    });

    render(<CanvasAssignments />);

    const item = screen.getByRole("listitem"); 
    const actualText = item.textContent.trim().replace(/\s+/g, " "); // remove extra spacing before checking
    const expected = "CS 101: Assignment 1 due at 10:30 PM today";
    expect(actualText).toContain(expected);
});

test("Already submitted assignment to Canvas", async() => { // check that user_submitted being true adds assignment to completed and does not display it
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
      callback({Canvas_Assignments: [
          { context_name: "CS 107", title: "Assignment 7", due_at: todayString, id: 7, user_submitted: false }, 
          { context_name: "CS 108", title: "Assignment 8", due_at: tomorrowString, id: 8, user_submitted: true },
          { context_name: "CS 109", title: "Assignment 9", due_at: futuredateString, id: 9, user_submitted: false }
      ], completedAssignments: [], 
      CanvasFetchStatus: { success: true, error: null },
      canvasPAT: "test_access_token"}); // no completed assignments in storage
  });
  global.chrome.storage.sync.get.mockImplementation((key, callback) => {
      callback({preferences: { canvasIntegration: true }});
  });

  render(<CanvasAssignments viewMode="weekly" />);

  expect(chrome.storage.local.set).toHaveBeenCalledWith({ completedAssignments: [{ id: 8, due_at: tomorrowString }]}); // user_submitted = true assignment is stored as completed

  const items = screen.getAllByRole("listitem");

  const expectedOrder = [
    "CS 107: Assignment 7 due at 10:30 PM today",
    `CS 109: Assignment 9 due on ${futureDateDateOnlyString} at 9:30 PM`, 
  ];

  items.forEach((item, index) => {
    const actualText = item.textContent.trim().replace(/\s+/g, " ");
    const expected = expectedOrder[index];
    expect(actualText).toContain(expected);
  });
});

test("Toggling showCompleted checkbox displays completed assignments", async () => {
    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(now.getDate() + 1);
    dueDate.setHours(20, 0);

    const dueDateString = dueDate.toLocaleString();

    global.chrome.storage.local.get.mockImplementation((key, callback) => {
        callback({
            Canvas_Assignments: [{ context_name: "CS 201", title: "Completed Assignment", due_at: dueDateString, id: 201, user_submitted: false }],
            completedAssignments: [{ id: 201, due_at: dueDateString }],
            CanvasFetchStatus: { success: true, error: null },
            canvasPAT: "token"
        });
    });
    global.chrome.storage.sync.get.mockImplementation((key, callback) => {
        callback({ preferences: { canvasIntegration: true } });
    });

    render(<CanvasAssignments viewMode="weekly" />);

    // Initially hidden
    expect(screen.queryByRole("listitem")).toBeNull();

    // Toggle checkbox to show completed
    const toggle = screen.getByText(/Show Completed/i);
    fireEvent.click(toggle);

    const item = await screen.findByRole("listitem");
    expect(item).toBeInTheDocument();
    expect(item.textContent).toContain("Completed Assignment");
});


test("Completed assignments have gray, struck-through styling", async () => {
    const now = new Date();
    now.setHours(22, 0);
    const dateString = now.toLocaleString();

    global.chrome.storage.local.get.mockImplementation((key, callback) => {
        callback({
            Canvas_Assignments: [{ context_name: "CS 301", title: "Assignment", due_at: dateString, id: 301, user_submitted: false }],
            completedAssignments: [{ id: 301, due_at: dateString }],
            CanvasFetchStatus: { success: true, error: null },
            canvasPAT: "token"
        });
    });
    global.chrome.storage.sync.get.mockImplementation((key, callback) => {
        callback({ preferences: { canvasIntegration: true } });
    });

    render(<CanvasAssignments viewMode="weekly" />);

    const toggle = screen.getByText(/Show Completed/i);
    fireEvent.click(toggle); // show completed

    const item = await screen.findByRole("listitem");
    const link = item.querySelector("a");

    expect(link).toHaveStyle({
        color: "gray",
        textDecoration: "line-through",
    });
});


test("Displays 'All assignments are completed' when all are marked complete", async () => {
    const now = new Date();
    now.setHours(23, 0);
    const dueString = now.toLocaleString();

    global.chrome.storage.local.get.mockImplementation((key, callback) => {
        callback({
            Canvas_Assignments: [{ context_name: "CS 401", title: "Assignment", due_at: dueString, id: 401, user_submitted: false }],
            completedAssignments: [{ id: 401, due_at: dueString }],
            CanvasFetchStatus: { success: true, error: null },
            canvasPAT: "token"
        });
    });
    global.chrome.storage.sync.get.mockImplementation((key, callback) => {
        callback({ preferences: { canvasIntegration: true } });
    });

    render(<CanvasAssignments viewMode="daily" />);

    await waitFor(() => {
        expect(screen.getByText(/All assignments due today are completed/i)).toBeInTheDocument();
    });
});

test("Assignments are sorted in chronological order", async () => {
    const now = new Date();

    const assignment1 = new Date(now);
    assignment1.setHours(18);

    const assignment2 = new Date(now);
    assignment2.setHours(20);

    const assignment3 = new Date(now);
    assignment3.setHours(23);

    global.chrome.storage.local.get.mockImplementation((key, callback) => {
        callback({
            Canvas_Assignments: [
                { context_name: "CS 501", title: "Late", due_at: assignment3.toLocaleString(), id: 501, user_submitted: false },
                { context_name: "CS 502", title: "Early", due_at: assignment1.toLocaleString(), id: 502, user_submitted: false },
                { context_name: "CS 503", title: "Middle", due_at: assignment2.toLocaleString(), id: 503, user_submitted: false }
            ],
            completedAssignments: [],
            CanvasFetchStatus: { success: true, error: null },
            canvasPAT: "token"
        });
    });
    global.chrome.storage.sync.get.mockImplementation((key, callback) => {
        callback({ preferences: { canvasIntegration: true } });
    });

    render(<CanvasAssignments viewMode="daily" />);

    const items = await screen.findAllByRole("listitem");
    const textContent = items.map(item => item.textContent);
    
    expect(textContent[0]).toContain("Early");
    expect(textContent[1]).toContain("Middle");
    expect(textContent[2]).toContain("Late");
});

test("Handles UPDATE_ASSIGNMENTS message correctly", async () => {
    let capturedHandler;

    // Capture the message handler
    global.chrome.runtime.onMessage.addListener.mockImplementation((handler) => {
        capturedHandler = handler;
    });

    const date = new Date();
    const dueString = date.toLocaleString();

    global.chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({
            Canvas_Assignments: [{ context_name: "CS 601", title: "Message Triggered", due_at: dueString, id: 601, user_submitted: false }],
            completedAssignments: [],
            CanvasFetchStatus: { success: true, error: null },
            canvasPAT: "token"
        });
    });
    global.chrome.storage.sync.get.mockImplementation((key, callback) => {
        callback({ preferences: { canvasIntegration: true } });
    });

    render(<CanvasAssignments viewMode="weekly" />);

    const sendResponseMock = jest.fn();

    // Simulate background message
    const response = capturedHandler({ type: "UPDATE_ASSIGNMENTS" }, null, sendResponseMock);

    expect(response).toBe(true);
    
    await waitFor(() => {
        expect(chrome.storage.local.get).toHaveBeenCalledWith(["Canvas_Assignments", "completedAssignments"], expect.any(Function));
        expect(sendResponseMock).toHaveBeenCalledWith(true);
    });

    // Confirm the assignment triggered by the message is rendered
    expect(await screen.findByText(/Message Triggered/)).toBeInTheDocument();
});

test("markComplete adds assignment to completed list", async () => {
    const now = new Date();
    now.setHours(22, 30);
    const dateString = now.toLocaleString();
  
    global.chrome.storage.local.get.mockImplementation((key, callback) => {
      callback({
        Canvas_Assignments: [{
          context_name: "CS 201",
          title: "Mark Test",
          due_at: dateString,
          id: 201,
          user_submitted: false
        }],
        completedAssignments: [],
        CanvasFetchStatus: { success: true, error: null },
        canvasPAT: "test_token"
      });
    });
  
    global.chrome.storage.sync.get.mockImplementation((key, callback) => {
      callback({ preferences: { canvasIntegration: true } });
    });
  
    render(<CanvasAssignments viewMode="weekly" />);
  
    // Find checkbox by ID or fallback to getAllByRole
    const checkbox = await screen.findByRole("checkbox", { name: "" }); // unnamed checkbox
    fireEvent.click(checkbox); // triggers markComplete
  
    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      completedAssignments: [{ id: 201, due_at: dateString }]
    });
  
    const assignment = screen.getByText(/Mark Test/);
    expect(assignment).toHaveStyle({
      textDecoration: "line-through",
      color: "gray"
    });
  });
  

  test("undoComplete removes assignment from completed list", async () => {
    const now = new Date();
    now.setHours(22, 30);
    const dateString = now.toLocaleString();
  
    global.chrome.storage.local.get.mockImplementation((key, callback) => {
      callback({
        Canvas_Assignments: [{
          context_name: "CS 202",
          title: "Undo Test",
          due_at: dateString,
          id: 202,
          user_submitted: false
        }],
        completedAssignments: [
          { id: 202, due_at: dateString }
        ],
        CanvasFetchStatus: { success: true, error: null },
        canvasPAT: "test_token"
      });
    });
  
    global.chrome.storage.sync.get.mockImplementation((key, callback) => {
      callback({ preferences: { canvasIntegration: true } });
    });
  
    render(<CanvasAssignments viewMode="weekly" />);
  
    // Show the completed assignment
    const showCompletedToggle = screen.getByText(/Show Completed/i);
    fireEvent.click(showCompletedToggle); // turn it on
    expect(screen.getByText(/Hide Completed/i)).toBeInTheDocument();
  
    // Wait for item to appear
    const assignment = await screen.findByText(/Undo Test/);
    expect(assignment).toBeInTheDocument();
  
    // Now click checkbox to undo
    const checkbox = screen.getByRole("checkbox", { name: "" }); // unnamed checkbox
    fireEvent.click(checkbox); // triggers undoComplete
  
    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      completedAssignments: []
    });
  
    expect(assignment).toHaveStyle({
      textDecoration: "none"
    });
  });

  test("Invalid Canvas Access Token error", async() => {
    const today = new Date();
    today.setHours(22, 30);
    const dateString = today.toLocaleString();
    global.chrome.storage.local.get.mockImplementation((key, callback) => { 
        callback({ Canvas_Assignments: [{ context_name: "CS 119", title: "Assignment 19", due_at: dateString, id: 19, user_submitted: false }], 
            CanvasFetchStatus: { success: false, error: "Invalid Canvas Access Token" },
            canvasPAT: "test_access_token"});
    });
    global.chrome.storage.sync.get.mockImplementation((key, callback) => {
        callback({preferences: { canvasIntegration: true }});
    });

    render(<CanvasAssignments viewMode="weekly" />);

    await waitFor(() => {
        expect(screen.getByText(/Your Canvas Access Token is invalid! Please check your saved token and try again./)).toBeInTheDocument(); // message that is displayed if all upcoming assignments in storage are already completed
    });
});

test("No Canvas Access Token in storage", async() => {
  const today = new Date();
  today.setHours(22, 30);
  const dateString = today.toLocaleString();
  global.chrome.storage.local.get.mockImplementation((key, callback) => { 
      callback({ Canvas_Assignments: [{ context_name: "CS 118", title: "Assignment 18", due_at: dateString, id: 18, user_submitted: false }], 
          CanvasFetchStatus: { success: true, error: null },
          canvasPAT: ""});
  });
  global.chrome.storage.sync.get.mockImplementation((key, callback) => {
      callback({preferences: { canvasIntegration: true }});
  });

  render(<CanvasAssignments viewMode="weekly" />);

  await waitFor(() => {
      expect(screen.getByText(/You do not have a Canvas Access Token stored! Please save a token into storage to enable this feature./)).toBeInTheDocument(); // message that is displayed if all upcoming assignments in storage are already completed
  });
});

test("Miscellaneous Canvas fetching error", async() => {
  const today = new Date();
  today.setHours(22, 30);
  const dateString = today.toLocaleString();
  global.chrome.storage.local.get.mockImplementation((key, callback) => { 
      callback({ Canvas_Assignments: [{ context_name: "CS 120", title: "Assignment 20", due_at: dateString, id: 20, user_submitted: false }], 
          CanvasFetchStatus: { success: false, error: "Miscellaneous error" },
          canvasPAT: "test_access_token"});
  });
  global.chrome.storage.sync.get.mockImplementation((key, callback) => {
      callback({preferences: { canvasIntegration: true }});
  });

  render(<CanvasAssignments viewMode="weekly" />);

  await waitFor(() => {
      expect(screen.getByText(/An error occured while fetching your assignments! Please check your saved token or try again later./)).toBeInTheDocument(); // message that is displayed if all upcoming assignments in storage are already completed
  });
});