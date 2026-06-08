import app from './app.js';
import { port } from './config/index.js';

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
