function NestedDropdown({ label, categories }) {
  return (
    <div className="nested-dropdown open">
      <div className="nested-dropdown-toggle">{label}</div>
      <div className="nested-dropdown-menu">
        {categories.map((category, index) => (
          <div key={index} className="nested-dropdown-category">
            <div className="nested-dropdown-category-name">
              {category.name}
            </div>
            <div className="nested-dropdown-items">
              {category.subcategories.map((sub, subIndex) => (
                <a
                  key={subIndex}
                  href={sub.href}
                  className="nested-dropdown-item"
                >
                  {sub.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NestedDropdown;
