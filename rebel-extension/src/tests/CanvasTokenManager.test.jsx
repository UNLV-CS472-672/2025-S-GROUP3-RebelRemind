import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CanvasTokenManager from "../components/CanvasTokenManager";

// Mocks
const mockGet = jest.fn();
const mockSet = jest.fn();

// Setup mock chrome API
beforeAll(() => {
  global.chrome = {
    runtime: {
      sendMessage: jest.fn(),
    },
    storage: {
      local: {
        get: mockGet,
        set: mockSet,
      },
    },
  };
  global.alert = jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();
});

test("Load token", async () => {
  mockGet.mockImplementation((_key, callback) => {
    callback({ canvasPAT: "test-token" });
  });

  render(<CanvasTokenManager />);

  await waitFor(() => {
    expect(screen.getByPlaceholderText("Enter Canvas Token").value).toBe(
      "test-token"
    );
  });
});

test("Toggle show", () => {
  render(<CanvasTokenManager />);
  const input = screen.getByPlaceholderText("Enter Canvas Token");
  const toggleButton = screen.getByText("👁 Show");

  expect(input).toHaveAttribute("type", "password");

  fireEvent.click(toggleButton);
  expect(input).toHaveAttribute("type", "text");

  fireEvent.click(screen.getByText("🙈 Hide"));
  expect(input).toHaveAttribute("type", "password");
});

test("Empty token", () => {
  render(<CanvasTokenManager />);
  const input = screen.getByPlaceholderText("Enter Canvas Token");

  fireEvent.change(input, { target: { value: "   " } });

  fireEvent.click(screen.getByText("Save Token"));

  expect(global.alert).toHaveBeenCalledWith("Please enter a valid token.");
});

test("Success with preferences set", async () => {
  chrome.runtime.sendMessage.mockImplementation((msg, callback) => {
    if (msg.type === "GET_PREFERENCES") {
      callback({preferences: {canvasIntegration: true}});
    }
  });
  render(<CanvasTokenManager />);
  const input = screen.getByPlaceholderText("Enter Canvas Token");

  fireEvent.change(input, { target: { value: "valid-token" } });
  fireEvent.click(screen.getByText("Save Token"));

  await waitFor(() => {
    expect(mockSet).toHaveBeenCalledWith(
      { canvasPAT: "valid-token" },
      expect.any(Function)
    );
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ type: "UPDATE_ASSIGNMENTS" });
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ type: "START_CANVAS_ALARM" });
  });

  // Simulate the callback
  mockSet.mock.calls[0][1]();
  expect(global.alert).toHaveBeenCalledWith(
    "Your Canvas token has been securely saved."
  );
});

test("Success with preferences not set", async () => {
  chrome.runtime.sendMessage.mockImplementation((msg, callback) => {
    if (msg.type === "GET_PREFERENCES") {
      callback({});
    }
  });
  render(<CanvasTokenManager />);
  const input = screen.getByPlaceholderText("Enter Canvas Token");

  fireEvent.change(input, { target: { value: "valid-token" } });
  fireEvent.click(screen.getByText("Save Token"));

  await waitFor(() => {
    expect(mockSet).toHaveBeenCalledWith(
      { canvasPAT: "valid-token" },
      expect.any(Function)
    );
  });

  // Simulate the callback
  mockSet.mock.calls[0][1]();
  expect(global.alert).toHaveBeenCalledWith(
    "Your Canvas token has been securely saved."
  );
});

test("Success with Canvas integration disabled", async () => {
  chrome.runtime.sendMessage.mockImplementation((msg, callback) => {
    if (msg.type === "GET_PREFERENCES") {
      callback({preferences: {canvasIntegration: false}});
    }
  });
  render(<CanvasTokenManager />);
  const input = screen.getByPlaceholderText("Enter Canvas Token");

  fireEvent.change(input, { target: { value: "valid-token" } });
  fireEvent.click(screen.getByText("Save Token"));

  await waitFor(() => {
    expect(mockSet).toHaveBeenCalledWith(
      { canvasPAT: "valid-token" },
      expect.any(Function)
    );
  });

  // Simulate the callback
  mockSet.mock.calls[0][1]();
  expect(global.alert).toHaveBeenCalledWith(
    "Your Canvas token has been securely saved."
  );
});
