// components/GroupedListRenderer.jsx
import './css/Events.css';
import { Check, Undo2 } from "lucide-react";

function GroupByWeek({ 
    groupedItems, 
    isComplete, 
    markComplete, 
    undoComplete, 
    isCanvas = false, 
    viewMode 
  }) {
    const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayIndex = new Date().getDay();
    const orderedWeekdays = [...weekdayNames.slice(todayIndex), ...weekdayNames.slice(0, todayIndex)];
    
  return (
    <div>
      {orderedWeekdays.map(day => {
        const items = groupedItems[day];
        if (!items || items.length === 0) return null;

        return (
          <div key={day} className="weekday-section">
            <div className="weekday-title">{viewMode === 'weekly' ? day : null}</div>
            <ul className={`event-list ${viewMode === 'daily' ? 'event-list-daily' : ''}`}>              {items.map(item => (
                <li key={item.id} className="event-item-canvas">
                  <div className="event-link">
                    <a
                      href={item.link || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="event-name"
                      style={{
                        textDecoration: isCanvas && isComplete(item.id) ? "line-through" : "none",
                        color: isCanvas && isComplete(item.id) ? "gray" : "inherit"
                      }}
                    >
                      {item.context_name && (
                        <span className="event-org">
                          {item.context_name}
                          {item.context_name ? ': ' : ''}
                        </span>
                      )}
                      {item.title || item.name} {item.label}
                    </a>

                    {isCanvas && (
                    <span className="event-time">
                        <div className="checkboxWrapper">
                            <div className="checkboxTooltip">
                                {isComplete(item.id) ? "Undo completion" : "Mark as complete"}
                            </div>
                            <div className="checkboxOverride">
                                <input
                                type="checkbox"
                                id={`checkbox-${item.id}`}
                                checked={isComplete(item.id)}
                                onChange={() =>
                                    isComplete(item.id)
                                    ? undoComplete(item.id)
                                    : markComplete(item)
                                }
                                />
                                <label htmlFor={`checkbox-${item.id}`}></label>
                            </div>
                        </div>
                    </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export default GroupByWeek;