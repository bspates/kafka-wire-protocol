module.exports = class ParserError extends Error {
  constructor(one, field = null) {
    var preMsg;

    if(field != null) {
      preMsg = "[Parse Error On Template Field: '" + field + "']";
    }

    if(one.message) {
      if(preMsg != null) {
        super(preMsg);
      } else {
        super(one.message);
      }

      this.stack = one.message + '\n' + one.stack;
    } else {
      super(preMsg + one);
    }
  }
};
