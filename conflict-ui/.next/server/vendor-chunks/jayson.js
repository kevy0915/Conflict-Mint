"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/jayson";
exports.ids = ["vendor-chunks/jayson"];
exports.modules = {

/***/ "(ssr)/./node_modules/jayson/lib/client/browser/index.js":
/*!*********************************************************!*\
  !*** ./node_modules/jayson/lib/client/browser/index.js ***!
  \*********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\n\nconst uuid = (__webpack_require__(/*! uuid */ \"(ssr)/./node_modules/uuid/dist/esm-node/index.js\").v4);\nconst generateRequest = __webpack_require__(/*! ../../generateRequest */ \"(ssr)/./node_modules/jayson/lib/generateRequest.js\");\n\n/**\n * Constructor for a Jayson Browser Client that does not depend any node.js core libraries\n * @class ClientBrowser\n * @param {Function} callServer Method that calls the server, receives the stringified request and a regular node-style callback\n * @param {Object} [options]\n * @param {Function} [options.reviver] Reviver function for JSON\n * @param {Function} [options.replacer] Replacer function for JSON\n * @param {Number} [options.version=2] JSON-RPC version to use (1|2)\n * @param {Function} [options.generator] Function to use for generating request IDs\n *  @param {Boolean} [options.notificationIdNull=false] When true, version 2 requests will set id to null instead of omitting it\n * @return {ClientBrowser}\n */\nconst ClientBrowser = function(callServer, options) {\n  if(!(this instanceof ClientBrowser)) {\n    return new ClientBrowser(callServer, options);\n  }\n\n  if (!options) {\n    options = {};\n  }\n\n  this.options = {\n    reviver: typeof options.reviver !== 'undefined' ? options.reviver : null,\n    replacer: typeof options.replacer !== 'undefined' ? options.replacer : null,\n    generator: typeof options.generator !== 'undefined' ? options.generator : function() { return uuid(); },\n    version: typeof options.version !== 'undefined' ? options.version : 2,\n    notificationIdNull: typeof options.notificationIdNull === 'boolean' ? options.notificationIdNull : false,\n  };\n\n  this.callServer = callServer;\n};\n\nmodule.exports = ClientBrowser;\n\n/**\n *  Creates a request and dispatches it if given a callback.\n *  @param {String|Array} method A batch request if passed an Array, or a method name if passed a String\n *  @param {Array|Object} [params] Parameters for the method\n *  @param {String|Number} [id] Optional id. If undefined an id will be generated. If null it creates a notification request\n *  @param {Function} [callback] Request callback. If specified, executes the request rather than only returning it.\n *  @throws {TypeError} Invalid parameters\n *  @return {Object} JSON-RPC 1.0 or 2.0 compatible request\n */\nClientBrowser.prototype.request = function(method, params, id, callback) {\n  const self = this;\n  let request = null;\n\n  // is this a batch request?\n  const isBatch = Array.isArray(method) && typeof params === 'function';\n\n  if (this.options.version === 1 && isBatch) {\n    throw new TypeError('JSON-RPC 1.0 does not support batching');\n  }\n\n  // is this a raw request?\n  const isRaw = !isBatch && method && typeof method === 'object' && typeof params === 'function';\n\n  if(isBatch || isRaw) {\n    callback = params;\n    request = method;\n  } else {\n    if(typeof id === 'function') {\n      callback = id;\n      // specifically undefined because \"null\" is a notification request\n      id = undefined;\n    }\n\n    const hasCallback = typeof callback === 'function';\n\n    try {\n      request = generateRequest(method, params, id, {\n        generator: this.options.generator,\n        version: this.options.version,\n        notificationIdNull: this.options.notificationIdNull,\n      });\n    } catch(err) {\n      if(hasCallback) {\n        return callback(err);\n      }\n      throw err;\n    }\n\n    // no callback means we should just return a raw request\n    if(!hasCallback) {\n      return request;\n    }\n\n  }\n\n  let message;\n  try {\n    message = JSON.stringify(request, this.options.replacer);\n  } catch(err) {\n    return callback(err);\n  }\n\n  this.callServer(message, function(err, response) {\n    self._parseResponse(err, response, callback);\n  });\n\n  // always return the raw request\n  return request;\n};\n\n/**\n * Parses a response from a server\n * @param {Object} err Error to pass on that is unrelated to the actual response\n * @param {String} responseText JSON-RPC 1.0 or 2.0 response\n * @param {Function} callback Callback that will receive different arguments depending on the amount of parameters\n * @private\n */\nClientBrowser.prototype._parseResponse = function(err, responseText, callback) {\n  if(err) {\n    callback(err);\n    return;\n  }\n\n  if(!responseText) {\n    // empty response text, assume that is correct because it could be a\n    // notification which jayson does not give any body for\n    return callback();\n  }\n\n  let response;\n  try {\n    response = JSON.parse(responseText, this.options.reviver);\n  } catch(err) {\n    return callback(err);\n  }\n\n  if(callback.length === 3) {\n    // if callback length is 3, we split callback arguments on error and response\n\n    // is batch response?\n    if(Array.isArray(response)) {\n\n      // neccesary to split strictly on validity according to spec here\n      const isError = function(res) {\n        return typeof res.error !== 'undefined';\n      };\n\n      const isNotError = function (res) {\n        return !isError(res);\n      };\n\n      return callback(null, response.filter(isError), response.filter(isNotError));\n    \n    } else {\n\n      // split regardless of validity\n      return callback(null, response.error, response.result);\n    \n    }\n  \n  }\n\n  callback(null, response);\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvamF5c29uL2xpYi9jbGllbnQvYnJvd3Nlci9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBYTs7QUFFYixhQUFhLHdGQUFrQjtBQUMvQix3QkFBd0IsbUJBQU8sQ0FBQyxpRkFBdUI7O0FBRXZEO0FBQ0E7QUFDQTtBQUNBLFdBQVcsVUFBVTtBQUNyQixXQUFXLFFBQVE7QUFDbkIsV0FBVyxVQUFVO0FBQ3JCLFdBQVcsVUFBVTtBQUNyQixXQUFXLFFBQVE7QUFDbkIsV0FBVyxVQUFVO0FBQ3JCLFlBQVksU0FBUztBQUNyQixZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsMkZBQTJGLGdCQUFnQjtBQUMzRztBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsWUFBWSxjQUFjO0FBQzFCLFlBQVksY0FBYztBQUMxQixZQUFZLGVBQWU7QUFDM0IsWUFBWSxVQUFVO0FBQ3RCLGFBQWEsV0FBVztBQUN4QixhQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixXQUFXLFVBQVU7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxNQUFNOztBQUVOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbmV4dC1taW50ZXItdWkvLi9ub2RlX21vZHVsZXMvamF5c29uL2xpYi9jbGllbnQvYnJvd3Nlci9pbmRleC5qcz9jM2QwIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuY29uc3QgdXVpZCA9IHJlcXVpcmUoJ3V1aWQnKS52NDtcbmNvbnN0IGdlbmVyYXRlUmVxdWVzdCA9IHJlcXVpcmUoJy4uLy4uL2dlbmVyYXRlUmVxdWVzdCcpO1xuXG4vKipcbiAqIENvbnN0cnVjdG9yIGZvciBhIEpheXNvbiBCcm93c2VyIENsaWVudCB0aGF0IGRvZXMgbm90IGRlcGVuZCBhbnkgbm9kZS5qcyBjb3JlIGxpYnJhcmllc1xuICogQGNsYXNzIENsaWVudEJyb3dzZXJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxTZXJ2ZXIgTWV0aG9kIHRoYXQgY2FsbHMgdGhlIHNlcnZlciwgcmVjZWl2ZXMgdGhlIHN0cmluZ2lmaWVkIHJlcXVlc3QgYW5kIGEgcmVndWxhciBub2RlLXN0eWxlIGNhbGxiYWNrXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbb3B0aW9ucy5yZXZpdmVyXSBSZXZpdmVyIGZ1bmN0aW9uIGZvciBKU09OXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbb3B0aW9ucy5yZXBsYWNlcl0gUmVwbGFjZXIgZnVuY3Rpb24gZm9yIEpTT05cbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy52ZXJzaW9uPTJdIEpTT04tUlBDIHZlcnNpb24gdG8gdXNlICgxfDIpXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbb3B0aW9ucy5nZW5lcmF0b3JdIEZ1bmN0aW9uIHRvIHVzZSBmb3IgZ2VuZXJhdGluZyByZXF1ZXN0IElEc1xuICogIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMubm90aWZpY2F0aW9uSWROdWxsPWZhbHNlXSBXaGVuIHRydWUsIHZlcnNpb24gMiByZXF1ZXN0cyB3aWxsIHNldCBpZCB0byBudWxsIGluc3RlYWQgb2Ygb21pdHRpbmcgaXRcbiAqIEByZXR1cm4ge0NsaWVudEJyb3dzZXJ9XG4gKi9cbmNvbnN0IENsaWVudEJyb3dzZXIgPSBmdW5jdGlvbihjYWxsU2VydmVyLCBvcHRpb25zKSB7XG4gIGlmKCEodGhpcyBpbnN0YW5jZW9mIENsaWVudEJyb3dzZXIpKSB7XG4gICAgcmV0dXJuIG5ldyBDbGllbnRCcm93c2VyKGNhbGxTZXJ2ZXIsIG9wdGlvbnMpO1xuICB9XG5cbiAgaWYgKCFvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IHt9O1xuICB9XG5cbiAgdGhpcy5vcHRpb25zID0ge1xuICAgIHJldml2ZXI6IHR5cGVvZiBvcHRpb25zLnJldml2ZXIgIT09ICd1bmRlZmluZWQnID8gb3B0aW9ucy5yZXZpdmVyIDogbnVsbCxcbiAgICByZXBsYWNlcjogdHlwZW9mIG9wdGlvbnMucmVwbGFjZXIgIT09ICd1bmRlZmluZWQnID8gb3B0aW9ucy5yZXBsYWNlciA6IG51bGwsXG4gICAgZ2VuZXJhdG9yOiB0eXBlb2Ygb3B0aW9ucy5nZW5lcmF0b3IgIT09ICd1bmRlZmluZWQnID8gb3B0aW9ucy5nZW5lcmF0b3IgOiBmdW5jdGlvbigpIHsgcmV0dXJuIHV1aWQoKTsgfSxcbiAgICB2ZXJzaW9uOiB0eXBlb2Ygb3B0aW9ucy52ZXJzaW9uICE9PSAndW5kZWZpbmVkJyA/IG9wdGlvbnMudmVyc2lvbiA6IDIsXG4gICAgbm90aWZpY2F0aW9uSWROdWxsOiB0eXBlb2Ygb3B0aW9ucy5ub3RpZmljYXRpb25JZE51bGwgPT09ICdib29sZWFuJyA/IG9wdGlvbnMubm90aWZpY2F0aW9uSWROdWxsIDogZmFsc2UsXG4gIH07XG5cbiAgdGhpcy5jYWxsU2VydmVyID0gY2FsbFNlcnZlcjtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2xpZW50QnJvd3NlcjtcblxuLyoqXG4gKiAgQ3JlYXRlcyBhIHJlcXVlc3QgYW5kIGRpc3BhdGNoZXMgaXQgaWYgZ2l2ZW4gYSBjYWxsYmFjay5cbiAqICBAcGFyYW0ge1N0cmluZ3xBcnJheX0gbWV0aG9kIEEgYmF0Y2ggcmVxdWVzdCBpZiBwYXNzZWQgYW4gQXJyYXksIG9yIGEgbWV0aG9kIG5hbWUgaWYgcGFzc2VkIGEgU3RyaW5nXG4gKiAgQHBhcmFtIHtBcnJheXxPYmplY3R9IFtwYXJhbXNdIFBhcmFtZXRlcnMgZm9yIHRoZSBtZXRob2RcbiAqICBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ9IFtpZF0gT3B0aW9uYWwgaWQuIElmIHVuZGVmaW5lZCBhbiBpZCB3aWxsIGJlIGdlbmVyYXRlZC4gSWYgbnVsbCBpdCBjcmVhdGVzIGEgbm90aWZpY2F0aW9uIHJlcXVlc3RcbiAqICBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIFJlcXVlc3QgY2FsbGJhY2suIElmIHNwZWNpZmllZCwgZXhlY3V0ZXMgdGhlIHJlcXVlc3QgcmF0aGVyIHRoYW4gb25seSByZXR1cm5pbmcgaXQuXG4gKiAgQHRocm93cyB7VHlwZUVycm9yfSBJbnZhbGlkIHBhcmFtZXRlcnNcbiAqICBAcmV0dXJuIHtPYmplY3R9IEpTT04tUlBDIDEuMCBvciAyLjAgY29tcGF0aWJsZSByZXF1ZXN0XG4gKi9cbkNsaWVudEJyb3dzZXIucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbihtZXRob2QsIHBhcmFtcywgaWQsIGNhbGxiYWNrKSB7XG4gIGNvbnN0IHNlbGYgPSB0aGlzO1xuICBsZXQgcmVxdWVzdCA9IG51bGw7XG5cbiAgLy8gaXMgdGhpcyBhIGJhdGNoIHJlcXVlc3Q/XG4gIGNvbnN0IGlzQmF0Y2ggPSBBcnJheS5pc0FycmF5KG1ldGhvZCkgJiYgdHlwZW9mIHBhcmFtcyA9PT0gJ2Z1bmN0aW9uJztcblxuICBpZiAodGhpcy5vcHRpb25zLnZlcnNpb24gPT09IDEgJiYgaXNCYXRjaCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0pTT04tUlBDIDEuMCBkb2VzIG5vdCBzdXBwb3J0IGJhdGNoaW5nJyk7XG4gIH1cblxuICAvLyBpcyB0aGlzIGEgcmF3IHJlcXVlc3Q/XG4gIGNvbnN0IGlzUmF3ID0gIWlzQmF0Y2ggJiYgbWV0aG9kICYmIHR5cGVvZiBtZXRob2QgPT09ICdvYmplY3QnICYmIHR5cGVvZiBwYXJhbXMgPT09ICdmdW5jdGlvbic7XG5cbiAgaWYoaXNCYXRjaCB8fCBpc1Jhdykge1xuICAgIGNhbGxiYWNrID0gcGFyYW1zO1xuICAgIHJlcXVlc3QgPSBtZXRob2Q7XG4gIH0gZWxzZSB7XG4gICAgaWYodHlwZW9mIGlkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjYWxsYmFjayA9IGlkO1xuICAgICAgLy8gc3BlY2lmaWNhbGx5IHVuZGVmaW5lZCBiZWNhdXNlIFwibnVsbFwiIGlzIGEgbm90aWZpY2F0aW9uIHJlcXVlc3RcbiAgICAgIGlkID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNvbnN0IGhhc0NhbGxiYWNrID0gdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nO1xuXG4gICAgdHJ5IHtcbiAgICAgIHJlcXVlc3QgPSBnZW5lcmF0ZVJlcXVlc3QobWV0aG9kLCBwYXJhbXMsIGlkLCB7XG4gICAgICAgIGdlbmVyYXRvcjogdGhpcy5vcHRpb25zLmdlbmVyYXRvcixcbiAgICAgICAgdmVyc2lvbjogdGhpcy5vcHRpb25zLnZlcnNpb24sXG4gICAgICAgIG5vdGlmaWNhdGlvbklkTnVsbDogdGhpcy5vcHRpb25zLm5vdGlmaWNhdGlvbklkTnVsbCxcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2goZXJyKSB7XG4gICAgICBpZihoYXNDYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgIH1cbiAgICAgIHRocm93IGVycjtcbiAgICB9XG5cbiAgICAvLyBubyBjYWxsYmFjayBtZWFucyB3ZSBzaG91bGQganVzdCByZXR1cm4gYSByYXcgcmVxdWVzdFxuICAgIGlmKCFoYXNDYWxsYmFjaykge1xuICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfVxuXG4gIH1cblxuICBsZXQgbWVzc2FnZTtcbiAgdHJ5IHtcbiAgICBtZXNzYWdlID0gSlNPTi5zdHJpbmdpZnkocmVxdWVzdCwgdGhpcy5vcHRpb25zLnJlcGxhY2VyKTtcbiAgfSBjYXRjaChlcnIpIHtcbiAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgfVxuXG4gIHRoaXMuY2FsbFNlcnZlcihtZXNzYWdlLCBmdW5jdGlvbihlcnIsIHJlc3BvbnNlKSB7XG4gICAgc2VsZi5fcGFyc2VSZXNwb25zZShlcnIsIHJlc3BvbnNlLCBjYWxsYmFjayk7XG4gIH0pO1xuXG4gIC8vIGFsd2F5cyByZXR1cm4gdGhlIHJhdyByZXF1ZXN0XG4gIHJldHVybiByZXF1ZXN0O1xufTtcblxuLyoqXG4gKiBQYXJzZXMgYSByZXNwb25zZSBmcm9tIGEgc2VydmVyXG4gKiBAcGFyYW0ge09iamVjdH0gZXJyIEVycm9yIHRvIHBhc3Mgb24gdGhhdCBpcyB1bnJlbGF0ZWQgdG8gdGhlIGFjdHVhbCByZXNwb25zZVxuICogQHBhcmFtIHtTdHJpbmd9IHJlc3BvbnNlVGV4dCBKU09OLVJQQyAxLjAgb3IgMi4wIHJlc3BvbnNlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayB0aGF0IHdpbGwgcmVjZWl2ZSBkaWZmZXJlbnQgYXJndW1lbnRzIGRlcGVuZGluZyBvbiB0aGUgYW1vdW50IG9mIHBhcmFtZXRlcnNcbiAqIEBwcml2YXRlXG4gKi9cbkNsaWVudEJyb3dzZXIucHJvdG90eXBlLl9wYXJzZVJlc3BvbnNlID0gZnVuY3Rpb24oZXJyLCByZXNwb25zZVRleHQsIGNhbGxiYWNrKSB7XG4gIGlmKGVycikge1xuICAgIGNhbGxiYWNrKGVycik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYoIXJlc3BvbnNlVGV4dCkge1xuICAgIC8vIGVtcHR5IHJlc3BvbnNlIHRleHQsIGFzc3VtZSB0aGF0IGlzIGNvcnJlY3QgYmVjYXVzZSBpdCBjb3VsZCBiZSBhXG4gICAgLy8gbm90aWZpY2F0aW9uIHdoaWNoIGpheXNvbiBkb2VzIG5vdCBnaXZlIGFueSBib2R5IGZvclxuICAgIHJldHVybiBjYWxsYmFjaygpO1xuICB9XG5cbiAgbGV0IHJlc3BvbnNlO1xuICB0cnkge1xuICAgIHJlc3BvbnNlID0gSlNPTi5wYXJzZShyZXNwb25zZVRleHQsIHRoaXMub3B0aW9ucy5yZXZpdmVyKTtcbiAgfSBjYXRjaChlcnIpIHtcbiAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgfVxuXG4gIGlmKGNhbGxiYWNrLmxlbmd0aCA9PT0gMykge1xuICAgIC8vIGlmIGNhbGxiYWNrIGxlbmd0aCBpcyAzLCB3ZSBzcGxpdCBjYWxsYmFjayBhcmd1bWVudHMgb24gZXJyb3IgYW5kIHJlc3BvbnNlXG5cbiAgICAvLyBpcyBiYXRjaCByZXNwb25zZT9cbiAgICBpZihBcnJheS5pc0FycmF5KHJlc3BvbnNlKSkge1xuXG4gICAgICAvLyBuZWNjZXNhcnkgdG8gc3BsaXQgc3RyaWN0bHkgb24gdmFsaWRpdHkgYWNjb3JkaW5nIHRvIHNwZWMgaGVyZVxuICAgICAgY29uc3QgaXNFcnJvciA9IGZ1bmN0aW9uKHJlcykge1xuICAgICAgICByZXR1cm4gdHlwZW9mIHJlcy5lcnJvciAhPT0gJ3VuZGVmaW5lZCc7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBpc05vdEVycm9yID0gZnVuY3Rpb24gKHJlcykge1xuICAgICAgICByZXR1cm4gIWlzRXJyb3IocmVzKTtcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCByZXNwb25zZS5maWx0ZXIoaXNFcnJvciksIHJlc3BvbnNlLmZpbHRlcihpc05vdEVycm9yKSk7XG4gICAgXG4gICAgfSBlbHNlIHtcblxuICAgICAgLy8gc3BsaXQgcmVnYXJkbGVzcyBvZiB2YWxpZGl0eVxuICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIHJlc3BvbnNlLmVycm9yLCByZXNwb25zZS5yZXN1bHQpO1xuICAgIFxuICAgIH1cbiAgXG4gIH1cblxuICBjYWxsYmFjayhudWxsLCByZXNwb25zZSk7XG59O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/jayson/lib/client/browser/index.js\n");

