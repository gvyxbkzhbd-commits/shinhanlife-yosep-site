import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import nodemailer from 'nodemailer';

dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(morgan('tiny'));
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*'}));

const db = await open({ filename: './data.db', driver: sqlite3.Database });
await db.exec(`
CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT, phone TEXT, method TEXT, datetime TEXT, note TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT, rating INTEGER, src TEXT, text TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`);

let transporter = null;
if(process.env.SMTP_HOST){
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

app.get('/api/health', (req,res)=>res.json({ok:true}));

app.get('/api/reservations', async (req,res)=>{
  const rows = await db.all('SELECT * FROM reservations ORDER BY id DESC LIMIT 200');
  res.json(rows);
});
app.post('/api/reservations', async (req,res)=>{
  const {name, phone, method, datetime, note} = req.body || {};
  if(!name || !phone || !datetime) return res.status(400).json({error:'missing fields'});
  const stmt = await db.run('INSERT INTO reservations(name,phone,method,datetime,note) VALUES(?,?,?,?,?)',
    [name,phone,method||'',datetime,note||'']);
  const row = await db.get('SELECT * FROM reservations WHERE id=?',[stmt.lastID]);
  if(transporter && process.env.NOTIFY_TO){
    try{
      await transporter.sendMail({
        from: process.env.NOTIFY_FROM || process.env.SMTP_USER,
        to: process.env.NOTIFY_TO,
        subject: `신규 상담 예약 - ${name}`,
        text: `이름: ${name}\n연락처: ${phone}\n방법: ${method}\n일시: ${datetime}\n메모: ${note||''}`
      });
    }catch(e){ console.error('email error', e.message); }
  }
  res.json(row);
});

app.get('/api/reviews', async (req,res)=>{
  const rows = await db.all('SELECT * FROM reviews ORDER BY id DESC LIMIT 200');
  res.json(rows);
});
app.post('/api/reviews', async (req,res)=>{
  const {name, rating, src, text} = req.body || {};
  if(!name || !rating || !text) return res.status(400).json({error:'missing fields'});
  const stmt = await db.run('INSERT INTO reviews(name,rating,src,text) VALUES(?,?,?,?)',
    [name, Number(rating), src||'', text]);
  const row = await db.get('SELECT * FROM reviews WHERE id=?',[stmt.lastID]);
  res.json(row);
});

const port = process.env.PORT || 10000;
app.listen(port, ()=>console.log('API running on port', port));
