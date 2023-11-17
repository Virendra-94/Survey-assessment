const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;

// Connect to MongoDB (Replace 'your_mongodb_connection_string' with your MongoDB connection string)
mongoose.connect('mongodb+srv://virendra94:Virmongo@cluster0.lft28qr.mongodb.net/Survey?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use(bodyParser.json());

// Define MongoDB Schema for answers
// const answerSchema = new mongoose.Schema({
//   questionId: String,
//   answer: String,
// });
const answerSchema = new mongoose.Schema({
  sessionId: String,
  questionId: String,
  answer: String,
});

const Answer = mongoose.model('Answer', answerSchema);

// Import or define MongoDB Schema for questions
const questionSchema = new mongoose.Schema({
  text: String,
  type: String,
  options: { type: Number, default: 0 },
});


const Questions = mongoose.model('Question', questionSchema);

const generateSessionId = () => {
  // Generate a random string of characters (you can use a more sophisticated method)
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const sessionIdLength = 10;
  let sessionId = '';

  for (let i = 0; i < sessionIdLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    sessionId += characters[randomIndex];
  }

  return sessionId;
};

app.get('/api/questions', async (req, res) => {
    try {
      const questions = await Questions.find();
      //console.log('Fetched questions:', questions); // Log the fetched questions
      res.json(questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  
app.post('/api/save-answer', async (req, res) => {
  const { answers, sessionId } = req.body;

  try {
    // Save answers with session and question identifiers
    await Promise.all(
      answers.map(({ questionId, answer }) =>
        Answer.create({ sessionId, questionId, answer })
      )
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving answers:', error);
    res.json({ success: false, error: 'Error saving answers to the database' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
