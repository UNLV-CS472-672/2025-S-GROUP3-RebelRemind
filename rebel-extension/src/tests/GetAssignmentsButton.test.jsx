import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GetAssignmentsButton from "../components/GetAssignmentsButton";

beforeAll(() => {
  global.chrome = {
    runtime: {
      sendMessage: jest.fn(),
    },
  };
  global.alert = jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();
});

test("Null preference", async () => {
  chrome.runtime.sendMessage.mockImplementation((msg, callback) => {
    if (msg.type === "GET_PREFERENCES") {
      callback(null);
    }
  });

  render(<GetAssignmentsButton />);
  fireEvent.click(screen.getByText("Get Your Canvas Assignments"));

  await waitFor(() => {
    expect(global.alert).toHaveBeenCalledWith("No preferences set!");
  });
});

test("Canvas disabled", async () => {
  chrome.runtime.sendMessage.mockImplementation((msg, callback) => {
    if (msg.type === "GET_PREFERENCES") {
      callback({ preferences: { canvasIntegration: false } });
    }
  });

  render(<GetAssignmentsButton />);
  fireEvent.click(screen.getByText("Get Your Canvas Assignments"));

  await waitFor(() => {
    expect(global.alert).toHaveBeenCalledWith(
      "Canvas Integration is disabled!"
    );
  });
});

test("No assignments", async () => {
  chrome.runtime.sendMessage.mockImplementation((msg, callback) => {
    if (msg.type === "GET_PREFERENCES") {
      callback({ preferences: { canvasIntegration: true } });
    } else if (msg.type === "GET_SCHEDULE") {
      callback(null);
    }
  });

  render(<GetAssignmentsButton />);
  fireEvent.click(screen.getByText("Get Your Canvas Assignments"));

  await waitFor(() => {
    expect(global.alert).toHaveBeenCalledWith("No schedule found!");
  });
});

test("Success", async () => {
  chrome.runtime.sendMessage.mockImplementation((msg, callback) => {
    if (msg.type === "GET_PREFERENCES") {
      callback({ preferences: { canvasIntegration: true } });
    } else if (msg.type === "GET_SCHEDULE") {
      callback({ schedule: ["Assignment 1", "Assignment 2"] }); // simulate some response
    }
  });

  render(<GetAssignmentsButton />);
  fireEvent.click(screen.getByText("Get Your Canvas Assignments"));

  await waitFor(() => {
    expect(global.alert).toHaveBeenCalledWith(
      "Your schedule has been fetched!"
    );
  });
});
