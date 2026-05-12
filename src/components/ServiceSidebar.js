import { useState, useEffect } from "react";

function ServiceSidebar({ categories, title, isNavigation }) {
  const [openCategories, setOpenCategories] = useState({});
  const [openSubcategories, setOpenSubcategories] = useState({});
  const [openItems, setOpenItems] = useState({});

  // Initialize: expand first category and its first subcategory
  useEffect(() => {
    if (categories.length > 0 && Object.keys(openCategories).length === 0) {
      const firstCat = categories[0];
      const firstSub = firstCat.subcategories && firstCat.subcategories[0];
      setOpenCategories({ [firstCat.name]: true });
      if (firstSub) {
        setOpenSubcategories({ [firstSub.name]: true });
      }
    }
  }, [categories]);

  const toggleCategory = (name) => {
    setOpenCategories((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const toggleSubcategory = (name) => {
    setOpenSubcategories((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const toggleItem = (name) => {
    setOpenItems((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const buildNavigationData = () => {
    if (!isNavigation || !categories.length) return [];

    return categories.map((cat) => {
      const subcategories = cat.subcategories || [];
      return {
        name: cat.name,
        slug: cat.slug,
        subcategories: subcategories.map((sub) => {
          const news = sub.news || [];
          const items = news.map((n) => {
            // Build proper URL: /news/category_slug/subcategory_slug/slug
            // Slug from DB may be just "article-slug" or "category/subcategory/article-slug"
            const slugParts = n.slug.split('/');
            const newsSlug = slugParts[slugParts.length - 1];
            // Use category/subcategory from the slug itself if it contains path, otherwise use DB values
            let catSlug, subSlug;
            if (slugParts.length > 2) {
              // Slug contains full path: category/subcategory/article
              catSlug = slugParts[0];
              subSlug = slugParts[1];
            } else {
              catSlug = n.category_slug || cat.slug;
              subSlug = n.subcategory_slug || sub.slug;
            }
            return {
              label: n.title,
              href: `/news/${catSlug}/${subSlug}/${newsSlug}`,
            };
          });
          return {
            name: sub.name,
            slug: sub.slug,
            items,
          };
        }),
      };
    });
  };

  const navigationData = buildNavigationData();

  const renderItem = (item, index) => {
    if (typeof item === "string") {
      return (
        <a key={index} href="/services" className="sidebar-link">
          {item}
        </a>
      );
    }

    if (item.children) {
      return (
        <div key={index} className="sidebar-subcategory">
          <button
            type="button"
            className={`sidebar-item-toggle ${openItems[item.label] ? "open" : ""}`}
            onClick={() => toggleItem(item.label)}
          >
            {item.label}
            <span className="sidebar-accordion-icon">
              {openItems[item.label] ? "−" : "+"}
            </span>
          </button>
          {openItems[item.label] && (
            <div className="sidebar-item-children">
              {item.children.map((child, j) => (
                <a key={j} href={child.href} className="sidebar-link sidebar-link-child">
                  {child.label}
                </a>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <a key={index} href={item.href} className="sidebar-link">
        {item.label}
      </a>
    );
  };

  return (
    <>
      <h3 className="sidebar-title">{title}</h3>
      <nav className="sidebar-nav" aria-label={`${title} navigation`}>
        {navigationData.map((category, index) => (
          <div key={index} className="sidebar-accordion">
            <button
              type="button"
              className={`sidebar-accordion-toggle ${openCategories[category.name] ? "open" : ""}`}
              onClick={() => toggleCategory(category.name)}
              aria-expanded={openCategories[category.name]}
            >
              {category.name}
              <span className="sidebar-accordion-icon">
                {openCategories[category.name] ? "−" : "+"}
              </span>
            </button>
            {openCategories[category.name] && (
              <div className="sidebar-accordion-content">
                {category.subcategories.map((sub, i) => (
                  <div key={i} className="sidebar-subcategory">
                    <button
                      type="button"
                      className={`sidebar-subcategory-toggle ${openSubcategories[sub.name] ? "open" : ""}`}
                      onClick={() => toggleSubcategory(sub.name)}
                      aria-expanded={openSubcategories[sub.name]}
                    >
                      {sub.name}
                      <span className="sidebar-accordion-icon">
                        {openSubcategories[sub.name] ? "−" : "+"}
                      </span>
                    </button>
                    {openSubcategories[sub.name] && sub.items.length > 0 && (
                      <div className="sidebar-subcategory-content">
                        {sub.items.map((item, j) => renderItem(item, j))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </>
  );
}

export default ServiceSidebar;
