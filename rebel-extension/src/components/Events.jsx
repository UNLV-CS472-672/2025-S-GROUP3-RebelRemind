import './css/Events.css';

function Events({ events, viewMode }) {
 if (!events || events.length === 0) {
    return <div className="no-events"> No events found for this view.</div>;
  }
  const sortedEvents = [...events].sort((a, b) => {
    const aDate = new Date(`${a.date} ${a.time}`);
    const bDate = new Date(`${b.date} ${b.time}`);
    return aDate - bDate; // soonest to latest
  });

  if (viewMode === "weekly") {
    const grouped = {};
    sortedEvents.forEach(event => {
      const [year, month, day] = event.date.split('-');
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
                <a href={event.link} target="_blank" rel="noopener noreferrer" className="event-link">
                  <span className="event-name">
                    <span className="event-org">{event.organization}{event.organization?':':''} </span>{event.name}
                  </span>
                  <span className="event-time">{event.time}</span>
                </a>
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
          <a href={event.link} target="_blank" rel="noopener noreferrer" className="event-link">
            <span className="event-name">
                <span className="event-org">{event.organization}{event.organization?':':''} </span>{event.name}
            </span>
            <span className="event-time">{event.time}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default Events;
