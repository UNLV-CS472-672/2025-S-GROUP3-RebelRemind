import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CanvasTokenManager from "../components/CanvasTokenManager";

// Mocks
const mockGet = jest.fn();
const mockSet = jest.fn();

// Setup mock chrome API
beforeAll(() => {
  global.chrome = {
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

test("Success", async () => {
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
