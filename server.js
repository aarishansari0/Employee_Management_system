

const express = require('express');
const mongoose = require('mongoose');
const jwt= require('jsonwebtoken');
const cors = require('cors');
const { Company, User, Task, Team, Project, File, Log,Request } = require('./models');
require('dotenv').config();
const mongo_url= process.env.mongo_url;
const SECRET_KEY=process.env.SECRET_KEY;


const app = express();
app.use(cors());
app.use(express.json());

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS
  }
});

mongoose.connect( mongo_url, {
  dbName: 'userdb',
});

mongoose.connection.on('error', console.error.bind(console, 'MongoDB error:'));

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Invalid token" });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Token invalid or expired" });
    req.token = decoded;
    next();
  });
}

app.get('/profile', authenticateToken, async (req, res) => {
  const { id } = req.token;

  const user = await User.findById(id).lean();

  res.json({
    success: true,
    user
  });
});

app.put('/update_profile', authenticateToken, async (req, res) => {
  const { id } = req.token;
  const { phone, email, bossEmail } = req.body;

  await User.findByIdAndUpdate(id, {
    phone,
    email,
    bossEmail
  });

  res.json({ success: true });
});

app.post('/signup', async (req, res) => {
  try {
    const { username, company_id, passkey, password } = req.body;

    const exists = await User.findOne({ username });
    if (exists) {
      return res.json({ success: false, error: 'User already exists' });
    }

    const company = await Company.findOne({ company_id: company_id.trim() });

    if (!company) {
      return res.json({ success: false, error: 'Company does not exist' });
    }

    const match = await company.comparePasskey(passkey.toString());

    if (!match) {
      return res.json({ success: false, error: "Wrong passkey" });
    }

    const user = new User({ username, company_id, password });
    await user.save();

    const token = jwt.sign(
      { username: user.username, company_id: user.company_id, id: user._id },
      SECRET_KEY
    );

    res.json({ success: true, token });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

app.post('/login', async (req, res) => {
  const { username, company_id, password } = req.body;
  console.log(`Login attempt for user: ${username}`);
  const user = await User.findOne({ username,company_id });
  if (!user) return res.json({ success: false, error: 'User not found' });
  const match = await user.comparePassword(password);
  if (!match) return res.json({ success: false, error: 'Incorrect password' });
  const token = jwt.sign(
    { username: user.username, company_id: user.company_id, id: user._id },
    SECRET_KEY
  );
  res.json({ success: true, token });
});

app.post('/add_company', async (req, res) => {
  try {
    const { company_id, passkey, company_name } = req.body;
    const company = new Company({ company_name, company_id, passkey });
    await company.save();
    res.json({ success: true, message: 'Company added successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});


app.post('/get_data', authenticateToken, async (req, res) => {
  const { username } = req.token;
  try {
    let tasks;
    if (username === 'admin') {
      tasks = await Task.find({});
    } else {
      tasks = await Task.find({ username });
    }
    res.json({ success: true, tasks });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.json({ success: false, error: 'Failed to fetch tasks' });
  }
});

app.post('/task-summary', authenticateToken, async (req, res) => {
  const { username } = req.token;
  const days = 7;

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days + 1);
  fromDate.setHours(0, 0, 0, 0);

  const tasks = await Task.find({
    username,
    date: { $gte: fromDate }
  });

  // Helper: Convert 12-hour time to minutes
  const toMinutes = (hour, minute, period) => {
    hour = parseInt(hour);
    minute = parseInt(minute);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return hour * 60 + minute;
  };

  const summary = {};

  tasks.forEach(task => {
    const dateStr = task.date.toISOString().split('T')[0];

    const start = toMinutes(task.startHour, task.startMinute, task.startPeriod);
    const end = toMinutes(task.endHour, task.endMinute, task.endPeriod);
    const duration = end - start;

    console.log(`${dateStr}: start=${start}, end=${end}, duration=${duration} minutes`);

    if (duration > 0) {
      summary[dateStr] = (summary[dateStr] || 0) + duration;
    }
  });

  // Fill in missing days
  const result = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const dateStr = d.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      minutes: summary[dateStr] || 0
    });
  }

  res.json({ success: true, data: result });
});

app.post('/add_task', authenticateToken, async (req, res) => {
  const { start, end, note, date } = req.body;
  const { username, company_id } = req.token;

  console.log(`Adding task for user: ${username}`);

  // Convert 12-hour time to minutes since midnight
  const to_24_minutes = (hour, minute, period) => {
    hour = parseInt(hour);
    minute = parseInt(minute);

    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    return hour * 60 + minute;
  };

  const start_total = to_24_minutes(start.hour, start.minute, start.period);
  const end_total = to_24_minutes(end.hour, end.minute, end.period);

  if (end_total <= start_total) {
    return res.json({
      success: false,
      error: "End time must be after start time"
    });
  }

  try {
    // Normalize date to day boundaries
    const task_date = new Date(date);
    task_date.setHours(0, 0, 0, 0);

    const next_day = new Date(task_date);
    next_day.setDate(task_date.getDate() + 1);

    const existing_tasks = await Task.find({
      username,
      date: {
        $gte: task_date,
        $lt: next_day
      }
    });

    const BUFFER = 0; // minutes

    for (const task of existing_tasks) {
      // ✅ FIXED: use camelCase fields
      const task_start = to_24_minutes(
        task.startHour,
        task.startMinute,
        task.startPeriod
      );

      const task_end = to_24_minutes(
        task.endHour,
        task.endMinute,
        task.endPeriod
      );

      // Safety guard (prevents corrupt DB data crashes)
      if (Number.isNaN(task_start) || Number.isNaN(task_end)) {
        console.error('Invalid task data:', task._id);
        continue;
      }

      const is_overlap = !(
        end_total + BUFFER <= task_start ||
        start_total >= task_end + BUFFER
      );

      if (is_overlap) {
        return res.json({
          success: false,
          error: 'Overlapping task (with buffer)',
          conflict: {
            start: `${task.startHour}:${String(task.startMinute).padStart(2, '0')} ${task.startPeriod}`,
            end: `${task.endHour}:${String(task.endMinute).padStart(2, '0')} ${task.endPeriod}`,
            note: task.note
          }
        });
      }
    }

    // Save task
    const task_data = {
      username,
      company_id,
      startHour: parseInt(start.hour),
      startMinute: parseInt(start.minute),
      startPeriod: start.period,
      endHour: parseInt(end.hour),
      endMinute: parseInt(end.minute),
      endPeriod: end.period,
      note,
      totalStart: start_total,
      totalEnd: end_total,
      date: new Date(date)
    };

    await Task.create(task_data);

    console.log('Task saved:', task_data);

    res.json({ success: true });

  } catch (err) {
    console.error('Error saving task:', err);
    res.json({
      success: false,
      error: err.message || 'Failed to save task'
    });
  }
});



app.delete('/delete_task', authenticateToken, async (req, res) => {
  try {
    const { username, company_id } = req.token;
    const { id } = req.body;  // 👈 this will be the MongoDB _id

    if (!id) {
      return res.status(400).json({ success: false, error: "Task ID is required" });
    }

    const deleted = await Task.findOneAndDelete({ _id: id});

    if (!deleted) {
      return res.status(404).json({ success: false, error: "Task not found or not authorized" });
    }

    res.json({ success: true, message: "Task deleted successfully" });

  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ success: false, error: "Server error deleting task" });
  }
});


app.get('/team_page', authenticateToken, async (req, res) => {
  try {
    const { company_id } = req.token;
    console.log("TOKEN COMPANY:", company_id);

    const teams = await Team.find({ company_id }).lean();
    const users = await User.find({ company_id }).lean();
    const projects = await Project.find({ company_id }).lean();

    console.log("TOKEN COMPANY:", company_id);
    console.log("TEAMS FOUND:", teams);
    console.log("PROJECTS FOUND:", projects);

    const formattedTeams = teams.map(team => {
      const members = [...new Set(team.members || [])];

      const teamMembers = [...new Set(team.members || [])]
        .map(username => {
          const user = users.find(u => u.username === username);
          if (!user) return null;

          const initials = user.username
            .split(' ')
            .map(w => w[0])
            .join('')
            .toUpperCase();

          return {
            initials,
            name: user.username,
            role: user.roles?.includes('company.admin') ? 'Admin' : 'Member'
          };
        })
        .filter(Boolean);

      const projectCount = projects.filter(
        p => p.team_name === team.name
      ).length;

      return {
        name: team.name,
        lead: teamMembers.length ? teamMembers[0].name : 'N/A',
        members: teamMembers,
        projectCount
      };
    });

    const formattedProjects = projects.map(project => ({
      name: project.name,
      team: project.team_name || 'Unassigned',
      status: project.status,
      due: project.deadline
        ? project.deadline.toISOString().split('T')[0]
        : null
    }));

    res.json({
      success: true,
      teams: formattedTeams,
      projects: formattedProjects
    });

  } catch (err) {
    console.error('Team page error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to load team data'
    });
  }
});

app.post('/add_team', authenticateToken, async (req, res) => {
  try {
    const { company_id, username } = req.token;
    const { name, members } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Team name is required"
      });
    }

    // Normalize members
    let teamMembers = Array.isArray(members) ? members : [];

    // Remove duplicates
    teamMembers = [...new Set(teamMembers)];

    // Always include creator
    if (!teamMembers.includes(username)) {
      teamMembers.push(username);
    }

    // Optional: validate users exist
    const validUsers = await User.find({
      company_id,
      username: { $in: teamMembers }
    });

    const validUsernames = validUsers.map(u => u.username);

    const newTeam = await Team.create({
      company_id,
      name: name.trim(),
      members: validUsernames
    });

    res.json({
      success: true,
      team: newTeam
    });

  } catch (err) {
    console.error("Add team error:", err);

    if (err.code === 11000) {
      return res.json({
        success: false,
        error: "Team already exists"
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create team"
    });
  }
});

