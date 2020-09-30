import express, { Request, Response } from "express";
import * as bodyParser from "body-parser";
import cors from "cors";
import memoryCache from "memory-cache";

import parseHtml from "./parseHtml";

const port = process.env.PORT || 5000;

const app = express();

app.use(cors());

// parse application/json
app.use(bodyParser.json());

// Validation middleware to simply check the url query param.
const validate = function (req: Request, res: Response, next) {
  const url = req.body.url;

  if (!url) {
    res.status(400).json({ message: "url key inside body is missing" });
    return;
  }

  if (
    !url.match(
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
    )
  ) {
    res.status(400).json({ message: "Invalid URL given." });
    return;
  }

  next();
};

// Function which returns an in memory cache middleware.
const cache = (duration: number) => {
  return (req: Request, res: Response, next) => {
    const key = req.body.url;

    // Try to get cached response using url param as key.
    const cachedResponse = memoryCache.get(key);

    if (cachedResponse) {
      // Send cached response.
      res.json(cachedResponse);
      return;
    }

    // If cached response not present,
    // pass the request to the actual handler.
    // @ts-ignore
    res.originalJSON = res.json;
    // @ts-ignore
    res.json = (result) => {
      // Cache the newly generated response for later use
      // and send it to the client.
      memoryCache.put(key, result, duration * 1000);
      // @ts-ignore
      res.originalJSON(result);
    };
    next();
  };
};

// API Endpoints
app.post("/", validate, cache(180), async (req, res) => {
  try {
    const object = await parseHtml(req.body.url);

    return res.json(object);
  } catch {
    res.status(500).send("Internal Server Error.");
  }
});

app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`);
});
