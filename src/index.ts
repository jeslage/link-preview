const fetch = require('isomorphic-fetch');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const buildObject = async (url: string) => {
  try {
    const response = await fetch(url);
    const text = await response.text();

    const {
      window: { document },
    } = await new JSDOM(text);

    let ogTags = {
      image: null,
      url: null,
      title: null,
      type: null,
      description: null,
    };

    let twitterTags = {
      card: null,
      url: null,
      title: null,
      description: null,
      image: null,
    };

    Object.keys(ogTags).forEach((key) => {
      const element = document.querySelector(`meta[property="og:${key}"]`);

      if (element) {
        ogTags = { ...ogTags, [key]: element.getAttribute('content') };
      }
    });

    Object.keys(twitterTags).forEach((key) => {
      const element = document.querySelector(`meta[name="twitter:${key}"]`);

      if (element) {
        twitterTags = {
          ...twitterTags,
          [key]: element.getAttribute('content'),
        };
      }
    });

    let domElements = {
      h1: null,
      h2: null,
      h3: null,
      h4: null,
      h5: null,
      h6: null,
    };

    Object.keys(domElements).forEach((key) => {
      const elements = document.querySelectorAll(key);

      if (elements.length > 0) {
        elements.forEach((elem) => {
          domElements = {
            ...domElements,
            [key]: [...(domElements[key] || []), elem.textContent],
          };
        });
      }
    });

    return { og: ogTags, twitter: twitterTags, elements: domElements };
  } catch (error) {
    return error;
  }
};

export default buildObject;
