fetch('data/taxonomy.json')
  .then(response => response.json())
  .then(data => renderTaxonomy(data));

function renderTaxonomy(taxonomy) {
  const container = document.getElementById('taxonomy-container');

  taxonomy.categories.forEach(cat => {
    const catDiv = document.createElement('div');
    catDiv.className = 'category';

    const catTitle = document.createElement('h2');
    catTitle.textContent = cat.name;
    catDiv.appendChild(catTitle);

    cat.dimensions.forEach(dim => {
      const dimDiv = document.createElement('div');
      dimDiv.className = 'dimension';

      const dimTitle = document.createElement('h3');
      dimTitle.textContent = dim.name;
      dimDiv.appendChild(dimTitle);

      const charList = document.createElement('ul');
      dim.characteristics.forEach(c => {
        const li = document.createElement('li');
        li.textContent = c;
        charList.appendChild(li);
      });
      dimDiv.appendChild(charList);
      catDiv.appendChild(dimDiv);
    });

    container.appendChild(catDiv);
  });
}
