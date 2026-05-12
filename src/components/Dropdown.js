import { useState, useRef, useEffect } from "react";

function Dropdown({ label, items, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggle = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`dropdown ${className} ${isOpen ? "open" : ""}`}>
      <button
        type="button"
        className="dropdown-toggle"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {label}
      </button>
      <ul className="dropdown-menu" role="menu">
        {items.map((item, index) => (
          <li key={index} role="presentation">
            <a
              href={item.href || "#"}
              className="dropdown-item"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              {item.icon && <span aria-hidden="true">{item.icon}</span>}
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dropdown;
