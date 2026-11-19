
const express = require('express');
const os = require('os');
const notesRouter = require('./routes/notes');

const app = express();

app.use(express.json());

// API Bài 1 và Bài 2: Thông tin máy chủ
app.get('/', (req, res) => {
  res.json({
    message: 'Xin chào từ đám mây!',
    host: os.hostname(),
    platform: `${os.type()} ${os.release()}`,
    cpus: os.cpus().length,
    memoryGB: Number(
      (os.totalmem() / 1024 ** 3).toFixed(1)
    ),
    uptimeSec: Math.round(os.uptime()),
    time: new Date().toISOString()
  });
});

// API Bài 3: Quản lý ghi chú
app.use('/notes', notesRouter);

// Xử lý lỗi
app.use((err, req, res, next) => {
  console.error(err);

  const clientError =
    ['ValidationError', 'CastError'].includes(err.name) ||
    err.code === 'LIMIT_FILE_SIZE';

  res.status(clientError ? 400 : 500).json({
    error: clientError ? err.message : 'Lỗi máy chủ'
  });
});

module.exports = app;
