export async function filterEvents(ac_events, ic_events, rc_events, uc_events) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["selectedInterests", "preferences"], (storageData) => {
        const selectedInterests = storageData.selectedInterests || [];
        const preferences = storageData.preferences || {};
  
        // Filter involvement center events
        const filt_ic_events = preferences.involvementCenter ? ic_events : [];
  
        // Filter rebel coverage events
        const filt_rc_events = preferences.rebelCoverage ? rc_events : [];
        
        //Filter Academic Calendar
        const filt_ac_events = preferences.academicCalendar ? ac_events : [];

        // Filter UNLV calendar events by interest categories
        const filt_uc_events = preferences.UNLVCalendar
          ? uc_events.filter(event => selectedInterests.includes(event.category))
          : [];
  
        resolve([filt_ac_events, filt_ic_events, filt_rc_events, filt_uc_events]);
      });
    });
  }
  