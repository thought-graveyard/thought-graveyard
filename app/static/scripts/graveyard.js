let allThoughts = [];

document.addEventListener('DOMContentLoaded', () => {
  const graveyard = document.getElementById('graveyard');
  const addBtn = document.getElementById('add-btn');
  const modal = document.getElementById('add-modal');
  const closeBtn = document.getElementById('close-modal');
  const saveBtn = document.getElementById('save-thought');
  const searchInput = document.getElementById('search-keyword');
  const searchResults = document.getElementById('search-results');
  const emotionFilters = document.querySelectorAll('.filter-emotion');
  const fetchUrl = currentMode === 'public' ? '/api/public-thoughts' : '/api/personal-thoughts';
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

  fetch(fetchUrl)
    .then(res => res.json())
    .then(data => {
      allThoughts = data;
      data.forEach(renderGravestone);
      renderSearchResults(data);
    });

  addBtn.addEventListener('click', () => modal.classList.remove('hidden'));
  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

  saveBtn.addEventListener('click', () => {
    const title = document.getElementById('input-title').value;
    const content = document.getElementById('input-content').value;
    const emotions = Array.from(document.querySelectorAll('.modal-emotion:checked')).map(cb => cb.value);
    const isPublic = document.getElementById('input-public').checked;

    if (!title || !content) return alert("Please enter all items");

    fetch('/api/thoughts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
      body: JSON.stringify({
        title, content, emotions, is_public: isPublic
      })
    })
    .then(res => res.json())
    .then(data => {
      if ((currentMode === 'public' && data.is_public) || (currentMode === 'personal' && !data.is_public)) {
        allThoughts.push(data);
        renderGravestone(data);
        renderSearchResults(allThoughts);
      }
      modal.classList.add('hidden');
      document.getElementById('input-title').value = '';
      document.getElementById('input-content').value = '';
      document.getElementById('input-public').checked = false;
      document.querySelectorAll('.modal-emotion').forEach(cb => cb.checked = false);
    });

    searchInput.addEventListener('input', () => renderSearchResults(allThoughts));
    emotionFilters.forEach(cb => cb.addEventListener('change', () => renderSearchResults(allThoughts)));
});

function renderGravestone(thought) {
    const container = document.createElement('div');
    container.className = 'absolute text-2xl cursor-pointer';
    container.style.top = thought.position.top;
    container.style.left = thought.position.left;
    container.innerText = '🪦';
    container.dataset.id = thought.id;

    const popup = document.createElement('div');
    popup.className = 'hidden absolute left-full top-0 ml-2 bg-white border rounded shadow-md p-2 text-sm w-60 z-10';
    popup.innerHTML = `
    <div class="font-bold mb-1">${thought.title}</div>
    <div class="mb-1">${thought.content}</div>
    <div class="text-xs text-gray-500 mb-1">Emotion: ${thought.emotions.join(' ')}</div>
  `;

  if (thought.author === "me") {
    const delBtn = document.createElement('button');
    delBtn.innerText = "🗑 Delete";
    delBtn.className = "text-red-600 text-xs underline";
    delBtn.onclick = (e) => {
      e.stopPropagation();
      if (confirm("Delete it?")) {
        fetch(`/api/thoughts/${thought.id}`, { 
          method: 'DELETE',
          headers: {
            'X-CSRFToken': csrfToken
          }
        })
          .then(() => {
            allThoughts = allThoughts.filter(x => x.id !== thought.id);
            popup.remove();
            container.remove();
            renderSearchResults(allThoughts);
          });
      }
    };
    popup.appendChild(delBtn);
  }

  container.appendChild(popup);

  let open = false;
  container.addEventListener('click', () => {
    open = !open;
    popup.classList.toggle('hidden', !open);
  });

  container.addEventListener('mouseleave', () => {
    open = false;
    popup.classList.add('hidden');
  });

  document.getElementById('graveyard').appendChild(container);
}
