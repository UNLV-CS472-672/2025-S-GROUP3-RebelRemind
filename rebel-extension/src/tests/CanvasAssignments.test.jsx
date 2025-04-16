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

test("No assignments in storage", async () => {
    global.chrome.storage.local.get.mockImplementation((key, callback) => { // mock chrome.storage as being empty
        callback([]);
    });

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
        callback({Canvas_Assignments: [{ context_name: "CS 101", title: "Assignment 1", due_at: dateString, id: 1, user_submitted: false }]});
    });

    render(<CanvasAssignments />);

    const item = screen.getByRole("listitem"); 
    const actualText = item.textContent.trim().replace(/\s+/g, " "); // remove extra spacing before checking
    const expected = "•CS 101: Assignment 1 due at 10:30 PM today";
    expect(actualText).toContain(expected);
});

test("Tomorrow assignment", async() => { // check for proper text if an assignment is due tomorrow
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(22, 30);
    const dateString = tomorrow.toLocaleString();
    global.chrome.storage.local.get.mockImplementation((key, callback) => { 
        callback({Canvas_Assignments: [{ context_name: "CS 102", title: "Assignment 2", due_at: dateString, id: 2, user_submitted: false }]});
    });

    render(<CanvasAssignments />);

    const item = screen.getByRole("listitem");
    const actualText = item.textContent.trim().replace(/\s+/g, " ");
    const expected = "•CS 102: Assignment 2 due at 10:30 PM tomorrow";
    expect(actualText).toContain(expected);
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
        callback({Canvas_Assignments: [{ context_name: "CS 103", title: "Assignment 3", due_at: dateString, id: 3, user_submitted: false }]});
    });

    render(<CanvasAssignments />);

    const item = screen.getByRole("listitem");
    const actualText = item.textContent.trim().replace(/\s+/g, " ");
    const expected = `•CS 103: Assignment 3 due on ${dueDateString} at 10:30 PM`;
    expect(actualText).toContain(expected);
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
        callback({Canvas_Assignments: [
            { context_name: "CS 104", title: "Assignment 4", due_at: futuredateString, id: 4, user_submitted: false }, 
            { context_name: "CS 105", title: "Assignment 5", due_at: todayString, id: 5, user_submitted: false },
            { context_name: "CS 106", title: "Assignment 6", due_at: tomorrowString, id: 6, user_submitted: false }
        ]});
    });

    render(<CanvasAssignments />);

    // ai-gen start (ChatGPT-4o, 2)
    const items = screen.getAllByRole("listitem");

    const expectedOrder = [
      "•CS 105: Assignment 5 due at 10:30 PM today",
      "•CS 106: Assignment 6 due at 11:30 PM tomorrow",
      `•CS 104: Assignment 4 due on ${futureDateDateOnlyString} at 9:30 PM`, 
    ];
  
    items.forEach((item, index) => { // check every assignment for accuracy
      const actualText = item.textContent.trim().replace(/\s+/g, " ");
      const expected = expectedOrder[index];
      expect(actualText).toContain(expected);
    });
    // ai-gen end
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
        ], completedAssignments: [] }); // no completed assignments in storage
    });

    render(<CanvasAssignments />);

    expect(chrome.storage.local.set).toHaveBeenCalledWith({ completedAssignments: [{ id: 8, due_at: tomorrowString }]}); // user_submitted = true assignment is stored as completed

    const items = screen.getAllByRole("listitem");

    const expectedOrder = [
      "•CS 107: Assignment 7 due at 10:30 PM today",
      `•CS 109: Assignment 9 due on ${futureDateDateOnlyString} at 9:30 PM`, 
    ];
  
    items.forEach((item, index) => {
      const actualText = item.textContent.trim().replace(/\s+/g, " ");
      const expected = expectedOrder[index];
      expect(actualText).toContain(expected);
    });
});

test("All assignments are completed", async() => {
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
            { context_name: "CS 117", title: "Assignment 17", due_at: todayString, id: 17, user_submitted: false }, 
            { context_name: "CS 118", title: "Assignment 18", due_at: tomorrowString, id: 18, user_submitted: true },
            { context_name: "CS 119", title: "Assignment 19", due_at: futuredateString, id: 19, user_submitted: false }], 
            completedAssignments: [
                { id: 17, due_at: todayString }, 
                { id: 19, due_at: futuredateString }
            ]});
    });

    render(<CanvasAssignments />);
    await waitFor(() => {
        expect(screen.getByText(/All upcoming assignments are completed!/)).toBeInTheDocument(); // message that is displayed if all upcoming assignments in storage are already completed
    });
});

