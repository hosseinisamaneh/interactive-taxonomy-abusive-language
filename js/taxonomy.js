fetch('data/taxonomy.json')
  .then(response => response.json())
  .then(data => renderInteractiveTaxonomy(data));

function renderInteractiveTaxonomy(taxonomy) {
  const container = document.getElementById('taxonomy-container');

  taxonomy.categories.forEach(cat => {
    const catDiv = document.createElement('div');
    catDiv.className = 'category';

    // Create collapsible category title
    const catHeader = document.createElement('div');
    catHeader.className = 'collapsible category-header';
    catHeader.textContent = cat.name;
    catHeader.addEventListener('click', () => {
      catHeader.classList.toggle("active");
      catContent.style.display = catContent.style.display === "block" ? "none" : "block";
    });
    catDiv.appendChild(catHeader);

    const catContent = document.createElement('div');
    catContent.className = 'content';

    cat.dimensions.forEach(dim => {
      const dimDiv = document.createElement('div');
      dimDiv.className = 'dimension';

      // Create collapsible dimension header
      const dimHeader = document.createElement('div');
      dimHeader.className = 'collapsible dimension-header';
      dimHeader.textContent = dim.name;
      dimHeader.addEventListener('click', () => {
        dimHeader.classList.toggle("active");
        dimContent.style.display = dimContent.style.display === "block" ? "none" : "block";
      });
      dimDiv.appendChild(dimHeader);

      // Characteristics list
      const dimContent = document.createElement('div');
      dimContent.className = 'content';

      const ul = document.createElement('ul');
      dim.characteristics.forEach(char => {
        const li = document.createElement('li');
        li.textContent = char;
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
