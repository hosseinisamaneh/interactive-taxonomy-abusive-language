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
        const matchedDimensions = cat.dimensions
          .map(dim => {
            const filteredChars = dim.characteristics.filter(c =>
              c.toLowerCase().includes(query)
            );
            if (
              dim.name.toLowerCase().includes(query) ||
              filteredChars.length > 0
            ) {
              return {
                ...dim,
                characteristics: filteredChars.length > 0 ? filteredChars : dim.characteristics,
                __highlight: query // pass query to highlight
              };
            }
            return null;
          })
          .filter(Boolean);

        if (
          cat.name.toLowerCase().includes(query) ||
          matchedDimensions.length > 0
        ) {
          return {
            ...cat,
            dimensions: matchedDimensions,
            __highlight: query // for highlighting
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

function renderInteractiveTaxonomy(taxonomy, expand = false, highlight = '') {
  const container = document.getElementById('taxonomy-container');
  container.innerHTML = ''; // Clear previous content

  taxonomy.categories.forEach(cat => {
    const catDiv = document.createElement('div');
    catDiv.className = 'category';

    const catHeader = document.createElement('div');
    catHeader.className = 'collapsible category-header';
    catHeader.innerHTML = highlightMatch(cat.name, highlight);
    const catContent = document.createElement('div');
    catContent.className = 'content';
    catContent.style.display = expand ? 'block' : 'none';

    catHeader.addEventListener('click', () => {
      catHeader.classList.toggle("active");
      catContent.style.display = catContent.style.display === "block" ? "none" : "block";
    });
    if (expand) catHeader.classList.add("active");
    catDiv.appendChild(catHeader);

    cat.dimensions.forEach(dim => {
      const dimDiv = document.createElement('div');
      dimDiv.className = 'dimension';

      const dimHeader = document.createElement('div');
      dimHeader.className = 'collapsible dimension-header';
      dimHeader.innerHTML = highlightMatch(dim.name, highlight);
      const dimContent = document.createElement('div');
      dimContent.className = 'content';
      dimContent.style.display = expand ? 'block' : 'none';

      dimHeader.addEventListener('click', () => {
        dimHeader.classList.toggle("active");
        dimContent.style.display = dimContent.style.display === "block" ? "none" : "block";
      });
      if (expand) dimHeader.classList.add("active");
      dimDiv.appendChild(dimHeader);

      const ul = document.createElement('ul');
      dim.characteristics.forEach(char => {
        const li = document.createElement('li');
        li.innerHTML = highlightMatch(char, highlight);
        li.className = 'has-tooltip';

        if (dim.definitions && dim.definitions[char]) {
          const tooltip = document.createElement('span');
          tooltip.className = 'tooltip';
          tooltip.textContent = dim.definitions[char];
          li.appendChild(tooltip);
        }

        ul.appendChild(li);
      });

      dimContent.appendChild(ul);
      dimDiv.appendChild(dimContent);
      catContent.appendChild(dimDiv);
    });

    catDiv.appendChild(catContent);
    container.appendChild(catDiv);
  });
}

function highlightMatch(text, keyword) {
  if (!keyword) return text;
  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
}