test("Mark assignment complete", async() => {
    const today = new Date();
    today.setHours(22, 30);
    const dateString = today.toLocaleString();
    global.chrome.storage.local.get.mockImplementation((key, callback) => { 
        callback({Canvas_Assignments: [{ context_name: "CS 113", title: "Assignment 13", due_at: dateString, id: 13, user_submitted: false }],
            completedAssignments: [] });
    });

    render(<CanvasAssignments />);

    const item = screen.getByRole("listitem");
    const actualText = item.textContent.trim().replace(/\s+/g, " ");
    const expected = "•CS 113: Assignment 13 due at 10:30 PM today";
    expect(actualText).toContain(expected); // assignment is displayed as normal

    const markCompletedButton = await screen.findByTitle("Assignment Completed");
    fireEvent.click(markCompletedButton); // click completed button

    expect(chrome.storage.local.set).toHaveBeenCalledWith({ completedAssignments: [
        { id: 13, due_at: dateString }
    ]}); // assignment is stored as completed now

    expect(item.querySelector("div")).toHaveStyle({
        color: "gray",
        textDecoration: 'line-through',
    }); // assignment has appearance of completed assignments
});

test("Undo a completed assignment", async() => {
    const today = new Date();
    today.setHours(22, 30);
    const dateString = today.toLocaleString();
    global.chrome.storage.local.get.mockImplementation((key, callback) => { 
        callback({Canvas_Assignments: [{ context_name: "CS 114", title: "Assignment 14", due_at: dateString, id: 14, user_submitted: false }], 
            completedAssignments: [{ id: 14, due_at: dateString }]}); // assignment is already completed
    });

    render(<CanvasAssignments />);

    expect(chrome.storage.local.set).toHaveBeenCalledWith({ completedAssignments: [
        { id: 14, due_at: dateString }
    ]}); // assignment is still in completedAssignments

    await waitFor(() => {
        expect(screen.getByText(/All upcoming assignments are completed!/)).toBeInTheDocument();  // currently all assignments are completed
    });

    const checkbox = screen.getByRole("checkbox"); 
    fireEvent.click(checkbox); // toggle showCompleted on

    const item = screen.getByRole("listitem");
    const actualText = item.textContent.trim().replace(/\s+/g, " ");
    const expected = "•CS 114: Assignment 14 due at 10:30 PM today";
    expect(actualText).toContain(expected); // assignment is now displayed

    expect(item.querySelector("div")).toHaveStyle({ // assignment has appearance of completed assignments
        color: "gray",
        textDecoration: 'line-through',
    });

    const undoCompletedButton = await screen.findByTitle("Undo Completed");
    fireEvent.click(undoCompletedButton); // click undo button

    expect(chrome.storage.local.set).toHaveBeenCalledWith({ completedAssignments: [] }); // completedAssignments is now empty

    expect(item.querySelector("div")).toHaveStyle({ // assignment appears normal again
        textDecoration: 'none',
    });
});

