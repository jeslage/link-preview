import express from 'express';
import * as bodyParser from 'body-parser';
import cors from 'cors';

import buildObject from './index';

const app = express();

app.use(cors());

app.set('port', process.env.PORT || 3000);

const cache = {};

// parse application/json
app.use(bodyParser.json());

// API Endpoints
app.post('/', async (req, res) => {
  if (
    cache[req.body.url] &&
    cache[req.body.url].lastUpdated >
      Date.now() - (req.body.cacheDuration || 5184000000)
  ) {
    return res.json({ cache: true, ...cache[req.body.url] });
  }

  const object = await buildObject(req.body.url);

  const response = {
    lastUpdated: Date.now(),
    ...object,
  };

  cache[req.body.url] = response;

  return res.json({ cache: false, ...response });
});

// export our app
export default app;
