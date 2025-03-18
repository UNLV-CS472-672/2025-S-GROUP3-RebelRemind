import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Counter from "../components/Counter";

// Mock Chrome's runtime messaging API
beforeAll(() => {
  global.chrome = {
    runtime: {
      sendMessage: jest.fn(),
    },
  };
});

beforeEach(() => {
  jest.clearAllMocks(); // Clear mocks between tests
});

describe("Counter Component", () => {
  test("renders initial state correctly", () => {
    render(<Counter />);

    expect(screen.getByText(/Count is 0/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Calculating count squared.../i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Gathering your UNLV schedule/i)
    ).toBeInTheDocument();
  });

  test("increments count when button is clicked", () => {
    render(<Counter />);
    const button = screen.getByText(/Count is 0/i);

    fireEvent.click(button);

    expect(screen.getByText(/Count is 1/i)).toBeInTheDocument();
  });

  test("requests squared value when count > 0", async () => {
    // Mock background response for squared value
    chrome.runtime.sendMessage.mockImplementation((msg, callback) => {
      if (msg.type === "POST_COUNT") {
        callback({ message: `${msg.count * msg.count}` }); // Return squared value as string
      }
    });

    render(<Counter />);
    const button = screen.getByText(/Count is 0/i);

    // Increment count to 1
    fireEvent.click(button);

    // Wait for squared value to be displayed
    await waitFor(() => {
      expect(screen.getByText(/1 squared = 1/i)).toBeInTheDocument();
    });

    // Check that messaging API was called with correct data
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      { type: "POST_COUNT", count: 1 },
      expect.any(Function)
    );
  });

  test("displays message when background script does not respond", async () => {
    // Mock no response (simulate undefined callback response)
    chrome.runtime.sendMessage.mockImplementation((msg, callback) => {
      callback(undefined);
    });

    render(<Counter />);
    const button = screen.getByText(/Count is 0/i);

    // Click button to trigger count
    fireEvent.click(button);

    // Check for no response message for square
    await waitFor(() => {
      expect(
        screen.getByText(/No response from background script/i)
      ).toBeInTheDocument();
    });
  });
});