test("Mark complete and undo complete an assignment", async() => {
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
            { context_name: "CS 110", title: "Assignment 10", due_at: todayString, id: 10, user_submitted: false }, 
            { context_name: "CS 111", title: "Assignment 11", due_at: tomorrowString, id: 11, user_submitted: true },
            { context_name: "CS 112", title: "Assignment 12", due_at: futuredateString, id: 12, user_submitted: false }], 
            completedAssignments: [] });
    });

    render(<CanvasAssignments />);

    const items = screen.getAllByRole("listitem");

    const expectedOrder = [
      "•CS 110: Assignment 10 due at 10:30 PM today",
      `•CS 112: Assignment 12 due on ${futureDateDateOnlyString} at 9:30 PM`, 
    ];
  
    items.forEach((item, index) => { // check current incomplete assignments display
      const actualText = item.textContent.trim().replace(/\s+/g, " ");
      const expected = expectedOrder[index];
      expect(actualText).toContain(expected);
    });

    const targetAssignment2 = screen.getByText("CS 112").closest("li");

    const markCompletedButton = within(targetAssignment2).getByRole("button", {
        name: /Assignment Completed/i,
    });
    fireEvent.click(markCompletedButton); // mark one assignment as complete

    expect(chrome.storage.local.set).toHaveBeenCalledWith({ completedAssignments: [
        { id: 11, due_at: tomorrowString }, 
        { id: 12, due_at: futuredateString }
    ]}); // store in completedAssignments

    const assignmentDiv2 = within(targetAssignment2).getByText((_, el) => 
        String(el?.className || "").includes("break-words")
    );

    expect(assignmentDiv2).toHaveStyle({
        color: "gray",
        textDecoration: 'line-through',
    }); // assignment has appearance of completed assignments

    const undoCompletedButton1 = within(targetAssignment2).getByRole("button", {
        name: /Undo Completed/i,
    });
    fireEvent.click(undoCompletedButton1); // now change it back to incomplete

    expect(chrome.storage.local.set).toHaveBeenCalledWith({ completedAssignments: [{ id: 11, due_at: tomorrowString }]}); // storage is updated

    expect(assignmentDiv2).toHaveStyle({
        textDecoration: 'none',
    }); // appears back as normal assignment

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox); // showCompleted is now on

    const targetAssignment1 = screen.getByText("CS 111").closest("li");

    const assignmentDiv1 = within(targetAssignment1).getByText((_, el) => 
        String(el?.className || "").includes("break-words")
    );

    expect(assignmentDiv1).toHaveStyle({
        color: "gray",
        textDecoration: 'line-through',
    }); // already completed assignment shows correctly

    const undoCompletedButton2 = within(targetAssignment1).getByRole("button", {
        name: /Undo Completed/i,
    });
    fireEvent.click(undoCompletedButton2); // undo already completed assignment

    expect(assignmentDiv1).toHaveStyle({
        textDecoration: 'none',
    });

    fireEvent.click(checkbox); // showCompleted is now off

    expect(assignmentDiv1).toHaveStyle({
        textDecoration: 'none',
    });

    expect(assignmentDiv2).toHaveStyle({
        textDecoration: 'none',
    }); // both assignments now display as normal
});

test("Handling UPDATE_ASSIGNMENTS message", async() => {
    chrome.runtime.onMessage.addListener.mockImplementation((fn) => {
        handleMessage = fn;
    });

    const today = new Date();
    today.setHours(22, 30);
    const dateString = today.toLocaleString();
    global.chrome.storage.local.get.mockImplementation((key, callback) => { 
        callback({Canvas_Assignments: [{ context_name: "CS 115", title: "Assignment 15", due_at: dateString, id: 15, user_submitted: false }], 
            completedAssignments: []});
    });

    const sendReponse = jest.fn();

    render(<CanvasAssignments />);

    const response = handleMessage({ type: "UPDATE_ASSIGNMENTS" }, null, sendReponse); // mock update message

    expect(response).toBe(true);
    await waitFor(() => { // check that fetchAssignments() runs twice and sendResponse runs as expected
        expect(chrome.storage.local.get).toHaveBeenCalledWith(["Canvas_Assignments", "completedAssignments"], expect.any(Function));
        expect(chrome.storage.local.get).toHaveBeenCalledTimes(2);
        expect(chrome.storage.local.set).toHaveBeenCalledTimes(2);
        expect(sendReponse).toHaveBeenCalledWith(true);
        expect(sendReponse).toHaveBeenCalledTimes(1);
    });
});

test("Handling INVALID_MESSAGE message", async() => {
    chrome.runtime.onMessage.addListener.mockImplementation((fn) => {
        handleMessage = fn;
    });

    const today = new Date();
    today.setHours(22, 30);
    const dateString = today.toLocaleString();
    global.chrome.storage.local.get.mockImplementation((key, callback) => { 
        callback({Canvas_Assignments: [{ context_name: "CS 116", title: "Assignment 16", due_at: dateString, id: 16, user_submitted: false }], 
            completedAssignments: []});
    });

    const sendReponse = jest.fn();

    render(<CanvasAssignments />);

    const response = handleMessage({ type: "INVALID_MESSAGE" }, null, sendReponse);

    expect(response).toBe(undefined);
    await waitFor(() => { // check that fetchAssignments() runs once and sendResponse does not run
        expect(chrome.storage.local.get).toHaveBeenCalledTimes(1);
        expect(chrome.storage.local.set).toHaveBeenCalledTimes(1);
        expect(sendReponse).not.toHaveBeenCalled();
    });
})