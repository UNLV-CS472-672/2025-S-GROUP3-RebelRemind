import './css/Events.css';

function Events({ events, viewMode }) {
 if (!events || events.length === 0) {
    return <div className="no-events"> No events found for this view.</div>;
  }

  if (viewMode === "weekly") {
    const grouped = {};
    events.forEach(event => {
      const date = new Date(event.date);
      const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
      if (!grouped[weekday]) grouped[weekday] = [];
      grouped[weekday].push(event);
    });

    const orderedWeekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return orderedWeekdays
      .filter(day => grouped[day])
      .map(day => (
        <div key={day} className="weekday-section">
          <div className="weekday-title">{day}</div>
          {/* <hr className="weekday-divider" /> */}
          <ul className="event-list">
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
    <ul className="event-list">
      {events.map(event => (
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
