/**
 * CalendarColorChanging Component Tests
 * 
 * This test suite validates the functionality of the Calendar color changing component.
 * This component allows users to customize the color of events on the calendar for each type.
 * 
 * Features Tested:
 * - Preferences are followed when displaying color pickers
 * - Changing color properly updates storage and sends message to calendar
 * 
 * Authored by: Gunnar Dalton
 */

import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import CalendarColorChange from "../components/CalendarEventColorChanging";

beforeAll(() => {
    global.chrome = {
      runtime:{
        sendMessage: jest.fn()
      },
      storage: {
        local: {
          get: jest.fn(),
          set: jest.fn((data, callback) => {
            callback();  
          })
        },
        sync: {
            get: jest.fn()
        }
      },
    };
});
  
beforeEach(() => {
jest.clearAllMocks();
});

test("Only user created events is displayed when all preferences are disabled", async () => {
    global.chrome.storage.local.get.mockImplementation((key, callback) => { // mock chrome.storage as being empty
        callback({ colorList: { UNLVEvents: "#b10202", InvolvementCenter: "#666666", userEvents: "#0000ff", CanvasCourses: {12345: { name: "CS 101", color: "#ff33dd" }} }});
    });
    global.chrome.storage.sync.get.mockImplementation((key, callback) => {
        callback({preferences: { canvasIntegration: false, UNLVCalendar: false, academicCalendar: false, involvementCenter: false, rebelCoverage: false }});
    });

    render(<CalendarColorChange />);

    const userEventsColorPicker = await screen.findByLabelText("Your Created Events:");
    expect(userEventsColorPicker).toBeInTheDocument();

    const InvolvementCenterColorPicker = screen.queryByLabelText("Involvement Center:");
    expect(InvolvementCenterColorPicker).not.toBeInTheDocument();

    const UNLVEventsColorPicker = screen.queryByLabelText("UNLV Events:");
    expect(UNLVEventsColorPicker).not.toBeInTheDocument();

    const CanvasCourseColorPicker = screen.queryByLabelText("CS 101:");
    expect(CanvasCourseColorPicker).not.toBeInTheDocument();
});

test("Involvement Center preference is the only one enabled", async () => {
    global.chrome.storage.local.get.mockImplementation((key, callback) => { // mock chrome.storage as being empty
        callback({ colorList: { UNLVEvents: "#b10202", InvolvementCenter: "#666666", userEvents: "#0000ff", CanvasCourses: {12345: { name: "CS 101", color: "#ff33dd" }} }});
    });
    global.chrome.storage.sync.get.mockImplementation((key, callback) => {
        callback({preferences: { canvasIntegration: false, UNLVCalendar: false, academicCalendar: false, involvementCenter: true, rebelCoverage: false }});
    });

    render(<CalendarColorChange />);

    const userEventsColorPicker = await screen.findByLabelText("Your Created Events:");
    expect(userEventsColorPicker).toBeInTheDocument();

    const InvolvementCenterColorPicker = await screen.findByLabelText("Involvement Center:");
    expect(InvolvementCenterColorPicker).toBeInTheDocument();

    const UNLVEventsColorPicker = screen.queryByLabelText("UNLV Events:");
    expect(UNLVEventsColorPicker).not.toBeInTheDocument();

    const CanvasCourseColorPicker = screen.queryByLabelText("CS 101:");
    expect(CanvasCourseColorPicker).not.toBeInTheDocument();
});

test("UNLV events preference is the only one enabled", async () => {
    global.chrome.storage.local.get.mockImplementation((key, callback) => { // mock chrome.storage as being empty
        callback({ colorList: { UNLVEvents: "#b10202", InvolvementCenter: "#666666", userEvents: "#0000ff", CanvasCourses: {12345: { name: "CS 101", color: "#ff33dd" }} }});
    });
    global.chrome.storage.sync.get.mockImplementation((key, callback) => {
        callback({preferences: { canvasIntegration: false, UNLVCalendar: true, academicCalendar: false, involvementCenter: false, rebelCoverage: false }});
    });

    render(<CalendarColorChange />);

    const userEventsColorPicker = await screen.findByLabelText("Your Created Events:");
    expect(userEventsColorPicker).toBeInTheDocument();

    const InvolvementCenterColorPicker = screen.queryByLabelText("Involvement Center:");
    expect(InvolvementCenterColorPicker).not.toBeInTheDocument();

    const UNLVEventsColorPicker = await screen.findByLabelText("UNLV Events:");
    expect(UNLVEventsColorPicker).toBeInTheDocument();

    const CanvasCourseColorPicker = screen.queryByLabelText("CS 101:");
    expect(CanvasCourseColorPicker).not.toBeInTheDocument();
});

test("Canvas courses display when Canvas integration is enabled", async () => {
    global.chrome.storage.local.get.mockImplementation((key, callback) => { // mock chrome.storage as being empty
        callback({ colorList: { UNLVEvents: "#b10202", InvolvementCenter: "#666666", userEvents: "#0000ff", CanvasCourses: {12345: { name: "CS 101", color: "#ff33dd" }} }});
    });
    global.chrome.storage.sync.get.mockImplementation((key, callback) => {
        callback({preferences: { canvasIntegration: true, UNLVCalendar: false, academicCalendar: false, involvementCenter: false, rebelCoverage: false }});
    });

    render(<CalendarColorChange />);

    const userEventsColorPicker = await screen.findByLabelText("Your Created Events:");
    expect(userEventsColorPicker).toBeInTheDocument();

    const InvolvementCenterColorPicker = screen.queryByLabelText("Involvement Center:");
    expect(InvolvementCenterColorPicker).not.toBeInTheDocument();

    const UNLVEventsColorPicker = screen.queryByLabelText("UNLV Events:");
    expect(UNLVEventsColorPicker).not.toBeInTheDocument();

    const CanvasCourseColorPicker = await screen.findByLabelText("CS 101:");
    expect(CanvasCourseColorPicker).toBeInTheDocument();
});

