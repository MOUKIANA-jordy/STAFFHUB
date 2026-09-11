import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import "../Styles/date-picker.css";


const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const WEEKDAYS = [
  "Lu",
  "Ma",
  "Me",
  "Je",
  "Ve",
  "Sa",
  "Di",
];


function pad(value) {
  return String(value).padStart(2, "0");
}


function toIsoDate(date) {
  if (!(date instanceof Date)) {
    return "";
  }

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-");
}


function fromIsoDate(value) {
  if (
    !value ||
    typeof value !== "string"
  ) {
    return null;
  }

  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  if (
    !year ||
    !month ||
    !day
  ) {
    return null;
  }

  const date =
    new Date(
      year,
      month - 1,
      day
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}


function normalizeDate(date) {
  if (
    !(date instanceof Date)
  ) {
    return null;
  }

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}


function sameDay(
  first,
  second
) {
  if (
    !first ||
    !second
  ) {
    return false;
  }

  return (
    first.getFullYear()
      === second.getFullYear()
    &&
    first.getMonth()
      === second.getMonth()
    &&
    first.getDate()
      === second.getDate()
  );
}


function formatDisplayDate(
  value
) {
  const date =
    fromIsoDate(value);

  if (!date) {
    return "";
  }

  return date.toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
}


function buildCalendarDays(
  visibleMonth
) {
  const year =
    visibleMonth.getFullYear();

  const month =
    visibleMonth.getMonth();

  const firstDay =
    new Date(
      year,
      month,
      1
    );

  const mondayOffset =
    (
      firstDay.getDay()
      + 6
    ) % 7;

  const gridStart =
    new Date(
      year,
      month,
      1 - mondayOffset
    );

  return Array.from(
    {
      length: 42,
    },
    (
      _,
      index
    ) => {
      const date =
        new Date(
          gridStart
        );

      date.setDate(
        gridStart.getDate()
        + index
      );

      return date;
    }
  );
}


export default function DatePicker({
  id,
  name,
  value = "",
  onChange,
  placeholder = "Sélectionner une date",
  disabled = false,
  required = false,
  minDate,
  maxDate,
  className = "",
}) {
  const wrapperRef =
    useRef(null);

  const selectedDate =
    useMemo(
      () =>
        fromIsoDate(value),
      [
        value,
      ]
    );

  const today =
    useMemo(
      () =>
        normalizeDate(
          new Date()
        ),
      []
    );

  const min =
    useMemo(
      () =>
        normalizeDate(
          fromIsoDate(
            minDate
          )
        ),
      [
        minDate,
      ]
    );

  const max =
    useMemo(
      () =>
        normalizeDate(
          fromIsoDate(
            maxDate
          )
        ),
      [
        maxDate,
      ]
    );

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    visibleMonth,
    setVisibleMonth,
  ] = useState(
    () => {
      const base =
        selectedDate
        || today;

      return new Date(
        base.getFullYear(),
        base.getMonth(),
        1
      );
    }
  );


  useEffect(
    () => {
      if (
        selectedDate
      ) {
        setVisibleMonth(
          new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            1
          )
        );
      }
    },
    [
      value,
    ]
  );


  useEffect(
    () => {
      const handleOutside =
        (event) => {
          if (
            wrapperRef.current
            && !wrapperRef.current.contains(
              event.target
            )
          ) {
            setOpen(false);
          }
        };

      document.addEventListener(
        "mousedown",
        handleOutside
      );

      return () => {
        document.removeEventListener(
          "mousedown",
          handleOutside
        );
      };
    },
    []
  );


  useEffect(
    () => {
      if (
        disabled
      ) {
        setOpen(false);
      }
    },
    [
      disabled,
    ]
  );


  const calendarDays =
    useMemo(
      () =>
        buildCalendarDays(
          visibleMonth
        ),
      [
        visibleMonth,
      ]
    );


  const emitChange =
    (nextValue) => {
      onChange?.({
        target: {
          name,
          value:
            nextValue,
        },
      });
    };


  const isDisabledDate =
    (date) => {
      const normalized =
        normalizeDate(date);

      if (
        min
        && normalized < min
      ) {
        return true;
      }

      if (
        max
        && normalized > max
      ) {
        return true;
      }

      return false;
    };


  const selectDate =
    (date) => {
      if (
        disabled
        || isDisabledDate(date)
      ) {
        return;
      }

      emitChange(
        toIsoDate(date)
      );

      setOpen(false);
    };


  const clearDate = (
    event
  ) => {
    event.stopPropagation();

    if (
      disabled
    ) {
      return;
    }

    emitChange("");
    setOpen(false);
  };


  const selectToday = () => {
    if (
      isDisabledDate(today)
    ) {
      return;
    }

    selectDate(today);
  };


  const goPreviousMonth = () => {
    setVisibleMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() - 1,
          1
        )
    );
  };


  const goNextMonth = () => {
    setVisibleMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + 1,
          1
        )
    );
  };


  return (
    <div
      ref={
        wrapperRef
      }
      className={[
        "app-date-picker",
        open
          ? "is-open"
          : "",
        disabled
          ? "is-disabled"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        id={id}
        type="button"
        className="app-date-picker-trigger"
        disabled={
          disabled
        }
        aria-haspopup="dialog"
        aria-expanded={
          open
        }
        onClick={() => {
          if (
            !disabled
          ) {
            setOpen(
              (current) =>
                !current
            );
          }
        }}
      >
        <span
          className={
            value
              ? "app-date-picker-value"
              : "app-date-picker-placeholder"
          }
        >
          {
            value
              ? formatDisplayDate(
                  value
                )
              : placeholder
          }
        </span>

        <span className="app-date-picker-actions">
          {
            value
            && !disabled
            && (
              <span
                className="app-date-picker-clear"
                role="button"
                tabIndex={0}
                aria-label="Effacer la date"
                onClick={
                  clearDate
                }
                onKeyDown={
                  (
                    event
                  ) => {
                    if (
                      event.key
                      === "Enter"
                      || event.key
                      === " "
                    ) {
                      clearDate(
                        event
                      );
                    }
                  }
                }
              >
                <X
                  size={15}
                />
              </span>
            )
          }

          <CalendarDays
            size={17}
            className="app-date-picker-calendar-icon"
          />
        </span>
      </button>


      {
        open
        && (
          <div
            className="app-date-picker-popover"
            role="dialog"
            aria-label="Sélectionner une date"
          >
            <div className="app-date-picker-header">
              <button
                type="button"
                className="app-date-picker-nav"
                onClick={
                  goPreviousMonth
                }
                aria-label="Mois précédent"
              >
                <ChevronLeft
                  size={17}
                />
              </button>

              <strong>
                {
                  MONTHS[
                    visibleMonth.getMonth()
                  ]
                }
                {" "}
                {
                  visibleMonth.getFullYear()
                }
              </strong>

              <button
                type="button"
                className="app-date-picker-nav"
                onClick={
                  goNextMonth
                }
                aria-label="Mois suivant"
              >
                <ChevronRight
                  size={17}
                />
              </button>
            </div>


            <div className="app-date-picker-weekdays">
              {
                WEEKDAYS.map(
                  (day) => (
                    <span
                      key={
                        day
                      }
                    >
                      {day}
                    </span>
                  )
                )
              }
            </div>


            <div className="app-date-picker-grid">
              {
                calendarDays.map(
                  (
                    date
                  ) => {
                    const iso =
                      toIsoDate(
                        date
                      );

                    const outsideMonth =
                      date.getMonth()
                      !== visibleMonth.getMonth();

                    const selected =
                      sameDay(
                        date,
                        selectedDate
                      );

                    const isToday =
                      sameDay(
                        date,
                        today
                      );

                    const blocked =
                      isDisabledDate(
                        date
                      );

                    return (
                      <button
                        key={
                          iso
                        }
                        type="button"
                        className={[
                          "app-date-picker-day",
                          outsideMonth
                            ? "is-outside"
                            : "",
                          selected
                            ? "is-selected"
                            : "",
                          isToday
                            ? "is-today"
                            : "",
                          blocked
                            ? "is-blocked"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        disabled={
                          blocked
                        }
                        onClick={() =>
                          selectDate(
                            date
                          )
                        }
                      >
                        <span>
                          {
                            date.getDate()
                          }
                        </span>

                        {
                          selected
                          && (
                            <Check
                              size={10}
                            />
                          )
                        }
                      </button>
                    );
                  }
                )
              }
            </div>


            <div className="app-date-picker-footer">
              <button
                type="button"
                className="app-date-picker-footer-button"
                onClick={() => {
                  emitChange("");
                  setOpen(false);
                }}
                disabled={
                  !value
                }
              >
                Effacer
              </button>

              <button
                type="button"
                className="app-date-picker-footer-button is-primary"
                onClick={
                  selectToday
                }
                disabled={
                  isDisabledDate(
                    today
                  )
                }
              >
                Aujourd’hui
              </button>
            </div>
          </div>
        )
      }


      {
        required
        && (
          <input
            tabIndex={-1}
            aria-hidden="true"
            className="app-date-picker-required-input"
            value={
              value
              || ""
            }
            required
            onChange={() => {}}
          />
        )
      }
    </div>
  );
}
