document.addEventListener('DOMContentLoaded', function() {

    const allButtons = document.querySelectorAll('.searchBtn');
    const searchBar = document.querySelector('.searchBar');
    const searchInput = document.getElementById('searchInput');
    const searchClose = document.getElementById('searchClose');

    for(var i =0; i < allButtons.length; i++) {
        

        allButtons[i].addEventListener('click', function() {
            searchBar.style.visibility = 'visible';
            searchBar.classList.add('open');
            this.setAttribute('aria-expanded', 'true');

            searchInput.focus();
        });

        searchClose.addEventListener('click', function() {
            searchBar.style.visibility = 'hidden';
            searchBar.classList.remove('open');
            this.setAttribute('aria-expanded', 'false');
        })
    }
});
const generateBtn = document.getElementById('generateBtn');
const publishBtn = document.getElementById('publishBtn');
const textarea = document.getElementById('content');
const topicInput = document.getElementById('topic');
const loadingDiv = document.getElementById('loading');

generateBtn.addEventListener('click', async () => {
  const topic = topicInput.value.trim();
  if (!topic) return alert("Please enter a topic!");

  loadingDiv.style.display = "block";
  generateBtn.disabled = true;
  textarea.value = "";

  try {
    const res = await fetch("/admin/generate-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic })
    });

    const data = await res.json();
    if (data.success) {
      textarea.value = data.post;
    } else {
      alert("AI failed to generate. Try again!");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong.");
  } finally {
    loadingDiv.style.display = "none";
    generateBtn.disabled = false;
  }
});

// Optional: handle "Publish"
document.getElementById('generateForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const topic = topicInput.value.trim();
  const body = textarea.value.trim();

  if (!topic || !body) return alert("Please enter a topic and generate content first!");

  try {
    const res = await fetch("/admin/publish", { // url normal publish route
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: topic, body })
    });

    const result = await res.json();
    if (result.success) alert("✅ Blog published!");
    else alert("❌ Publish failed");
  } catch (error) {
    console.error(error);
  }
});