test("Color changes for user events", async() => {
    global.chrome.storage.local.get.mockImplementation((key, callback) => { // mock chrome.storage as being empty
        callback({ colorList: { UNLVEvents: "#b10202", InvolvementCenter: "#666666", userEvents: "#0000ff", CanvasCourses: {12345: { name: "CS 101", color: "#ff33dd" }} }});
    });
    global.chrome.storage.sync.get.mockImplementation((key, callback) => {
        callback({preferences: { canvasIntegration: false, UNLVCalendar: false, academicCalendar: false, involvementCenter: false, rebelCoverage: false }});
    });

    render(<CalendarColorChange />);

    const userEventsColorPicker = await screen.findByLabelText("Your Created Events:");
    expect(userEventsColorPicker).toBeInTheDocument();
    fireEvent.change(userEventsColorPicker, { target: { value: "#800080" }});
    await waitFor(() => {
        expect(chrome.storage.local.set).toHaveBeenCalled();
        expect(chrome.runtime.sendMessage).toHaveBeenCalled();
    });

    expect(chrome.storage.local.set).toHaveBeenCalledWith({ colorList: { UNLVEvents: "#b10202", InvolvementCenter: "#666666", userEvents: "#800080", CanvasCourses: {12345: { name: "CS 101", color: "#ff33dd" }} } }, expect.any(Function));
});

test("Color changes for involvement center", async() => {
    global.chrome.storage.local.get.mockImplementation((key, callback) => { // mock chrome.storage as being empty
        callback({ colorList: { UNLVEvents: "#b10202", InvolvementCenter: "#666666", userEvents: "#0000ff", CanvasCourses: {12345: { name: "CS 101", color: "#ff33dd" }} }});
    });
    global.chrome.storage.sync.get.mockImplementation((key, callback) => {
        callback({preferences: { canvasIntegration: false, UNLVCalendar: false, academicCalendar: false, involvementCenter: true, rebelCoverage: false }});
    });

    render(<CalendarColorChange />);

    const involvementCenterColorPicker = await screen.findByLabelText("Involvement Center:");
    expect(involvementCenterColorPicker).toBeInTheDocument();
    fireEvent.change(involvementCenterColorPicker, { target: { value: "#800080" }});
    await waitFor(() => {
        expect(chrome.storage.local.set).toHaveBeenCalled();
        expect(chrome.runtime.sendMessage).toHaveBeenCalled();
    });

    expect(chrome.storage.local.set).toHaveBeenCalledWith({ colorList: { UNLVEvents: "#b10202", InvolvementCenter: "#800080", userEvents: "#0000ff", CanvasCourses: {12345: { name: "CS 101", color: "#ff33dd" }} } }, expect.any(Function));
});

test("Color changes for UNLV events", async() => {
    global.chrome.storage.local.get.mockImplementation((key, callback) => { // mock chrome.storage as being empty
        callback({ colorList: { UNLVEvents: "#b10202", InvolvementCenter: "#666666", userEvents: "#0000ff", CanvasCourses: {12345: { name: "CS 101", color: "#ff33dd" }} }});
    });
    global.chrome.storage.sync.get.mockImplementation((key, callback) => {
        callback({preferences: { canvasIntegration: false, UNLVCalendar: true, academicCalendar: false, involvementCenter: false, rebelCoverage: false }});
    });

    render(<CalendarColorChange />);

    const UNLVEventsColorPicker = await screen.findByLabelText("UNLV Events:");
    expect(UNLVEventsColorPicker).toBeInTheDocument();
    fireEvent.change(UNLVEventsColorPicker, { target: { value: "#800080" }});
    await waitFor(() => {
        expect(chrome.storage.local.set).toHaveBeenCalled();
        expect(chrome.runtime.sendMessage).toHaveBeenCalled();
    });

    expect(chrome.storage.local.set).toHaveBeenCalledWith({ colorList: { UNLVEvents: "#800080", InvolvementCenter: "#666666", userEvents: "#0000ff", CanvasCourses: {12345: { name: "CS 101", color: "#ff33dd" }} } }, expect.any(Function));
});

test("Color changes for Canvas course", async() => {
    global.chrome.storage.local.get.mockImplementation((key, callback) => { // mock chrome.storage as being empty
        callback({ colorList: { UNLVEvents: "#b10202", InvolvementCenter: "#666666", userEvents: "#0000ff", CanvasCourses: {12345: { name: "CS 101", color: "#ff33dd" }} }});
    });
    global.chrome.storage.sync.get.mockImplementation((key, callback) => {
        callback({preferences: { canvasIntegration: true, UNLVCalendar: false, academicCalendar: false, involvementCenter: false, rebelCoverage: false }});
    });

    render(<CalendarColorChange />);

    const CanvasCourseColorPicker = await screen.findByLabelText("CS 101:");
    expect(CanvasCourseColorPicker).toBeInTheDocument();
    fireEvent.change(CanvasCourseColorPicker, { target: { value: "#800080" }});
    await waitFor(() => {
        expect(chrome.storage.local.set).toHaveBeenCalled();
        expect(chrome.runtime.sendMessage).toHaveBeenCalled();
    });

    expect(chrome.storage.local.set).toHaveBeenCalledWith({ colorList: { UNLVEvents: "#b10202", InvolvementCenter: "#666666", userEvents: "#0000ff", CanvasCourses: {12345: { name: "CS 101", color: "#800080" }} } }, expect.any(Function));
});