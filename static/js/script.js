/* =========================================================
   AI STUDY ASSISTANT PRO
   FRONTEND JAVASCRIPT
========================================================= */

/* =========================================================
   GLOBAL STATE
========================================================= */

let currentQuestion = "";
let currentPersonality = "";

let isRequestRunning = false;

/* =========================================================
   PERSONALITY NAMES
========================================================= */

const personalityMap = {
  friendly_tutor: "Friendly Tutor",

  academic_professor: "Academic Professor",

  elaborate_explainer: "Elaborate Explainer",

  concise_educator: "Concise Educator",
};

/* =========================================================
   ASK QUESTION
========================================================= */

async function askQuestion() {
  if (isRequestRunning) {
    return;
  }

  const questionInput = document.getElementById("question");

  const personalityInput = document.getElementById("personality");

  const loadingDiv = document.getElementById("loading");

  const responseArea = document.getElementById("responseArea");

  const askButton = document.getElementById("askButton");

  const question = questionInput.value.trim();

  const personality = personalityInput.value;

  /* -----------------------------------------
       VALIDATION
    ----------------------------------------- */

  if (!question) {
    showNotification("Please enter a question!", "warning");

    focusQuestion();

    return;
  }

  /* -----------------------------------------
       STORE STATE
    ----------------------------------------- */

  currentQuestion = question;

  currentPersonality = personality;

  isRequestRunning = true;

  /* -----------------------------------------
       SHOW LOADING
    ----------------------------------------- */

  loadingDiv.classList.remove("hidden");

  responseArea.classList.add("hidden");

  askButton.disabled = true;

  askButton.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <span>Thinking...</span>
    `;

  /* Scroll to loading */

  setTimeout(() => {
    loadingDiv.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, 100);

  try {
    /* -------------------------------------
           API REQUEST
        -------------------------------------- */

    const response = await fetch("/ask", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        question: question,

        personality: personality,
      }),
    });

    /* -------------------------------------
           HTTP ERROR
        -------------------------------------- */

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    /* -------------------------------------
           PARSE RESPONSE
        -------------------------------------- */

    const data = await response.json();

    /* -------------------------------------
           HIDE LOADING
        -------------------------------------- */

    loadingDiv.classList.add("hidden");

    /* -------------------------------------
           API ERROR
        -------------------------------------- */

    if (data.error) {
      showNotification(data.error, "error");

      return;
    }

    /* -------------------------------------
           DISPLAY RESPONSE
        -------------------------------------- */

    displayExplanation(data);

    responseArea.classList.remove("hidden");

    /* -------------------------------------
           SCROLL TO RESPONSE
        -------------------------------------- */

    setTimeout(() => {
      responseArea.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  } catch (error) {
    console.error("Ask question error:", error);

    loadingDiv.classList.add("hidden");

    showNotification("An error occurred: " + error.message, "error");
  } finally {
    isRequestRunning = false;

    askButton.disabled = false;

    askButton.innerHTML = `
            <span>Get Explanation</span>
            <i class="fas fa-arrow-right"></i>
        `;
  }
}

/* =========================================================
   DISPLAY EXPLANATION
========================================================= */

function displayExplanation(data) {
  const explanationDiv = document.getElementById("explanation");

  const metadataDiv = document.getElementById("metadata");

  const personalityDisplay = document.getElementById("personalityDisplay");

  /* -----------------------------------------
       PERSONALITY
    -------------------------------------- */

  const personalityName =
    personalityMap[data.personality] ||
    personalityMap[currentPersonality] ||
    "Friendly Tutor";

  personalityDisplay.innerHTML = `

        <i class="fas fa-user-tag"></i>

        <span>
            ${escapeHtml(personalityName)}
        </span>

    `;

  /* -----------------------------------------
       EXPLANATION
    -------------------------------------- */

  let explanation = data.explanation || "No explanation was returned.";

  explanation = formatMarkdown(explanation);

  explanationDiv.innerHTML = explanation;

  /* -----------------------------------------
       METADATA
    -------------------------------------- */

  const model = data.model || "llama-3.3-70b-versatile";

  let tokenCount = 0;

  if (data.tokens && typeof data.tokens === "object") {
    tokenCount = data.tokens.total || data.tokens.completion || 0;
  } else if (typeof data.tokens === "number") {
    tokenCount = data.tokens;
  }

  metadataDiv.innerHTML = `

        <span>

            <i class="fas fa-microchip"></i>

            Model:
            ${escapeHtml(model)}

        </span>

        <span>

            <i class="fas fa-tachometer-alt"></i>

            Tokens:
            ${tokenCount}

        </span>

        <span>

            <i class="fas fa-clock"></i>

            ${new Date().toLocaleTimeString()}

        </span>

    `;
}

/* =========================================================
   MARKDOWN FORMATTER
========================================================= */

function formatMarkdown(text) {
  /*
        We escape HTML first so that the AI response
        cannot directly inject arbitrary HTML.
    */

  let html = escapeHtml(text);

  /* Code blocks */

  html = html.replace(/```([\s\S]*?)```/g, function (match, code) {
    return `
                    <pre><code>${code.trim()}</code></pre>
                `;
  });

  /* Headings */

  html = html.replace(/^### (.*?)$/gm, "<h3>$1</h3>");

  html = html.replace(/^## (.*?)$/gm, "<h2>$1</h2>");

  html = html.replace(/^# (.*?)$/gm, "<h1>$1</h1>");

  /* Bold */

  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  /* Italic */

  html = html.replace(/(?<!\*)\*(?!\*)(.*?)\*(?!\*)/g, "<em>$1</em>");

  /* Inline code */

  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  /*
       Convert unordered list
       lines starting with -, * or +
    */

  html = convertLists(html);

  /*
       Convert normal line breaks.
       Do not insert <br> inside
       pre/code blocks.
    */

  const parts = html.split(/(<pre><code>[\s\S]*?<\/code><\/pre>)/g);

  for (let i = 0; i < parts.length; i++) {
    if (!parts[i].startsWith("<pre><code>")) {
      parts[i] = parts[i].replace(/\n/g, "<br>");
    }
  }

  html = parts.join("");

  return html;
}

/* =========================================================
   LIST CONVERTER
========================================================= */

function convertLists(html) {
  const lines = html.split("\n");

  let output = [];

  let inUnorderedList = false;

  let inOrderedList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    /* Unordered */

    const unordered = line.match(/^\s*[-*+]\s+(.*)/);

    /* Ordered */

    const ordered = line.match(/^\s*\d+\.\s+(.*)/);

    if (unordered) {
      if (!inUnorderedList) {
        output.push("<ul>");

        inUnorderedList = true;
      }

      output.push(`<li>${unordered[1]}</li>`);

      continue;
    }

    if (ordered) {
      if (!inOrderedList) {
        output.push("<ol>");

        inOrderedList = true;
      }

      output.push(`<li>${ordered[1]}</li>`);

      continue;
    }

    if (inUnorderedList) {
      output.push("</ul>");

      inUnorderedList = false;
    }

    if (inOrderedList) {
      output.push("</ol>");

      inOrderedList = false;
    }

    output.push(line);
  }

  if (inUnorderedList) {
    output.push("</ul>");
  }

  if (inOrderedList) {
    output.push("</ol>");
  }

  return output.join("\n");
}

/* =========================================================
   REGENERATE
========================================================= */

async function regenerateResponse() {
  if (!currentQuestion) {
    showNotification("No question to regenerate.", "warning");

    return;
  }

  if (isRequestRunning) {
    return;
  }

  const questionInput = document.getElementById("question");

  const personalityInput = document.getElementById("personality");

  questionInput.value = currentQuestion;

  personalityInput.value = currentPersonality;

  await askQuestion();
}

/* =========================================================
   COPY EXPLANATION
========================================================= */

async function copyExplanation() {
  const explanationDiv = document.getElementById("explanation");

  const text = explanationDiv.innerText.trim();

  if (!text) {
    showNotification("Nothing to copy.", "warning");

    return;
  }

  try {
    await navigator.clipboard.writeText(text);

    showNotification("Explanation copied to clipboard!", "success");
  } catch (error) {
    console.error("Clipboard error:", error);

    /* Fallback */

    const textarea = document.createElement("textarea");

    textarea.value = text;

    textarea.style.position = "fixed";

    textarea.style.opacity = "0";

    document.body.appendChild(textarea);

    textarea.select();

    try {
      document.execCommand("copy");

      showNotification("Explanation copied to clipboard!", "success");
    } catch (fallbackError) {
      showNotification("Failed to copy explanation.", "error");
    }

    textarea.remove();
  }
}

/* =========================================================
   FOCUS QUESTION
========================================================= */

function focusQuestion() {
  const question = document.getElementById("question");

  if (!question) {
    return;
  }

  question.scrollIntoView({
    behavior: "smooth",

    block: "center",
  });

  setTimeout(() => {
    question.focus();
  }, 500);
}

/* =========================================================
   HOW IT WORKS SCROLL
========================================================= */

function scrollToHowItWorks() {
  const section = document.getElementById("how-it-works");

  if (!section) {
    return;
  }

  section.scrollIntoView({
    behavior: "smooth",

    block: "start",
  });
}

/* =========================================================
   NOTIFICATION
========================================================= */

function showNotification(message, type = "info") {
  /* Remove old notification */

  const existing = document.querySelector(".notification");

  if (existing) {
    existing.remove();
  }

  const notification = document.createElement("div");

  notification.className = `notification notification-${type}`;

  /* Icon */

  let icon = "fa-circle-info";

  if (type === "success") {
    icon = "fa-circle-check";
  } else if (type === "warning") {
    icon = "fa-triangle-exclamation";
  } else if (type === "error") {
    icon = "fa-circle-xmark";
  }

  notification.innerHTML = `

        <i class="fas ${icon}"></i>

        <span>
            ${escapeHtml(message)}
        </span>

    `;

  /* Colors */

  const colors = {
    success: "#16a34a",

    warning: "#d97706",

    error: "#dc2626",

    info: "#087dd5",
  };

  notification.style.background = colors[type] || colors.info;

  document.body.appendChild(notification);

  /* Auto remove */

  setTimeout(() => {
    notification.style.opacity = "0";

    notification.style.transform = "translateX(80px)";

    notification.style.transition = "all 0.3s ease";

    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {
  const div = document.createElement("div");

  div.textContent = value;

  return div.innerHTML;
}

/* =========================================================
   KEYBOARD SHORTCUT
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const question = document.getElementById("question");

  const personality = document.getElementById("personality");

  /* -------------------------------------
           Ctrl + Enter
        -------------------------------------- */

  if (question) {
    question.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();

        askQuestion();
      }
    });

    /* ---------------------------------
               Auto resize
            ---------------------------------- */

    question.addEventListener("input", function () {
      this.style.height = "auto";

      this.style.height = this.scrollHeight + "px";
    });
  }

  /* -------------------------------------
           Personality change
        -------------------------------------- */

  if (personality) {
    personality.addEventListener("change", function () {
      currentPersonality = this.value;
    });
  }
});

/* =========================================================
   PREVENT ACCIDENTAL PAGE RELOAD
========================================================= */

window.addEventListener("beforeunload", function (event) {
  if (isRequestRunning) {
    event.preventDefault();

    event.returnValue = "";
  }
});
