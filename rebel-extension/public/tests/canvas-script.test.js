/**
 * canvas-script Tests
 * 
 * This test suite validates the functionality of the Canvas API interactions.
 * This script handles fetching assignments from Canvas for the user.
 * 
 * Features Tested:
 * - Canvas access token can be properly fetched from Chrome storage.
 * - The course list for a given user is being retrieved properly.
 * - Assignments for a given course are being retrieved and handled properly.
 * 
 * Authored by: Gunnar Dalton
 */

import { getAssignments, getCourses, getCanvasPAT, generateInitialColor } from "../scripts/canvas-script";

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
    });

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
    });

    test("Bad Access Token", async () => { // check for bad API response
        const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        fetch.mockResolvedValueOnce({
            ok: false, 
            status: 401,
            json: async () => ({ error: "Unauthorized" })
        })
        const result = await getAssignments(12345, "bad_access_token")
        expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringContaining("Error fetching assignments:"), 
            expect.any(Error) 
        );
        consoleLogSpy.mockRestore();
    });

    test("Bad link to second page of assignment list", async() => {
        fetch
            .mockResolvedValueOnce({ // first page
                ok: true,
                json: async () => [{ assignment: {due_at: "2025-03-03"}, title: "Assignment 4", context_name: "CS 104" }, 
                    { assignment: {due_at: "2025-04-01"}, title: "Assignment 5", context_name: "CS 105" },
                    { assignment: {due_at: "2025-03-25"}, title: "Assignment 6", context_name: "CS 106" }],
                headers: { get: () => '<https://bad_link.com>; rel="bad"'}
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
            {"context_name": "CS 106", "due_at": "2025-03-25", "title": "Assignment 6"}])
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith("https://unlv.instructure.com/api/v1/calendar_events?type=assignment&all_events=true&per_page=100&context_codes[]=course_12345", expect.any(Object));
    });
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
        const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        fetch.mockResolvedValueOnce({
            ok: false, 
            status: 401,
            json: async () => ({ error: "Unauthorized" })
        })
        const result = await getCourses("bad_access_token");
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("There may be an issue with your Canvas Access Token. Please check that and try again!"));
        expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringContaining("Error fetching courses:"), 
            expect.any(Error) 
        );
        consoleLogSpy.mockRestore();
    });

    test("Bad link to second page of course list", async() => {
        fetch
        .mockResolvedValueOnce({ // first page
                ok: true,
                json: async () => [{ id: 1, name: "CS 101", access_restricted_by_date: true }, 
                    { id: 2, name: "CS 102", access_restricted_by_date: false }, 
                    { id: 3, name: "CS 103", access_restricted_by_date: true }, 
                    { id: 4, name: "CS 104", access_restricted_by_date: true }],
                    headers: { get: () => '<https://bad_link.com>; rel="bad"'}
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
            expect(result).toEqual([2]); // get only active courses
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith("https://unlv.instructure.com/api/v1/courses?per_page=100", expect.any(Object));
    });

    test("Non 401 error received", async() => {
        const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        fetch.mockResolvedValueOnce({
            ok: false, 
            status: 404,
            json: async () => ({ error: "Not Found" })
        })
        const result = await getCourses("bad_access_token");
        expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringContaining("Error fetching courses:"), 
            expect.any(Error) 
        );
        consoleLogSpy.mockRestore();
    });

    test("Add all new courses to color list", async() => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [{ id: 1, name: "CS 101", access_restricted_by_date: true }, 
                { id: 2, name: "CS 102", access_restricted_by_date: false }, 
                { id: 3, name: "CS 103", access_restricted_by_date: false }, 
                { id: 4, name: "CS 104", access_restricted_by_date: true }],
            headers: { get: () => null }
        });
        global.chrome.storage.local.get.mockImplementation((key, callback) => { 
            callback({ colorList: { UNLVEvents: "#b10202", InvolvementCenter: "#666666", userEvents: "#0000ff", CanvasCourses: {} }});
        })
        const result = await getCourses("test_access_token");

        expect(chrome.storage.local.set).toHaveBeenCalledWith({ colorList: { UNLVEvents: "#b10202", InvolvementCenter: "#666666", userEvents: "#0000ff", CanvasCourses: {
            2: { color: expect.any(String), name: "CS 102"},
            3: { color: expect.any(String), name: "CS 103"}
        } }});
    });

    test("Add a new course to color list", async() => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [{ id: 1, name: "CS 101", access_restricted_by_date: true }, 
                { id: 2, name: "CS 102", access_restricted_by_date: false }, 
                { id: 3, name: "CS 103", access_restricted_by_date: false }, 
                { id: 4, name: "CS 104", access_restricted_by_date: false }],
            headers: { get: () => null }
        });
        global.chrome.storage.local.get.mockImplementation((key, callback) => { 
            callback({ colorList: { UNLVEvents: "#b10202", InvolvementCenter: "#666666", userEvents: "#0000ff", CanvasCourses: { 2: { color: "#333333", name: "CS 102" } } }});
        })
        const result = await getCourses("test_access_token");

        expect(chrome.storage.local.set).toHaveBeenCalledWith({ colorList: { UNLVEvents: "#b10202", InvolvementCenter: "#666666", userEvents: "#0000ff", CanvasCourses: {
            2: { color: "#333333", name: "CS 102"},
            3: { color: expect.any(String), name: "CS 103"},
            4: { color: expect.any(String), name: "CS 104"}
        } }});
    });
});

describe("generateInitialColor", () => {
    // ai-gen start (ChatGPT-4o, 1)
    test("Color is calculated as a hex color for a course", async() => {
        expect(generateInitialColor(12345)).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    test("All cases of h values are tested", async() => {
        expect(generateInitialColor(1089)).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(generateInitialColor(1000)).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(generateInitialColor(1010)).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(generateInitialColor(1030)).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(generateInitialColor(1050)).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(generateInitialColor(1070)).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
    // ai-gen end
});