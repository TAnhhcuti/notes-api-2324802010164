
require('dotenv').config();

const mongoose = require('mongoose');
const Note = require('../src/models/note');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Đồng bộ chỉ mục đã khai báo trong model
    await Note.syncIndexes();

    // Truy vấn quét toàn bộ collection
    const scan = await Note.find({ tags: 'docker' })
      .hint({ $natural: 1 })
      .explain('executionStats');

    // Truy vấn sử dụng chỉ mục tags
    const idx = await Note.find({ tags: 'docker' })
      .hint({ tags: 1 })
      .explain('executionStats');

    const a = scan.executionStats;
    const b = idx.executionStats;

    console.table({
      'Quét toàn bộ': {
        docsExamined: a.totalDocsExamined,
        returned: a.nReturned,
        ms: a.executionTimeMillis
      },
      'Dùng chỉ mục': {
        docsExamined: b.totalDocsExamined,
        returned: b.nReturned,
        ms: b.executionTimeMillis
      }
    });

    const ratio = b.totalDocsExamined === 0
      ? Infinity
      : a.totalDocsExamined / b.totalDocsExamined;

    console.log(
      `Chỉ mục giảm số tài liệu phải quét ${ratio.toFixed(2)} lần`
    );

  } catch (err) {
    console.error('Lỗi:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
