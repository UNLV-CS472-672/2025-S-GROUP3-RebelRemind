// ✅ Mock checkDailyTask to always allow running
jest.mock('../scripts/check-daily-login.js', () => ({
    checkDailyTask: jest.fn(() => Promise.resolve(true))
  }));
  
  // ✅ Mock fetchEvents to return a mock event that passes the filter
jest.mock('../scripts/fetch-events.js', () => ({
fetchEvents: jest.fn(() =>
    Promise.resolve([
    [
        {
        startDate: new Date().toLocaleDateString('en-CA'),
        startTime: "23:59"
        }
    ], // academic
    [], [], []
    ])
)
}));


import { alarmInstall, storageListener,  chromeStartUpLisener, dailyAlarmListener, handleDailyTask, onClickNotification} from "../scripts/notifications.js";

jest.mock('../scripts/check-daily-login.js', () => ({
    checkDailyTask: jest.fn(() => Promise.resolve(true))
  }));
// Mock the browser API
beforeAll(() => {
global.chrome = {
    alarms: {
      create: jest.fn(),
      clear: jest.fn((name, cb) => cb?.(true)),
      get: jest.fn((name, cb) => cb?.(null))
    },
    storage: {
      sync: {
        get: jest.fn((keys, cb) => cb({ notificationsEnabled: true })),
      },
      local: {
        get: jest.fn((key, cb) => cb({ Canvas_Assignments: [], notificationHistory: [] })),
        set: jest.fn()
      }
    },
    notifications: {
      create: jest.fn((id, options, cb) => cb?.(id))
    },
    runtime: {
      getURL: jest.fn((path) => `chrome-extension://abc123/${path}`),
      lastError: null
    },
    tabs: {
      create: jest.fn()
    }
  };
  chrome.storage.local.get = jest.fn((key, callback) => {
    if (key === "Canvas_Assignments") {
        callback({ Canvas_Assignments: [] }); // no canvas data
    } else if (key === "notificationHistory") {
        callback({ notificationHistory: [] });
    } else {
        callback({});
    }
    });
    
});


describe('Notification functions', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    test('alarmInstall creates dailyCheck alarm', () => {
      alarmInstall();
  
      expect(chrome.alarms.create).toHaveBeenCalledWith("dailyCheck", expect.objectContaining({
        periodInMinutes: 1440
      }));
    });
  
    test('storageListener enables notifications and creates alarm', () => {
      const changes = {
        notificationsEnabled: {
          newValue: true
        }
      };
  
      storageListener(changes, "sync");
  
      expect(chrome.alarms.get).toHaveBeenCalledWith("dailyCheck", expect.any(Function));
    });
  
    test('storageListener disables notifications and clears alarm', () => {
      const changes = {
        notificationsEnabled: {
          newValue: false
        }
      };
  
      storageListener(changes, "sync");
  
      expect(chrome.alarms.clear).toHaveBeenCalledWith("dailyCheck", expect.any(Function));
    });
  
    test('onClickNotification opens tab if rebel-remind is clicked', () => {
      onClickNotification("rebel-remind");
  
      expect(chrome.tabs.create).toHaveBeenCalledWith({
        url: expect.stringContaining("welcome.html#/notifications")
      });
    });
  
    test('alarmInstall creates a dailyCheck alarm', () => {
        alarmInstall();
        expect(chrome.alarms.create).toHaveBeenCalledWith('dailyCheck', expect.objectContaining({
          periodInMinutes: 1440
        }));
      });
    
      test('storageListener enables and creates dailyCheck alarm', () => {
        const changes = {
          notificationsEnabled: {
            newValue: true
          }
        };
    
        storageListener(changes, 'sync');
    
        expect(chrome.alarms.get).toHaveBeenCalledWith('dailyCheck', expect.any(Function));
      });
      test('handleDailyTask triggers a Chrome notification when events exist', async () => {
        await handleDailyTask();
    
        expect(chrome.notifications.create).toHaveBeenCalledWith(
          'rebel-remind',
          expect.objectContaining({
            type: 'basic',
            title: 'RebelRemind',
            message: expect.stringContaining('Academic'),
          }),
          expect.any(Function)
        );
      });
      test('storageListener enables notifications and creates alarm', () => {
        storageListener({ notificationsEnabled: { newValue: true } }, 'sync');
        expect(chrome.alarms.get).toHaveBeenCalled();
      });
      
      test('storageListener disables notifications and clears alarm', () => {
        storageListener({ notificationsEnabled: { newValue: false } }, 'sync');
        expect(chrome.alarms.clear).toHaveBeenCalledWith('dailyCheck', expect.any(Function));
      });
  });