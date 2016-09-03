module.exports = class ParserError extends Error {
  constructor(message) {
    super('[Protocol Parse Error]: ' + message);
  }
};
