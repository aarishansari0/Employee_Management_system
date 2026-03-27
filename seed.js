import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import {
  Company,
  User,
  Team,
  Project,
  Task
} from "./models.js";

dotenv.config();

const MONGO = process.env.mongo_url;

const company_id = "one";

const names = [
  "Aarav", "Vivaan", "Aditya", "Krishna", "Ishaan",
  "Rohan", "Arjun", "Kabir", "Dev", "Sai"
];

const teams = ["frontend", "backend", "design"];

async function seed() {
  await mongoose.connect(MONGO, { dbName: "userdb" });

  console.log("Connected to DB");

  const users = [];

  for (let name of names) {
    const user = new User({
      username: name.toLowerCase(),
      company_id,
      password: "1234",
      role: Math.random() > 0.7 ? "admin" : "member",
      email: `${name.toLowerCase()}@mail.com`,
      bossEmail: "admin@mail.com"
    });

    await user.save();
    users.push(user);
  }

  console.log("Users created");

  const teamDocs = [];

  for (let t of teams) {
    const members = users
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(u => u.username);

    const team = await Team.create({
      company_id,
      name: t,
      members
    });

    teamDocs.push(team);
  }

  console.log("Teams created");


  const projectDocs = [];

  for (let i = 1; i <= 6; i++) {
    const team = teamDocs[Math.floor(Math.random() * teamDocs.length)];

    const project = await Project.create({
      company_id,
      name: `Project ${i}`,
      team_name: team.name,
      status: ["todo", "in_progress", "completed"][Math.floor(Math.random() * 3)],
      deadline: new Date(Date.now() + Math.random() * 10 * 86400000),
      progress: Math.floor(Math.random() * 100)
    });

    projectDocs.push(project);
  }

  console.log("Projects created");

  for (let i = 0; i < 50; i++) {
    const user = users[Math.floor(Math.random() * users.length)];

    const start = 9 * 60 + Math.floor(Math.random() * 300);
    const duration = 30 + Math.floor(Math.random() * 120);

    const end = start + duration;

    const to12 = (min) => {
      let h = Math.floor(min / 60);
      let m = min % 60;
      let period = h >= 12 ? "PM" : "AM";
      if (h > 12) h -= 12;
      if (h === 0) h = 12;
      return { h, m, p: period };
    };

    const s = to12(start);
    const e = to12(end);

    await Task.create({
      company_id,
      username: user.username,
      date: new Date(Date.now() - Math.random() * 7 * 86400000),

      startHour: s.h,
      startMinute: s.m,
      startPeriod: s.p,

      endHour: e.h,
      endMinute: e.m,
      endPeriod: e.p,

      totalStart: start,
      totalEnd: end,

      note: "Working on feature"
    });
  }

  console.log("Tasks created");

  console.log("✅ DB SEEDED SUCCESSFULLY");
  process.exit();
}

seed();