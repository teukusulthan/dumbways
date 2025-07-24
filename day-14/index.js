import express from "express";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import session from "express-session";
import flash from "express-flash";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./src/assets/uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage: storage });

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

app.use(
  session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Cannot logout:", err);
      return res.redirect("/project");
    }
    res.redirect("/login");
  });
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

  res.render("project", {
    projects,
    user: req.session.user,
  });
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

app.post("/register", async (req, res) => {
  const { full_name, email, password } = req.body;

  const checkEmail = await db.query(
    "SELECT * FROM public.user WHERE email = $1",
    [email]
  );

  if (checkEmail.rows.length > 0) {
    req.flash("error", "Email is already used!");
    return res.redirect("/register");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.query(
    `INSERT INTO public.user (full_name, email, password) VALUES ($1, $2, $3)`,
    [full_name, email, hashedPassword]
  );

  req.flash("success", "Registration successful! Please log in.");
  res.redirect("/login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await db.query("SELECT * FROM public.user WHERE email = $1", [
    email,
  ]);

  if (result.rows.length === 0) {
    req.flash("error", "Email not found!");
    return res.redirect("/login");
  }

  const user = result.rows[0];

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    req.flash("error", "Wrong password!");
    return res.redirect("/login");
  }

  req.session.user = {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
  };

  req.flash("success", `Selamat datang, ${user.full_name}!`);
  res.redirect("/project");
});

app.post("/add-project", upload.single("upload"), async (req, res) => {
  const { project_name, start_date, end_date, description, technologies } =
    req.body;

  const fileName = `/assets/uploads/${req.file.filename}`;

  await db.query(
    `INSERT INTO project (project_name, start_date, end_date, description, technologies, upload)
   VALUES ($1, $2, $3, $4, $5, $6)`,
    [project_name, start_date, end_date, description, technologies, fileName]
  );
  res.redirect("/project");
});

app.post("/delete/:id", async (req, res) => {
  const { id } = req.params;

  await db.query("DELETE FROM project WHERE id = $1", [id]);

  res.redirect("/project");
});
