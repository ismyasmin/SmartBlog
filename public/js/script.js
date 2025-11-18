document.addEventListener('DOMContentLoaded', function() {

    // Select search button(s), search bar, input field, and close button
    const allButtons = document.querySelectorAll('.searchBtn');
    const searchBar = document.querySelector('.searchBar');
    const searchInput = document.getElementById('searchInput');
    const searchClose = document.getElementById('searchClose');

    // Loops through all search buttons
    for(var i =0; i < allButtons.length; i++) {
        

        // When search button is clicked, opens search bar
        allButtons[i].addEventListener('click', function() {
            searchBar.style.visibility = 'visible';
            searchBar.classList.add('open');
            this.setAttribute('aria-expanded', 'true');

            searchInput.focus();// Auto-foucs into search field
        });

        // When the close button is clicked, search bar will be hidden
        searchClose.addEventListener('click', function() {
            searchBar.style.visibility = 'hidden';
            searchBar.classList.remove('open'); // Removes animation class
            this.setAttribute('aria-expanded', 'false');// Accessibility attribute
        })
    }
});

// Selects elements used on the AI post generator page
const generateBtn = document.getElementById('generateBtn');
const publishBtn = document.getElementById('publishBtn');
const textarea = document.getElementById('content');
const topicInput = document.getElementById('topic');
const loadingDiv = document.getElementById('loading');

// Handles the "Generate AI Post" button click
generateBtn.addEventListener('click', async () => {
  const topic = topicInput.value.trim();
  if (!topic) return alert("Please enter a topic!");

  // Show loading animation + disable button to prevent spam clicking
  loadingDiv.style.display = "block";
  generateBtn.disabled = true;
  textarea.value = "";

  try {
    // Send topic to backend route that generates the blog post
    const res = await fetch("/admin/generate-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic })
    });

    const data = await res.json();

    // Displays the result inside the textarea If successful
    if (data.success) {
      textarea.value = data.post;
    } else {
      alert("AI failed to generate. Try again!");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong.");
  } finally { // Hides loading animation, re-enables button
    loadingDiv.style.display = "none";
    generateBtn.disabled = false;
  }
});

// Optional: handles "Publish" button submission
document.getElementById('generateForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const topic = topicInput.value.trim();
  const body = textarea.value.trim();

  // Hide loading animation, re-enable button
  if (!topic || !body) return alert("Please enter a topic and generate content first!");

  try {
    // Send the final post to the backend "publish" route
    const res = await fetch("/admin/publish", { // url normal publish route
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: topic, body })
    });

    // Show success or failure message
    const result = await res.json();
    if (result.success) alert("✅ Blog published!");
    else alert("❌ Publish failed");
  } catch (error) {
    console.error(error);
  }
});