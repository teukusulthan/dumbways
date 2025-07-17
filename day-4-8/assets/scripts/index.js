const formSubmit = document.getElementById("form-submit");
const projectContainer = document.getElementById("project-container");
const projectCard = document.getElementById("project-card");
const cardDetail = document.getElementById("project-detail");
const projectWrapper = document.getElementById("project-wrapper");

function renderCard(name, desc, imgUrl, icons, durationText) {
  const iconsElement = icons.map((e) => `<img src="${e}" />`);
  return `<div class="myproject-card" id="project-card">
            <img src="${imgUrl}" alt="${name} project image">
            <div class="myproject-card-content">
              <h2>${name}</h2>
              <h3>Duration: ${durationText}</h3>
              <p>${desc}</p>
              <div class="myproject-card-content-tech">
                ${iconsElement.join("")}
              </div>
              <div class="myproject-card-button">
                <button type="button" onclick="showDetail()">Detail</button>
                <button type="button">Delete</button>
              </div>
            </div>
          </div>`;
}

let projectData = [];

formSubmit.addEventListener("submit", (e) => {
  e.preventDefault();

  const projectName = document.getElementById("proname").value;
  const description = document.getElementById("desc").value;
  const imgInput = document.getElementById("uplimg");
  const startDate = document.getElementById("start-date").value;
  const endDate = document.getElementById("end-date").value;
  const durationText = calculateDuration(startDate, endDate);

  const checkboxes = [
    document.getElementById("tech-1").checked,
    document.getElementById("tech-2").checked,
    document.getElementById("tech-3").checked,
    document.getElementById("tech-4").checked,
  ];

  const checkboxesMapping = [
    "assets/icons/Nodejs.png",
    "assets/icons/Reactjs.png",
    "assets/icons/Nextjs.png",
    "assets/icons/Typescript.png",
  ];

  const iconResult = checkboxesMapping.filter((_, i) => checkboxes[i]);

  const file = imgInput.files[0];
  const reader = new FileReader();

  reader.onloadend = function () {
    const imgUrl = reader.result;

    projectData.push({
      name: projectName,
      desc: description,
      img: imgUrl,
      icon: iconResult,
      duration: durationText,
    });

    projectContainer.innerHTML = "";

    const projectElem = projectData.map((project) => {
      const cardHTML = renderCard(
        project.name,
        project.desc,
        project.img,
        project.icon,
        project.duration
      );

      projectContainer.insertAdjacentHTML("beforeend", cardHTML);
    });

    formSubmit.reset();
  };

  reader.readAsDataURL(file);
});

function showDetail() {
  cardDetail.style.display = "flex";
}

function closeDetail() {
  cardDetail.style.display = "none";
}

function calculateDuration(startDateStr, endDateStr) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  const diffInMs = end - start;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) return "Invalid date range";

  const years = Math.floor(diffInDays / 365);
  const months = Math.floor((diffInDays % 365) / 30);
  const days = (diffInDays % 365) % 30;

  let result = [];
  if (years > 0) result.push(`${years} year${years > 1 ? "s" : ""}`);
  if (months > 0) result.push(`${months} month${months > 1 ? "s" : ""}`);
  if (days > 0) result.push(`${days} day${days > 1 ? "s" : ""}`);

  return result.length > 0 ? result.join(", ") : "0 days";
}
