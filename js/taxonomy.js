// Updated taxonomy.js to support:
// - subcharacteristics within characteristics
// - nested dimensions
// - subcategories

let originalData = null;

document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('searchInput');
  const clearButton = document.getElementById('clearButton');

  fetch('data/taxonomy.json')
    .then(response => response.json())
    .then(data => {
      originalData = data;
      renderInteractiveTaxonomy(data);
    });

  searchInput.addEventListener('input', function () {
    const query = this.value.toLowerCase();
    if (!query) {
      renderInteractiveTaxonomy(originalData);
      return;
    }

    const filtered = {
      categories: originalData.categories.map(cat => {
        const matchedSub = filterSubcategories(cat.subcategories || [], query);
        const matchedDims = filterDimensions(cat.dimensions || [], query);

        if (
          cat.name.toLowerCase().includes(query) ||
          matchedDims.length > 0 ||
          matchedSub.length > 0
        ) {
          return {
            ...cat,
            dimensions: matchedDims,
            subcategories: matchedSub
          };
        }
        return null;
      }).filter(Boolean)
    };

    renderInteractiveTaxonomy(filtered, true, query);
  });

  clearButton.addEventListener('click', () => {
    searchInput.value = '';
    renderInteractiveTaxonomy(originalData);
  });
});

function filterDimensions(dimensions, query) {
  return dimensions
    .map(dim => {
      const filteredChars = dim.characteristics.filter(c => {
        if (typeof c === 'string') return c.toLowerCase().includes(query);
        if (typeof c === 'object') {
          return (
            c.name.toLowerCase().includes(query) ||
            (c.subcharacteristics || []).some(sc => sc.toLowerCase().includes(query))
          );
        }
        return false;
      });

      const filteredSubDims = (dim.dimensions || []).length > 0 ? filterDimensions(dim.dimensions, query) : [];

      if (
        dim.name.toLowerCase().includes(query) ||
        filteredChars.length > 0 ||
        filteredSubDims.length > 0
      ) {
        return {
          ...dim,
          characteristics: filteredChars,
          dimensions: filteredSubDims
        };
      }
      return null;
    })
    .filter(Boolean);
}

function filterSubcategories(subcategories, query) {
  return subcategories
    .map(sub => {
      const matchedDims = filterDimensions(sub.dimensions || [], query);
      const matchedSubs = filterSubcategories(sub.subcategories || [], query);

      if (
        sub.name.toLowerCase().includes(query) ||
        matchedDims.length > 0 ||
        matchedSubs.length > 0
      ) {
        return {
          ...sub,
          dimensions: matchedDims,
          subcategories: matchedSubs
        };
      }
      return null;
    })
    .filter(Boolean);
}

function renderInteractiveTaxonomy(taxonomy, expand = false, highlight = '') {
  const container = document.getElementById('taxonomy-container');
  container.innerHTML = '';

  taxonomy.categories.forEach(cat => {
    const catDiv = createCategoryElement(cat, expand, highlight);
    container.appendChild(catDiv);
  });
}

function createCategoryElement(cat, expand, highlight) {
  const catDiv = document.createElement('div');
  catDiv.className = 'category';

  const catHeader = document.createElement('div');
  catHeader.className = 'collapsible category-header';
  catHeader.innerHTML = highlightMatch(cat.name, highlight);

  const catContent = document.createElement('div');
  catContent.className = 'content';
  catContent.style.display = expand ? 'block' : 'none';

  catHeader.addEventListener('click', () => {
    catHeader.classList.toggle('active');
    catContent.style.display = catContent.style.display === 'block' ? 'none' : 'block';
  });

  if (expand) catHeader.classList.add('active');
  catDiv.appendChild(catHeader);

  (cat.dimensions || []).forEach(dim => {
    catContent.appendChild(createDimensionElement(dim, expand, highlight));
  });

  (cat.subcategories || []).forEach(sub => {
    catContent.appendChild(createCategoryElement(sub, expand, highlight));
  });

  catDiv.appendChild(catContent);
  return catDiv;
}

function createDimensionElement(dim, expand, highlight) {
  const dimDiv = document.createElement('div');
  dimDiv.className = 'dimension';

  const dimHeader = document.createElement('div');
  dimHeader.className = 'collapsible dimension-header';
  dimHeader.innerHTML = highlightMatch(dim.name, highlight);

  const dimContent = document.createElement('div');
  dimContent.className = 'content';
  dimContent.style.display = expand ? 'block' : 'none';

  dimHeader.addEventListener('click', () => {
    dimHeader.classList.toggle('active');
    dimContent.style.display = dimContent.style.display === 'block' ? 'none' : 'block';
  });

  if (expand) dimHeader.classList.add('active');
  dimDiv.appendChild(dimHeader);

  const ul = document.createElement('ul');
(dim.characteristics || []).forEach(char => {
    const li = document.createElement('li');

    if (typeof char === 'string') {
      li.innerHTML = highlightMatch(char, highlight);
    } else if (typeof char === 'object' && char.name) {
      li.innerHTML = highlightMatch(char.name, highlight);
      const subUl = document.createElement('ul');
      (char.subcharacteristics || []).forEach(sub => {
        const subLi = document.createElement('li');
        subLi.innerHTML = highlightMatch(sub, highlight);
        subUl.appendChild(subLi);
      });
      li.appendChild(subUl);
    }

    ul.appendChild(li);
  });

  dimContent.appendChild(ul);

  if (Array.isArray(dim.dimensions)) {
    (dim.dimensions || []).forEach(subDim => {
      dimContent.appendChild(createDimensionElement(subDim, expand, highlight));
    });
  }
  dimDiv.appendChild(dimContent);
  return dimDiv;
}

function highlightMatch(text, keyword) {
  if (!keyword || typeof text !== 'string') return text;
  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
}
