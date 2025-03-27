import { getAssignments, getCourses, getCanvasPAT } from "../scripts/canvas-script";

beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks between tests
    global.chrome = {
        runtime: {
          sendMessage: jest.fn(),
        },
        storage: {
          local: {
              get: jest.fn(),
              set: jest.fn((data, callback) => callback && callback()) 
          }
        }
      };
      global.fetch = jest.fn(); 
});

describe("getCanvasPAT", () => {
    test("Get Canvas Access Token from Storage Successfully", async () => {
        global.chrome.storage.local.get.mockImplementation((key, callback) => { // mock chrome.storage with token
            callback({ canvasPAT: "test_access_token"});
        })
        await expect(getCanvasPAT()).resolves.toBe("test_access_token");

        expect(global.chrome.storage.local.get).toHaveBeenCalledWith("canvasPAT", expect.any(Function));
    }); 
    test("No Access Token in Storage", async () => {
        global.chrome.storage.local.get.mockImplementation((key, callback) => callback({})); // mock chrome.storage with no token
        await expect(getCanvasPAT()).resolves.toBe(false);
    });
});
describe("getAssignments", () => {
    test("Fetch Assignment List (Single Page)", async () => {
        // ai-gen start (ChatGPT-4o, 2)
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [{ assignment: {due_at: "2025-03-03"}, title: "Assignment 1", context_name: "CS 101" }, // fake assignments to fetch
                { assignment: {due_at: "2025-04-01"}, title: "Assignment 2", context_name: "CS 102" },
                { assignment: {due_at: "2025-03-25"}, title: "Assignment 3", context_name: "CS 103" }],
            headers: { get: () => null }
        });
        const result = await getAssignments(12345, "test_access_token");
        expect(result).toEqual([{"context_name": "CS 101", "due_at": "2025-03-03", "title": "Assignment 1"}, {"context_name": "CS 102", "due_at": "2025-04-01", "title": "Assignment 2"}, {"context_name": "CS 103", "due_at": "2025-03-25", "title": "Assignment 3"}])
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith("https://unlv.instructure.com/api/v1/calendar_events?type=assignment&all_events=true&per_page=100&context_codes[]=course_12345", expect.any(Object));
        // ai-gen end
    })
    test("Fetch Assignment List (Multi Page)", async () => {
        fetch
            .mockResolvedValueOnce({ // first page
                ok: true,
                json: async () => [{ assignment: {due_at: "2025-03-03"}, title: "Assignment 4", context_name: "CS 104" }, 
                    { assignment: {due_at: "2025-04-01"}, title: "Assignment 5", context_name: "CS 105" },
                    { assignment: {due_at: "2025-03-25"}, title: "Assignment 6", context_name: "CS 106" }],
                headers: { get: () => '<https://unlv.instructure.com/api/v1/calendar_events?type=assignment&all_events=true&context_codes[]=course_12345&page=2&per_page=100>; rel="next"'}
            })
            .mockResolvedValueOnce({ // second page
                ok: true,
                json: async () => [{ assignment: {due_at: "2025-03-03"}, title: "Assignment 1", context_name: "CS 101" }, 
                    { assignment: {due_at: "2025-04-01"}, title: "Assignment 2", context_name: "CS 102" },
                    { assignment: {due_at: "2025-03-25"}, title: "Assignment 3", context_name: "CS 103" }],
                headers: { get: () => null }
            });
        const result = await getAssignments(12345, "test_access_token");
        expect(result).toEqual([{"context_name": "CS 104", "due_at": "2025-03-03", "title": "Assignment 4"},
            {"context_name": "CS 105", "due_at": "2025-04-01", "title": "Assignment 5"},
            {"context_name": "CS 106", "due_at": "2025-03-25", "title": "Assignment 6"},
            {"context_name": "CS 101", "due_at": "2025-03-03", "title": "Assignment 1"}, 
            {"context_name": "CS 102", "due_at": "2025-04-01", "title": "Assignment 2"}, 
            {"context_name": "CS 103", "due_at": "2025-03-25", "title": "Assignment 3"}])
        expect(fetch).toHaveBeenCalledTimes(2);
        expect(fetch).toHaveBeenCalledWith("https://unlv.instructure.com/api/v1/calendar_events?type=assignment&all_events=true&per_page=100&context_codes[]=course_12345", expect.any(Object));
        expect(fetch).toHaveBeenCalledWith("https://unlv.instructure.com/api/v1/calendar_events?type=assignment&all_events=true&context_codes[]=course_12345&page=2&per_page=100", expect.any(Object))
    })
    test("Bad Access Token", async () => { // check for bad API response
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        fetch.mockResolvedValueOnce({
            ok: false, 
            status: 401,
            json: async () => ({ error: "Unauthorized" })
        })
        const result = await getAssignments(12345, "bad_access_token")
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining("Error fetching events:"), 
            expect.any(Error) 
        );
        consoleErrorSpy.mockRestore();
    })
});

describe("getCourses", () => {
    test("Fetch Course List (Single Page)", async () => {
        fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => [{ id: 1, name: "CS 101", access_restricted_by_date: true }, // fake course list
                    { id: 2, name: "CS 102", access_restricted_by_date: false }, 
                    { id: 3, name: "CS 103", access_restricted_by_date: false }, 
                    { id: 4, name: "CS 104", access_restricted_by_date: true }],
                headers: { get: () => null }
        });
        const result = await getCourses("test_access_token");
        expect(result).toEqual([2, 3]); // get only active courses
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith("https://unlv.instructure.com/api/v1/courses?per_page=100", expect.any(Object));
    });
    test("Fetch Course List (Multi Page)", async () => {
        fetch
        .mockResolvedValueOnce({ // first page
                ok: true,
                json: async () => [{ id: 1, name: "CS 101", access_restricted_by_date: true }, 
                    { id: 2, name: "CS 102", access_restricted_by_date: false }, 
                    { id: 3, name: "CS 103", access_restricted_by_date: true }, 
                    { id: 4, name: "CS 104", access_restricted_by_date: true }],
                    headers: { get: () => '<https://unlv.instructure.com/api/v1/courses?page=2&per_page=100>; rel="next"'}
            })
        .mockResolvedValueOnce({ // second page
                ok: true,
                json: async () => [{ id: 5, name: "CS 105", access_restricted_by_date: false },
                    { id: 6, name: "CS 106", access_restricted_by_date: false },
                    { id: 7, name: "CS 107", access_restricted_by_date: true },
                    { id: 8, name: "CS 108", access_restricted_by_date: true }],
                    headers: { get: () => null}
            });
            const result = await getCourses("test_access_token");
            expect(result).toEqual([2, 5, 6]); // get only active courses
            expect(fetch).toHaveBeenCalledTimes(2);
            expect(fetch).toHaveBeenCalledWith("https://unlv.instructure.com/api/v1/courses?per_page=100", expect.any(Object));
            expect(fetch).toHaveBeenCalledWith("https://unlv.instructure.com/api/v1/courses?page=2&per_page=100", expect.any(Object));
    });
    test("Bad Access Token", async () => { // check for bad API response
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        fetch.mockResolvedValueOnce({
            ok: false, 
            status: 401,
            json: async () => ({ error: "Unauthorized" })
        })
        const result = await getCourses("bad_access_token")
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining("Error fetching events:"), 
            expect.any(Error) 
        );
        consoleErrorSpy.mockRestore();
    })
});