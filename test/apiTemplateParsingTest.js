var api = require('../lib/protocol/api');
var parser = require('../lib/protocol/parser');
var assert = require('assert');
var defs = require('../lib/protocol/definitions');

var buf = Buffer.alloc(2400);

// Mock out data for a "simple template" (ie No message sets)
let buildTemplateData = function(template) {
  var res = {};
  for(var i = 0; i < template.length; i++) {
    var key = Object.keys(template[i]);
    key = key[0];
    switch(template[i][key]) {
      case 'int8':
      case 'int16':
      case 'int32':
      case 'int64':
        res[key] = 22;
        break;

      case 'array':
        i++;
        res[key] = [buildData(template[i])];
        break;

      case 'string':
        res[key] = 'string';
        break;

      case 'bytes':
        res[key] = new Buffer('woot');
        break;

      case 'object':
        i++;
        res[key] = buildData(template[i]);
        break;

      case 'error':
        res[key] = defs.ERRORS[0];
        break;

      default:
        throw new Error('Test cannot build data for type: ' + template[i][key]);
    }
  }
  return res;
};

describe('The api templates', () => {
  describe('when encoding/decoding the requests', () => {
    for(var template in api) {
      // Ignore header and message since they do not have request response templates
      // Ignore fetch and produce because they have message sets
      if(['Header', 'Message', 'Produce'].includes(template)) continue;

      // Ignore unimplemented api messages
      if(api[template] == null) continue;

      it('data should stay consistent across processing for Template: ' + template, function(curTemplate) {
        var reqData = buildTemplateData(curTemplate.request);
        var reqRes;
        parser.encode(reqData, curTemplate.request, buf, 0);
        [reqRes] = parser.decode(curTemplate.request, buf, 0);
        assert.deepEqual(reqRes, reqData);
      }.bind(this, api[template]));
    }
  });

  describe('when encoding/decoding the responses', () => {
    for(var template in api) {
      // Ignore header and message since they do not have request response templates
      // Ignore fetch and produce because they have message sets
      if(['Header', 'Message', 'Fetch'].includes(template)) continue;

      // Ignore unimplemented api messages
      if(api[template] == null) continue;

      it('data should stay consistent across processing for Template: ' + template, function(curTemplate) {
        var resData = buildTemplateData(curTemplate.response);
        var resRes;
        parser.encode(resData, curTemplate.response, buf, 0);
        [resRes] = parser.decode(curTemplate.response, buf, 0);
        assert.deepEqual(resRes, resData);
      }.bind(this, api[template]));
    }
  });
});
