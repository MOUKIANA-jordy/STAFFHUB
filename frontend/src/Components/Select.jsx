import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Check,
  ChevronDown,
} from "lucide-react";

import "../Styles/select.css";


export default function Select({
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Sélectionner",
  disabled = false,
  required = false,
  className = "",
}) {
  const wrapperRef = useRef(null);

  const [
    open,
    setOpen,
  ] = useState(false);


  const normalizedOptions =
    useMemo(
      () =>
        options.map(
          (option) => {
            if (
              typeof option
              === "string"
            ) {
              return {
                value: option,
                label: option,
              };
            }

            return {
              value:
                option.value,

              label:
                option.label,
            };
          }
        ),
      [options]
    );


  const selectedOption =
    normalizedOptions.find(
      (option) =>
        String(option.value)
        === String(value)
    );


  useEffect(
    () => {
      const handleOutsideClick =
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
        handleOutsideClick
      );

      return () => {
        document.removeEventListener(
          "mousedown",
          handleOutsideClick
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


  const handleSelect =
    (optionValue) => {
      if (
        disabled
      ) {
        return;
      }

      const syntheticEvent = {
        target: {
          name,
          value:
            optionValue,
        },
      };

      onChange?.(
        syntheticEvent
      );

      setOpen(false);
    };


  const handleKeyDown =
    (event) => {
      if (
        disabled
      ) {
        return;
      }

      if (
        event.key
        === "Enter"
        || event.key
        === " "
      ) {
        event.preventDefault();

        setOpen(
          (current) =>
            !current
        );
      }

      if (
        event.key
        === "Escape"
      ) {
        setOpen(false);
      }
    };


  return (
    <div
      ref={
        wrapperRef
      }
      className={[
        "app-select",
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
        className="app-select-trigger"
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
        onKeyDown={
          handleKeyDown
        }
        disabled={
          disabled
        }
        aria-haspopup="listbox"
        aria-expanded={
          open
        }
      >
        <span
          className={
            selectedOption
              ? "app-select-value"
              : "app-select-placeholder"
          }
        >
          {
            selectedOption?.label
            || placeholder
          }
        </span>

        <ChevronDown
          size={17}
          className="app-select-chevron"
        />
      </button>


      {
        open
        && (
          <div
            className="app-select-menu"
            role="listbox"
            aria-labelledby={
              id
            }
          >
            {
              normalizedOptions.length
              > 0
                ? (
                    normalizedOptions.map(
                      (option) => {
                        const selected =
                          String(option.value)
                          === String(value);

                        return (
                          <button
                            key={
                              String(
                                option.value
                              )
                            }
                            type="button"
                            role="option"
                            aria-selected={
                              selected
                            }
                            className={[
                              "app-select-option",
                              selected
                                ? "is-selected"
                                : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                            onClick={() =>
                              handleSelect(
                                option.value
                              )
                            }
                          >
                            <span>
                              {
                                option.label
                              }
                            </span>

                            {
                              selected
                              && (
                                <Check
                                  size={15}
                                />
                              )
                            }
                          </button>
                        );
                      }
                    )
                  )
                : (
                    <div className="app-select-empty">
                      Aucune option
                    </div>
                  )
            }
          </div>
        )
      }


      {
        required
        && (
          <input
            type="text"
            tabIndex="-1"
            autoComplete="off"
            value={
              value
              || ""
            }
            required
            onChange={() => {}}
            className="app-select-required-input"
            aria-hidden="true"
          />
        )
      }
    </div>
  );
}

