import { checkDailyTask } from "../scripts/check-daily-login.js";

const mockGet = jest.fn();
const mockSet = jest.fn();

beforeAll(() => {
  global.chrome = {
    storage: {
      local: {
        get: mockGet,
        set: mockSet,
      },
    },
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

// Helper to get today's date string
const today = new Date().toISOString().split("T")[0];

test("No log in today", async () => {
  mockGet.mockImplementation((_keys, callback) => {
    callback({ lastRunDate: "2020-01-01" }); // Old date
  });

  mockSet.mockImplementation((_data, callback) => {
    callback?.();
  });

  const result = await checkDailyTask();

  expect(result).toBe(true);
  expect(mockSet).toHaveBeenCalledWith(
    { lastRunDate: today },
    expect.any(Function)
  );
});

test("Log in today", async () => {
  mockGet.mockImplementation((_keys, callback) => {
    callback({ lastRunDate: today });
  });

  const result = await checkDailyTask();

  expect(result).toBe(false);
  expect(mockSet).not.toHaveBeenCalled();
});
