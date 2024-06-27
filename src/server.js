import app from './app.js';
import connectDB from './config/database.js';
import { responseHandler } from './utils/responseHandler.js';

// Database connection
connectDB();




// in last send message if routes not found
app.use((req, res, next) => {
  responseHandler.notFound(res, req.originalUrl);
});
// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