app.delete('/delete_team', authenticateToken, async (req, res) => {
  try {
    const { company_id } = req.token;
    const { teamName } = req.body;

    if (!company_id) {
      return res.status(400).json({
        success: false,
        error: "Invalid company"
      });
    }

    if (!teamName || typeof teamName !== "string") {
      return res.status(400).json({
        success: false,
        error: "Valid team name required"
      });
    }

    console.log("Deleting team:", teamName, "Company:", company_id);

    const deleted = await Team.findOneAndDelete({
      company_id,
      name: teamName
    });

    if (!deleted) {
      return res.json({
        success: false,
        error: "Team not found"
      });
    }

    await Project.deleteMany({
      company_id,
      team_name: teamName
    });

    res.json({ success: true });

  } catch (err) {
    console.error("Delete team error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to delete team"
    });
  }
});


app.get('/projects', authenticateToken, async (req, res) => {
  try {
    const { company_id } = req.token;

    const projects = await Project.find({ company_id });

    res.json({ success: true, projects });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/add_project', authenticateToken, async (req, res) => {
  try {
    const { company_id } = req.token;
    const { name, team_name, deadline } = req.body;

    if (!name || !team_name) {
      return res.json({ success: false, error: "Missing fields" });
    }

    const team = await Team.findOne({ company_id, name: team_name });
    if (!team) {
      return res.json({ success: false, error: "Team does not exist" });
    }

    const project = await Project.create({
      company_id,
      name,
      team_name,
      deadline
    });

    res.json({ success: true, project });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/update_project/:id', authenticateToken, async (req, res) => {
  try {
    const { company_id } = req.token;
    const { id } = req.params;
    const { name, status, deadline, team_name, progress } = req.body;

    const project = await Project.findOne({ _id: id, company_id });
    if (!project) {
      return res.json({ success: false, error: "Project not found" });
    }

    if (team_name) {
      const team = await Team.findOne({ company_id, name: team_name });
      if (!team) {
        return res.json({ success: false, error: "Invalid team" });
      }
      project.team_name = team_name;
    }

    if (name) project.name = name;
    if (status) project.status = status;
    if (deadline) project.deadline = deadline;
    if (progress !== undefined) project.progress = progress;

    await project.save();

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/delete_project/:id', authenticateToken, async (req, res) => {
  try {
    const { company_id } = req.token;
    const { id } = req.params;

    await Project.findOneAndDelete({ _id: id, company_id });

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/add_request', authenticateToken, async (req, res) => {
  try {
    const { username, company_id, id } = req.token;
    const { requestType, title, details, startDate, endDate } = req.body;

    // ✅ get current user
    const user = await User.findById(id);

    if (!user){
      return res.json({success:false, error: "no user"})
    }

    if (!user || !user.bossEmail) {
      return res.json({
        success: false,
        error: "Boss email not found for user"
      });
    }

    // ✅ create request
    const request = await Request.create({
      company_id,
      username,
      requestType,
      title,
      details,
      startDate,
      endDate,
      status: "pending"
    });

    const approveLink = `https://hermes-ib9a.onrender.com/approve/${request._id}`;

    await transporter.sendMail({
      from: process.env.EMAIL, // ✅ use env
      to: user.bossEmail,
      subject: 'Leave Request Approval',
      html: `
        <h2>Leave Request</h2>
        <p><b>Employee:</b> ${username}</p>
        <p><b>Title:</b> ${title}</p>
        <p><b>Details:</b> ${details}</p>
        <p><b>Dates:</b> ${startDate} → ${endDate}</p>

        <a href="${approveLink}" 
          style="padding:10px 20px; background:green; color:white;">
          Approve
        </a>
      `
    });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.json({ success: false, error: err.message });
  }
});

app.get('/approve/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const request = await Request.findById(id);
    if (!request) {
      return res.send("Request not found");
    }

    // ✅ prevent double approval
    if (request.status === "approved") {
      return res.send("⚠️ Already approved");
    }

    // ✅ update status
    request.status = "approved";
    await request.save();

    // ✅ find employee
    const user = await User.findOne({
      username: request.username,
      company_id: request.company_id
    });

    if (!user || !user.email) {
      console.log("No user email found");
    } else {
      // ✅ send email to employee
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: user.email,
        subject: "Your Leave Request was Approved ✅",
        html: `
          <h2>Good news 🎉</h2>
          <p>Your request has been approved.</p>

          <p><b>Title:</b> ${request.title}</p>
          <p><b>Details:</b> ${request.details}</p>
          <p><b>Dates:</b> ${request.startDate} → ${request.endDate}</p>

          <p>Status: <b style="color:green;">APPROVED</b></p>
        `
      });
    }

    res.send(`
      <h2>✅ Request Approved</h2>
      <p>${request.title} has been approved.</p>
    `);

  } catch (err) {
    console.error(err);
    res.send("Error approving request");
  }
});


app.listen(3000, () => console.log('Server running on http://localhost:3000'));

