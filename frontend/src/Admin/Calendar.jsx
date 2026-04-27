import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  fr: require("date-fns/locale/fr"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarPage() {
  const events = [
    {
      title: "Absence",
      start: new Date(),
      end: new Date(),
    },
  ];

  return (
    <div style={{ height: 500 }}>
      <h1>📅 Calendrier</h1>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
      />
    </div>
  );
}
