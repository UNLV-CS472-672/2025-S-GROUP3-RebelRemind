import './css/Events.css';
import addcalendarIcon from "../assets/addcalendarIcon.png";

function Events({ events, viewMode, setActiveEventPopup }) {
  if (!events || events.length === 0) {
    return <div className="no-events"> No events found for this view.</div>;
  }
  const sortedEvents = [...events].sort((a, b) => {
    const aDate = new Date(`${a.startDate} ${a.startTime}`);
    const bDate = new Date(`${b.startDate} ${b.startTime}`);
    return aDate - bDate; // soonest to latest
  });
  
  const handleAddEvent = (event) => {  
        chrome.storage.local.get("UNLVEvents", (data) => {
            const existing = Array.isArray(data["UNLVEvents"]) ? data["UNLVEvents"] : [];
            const updatedEvents = [...existing, event];

            chrome.storage.local.set({ "UNLVEvents": updatedEvents }, () => {
                alert("Event saved to calendar.");

                chrome.runtime.sendMessage({ type: "EVENT_UPDATED" });
            });
        });
   };

  if (viewMode === "weekly") {
    const grouped = {};
    sortedEvents.forEach(event => {
      const [year, month, day] = event.startDate.split('-');
      const date = new Date(year, month - 1, day);
      const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
      if (!grouped[weekday]) grouped[weekday] = [];
      grouped[weekday].push(event);
    });

    const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayIndex = new Date().getDay();
    const orderedWeekdays = [...weekdayNames.slice(todayIndex), ...weekdayNames.slice(0, todayIndex)];
      
    return orderedWeekdays
      .filter(day => grouped[day])
      .map(day => (
        <div key={day} className="weekday-section">
          <div className="weekday-title">{day}</div>
          {/* <hr className="weekday-divider" /> */}
          <ul className={`event-list ${viewMode === 'daily' ? 'event-list-daily' : ''}`}>
            {grouped[day].map(event => (
              <li key={event.id} className="event-item">
              {event.link === "customEvent" ? ( // Custom Events
                  <>
                    <a
                      className="event-link"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveEventPopup(event);
                      }}
                    >
                      <span className="event-name">
                        <span className="event-org">
                          {event.organization}
                          {event.organization ? ':' : ''}{" "}
                        </span>
                        {event.name}
                      </span>
                      <span className="event-time">{event.startTime}</span>
                    </a>
                  </>
                ) : (<>
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="event-link"
                  >
                    <span className="event-name">
                      <span className="event-org">
                        {event.organization}
                        {event.organization ? ':' : ''}{" "}
                      </span>
                      {event.name}
                    </span>
                    </a>
                    <span className="event-time">{event.startTime}
                    <div>
		              <button style={{background: 'transparent', paddingRight: '0px', paddingTop: '0px'}} 
		              		onClick={() => handleAddEvent(event)}
		              		aria-label="add to calendar">
		              	<img src={addcalendarIcon} height="25px" width="25px" />
		              </button>
		              </div>
                    </span>               
                </>
                )}
              </li>

            ))}
          </ul>
        </div>
      ));
  }
  
  return (
    <ul className={`event-list ${viewMode === 'daily' ? 'event-list-daily' : ''}`}>
      {sortedEvents.map(event => (
        <li key={event.id} className="event-item">
        {event.link === "customEvent" ? ( // Custom Events
            <>
              <a
                className="event-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveEventPopup(event);
                }}
              >
                <span className="event-name">
                  <span className="event-org">
                    {event.organization}
                    {event.organization ? ':' : ''}{" "}
                  </span>
                  {event.name}
                </span>
                <span className="event-time">{event.startTime}</span>
              </a>
            </>
          ) : (<>
            <a
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="event-link"
            >
              <span className="event-name">
                <span className="event-org">
                  {event.organization}
                  {event.organization ? ':' : ''}{" "}
                </span>
                {event.name}
              </span>
              </a>
              <span className="event-time">{event.startTime}
              <div>
		            <button style={{background: 'transparent', paddingRight: '0px', paddingTop: '0px'}} 
		              	onClick={() => handleAddEvent(event)}
		              	aria-label="add to calendar">
		              <img src={addcalendarIcon} height="25px" width="25px" />
		            </button>
		         </div>
              </span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

export default Events;
