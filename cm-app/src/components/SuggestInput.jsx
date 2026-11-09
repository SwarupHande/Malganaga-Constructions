import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { rankOptions } from '../utils/suggest';

const OTHER = { name: '__other__', label: 'Other (type your own)' };

// Text input with a ranked suggestion list. Free text is still allowed.
// With `allowOther`, the list ends with "Other"; picking it switches to a plain text box
// (no suggestions) for items that aren't in the catalogue.
// The list is portalled to <body> with fixed positioning so scrolling tables/modals can't clip it.
export default function SuggestInput({ value, onChange, options, placeholder, ariaLabel, allowOther = false }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [rect, setRect] = useState(null);
  const [custom, setCustom] = useState(false);
  const inputRef = useRef(null);
  const listId = useId();

  const items = useMemo(() => {
    const matches = rankOptions(options, value);
    return allowOther ? [...matches, OTHER] : matches;
  }, [options, value, allowOther]);
  const show = open && !custom && items.length > 0;

  // Keep the list glued to the input while the page or modal scrolls/resizes.
  useLayoutEffect(() => {
    if (!show) return undefined;
    const place = () => setRect(inputRef.current.getBoundingClientRect());
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [show]);

  useEffect(() => setActive(0), [value, options]);

  function choose(option) {
    setOpen(false);
    if (option === OTHER) {
      setCustom(true);
      onChange('');
      inputRef.current?.focus();
      return;
    }
    onChange(option.name);
  }

  function backToList() {
    setCustom(false);
    onChange('');
    inputRef.current?.focus();
  }

  function onKeyDown(e) {
    if (custom) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!show) return setOpen(true);
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setActive((i) => (i + step + items.length) % items.length);
    } else if (e.key === 'Enter' && show) {
      e.preventDefault(); // pick the suggestion instead of submitting the form
      choose(items[active]);
    } else if (e.key === 'Escape' && show) {
      e.stopPropagation(); // close the list, not the modal
      setOpen(false);
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  }

  // Fit below the input; flip above when there isn't room.
  const below = rect && window.innerHeight - rect.bottom > 260;
  const style = rect && {
    left: rect.left,
    width: Math.max(rect.width, 280),
    ...(below ? { top: rect.bottom + 4 } : { bottom: window.innerHeight - rect.top + 4 }),
  };

  return (
    <div className={`suggest-field${custom ? ' suggest-field--custom' : ''}`}>
      {custom && <span className="suggest-field__tag">Other</span>}
      <input
        ref={inputRef}
        type="text"
        role={custom ? undefined : 'combobox'}
        aria-label={custom ? `${ariaLabel} (other)` : ariaLabel}
        aria-expanded={custom ? undefined : show}
        aria-controls={custom ? undefined : listId}
        aria-autocomplete={custom ? undefined : 'list'}
        aria-activedescendant={show ? `${listId}-${active}` : undefined}
        autoComplete="off"
        placeholder={custom ? 'Type the item name…' : placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      {custom && (
        <button
          type="button"
          className="suggest-field__back"
          onClick={backToList}
          aria-label="Back to suggestions"
          title="Back to suggestions"
        >
          &times;
        </button>
      )}
      {show && rect &&
        createPortal(
          <ul className="suggest" id={listId} role="listbox" style={style}>
            {items.map((o, i) => (
              <li
                key={o.name}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                className={`suggest__option${o === OTHER ? ' suggest__option--other' : ''}${i === active ? ' suggest__option--active' : ''}`}
                onMouseDown={(e) => e.preventDefault()} // keep focus in the input
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(o)}
              >
                {o === OTHER ? (
                  <span className="suggest__name">+ {OTHER.label}</span>
                ) : (
                  <>
                    <span className="suggest__name">{highlight(o.name, value)}</span>
                    {o.unit && <span className="suggest__unit">{o.unit}</span>}
                  </>
                )}
              </li>
            ))}
          </ul>,
          document.body
        )}
    </div>
  );
}

// Bold the part of the name that matches what was typed.
function highlight(text, query) {
  const q = query.trim();
  const at = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <mark>{text.slice(at, at + q.length)}</mark>
      {text.slice(at + q.length)}
    </>
  );
}
