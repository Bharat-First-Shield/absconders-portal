const express = require('express');
const cors = require('cors');
const criminalsRouter = require('./routes/criminals');

const app = express();

app.use(cors());
app.use(express.json());

// Mount the criminals router
app.use('/api/criminals', criminalsRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});