/***/ }),

/***/ "(ssr)/./node_modules/jayson/lib/generateRequest.js":
/*!****************************************************!*\
  !*** ./node_modules/jayson/lib/generateRequest.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\n\nconst uuid = (__webpack_require__(/*! uuid */ \"(ssr)/./node_modules/uuid/dist/esm-node/index.js\").v4);\n\n/**\n *  Generates a JSON-RPC 1.0 or 2.0 request\n *  @param {String} method Name of method to call\n *  @param {Array|Object} params Array of parameters passed to the method as specified, or an object of parameter names and corresponding value\n *  @param {String|Number|null} [id] Request ID can be a string, number, null for explicit notification or left out for automatic generation\n *  @param {Object} [options]\n *  @param {Number} [options.version=2] JSON-RPC version to use (1 or 2)\n *  @param {Boolean} [options.notificationIdNull=false] When true, version 2 requests will set id to null instead of omitting it\n *  @param {Function} [options.generator] Passed the request, and the options object and is expected to return a request ID\n *  @throws {TypeError} If any of the parameters are invalid\n *  @return {Object} A JSON-RPC 1.0 or 2.0 request\n *  @memberOf Utils\n */\nconst generateRequest = function(method, params, id, options) {\n  if(typeof method !== 'string') {\n    throw new TypeError(method + ' must be a string');\n  }\n\n  options = options || {};\n\n  // check valid version provided\n  const version = typeof options.version === 'number' ? options.version : 2;\n  if (version !== 1 && version !== 2) {\n    throw new TypeError(version + ' must be 1 or 2');\n  }\n\n  const request = {\n    method: method\n  };\n\n  if(version === 2) {\n    request.jsonrpc = '2.0';\n  }\n\n  if(params) {\n    // params given, but invalid?\n    if(typeof params !== 'object' && !Array.isArray(params)) {\n      throw new TypeError(params + ' must be an object, array or omitted');\n    }\n    request.params = params;\n  }\n\n  // if id was left out, generate one (null means explicit notification)\n  if(typeof(id) === 'undefined') {\n    const generator = typeof options.generator === 'function' ? options.generator : function() { return uuid(); };\n    request.id = generator(request, options);\n  } else if (version === 2 && id === null) {\n    // we have a version 2 notification\n    if (options.notificationIdNull) {\n      request.id = null; // id will not be set at all unless option provided\n    }\n  } else {\n    request.id = id;\n  }\n\n  return request;\n};\n\nmodule.exports = generateRequest;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvamF5c29uL2xpYi9nZW5lcmF0ZVJlcXVlc3QuanMiLCJtYXBwaW5ncyI6IkFBQWE7O0FBRWIsYUFBYSx3RkFBa0I7O0FBRS9CO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEIsWUFBWSxjQUFjO0FBQzFCLFlBQVksb0JBQW9CO0FBQ2hDLFlBQVksUUFBUTtBQUNwQixZQUFZLFFBQVE7QUFDcEIsWUFBWSxTQUFTO0FBQ3JCLFlBQVksVUFBVTtBQUN0QixhQUFhLFdBQVc7QUFDeEIsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGlHQUFpRztBQUNqRztBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSIsInNvdXJjZXMiOlsid2VicGFjazovL25leHQtbWludGVyLXVpLy4vbm9kZV9tb2R1bGVzL2pheXNvbi9saWIvZ2VuZXJhdGVSZXF1ZXN0LmpzPzVmM2QiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCB1dWlkID0gcmVxdWlyZSgndXVpZCcpLnY0O1xuXG4vKipcbiAqICBHZW5lcmF0ZXMgYSBKU09OLVJQQyAxLjAgb3IgMi4wIHJlcXVlc3RcbiAqICBAcGFyYW0ge1N0cmluZ30gbWV0aG9kIE5hbWUgb2YgbWV0aG9kIHRvIGNhbGxcbiAqICBAcGFyYW0ge0FycmF5fE9iamVjdH0gcGFyYW1zIEFycmF5IG9mIHBhcmFtZXRlcnMgcGFzc2VkIHRvIHRoZSBtZXRob2QgYXMgc3BlY2lmaWVkLCBvciBhbiBvYmplY3Qgb2YgcGFyYW1ldGVyIG5hbWVzIGFuZCBjb3JyZXNwb25kaW5nIHZhbHVlXG4gKiAgQHBhcmFtIHtTdHJpbmd8TnVtYmVyfG51bGx9IFtpZF0gUmVxdWVzdCBJRCBjYW4gYmUgYSBzdHJpbmcsIG51bWJlciwgbnVsbCBmb3IgZXhwbGljaXQgbm90aWZpY2F0aW9uIG9yIGxlZnQgb3V0IGZvciBhdXRvbWF0aWMgZ2VuZXJhdGlvblxuICogIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAqICBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMudmVyc2lvbj0yXSBKU09OLVJQQyB2ZXJzaW9uIHRvIHVzZSAoMSBvciAyKVxuICogIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMubm90aWZpY2F0aW9uSWROdWxsPWZhbHNlXSBXaGVuIHRydWUsIHZlcnNpb24gMiByZXF1ZXN0cyB3aWxsIHNldCBpZCB0byBudWxsIGluc3RlYWQgb2Ygb21pdHRpbmcgaXRcbiAqICBAcGFyYW0ge0Z1bmN0aW9ufSBbb3B0aW9ucy5nZW5lcmF0b3JdIFBhc3NlZCB0aGUgcmVxdWVzdCwgYW5kIHRoZSBvcHRpb25zIG9iamVjdCBhbmQgaXMgZXhwZWN0ZWQgdG8gcmV0dXJuIGEgcmVxdWVzdCBJRFxuICogIEB0aHJvd3Mge1R5cGVFcnJvcn0gSWYgYW55IG9mIHRoZSBwYXJhbWV0ZXJzIGFyZSBpbnZhbGlkXG4gKiAgQHJldHVybiB7T2JqZWN0fSBBIEpTT04tUlBDIDEuMCBvciAyLjAgcmVxdWVzdFxuICogIEBtZW1iZXJPZiBVdGlsc1xuICovXG5jb25zdCBnZW5lcmF0ZVJlcXVlc3QgPSBmdW5jdGlvbihtZXRob2QsIHBhcmFtcywgaWQsIG9wdGlvbnMpIHtcbiAgaWYodHlwZW9mIG1ldGhvZCAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKG1ldGhvZCArICcgbXVzdCBiZSBhIHN0cmluZycpO1xuICB9XG5cbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgLy8gY2hlY2sgdmFsaWQgdmVyc2lvbiBwcm92aWRlZFxuICBjb25zdCB2ZXJzaW9uID0gdHlwZW9mIG9wdGlvbnMudmVyc2lvbiA9PT0gJ251bWJlcicgPyBvcHRpb25zLnZlcnNpb24gOiAyO1xuICBpZiAodmVyc2lvbiAhPT0gMSAmJiB2ZXJzaW9uICE9PSAyKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcih2ZXJzaW9uICsgJyBtdXN0IGJlIDEgb3IgMicpO1xuICB9XG5cbiAgY29uc3QgcmVxdWVzdCA9IHtcbiAgICBtZXRob2Q6IG1ldGhvZFxuICB9O1xuXG4gIGlmKHZlcnNpb24gPT09IDIpIHtcbiAgICByZXF1ZXN0Lmpzb25ycGMgPSAnMi4wJztcbiAgfVxuXG4gIGlmKHBhcmFtcykge1xuICAgIC8vIHBhcmFtcyBnaXZlbiwgYnV0IGludmFsaWQ/XG4gICAgaWYodHlwZW9mIHBhcmFtcyAhPT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkocGFyYW1zKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihwYXJhbXMgKyAnIG11c3QgYmUgYW4gb2JqZWN0LCBhcnJheSBvciBvbWl0dGVkJyk7XG4gICAgfVxuICAgIHJlcXVlc3QucGFyYW1zID0gcGFyYW1zO1xuICB9XG5cbiAgLy8gaWYgaWQgd2FzIGxlZnQgb3V0LCBnZW5lcmF0ZSBvbmUgKG51bGwgbWVhbnMgZXhwbGljaXQgbm90aWZpY2F0aW9uKVxuICBpZih0eXBlb2YoaWQpID09PSAndW5kZWZpbmVkJykge1xuICAgIGNvbnN0IGdlbmVyYXRvciA9IHR5cGVvZiBvcHRpb25zLmdlbmVyYXRvciA9PT0gJ2Z1bmN0aW9uJyA/IG9wdGlvbnMuZ2VuZXJhdG9yIDogZnVuY3Rpb24oKSB7IHJldHVybiB1dWlkKCk7IH07XG4gICAgcmVxdWVzdC5pZCA9IGdlbmVyYXRvcihyZXF1ZXN0LCBvcHRpb25zKTtcbiAgfSBlbHNlIGlmICh2ZXJzaW9uID09PSAyICYmIGlkID09PSBudWxsKSB7XG4gICAgLy8gd2UgaGF2ZSBhIHZlcnNpb24gMiBub3RpZmljYXRpb25cbiAgICBpZiAob3B0aW9ucy5ub3RpZmljYXRpb25JZE51bGwpIHtcbiAgICAgIHJlcXVlc3QuaWQgPSBudWxsOyAvLyBpZCB3aWxsIG5vdCBiZSBzZXQgYXQgYWxsIHVubGVzcyBvcHRpb24gcHJvdmlkZWRcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmVxdWVzdC5pZCA9IGlkO1xuICB9XG5cbiAgcmV0dXJuIHJlcXVlc3Q7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdlbmVyYXRlUmVxdWVzdDtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/jayson/lib/generateRequest.js\n");

/***/ })

};
;