const mongoose = require('mongoose');
const Event = require('./models/Event');

mongoose.connect('mongodb://localhost:27017/event-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function cleanup() {
  const result = await Event.deleteMany({
    $or: [
      { description: { $exists: false } },
      { description: null }
    ]
  });
  console.log('Deleted events:', result.deletedCount);
  mongoose.disconnect();
}

cleanup(); 