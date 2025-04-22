// components/GroupedListRenderer.jsx
import './css/Events.css';
import { Check, Undo2 } from "lucide-react";

function GroupByWeek({ 
    groupedItems, 
    isComplete, 
    markComplete, 
    undoComplete, 
    isCanvas = false, 
    hasCompletedAssignments 
  }) {
    const orderedWeekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div>
      {orderedWeekdays.map(day => {
        const items = groupedItems[day];
        if (!items || items.length === 0) return null;

        return (
          <div key={day} className="weekday-section">
            <div className="weekday-title">{day}</div>
            <ul className="event-list">
              {items.map(item => (
                <li key={item.id} className="event-item">
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

                    {isCanvas && hasCompletedAssignments && (
                      <span className="event-time">
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