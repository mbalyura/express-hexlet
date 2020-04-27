import runServer from '../application.js';

const port = 8080;
runServer().listen(port, () => {
  console.log(`Server has been started on port http://127.0.0.1:${port}`)
});
