const fetch = require("isomorphic-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const parseHtml = async (url: string) => {
  try {
    const response = await fetch(url);
    const text = await response.text();

    const {
      window: { document },
    } = await new JSDOM(text);

    let meta = {
      title: null,
      description: null,
      keywords: null,
    };

    let og = {
      image: null,
      url: null,
      title: null,
      type: null,
      description: null,
    };

    let twitter = {
      card: null,
      url: null,
      title: null,
      description: null,
      image: null,
    };

    // Loop through meta tags
    Object.keys(meta).forEach((key) => {
      if (key === "title") {
        const titleElement = document.querySelector("title");
        meta = {
          ...meta,
          [key]: titleElement.textContent,
        };
      } else {
        const element = document.querySelector(`meta[name="${key}"]`);

        if (element) {
          if (key === "keywords") {
            meta = {
              ...meta,
              // @ts-ignore
              [key]: element.getAttribute("content")?.split(", ") || [],
            };
            return;
          }

          meta = { ...meta, [key]: element.getAttribute("content") };
        }
      }
    });

    // Loop through OG tags
    Object.keys(og).forEach((key) => {
      const element = document.querySelector(`meta[property="og:${key}"]`);

      if (element) {
        og = { ...og, [key]: element.getAttribute("content") };
      }
    });

    // Loop through twitter tags
    Object.keys(twitter).forEach((key) => {
      const element = document.querySelector(`meta[name="twitter:${key}"]`);

      if (element) {
        twitter = {
          ...twitter,
          [key]: element.getAttribute("content"),
        };
      }
    });

    let headlines = {
      h1: null,
      h2: null,
      h3: null,
      h4: null,
      h5: null,
      h6: null,
    };

    // Loop through  headline tags
    Object.keys(headlines).forEach((key) => {
      const elements = document.querySelectorAll(key);

      if (elements.length > 0) {
        elements.forEach((elem) => {
          headlines = {
            ...headlines,
            [key]: [...(headlines[key] || []), elem.textContent],
          };
        });
      }
    });

    return {
      ...meta,
      og,
      twitter,
      headlines,
    };
  } catch (error) {
    return error;
  }
};

export default parseHtml;
