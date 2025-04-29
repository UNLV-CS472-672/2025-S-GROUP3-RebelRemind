import { alarmInstall, storageListener,  chromeStartUpLisener, dailyAlarmListener, handleDailyTask}

// Mock the browser API
global.chrome = {
    notifications: {
        create: jest.fn(),
    },
    alarms: {
        create: jest.fn(),
        onAlarm: {
            addListener: jest.fn(),
        },
    },
};

describe('Notification Functions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('sendNotification should create a notification with correct parameters', () => {
        const title = 'Test Title';
        const message = 'Test Message';
        const iconUrl = 'icon.png';

        sendNotification(title, message, iconUrl);

        expect(chrome.notifications.create).toHaveBeenCalledWith({
            type: 'basic',
            iconUrl: iconUrl,
            title: title,
            message: message,
        });
    });
});