// models.js

const bcrypt = require('bcrypt');

const mongoose = require('mongoose');
const { Schema, Types } = mongoose;
const ObjectId = Schema.Types.ObjectId;


const CompanySchema = new Schema({
  company_id:  {type:String, required: true, trim: true},
  company_name:{ type: String, required: true, trim: true },
  passkey:     { type: String, required: true }, // hashed
}, { timestamps: true });

CompanySchema.index({ company_name: 1 }, { unique: true });

CompanySchema.methods.comparePasskey = async function (plainPasskey) {
  return bcrypt.compare(plainPasskey, this.passkey);
};

const UserSchema = new Schema({
  company_id:   { type: String, required: true, index: true },
  username:        { type: String, required: true, trim: true },
  phone:       { type: String, trim: true },
  password:{ type: String, required: true},
  email: {type:String, required:false,trim:true},
  bossEmail: { type: String, trim: true },
  roles:       { type: String, enum: ['admin','member'], default: ['member']},
  status:      { type: String, enum: ['active','disabled','invited'], default: 'active' },
  joinedAt:     { type: Date, default: Date.now }
}, { timestamps: true });


UserSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

const TeamSchema = new Schema({
  company_id:   { type:String, required: true, index: true },
  name:        { type: String, required: true, trim: true },
  members:     { type: [String], default: [] },
}, { timestamps: true });

TeamSchema.index({ company_id: 1, name: 1 }, { unique: true });


const ProjectSchema = new Schema({
  company_id: { type: String, required: true, index: true },

  name: { 
    type: String, 
    required: true, 
    trim: true 
  },

  team_name: { 
    type: String, 
    required: true, 
    trim: true 
  },

  status: { 
    type: String, 
    enum: ['todo', 'in_progress', 'completed'], 
    default: 'todo' 
  },

  deadline: { type: Date },

  progress: { 
    type: Number, 
    min: 0, 
    max: 100, 
    default: 0 
  }

}, { timestamps: true });

ProjectSchema.index({ company_id: 1, name: 1 });

const FileSchema = new Schema({
  company_id:        { type: String, required: true, index: true },
  filename:         { type: String, required: true, trim: true },
  mime:             { type: String, required: true, trim: true },
  size:             { type: Number, required: true },                 // enforce 5MB in API
  storageType:      { type: String, enum: ['local'], default: 'local' },
  storageKey:       { type: String, required: true },                 // absolute/safe path
  checksum:         { type: String, default: null },                  // optional md5/sha256

  // Sharing
  visibility:       { type: String, enum: ['private','team','company','custom'], default: 'private' },
  createdAt:        { type: Date, default: Date.now }
});

FileSchema.index({ company_id: 1, createdAt: -1 });


const LogSchema = new Schema({
  company_id:  { type: String, required: true, index: true },
  username: {type:String, required: true, index:true},
  action:     { type: String, enum: ['create','update','delete','login','upload'], required: true },
  message:    { type: String, default: '' },                              // { field: [old, new], ... }
  time:       { type: Date, default: Date.now }                          // explicit timestamp
});

LogSchema.index({ company_id: 1, time: -1 });

const TaskSchema = new mongoose.Schema({
  company_id: {
    type: String,
    required: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },

  startHour: { type: Number, required: true, min: 1, max: 12 },
  startMinute: { type: Number, required: true, min: 0, max: 59 },
  startPeriod: { type: String, required: true, enum: ['AM', 'PM'] },

  endHour: { type: Number, required: true, min: 1, max: 12 },
  endMinute: { type: Number, required: true, min: 0, max: 59 },
  endPeriod: { type: String, required: true, enum: ['AM', 'PM'] },

  totalStart: { type: Number, required: true }, // minutes since midnight
  totalEnd: { type: Number, required: true },

  note: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, { timestamps: true });


// Fast lookup per day per user
TaskSchema.index({ company_id: 1, username: 1, date: 1 });


const RequestSchema = new mongoose.Schema({
  company_id: { type: String, required: true, index: true },
  username: { type: String, required: true },
  requestType: String,
  title: String,
  details: String,
  startDate: String,
  endDate: String,
  status: { type: String, default: "pending" }
}, { timestamps: true });



const Company = mongoose.model('Company', CompanySchema, 'company');
const User    = mongoose.model('User',    UserSchema);
const Task = mongoose.model('Task', TaskSchema);
const Team    = mongoose.model('Team',    TeamSchema);
const Project = mongoose.model('Project', ProjectSchema);
const File    = mongoose.model('File',    FileSchema);
const Log     = mongoose.model('Log',     LogSchema);
const Request = mongoose.model("Request", RequestSchema);


module.exports = { Company, User, Task, Team, Project, File, Log, Request }; 
