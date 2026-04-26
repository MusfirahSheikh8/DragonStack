const app = require('../app/index');
const port = 3003;
console.log("🚀 server.js file executed");

app.listen(port, () => console.log(`listening on port ${port}`));
