import express from "express";
import { Pool } from "pg";

const db = new Pool({
  user: "postgres",
  password: "root",
  host: "localhost",
  port: 5432,
  database: "du-personal-web",
  max: 20,
});

const app = express();
const port = 3000;

app.set("view engine", "hbs");
app.set("views", "src/views");
app.use("/assets", express.static("src/assets"));
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});

app.get("/add-project", (req, res) => {
  res.render("addProject");
});

app.get("/project", async (req, res) => {
  const result = await db.query("SELECT * FROM project");

  const projects = result.rows.map((project) => {
    const techArray = project.technologies
      ? project.technologies
          .replace(/[{}"]/g, "")
          .split(",")
          .map((t) => t.trim().toLowerCase().replace(".", ""))
      : [];

    return {
      ...project,
      techIcons: techArray,
    };
  });

  res.render("project", { projects });
});

app.get("/detail/:id", async (req, res) => {
  const { id } = req.params;

  const result = await db.query("SELECT * FROM project WHERE id = $1", [id]);
  const project = result.rows[0];

  const techArray = project.technologies
    ? project.technologies
        .replace(/[{}"]/g, "")
        .split(",")
        .map((t) => t.trim().toLowerCase().replace(".", ""))
    : [];

  res.render("detail", {
    project: {
      ...project,
      techIcons: techArray,
    },
  });
});

app.post("/add-project", async (req, res) => {
  const {
    project_name,
    start_date,
    end_date,
    description,
    technologies,
    upload,
  } = req.body;

  const placeholderImage = "https://via.placeholder.com/300x180?text=No+Image";

  await db.query(
    `INSERT INTO project (project_name, start_date, end_date, description, technologies, upload)
   VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      project_name,
      start_date,
      end_date,
      description,
      technologies,
      placeholderImage,
    ]
  );
  res.redirect("/project");
});

app.post("/delete/:id", async (req, res) => {
  const { id } = req.params;

  await db.query("DELETE FROM project WHERE id = $1", [id]);

  res.redirect("/project");
});
