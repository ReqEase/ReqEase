/*!
 * ReqEase v1.2.3
 * (c) HichemTech
 * Released under the MIT License.
 * Github: github.com/ReqEase/ReqEase
 */

/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 765:
/***/ (function(module, exports, __webpack_require__) {

/* module decorator */ module = __webpack_require__.nmd(module);
/*!
 * validate.js 0.13.1
 *
 * (c) 2013-2019 Nicklas Ansman, 2013 Wrapp
 * Validate.js may be freely distributed under the MIT license.
 * For all details and documentation:
 * http://validatejs.org/
 */

(function(exports, module, define) {
  "use strict";

  // The main function that calls the validators specified by the constraints.
  // The options are the following:
  //   - format (string) - An option that controls how the returned value is formatted
  //     * flat - Returns a flat array of just the error messages
  //     * grouped - Returns the messages grouped by attribute (default)
  //     * detailed - Returns an array of the raw validation data
  //   - fullMessages (boolean) - If `true` (default) the attribute name is prepended to the error.
  //
  // Please note that the options are also passed to each validator.
  var validate = function(attributes, constraints, options) {
    options = v.extend({}, v.options, options);

    var results = v.runValidations(attributes, constraints, options)
      , attr
      , validator;

    if (results.some(function(r) { return v.isPromise(r.error); })) {
      throw new Error("Use validate.async if you want support for promises");
    }
    return validate.processValidationResults(results, options);
  };

  var v = validate;

  // Copies over attributes from one or more sources to a single destination.
  // Very much similar to underscore's extend.
  // The first argument is the target object and the remaining arguments will be
  // used as sources.
  v.extend = function(obj) {
    [].slice.call(arguments, 1).forEach(function(source) {
      for (var attr in source) {
        obj[attr] = source[attr];
      }
    });
    return obj;
  };

  v.extend(validate, {
    // This is the version of the library as a semver.
    // The toString function will allow it to be coerced into a string
    version: {
      major: 0,
      minor: 13,
      patch: 1,
      metadata: null,
      toString: function() {
        var version = v.format("%{major}.%{minor}.%{patch}", v.version);
        if (!v.isEmpty(v.version.metadata)) {
          version += "+" + v.version.metadata;
        }
        return version;
      }
    },

    // Below is the dependencies that are used in validate.js

    // The constructor of the Promise implementation.
    // If you are using Q.js, RSVP or any other A+ compatible implementation
    // override this attribute to be the constructor of that promise.
    // Since jQuery promises aren't A+ compatible they won't work.
    Promise: typeof Promise !== "undefined" ? Promise : /* istanbul ignore next */ null,

    EMPTY_STRING_REGEXP: /^\s*$/,

    // Runs the validators specified by the constraints object.
    // Will return an array of the format:
    //     [{attribute: "<attribute name>", error: "<validation result>"}, ...]
    runValidations: function(attributes, constraints, options) {
      var results = []
        , attr
        , validatorName
        , value
        , validators
        , validator
        , validatorOptions
        , error;

      if (v.isDomElement(attributes) || v.isJqueryElement(attributes)) {
        attributes = v.collectFormValues(attributes);
      }

      // Loops through each constraints, finds the correct validator and run it.
      for (attr in constraints) {
        value = v.getDeepObjectValue(attributes, attr);
        // This allows the constraints for an attribute to be a function.
        // The function will be called with the value, attribute name, the complete dict of
        // attributes as well as the options and constraints passed in.
        // This is useful when you want to have different
        // validations depending on the attribute value.
        validators = v.result(constraints[attr], value, attributes, attr, options, constraints);

        for (validatorName in validators) {
          validator = v.validators[validatorName];

          if (!validator) {
            error = v.format("Unknown validator %{name}", {name: validatorName});
            throw new Error(error);
          }

          validatorOptions = validators[validatorName];
          // This allows the options to be a function. The function will be
          // called with the value, attribute name, the complete dict of
          // attributes as well as the options and constraints passed in.
          // This is useful when you want to have different
          // validations depending on the attribute value.
          validatorOptions = v.result(validatorOptions, value, attributes, attr, options, constraints);
          if (!validatorOptions) {
            continue;
          }
          results.push({
            attribute: attr,
            value: value,
            validator: validatorName,
            globalOptions: options,
            attributes: attributes,
            options: validatorOptions,
            error: validator.call(validator,
                value,
                validatorOptions,
                attr,
                attributes,
                options)
          });
        }
      }

      return results;
    },

    // Takes the output from runValidations and converts it to the correct
    // output format.
    processValidationResults: function(errors, options) {
      errors = v.pruneEmptyErrors(errors, options);
      errors = v.expandMultipleErrors(errors, options);
      errors = v.convertErrorMessages(errors, options);

      var format = options.format || "grouped";

      if (typeof v.formatters[format] === 'function') {
        errors = v.formatters[format](errors);
      } else {
        throw new Error(v.format("Unknown format %{format}", options));
      }

      return v.isEmpty(errors) ? undefined : errors;
    },

    // Runs the validations with support for promises.
    // This function will return a promise that is settled when all the
    // validation promises have been completed.
    // It can be called even if no validations returned a promise.
    async: function(attributes, constraints, options) {
      options = v.extend({}, v.async.options, options);

      var WrapErrors = options.wrapErrors || function(errors) {
        return errors;
      };

      // Removes unknown attributes
      if (options.cleanAttributes !== false) {
        attributes = v.cleanAttributes(attributes, constraints);
      }

      var results = v.runValidations(attributes, constraints, options);

      return new v.Promise(function(resolve, reject) {
        v.waitForResults(results).then(function() {
          var errors = v.processValidationResults(results, options);
          if (errors) {
            reject(new WrapErrors(errors, options, attributes, constraints));
          } else {
            resolve(attributes);
          }
        }, function(err) {
          reject(err);
        });
      });
    },

    single: function(value, constraints, options) {
      options = v.extend({}, v.single.options, options, {
        format: "flat",
        fullMessages: false
      });
      return v({single: value}, {single: constraints}, options);
    },

    // Returns a promise that is resolved when all promises in the results array
    // are settled. The promise returned from this function is always resolved,
    // never rejected.
    // This function modifies the input argument, it replaces the promises
    // with the value returned from the promise.
    waitForResults: function(results) {
      // Create a sequence of all the results starting with a resolved promise.
      return results.reduce(function(memo, result) {
        // If this result isn't a promise skip it in the sequence.
        if (!v.isPromise(result.error)) {
          return memo;
        }

        return memo.then(function() {
          return result.error.then(function(error) {
            result.error = error || null;
          });
        });
      }, new v.Promise(function(r) { r(); })); // A resolved promise
    },

    // If the given argument is a call: function the and: function return the value
    // otherwise just return the value. Additional arguments will be passed as
    // arguments to the function.
    // Example:
    // ```
    // result('foo') // 'foo'
    // result(Math.max, 1, 2) // 2
    // ```
    result: function(value) {
      var args = [].slice.call(arguments, 1);
      if (typeof value === 'function') {
        value = value.apply(null, args);
      }
      return value;
    },

    // Checks if the value is a number. This function does not consider NaN a
    // number like many other `isNumber` functions do.
    isNumber: function(value) {
      return typeof value === 'number' && !isNaN(value);
    },

    // Returns false if the object is not a function
    isFunction: function(value) {
      return typeof value === 'function';
    },

    // A simple check to verify that the value is an integer. Uses `isNumber`
    // and a simple modulo check.
    isInteger: function(value) {
      return v.isNumber(value) && value % 1 === 0;
    },

    // Checks if the value is a boolean
    isBoolean: function(value) {
      return typeof value === 'boolean';
    },

    // Uses the `Object` function to check if the given argument is an object.
    isObject: function(obj) {
      return obj === Object(obj);
    },

    // Simply checks if the object is an instance of a date
    isDate: function(obj) {
      return obj instanceof Date;
    },

    // Returns false if the object is `null` of `undefined`
    isDefined: function(obj) {
      return obj !== null && obj !== undefined;
    },

    // Checks if the given argument is a promise. Anything with a `then`
    // function is considered a promise.
    isPromise: function(p) {
      return !!p && v.isFunction(p.then);
    },

    isJqueryElement: function(o) {
      return o && v.isString(o.jquery);
    },

    isDomElement: function(o) {
      if (!o) {
        return false;
      }

      if (!o.querySelectorAll || !o.querySelector) {
        return false;
      }

      if (v.isObject(document) && o === document) {
        return true;
      }

      // http://stackoverflow.com/a/384380/699304
      /* istanbul ignore else */
      if (typeof HTMLElement === "object") {
        return o instanceof HTMLElement;
      } else {
        return o &&
          typeof o === "object" &&
          o !== null &&
          o.nodeType === 1 &&
          typeof o.nodeName === "string";
      }
    },

    isEmpty: function(value) {
      var attr;

      // Null and undefined are empty
      if (!v.isDefined(value)) {
        return true;
      }

      // functions are non empty
      if (v.isFunction(value)) {
        return false;
      }

      // Whitespace only strings are empty
      if (v.isString(value)) {
        return v.EMPTY_STRING_REGEXP.test(value);
      }

      // For arrays we use the length property
      if (v.isArray(value)) {
        return value.length === 0;
      }

      // Dates have no attributes but aren't empty
      if (v.isDate(value)) {
        return false;
      }

      // If we find at least one property we consider it non empty
      if (v.isObject(value)) {
        for (attr in value) {
          return false;
        }
        return true;
      }

      return false;
    },

    // Formats the specified strings with the given values like so:
    // ```
    // format("Foo: %{foo}", {foo: "bar"}) // "Foo bar"
    // ```
    // If you want to write %{...} without having it replaced simply
    // prefix it with % like this `Foo: %%{foo}` and it will be returned
    // as `"Foo: %{foo}"`
    format: v.extend(function(str, vals) {
      if (!v.isString(str)) {
        return str;
      }
      return str.replace(v.format.FORMAT_REGEXP, function(m0, m1, m2) {
        if (m1 === '%') {
          return "%{" + m2 + "}";
        } else {
          return String(vals[m2]);
        }
      });
    }, {
      // Finds %{key} style patterns in the given string
      FORMAT_REGEXP: /(%?)%\{([^\}]+)\}/g
    }),

    // "Prettifies" the given string.
    // Prettifying means replacing [.\_-] with spaces as well as splitting
    // camel case words.
    prettify: function(str) {
      if (v.isNumber(str)) {
        // If there are more than 2 decimals round it to two
        if ((str * 100) % 1 === 0) {
          return "" + str;
        } else {
          return parseFloat(Math.round(str * 100) / 100).toFixed(2);
        }
      }

      if (v.isArray(str)) {
        return str.map(function(s) { return v.prettify(s); }).join(", ");
      }

      if (v.isObject(str)) {
        if (!v.isDefined(str.toString)) {
          return JSON.stringify(str);
        }

        return str.toString();
      }

      // Ensure the string is actually a string
      str = "" + str;

      return str
        // Splits keys separated by periods
        .replace(/([^\s])\.([^\s])/g, '$1 $2')
        // Removes backslashes
        .replace(/\\+/g, '')
        // Replaces - and - with space
        .replace(/[_-]/g, ' ')
        // Splits camel cased words
        .replace(/([a-z])([A-Z])/g, function(m0, m1, m2) {
          return "" + m1 + " " + m2.toLowerCase();
        })
        .toLowerCase();
    },

    stringifyValue: function(value, options) {
      var prettify = options && options.prettify || v.prettify;
      return prettify(value);
    },

    isString: function(value) {
      return typeof value === 'string';
    },

    isArray: function(value) {
      return {}.toString.call(value) === '[object Array]';
    },

    // Checks if the object is a hash, which is equivalent to an object that
    // is neither an array nor a function.
    isHash: function(value) {
      return v.isObject(value) && !v.isArray(value) && !v.isFunction(value);
    },

    contains: function(obj, value) {
      if (!v.isDefined(obj)) {
        return false;
      }
      if (v.isArray(obj)) {
        return obj.indexOf(value) !== -1;
      }
      return value in obj;
    },

    unique: function(array) {
      if (!v.isArray(array)) {
        return array;
      }
      return array.filter(function(el, index, array) {
        return array.indexOf(el) == index;
      });
    },

    forEachKeyInKeypath: function(object, keypath, callback) {
      if (!v.isString(keypath)) {
        return undefined;
      }

      var key = ""
        , i
        , escape = false;

      for (i = 0; i < keypath.length; ++i) {
        switch (keypath[i]) {
          case '.':
            if (escape) {
              escape = false;
              key += '.';
            } else {
              object = callback(object, key, false);
              key = "";
            }
            break;

          case '\\':
            if (escape) {
              escape = false;
              key += '\\';
            } else {
              escape = true;
            }
            break;

          default:
            escape = false;
            key += keypath[i];
            break;
        }
      }

      return callback(object, key, true);
    },

    getDeepObjectValue: function(obj, keypath) {
      if (!v.isObject(obj)) {
        return undefined;
      }

      return v.forEachKeyInKeypath(obj, keypath, function(obj, key) {
        if (v.isObject(obj)) {
          return obj[key];
        }
      });
    },

    // This returns an object with all the values of the form.
    // It uses the input name as key and the value as value
    // So for example this:
    // <input type="text" name="email" value="foo@bar.com" />
    // would return:
    // {email: "foo@bar.com"}
    collectFormValues: function(form, options) {
      var values = {}
        , i
        , j
        , input
        , inputs
        , option
        , value;

      if (v.isJqueryElement(form)) {
        form = form[0];
      }

      if (!form) {
        return values;
      }

      options = options || {};

      inputs = form.querySelectorAll("input[name], textarea[name]");
      for (i = 0; i < inputs.length; ++i) {
        input = inputs.item(i);

        if (v.isDefined(input.getAttribute("data-ignored"))) {
          continue;
        }

        var name = input.name.replace(/\./g, "\\\\.");
        value = v.sanitizeFormValue(input.value, options);
        if (input.type === "number") {
          value = value ? +value : null;
        } else if (input.type === "checkbox") {
          if (input.attributes.value) {
            if (!input.checked) {
              value = values[name] || null;
            }
          } else {
            value = input.checked;
          }
        } else if (input.type === "radio") {
          if (!input.checked) {
            value = values[name] || null;
          }
        }
        values[name] = value;
      }

      inputs = form.querySelectorAll("select[name]");
      for (i = 0; i < inputs.length; ++i) {
        input = inputs.item(i);
        if (v.isDefined(input.getAttribute("data-ignored"))) {
          continue;
        }

        if (input.multiple) {
          value = [];
          for (j in input.options) {
            option = input.options[j];
             if (option && option.selected) {
              value.push(v.sanitizeFormValue(option.value, options));
            }
          }
        } else {
          var _val = typeof input.options[input.selectedIndex] !== 'undefined' ? input.options[input.selectedIndex].value : /* istanbul ignore next */ '';
          value = v.sanitizeFormValue(_val, options);
        }
        values[input.name] = value;
      }

      return values;
    },

    sanitizeFormValue: function(value, options) {
      if (options.trim && v.isString(value)) {
        value = value.trim();
      }

      if (options.nullify !== false && value === "") {
        return null;
      }
      return value;
    },

    capitalize: function(str) {
      if (!v.isString(str)) {
        return str;
      }
      return str[0].toUpperCase() + str.slice(1);
    },

    // Remove all errors who's error attribute is empty (null or undefined)
    pruneEmptyErrors: function(errors) {
      return errors.filter(function(error) {
        return !v.isEmpty(error.error);
      });
    },

    // In
    // [{error: ["err1", "err2"], ...}]
    // Out
    // [{error: "err1", ...}, {error: "err2", ...}]
    //
    // All attributes in an error with multiple messages are duplicated
    // when expanding the errors.
    expandMultipleErrors: function(errors) {
      var ret = [];
      errors.forEach(function(error) {
        // Removes errors without a message
        if (v.isArray(error.error)) {
          error.error.forEach(function(msg) {
            ret.push(v.extend({}, error, {error: msg}));
          });
        } else {
          ret.push(error);
        }
      });
      return ret;
    },

    // Converts the error mesages by prepending the attribute name unless the
    // message is prefixed by ^
    convertErrorMessages: function(errors, options) {
      options = options || {};

      var ret = []
        , prettify = options.prettify || v.prettify;
      errors.forEach(function(errorInfo) {
        var error = v.result(errorInfo.error,
            errorInfo.value,
            errorInfo.attribute,
            errorInfo.options,
            errorInfo.attributes,
            errorInfo.globalOptions);

        if (!v.isString(error)) {
          ret.push(errorInfo);
          return;
        }

        if (error[0] === '^') {
          error = error.slice(1);
        } else if (options.fullMessages !== false) {
          error = v.capitalize(prettify(errorInfo.attribute)) + " " + error;
        }
        error = error.replace(/\\\^/g, "^");
        error = v.format(error, {
          value: v.stringifyValue(errorInfo.value, options)
        });
        ret.push(v.extend({}, errorInfo, {error: error}));
      });
      return ret;
    },

    // In:
    // [{attribute: "<attributeName>", ...}]
    // Out:
    // {"<attributeName>": [{attribute: "<attributeName>", ...}]}
    groupErrorsByAttribute: function(errors) {
      var ret = {};
      errors.forEach(function(error) {
        var list = ret[error.attribute];
        if (list) {
          list.push(error);
        } else {
          ret[error.attribute] = [error];
        }
      });
      return ret;
    },

    // In:
    // [{error: "<message 1>", ...}, {error: "<message 2>", ...}]
    // Out:
    // ["<message 1>", "<message 2>"]
    flattenErrorsToArray: function(errors) {
      return errors
        .map(function(error) { return error.error; })
        .filter(function(value, index, self) {
          return self.indexOf(value) === index;
        });
    },

    cleanAttributes: function(attributes, whitelist) {
      function whitelistCreator(obj, key, last) {
        if (v.isObject(obj[key])) {
          return obj[key];
        }
        return (obj[key] = last ? true : {});
      }

      function buildObjectWhitelist(whitelist) {
        var ow = {}
          , lastObject
          , attr;
        for (attr in whitelist) {
          if (!whitelist[attr]) {
            continue;
          }
          v.forEachKeyInKeypath(ow, attr, whitelistCreator);
        }
        return ow;
      }

      function cleanRecursive(attributes, whitelist) {
        if (!v.isObject(attributes)) {
          return attributes;
        }

        var ret = v.extend({}, attributes)
          , w
          , attribute;

        for (attribute in attributes) {
          w = whitelist[attribute];

          if (v.isObject(w)) {
            ret[attribute] = cleanRecursive(ret[attribute], w);
          } else if (!w) {
            delete ret[attribute];
          }
        }
        return ret;
      }

      if (!v.isObject(whitelist) || !v.isObject(attributes)) {
        return {};
      }

      whitelist = buildObjectWhitelist(whitelist);
      return cleanRecursive(attributes, whitelist);
    },

    exposeModule: function(validate, root, exports, module, define) {
      if (exports) {
        if (module && module.exports) {
          exports = module.exports = validate;
        }
        exports.validate = validate;
      } else {
        root.validate = validate;
        if (validate.isFunction(define) && define.amd) {
          define([], function () { return validate; });
        }
      }
    },

    warn: function(msg) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn("[validate.js] " + msg);
      }
    },

    error: function(msg) {
      if (typeof console !== "undefined" && console.error) {
        console.error("[validate.js] " + msg);
      }
    }
  });

  validate.validators = {
    // Presence validates that the value isn't empty
    presence: function(value, options) {
      options = v.extend({}, this.options, options);
      if (options.allowEmpty !== false ? !v.isDefined(value) : v.isEmpty(value)) {
        return options.message || this.message || "can't be blank";
      }
    },
    length: function(value, options, attribute) {
      // Empty values are allowed
      if (!v.isDefined(value)) {
        return;
      }

      options = v.extend({}, this.options, options);

      var is = options.is
        , maximum = options.maximum
        , minimum = options.minimum
        , tokenizer = options.tokenizer || function(val) { return val; }
        , err
        , errors = [];

      value = tokenizer(value);
      var length = value.length;
      if(!v.isNumber(length)) {
        return options.message || this.notValid || "has an incorrect length";
      }

      // Is checks
      if (v.isNumber(is) && length !== is) {
        err = options.wrongLength ||
          this.wrongLength ||
          "is the wrong length (should be %{count} characters)";
        errors.push(v.format(err, {count: is}));
      }

      if (v.isNumber(minimum) && length < minimum) {
        err = options.tooShort ||
          this.tooShort ||
          "is too short (minimum is %{count} characters)";
        errors.push(v.format(err, {count: minimum}));
      }

      if (v.isNumber(maximum) && length > maximum) {
        err = options.tooLong ||
          this.tooLong ||
          "is too long (maximum is %{count} characters)";
        errors.push(v.format(err, {count: maximum}));
      }

      if (errors.length > 0) {
        return options.message || errors;
      }
    },
    numericality: function(value, options, attribute, attributes, globalOptions) {
      // Empty values are fine
      if (!v.isDefined(value)) {
        return;
      }

      options = v.extend({}, this.options, options);

      var errors = []
        , name
        , count
        , checks = {
            greaterThan:          function(v, c) { return v > c; },
            greaterThanOrEqualTo: function(v, c) { return v >= c; },
            equalTo:              function(v, c) { return v === c; },
            lessThan:             function(v, c) { return v < c; },
            lessThanOrEqualTo:    function(v, c) { return v <= c; },
            divisibleBy:          function(v, c) { return v % c === 0; }
          }
        , prettify = options.prettify ||
          (globalOptions && globalOptions.prettify) ||
          v.prettify;

      // Strict will check that it is a valid looking number
      if (v.isString(value) && options.strict) {
        var pattern = "^-?(0|[1-9]\\d*)";
        if (!options.onlyInteger) {
          pattern += "(\\.\\d+)?";
        }
        pattern += "$";

        if (!(new RegExp(pattern).test(value))) {
          return options.message ||
            options.notValid ||
            this.notValid ||
            this.message ||
            "must be a valid number";
        }
      }

      // Coerce the value to a number unless we're being strict.
      if (options.noStrings !== true && v.isString(value) && !v.isEmpty(value)) {
        value = +value;
      }

      // If it's not a number we shouldn't continue since it will compare it.
      if (!v.isNumber(value)) {
        return options.message ||
          options.notValid ||
          this.notValid ||
          this.message ||
          "is not a number";
      }

      // Same logic as above, sort of. Don't bother with comparisons if this
      // doesn't pass.
      if (options.onlyInteger && !v.isInteger(value)) {
        return options.message ||
          options.notInteger ||
          this.notInteger ||
          this.message ||
          "must be an integer";
      }

      for (name in checks) {
        count = options[name];
        if (v.isNumber(count) && !checks[name](value, count)) {
          // This picks the default message if specified
          // For example the greaterThan check uses the message from
          // this.notGreaterThan so we capitalize the name and prepend "not"
          var key = "not" + v.capitalize(name);
          var msg = options[key] ||
            this[key] ||
            this.message ||
            "must be %{type} %{count}";

          errors.push(v.format(msg, {
            count: count,
            type: prettify(name)
          }));
        }
      }

      if (options.odd && value % 2 !== 1) {
        errors.push(options.notOdd ||
            this.notOdd ||
            this.message ||
            "must be odd");
      }
      if (options.even && value % 2 !== 0) {
        errors.push(options.notEven ||
            this.notEven ||
            this.message ||
            "must be even");
      }

      if (errors.length) {
        return options.message || errors;
      }
    },
    datetime: v.extend(function(value, options) {
      if (!v.isFunction(this.parse) || !v.isFunction(this.format)) {
        throw new Error("Both the parse and format functions needs to be set to use the datetime/date validator");
      }

      // Empty values are fine
      if (!v.isDefined(value)) {
        return;
      }

      options = v.extend({}, this.options, options);

      var err
        , errors = []
        , earliest = options.earliest ? this.parse(options.earliest, options) : NaN
        , latest = options.latest ? this.parse(options.latest, options) : NaN;

      value = this.parse(value, options);

      // 86400000 is the number of milliseconds in a day, this is used to remove
      // the time from the date
      if (isNaN(value) || options.dateOnly && value % 86400000 !== 0) {
        err = options.notValid ||
          options.message ||
          this.notValid ||
          "must be a valid date";
        return v.format(err, {value: arguments[0]});
      }

      if (!isNaN(earliest) && value < earliest) {
        err = options.tooEarly ||
          options.message ||
          this.tooEarly ||
          "must be no earlier than %{date}";
        err = v.format(err, {
          value: this.format(value, options),
          date: this.format(earliest, options)
        });
        errors.push(err);
      }

      if (!isNaN(latest) && value > latest) {
        err = options.tooLate ||
          options.message ||
          this.tooLate ||
          "must be no later than %{date}";
        err = v.format(err, {
          date: this.format(latest, options),
          value: this.format(value, options)
        });
        errors.push(err);
      }

      if (errors.length) {
        return v.unique(errors);
      }
    }, {
      parse: null,
      format: null
    }),
    date: function(value, options) {
      options = v.extend({}, options, {dateOnly: true});
      return v.validators.datetime.call(v.validators.datetime, value, options);
    },
    format: function(value, options) {
      if (v.isString(options) || (options instanceof RegExp)) {
        options = {pattern: options};
      }

      options = v.extend({}, this.options, options);

      var message = options.message || this.message || "is invalid"
        , pattern = options.pattern
        , match;

      // Empty values are allowed
      if (!v.isDefined(value)) {
        return;
      }
      if (!v.isString(value)) {
        return message;
      }

      if (v.isString(pattern)) {
        pattern = new RegExp(options.pattern, options.flags);
      }
      match = pattern.exec(value);
      if (!match || match[0].length != value.length) {
        return message;
      }
    },
    inclusion: function(value, options) {
      // Empty values are fine
      if (!v.isDefined(value)) {
        return;
      }
      if (v.isArray(options)) {
        options = {within: options};
      }
      options = v.extend({}, this.options, options);
      if (v.contains(options.within, value)) {
        return;
      }
      var message = options.message ||
        this.message ||
        "^%{value} is not included in the list";
      return v.format(message, {value: value});
    },
    exclusion: function(value, options) {
      // Empty values are fine
      if (!v.isDefined(value)) {
        return;
      }
      if (v.isArray(options)) {
        options = {within: options};
      }
      options = v.extend({}, this.options, options);
      if (!v.contains(options.within, value)) {
        return;
      }
      var message = options.message || this.message || "^%{value} is restricted";
      if (v.isString(options.within[value])) {
        value = options.within[value];
      }
      return v.format(message, {value: value});
    },
    email: v.extend(function(value, options) {
      options = v.extend({}, this.options, options);
      var message = options.message || this.message || "is not a valid email";
      // Empty values are fine
      if (!v.isDefined(value)) {
        return;
      }
      if (!v.isString(value)) {
        return message;
      }
      if (!this.PATTERN.exec(value)) {
        return message;
      }
    }, {
      PATTERN: /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i
    }),
    equality: function(value, options, attribute, attributes, globalOptions) {
      if (!v.isDefined(value)) {
        return;
      }

      if (v.isString(options)) {
        options = {attribute: options};
      }
      options = v.extend({}, this.options, options);
      var message = options.message ||
        this.message ||
        "is not equal to %{attribute}";

      if (v.isEmpty(options.attribute) || !v.isString(options.attribute)) {
        throw new Error("The attribute must be a non empty string");
      }

      var otherValue = v.getDeepObjectValue(attributes, options.attribute)
        , comparator = options.comparator || function(v1, v2) {
          return v1 === v2;
        }
        , prettify = options.prettify ||
          (globalOptions && globalOptions.prettify) ||
          v.prettify;

      if (!comparator(value, otherValue, options, attribute, attributes)) {
        return v.format(message, {attribute: prettify(options.attribute)});
      }
    },
    // A URL validator that is used to validate URLs with the ability to
    // restrict schemes and some domains.
    url: function(value, options) {
      if (!v.isDefined(value)) {
        return;
      }

      options = v.extend({}, this.options, options);

      var message = options.message || this.message || "is not a valid url"
        , schemes = options.schemes || this.schemes || ['http', 'https']
        , allowLocal = options.allowLocal || this.allowLocal || false
        , allowDataUrl = options.allowDataUrl || this.allowDataUrl || false;
      if (!v.isString(value)) {
        return message;
      }

      // https://gist.github.com/dperini/729294
      var regex =
        "^" +
        // protocol identifier
        "(?:(?:" + schemes.join("|") + ")://)" +
        // user:pass authentication
        "(?:\\S+(?::\\S*)?@)?" +
        "(?:";

      var tld = "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))";

      if (allowLocal) {
        tld += "?";
      } else {
        regex +=
          // IP address exclusion
          // private & local networks
          "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
          "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
          "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})";
      }

      regex +=
          // IP address dotted notation octets
          // excludes loopback network 0.0.0.0
          // excludes reserved space >= 224.0.0.0
          // excludes network & broacast addresses
          // (first & last IP address of each class)
          "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
          "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
          "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
        "|" +
          // host name
          "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
          // domain name
          "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
          tld +
        ")" +
        // port number
        "(?::\\d{2,5})?" +
        // resource path
        "(?:[/?#]\\S*)?" +
      "$";

      if (allowDataUrl) {
        // RFC 2397
        var mediaType = "\\w+\\/[-+.\\w]+(?:;[\\w=]+)*";
        var urlchar = "[A-Za-z0-9-_.!~\\*'();\\/?:@&=+$,%]*";
        var dataurl = "data:(?:"+mediaType+")?(?:;base64)?,"+urlchar;
        regex = "(?:"+regex+")|(?:^"+dataurl+"$)";
      }

      var PATTERN = new RegExp(regex, 'i');
      if (!PATTERN.exec(value)) {
        return message;
      }
    },
    type: v.extend(function(value, originalOptions, attribute, attributes, globalOptions) {
      if (v.isString(originalOptions)) {
        originalOptions = {type: originalOptions};
      }

      if (!v.isDefined(value)) {
        return;
      }

      var options = v.extend({}, this.options, originalOptions);

      var type = options.type;
      if (!v.isDefined(type)) {
        throw new Error("No type was specified");
      }

      var check;
      if (v.isFunction(type)) {
        check = type;
      } else {
        check = this.types[type];
      }

      if (!v.isFunction(check)) {
        throw new Error("validate.validators.type.types." + type + " must be a function.");
      }

      if (!check(value, options, attribute, attributes, globalOptions)) {
        var message = originalOptions.message ||
          this.messages[type] ||
          this.message ||
          options.message ||
          (v.isFunction(type) ? "must be of the correct type" : "must be of type %{type}");

        if (v.isFunction(message)) {
          message = message(value, originalOptions, attribute, attributes, globalOptions);
        }

        return v.format(message, {attribute: v.prettify(attribute), type: type});
      }
    }, {
      types: {
        object: function(value) {
          return v.isObject(value) && !v.isArray(value);
        },
        array: v.isArray,
        integer: v.isInteger,
        number: v.isNumber,
        string: v.isString,
        date: v.isDate,
        boolean: v.isBoolean
      },
      messages: {}
    })
  };

  validate.formatters = {
    detailed: function(errors) {return errors;},
    flat: v.flattenErrorsToArray,
    grouped: function(errors) {
      var attr;

      errors = v.groupErrorsByAttribute(errors);
      for (attr in errors) {
        errors[attr] = v.flattenErrorsToArray(errors[attr]);
      }
      return errors;
    },
    constraint: function(errors) {
      var attr;
      errors = v.groupErrorsByAttribute(errors);
      for (attr in errors) {
        errors[attr] = errors[attr].map(function(result) {
          return result.validator;
        }).sort();
      }
      return errors;
    }
  };

  validate.exposeModule(validate, this, exports, module, __webpack_require__.amdD);
}).call(this,
         true ? /* istanbul ignore next */ exports : 0,
         true ? /* istanbul ignore next */ module : 0,
        __webpack_require__.amdD);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/amd define */
/******/ 	(() => {
/******/ 		__webpack_require__.amdD = function () {
/******/ 			throw new Error('define cannot be used indirect');
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";

// UNUSED EXPORTS: CaptchaHandler, FormValidator, ModalHandler, ModalHandlerManager, ReqEase, Requester, ResponseHandler

;// CONCATENATED MODULE: ./src/root/BuildMode.ts
var BuildMode;
(function (BuildMode) {
    BuildMode["onInit"] = "onInit";
    BuildMode["everytime"] = "everytime";
})(BuildMode || (BuildMode = {}));
const defaultBuildMode = BuildMode.onInit;

;// CONCATENATED MODULE: ./src/root/utils.ts
function isUndefinedOrNull(value) {
    return typeof value === 'undefined' || value == null;
}
function mergeObjects(defaultObj, newObj, excludedKeys = []) {
    const mergedObject = Object.assign({}, defaultObj);
    for (const key in defaultObj) {
        if (key in newObj && !excludedKeys.includes(key)) {
            mergedObject[key] = newObj[key];
        }
    }
    return mergedObject;
}

;// CONCATENATED MODULE: ./src/root/HtmlGeneralElement.ts

function getJqueryElement(htmlGeneralElement) {
    if (Array.isArray(htmlGeneralElement)) {
        const jqueryElements = [];
        for (const element of htmlGeneralElement) {
            if (typeof element === 'undefined' || element === null)
                continue;
            let x = getOneJqueryElementByName(element);
            if (typeof x === 'undefined')
                continue;
            jqueryElements.push(x);
        }
        return jqueryElements;
    }
    else {
        return getOneJqueryElementByName(htmlGeneralElement);
    }
}
function getOneJqueryElement(htmlGeneralElement) {
    if (isUndefinedOrNull(htmlGeneralElement))
        return undefined;
    if (isHtmlGeneralElementString(htmlGeneralElement)) {
        return $(htmlGeneralElement);
    }
    else if (isHtmlGeneralElementHTMLElement(htmlGeneralElement)) {
        return $(htmlGeneralElement);
    }
    else if (isHtmlGeneralElementJQueryElement(htmlGeneralElement)) {
        return htmlGeneralElement;
    }
    return undefined;
}
function getOneJqueryElementByName(htmlGeneralElement) {
    if (isUndefinedOrNull(htmlGeneralElement))
        return undefined;
    if (isHtmlGeneralElementString(htmlGeneralElement)) {
        if (htmlGeneralElement.startsWith('selector:')) {
            return $(htmlGeneralElement.substring(9));
        }
        return $('[name="' + htmlGeneralElement + '"]');
    }
    else if (isHtmlGeneralElementHTMLElement(htmlGeneralElement)) {
        return $(htmlGeneralElement);
    }
    else if (isHtmlGeneralElementJQueryElement(htmlGeneralElement)) {
        return htmlGeneralElement;
    }
    return undefined;
}
function getOkBtnFromForm(form, okBtn) {
    form = getOneJqueryElement(form);
    okBtn = getOneJqueryElement(okBtn);
    if (!isUndefinedOrNull(form) && form.length !== 0) {
        if (isUndefinedOrNull(okBtn) || okBtn.length === 0) {
            okBtn = form.find('button[type="submit"], #okBtn').last();
        }
    }
    return [form, okBtn];
}
function isHtmlGeneralElementString(htmlGeneralElement) {
    return typeof htmlGeneralElement === 'string';
}
function isHtmlGeneralElementHTMLElement(htmlGeneralElement) {
    return typeof htmlGeneralElement !== 'string' && !("jquery" in htmlGeneralElement);
}
function isHtmlGeneralElementJQueryElement(htmlGeneralElement) {
    return typeof htmlGeneralElement !== 'string' && typeof htmlGeneralElement !== 'undefined' && htmlGeneralElement !== null && "jquery" in htmlGeneralElement;
}

;// CONCATENATED MODULE: ./src/ReqEaseOptionsBuilder.ts



class ReqEaseOptionsBuilder {
    constructor(options) {
        this.options = options;
    }
    build() {
        var _a, _b;
        let [form, okBtn] = getOkBtnFromForm(this.options.form, this.options.okBtn);
        let buildMode = BuildMode.onInit;
        if (!isUndefinedOrNull(this.options.buildMode)) {
            if (typeof this.options.buildMode === "string") {
                if (Object.keys(BuildMode).includes(this.options.buildMode)) {
                    buildMode = BuildMode[this.options.buildMode];
                }
            }
            else {
                buildMode = this.options.buildMode;
            }
        }
        this.reqEaseOptions = {
            form: form,
            okBtn: okBtn,
            formValidator: (_a = this.options.formValidator) !== null && _a !== void 0 ? _a : {},
            buildMode: buildMode,
            requester: (_b = this.options.requester) !== null && _b !== void 0 ? _b : {}
        };
        return this.reqEaseOptions;
    }
}

;// CONCATENATED MODULE: ./src/ReqEaseOptions.ts

class ReqEaseOptions {
    static Builder(options) {
        return new ReqEaseOptionsBuilder(options);
    }
}

;// CONCATENATED MODULE: ./src/forms/FormValidatorStrings.ts
const defaultStrings = {
    format: {
        defaultInvalid: "Invalid format"
    },
    length: {
        defaultTooShort: "Value is too short",
        defaultTooLong: "Value is too long",
        passwordTooShort: "Password must be at least %{count} characters",
        passwordTooLong: "Password must be at most %{count} characters",
    },
    required: "This field is required",
    captcha: {},
};

;// CONCATENATED MODULE: ./src/forms/ValidatorCallbacks.ts
const defaultCallbacks = {
    onSuccess: () => { },
    onFailure: () => { }
};

;// CONCATENATED MODULE: ./src/forms/ValidatorsSource.ts
var ValidatorsSource;
(function (ValidatorsSource) {
    ValidatorsSource["FULL"] = "full";
    ValidatorsSource["ONLY_DEFINED"] = "only-defined";
})(ValidatorsSource || (ValidatorsSource = {}));
const defaultValidationSource = ValidatorsSource.FULL;

;// CONCATENATED MODULE: ./src/view/captcha/CaptchaHandlerManager.ts
class CaptchaHandlerManager {
    // Register a modal handler with a label
    static registerHandler(handler) {
        CaptchaHandlerManager.handlers[handler.label] = handler;
    }
    static createHandler(label, formValidator, options) {
        const handlerClass = CaptchaHandlerManager.handlers[label];
        if (!handlerClass) {
            console.error(`Captcha handler with label "${label}" not registered.`);
            return null;
        }
        return new handlerClass(formValidator, options);
    }
}
CaptchaHandlerManager.handlers = {};

;// CONCATENATED MODULE: ./src/view/captcha/CaptchaHandler.ts
// noinspection JSUnusedGlobalSymbols
class CaptchaHandler {
    constructor(formValidator, captchaOptions) {
        this.formValidator = formValidator;
        this.captchaOptions = captchaOptions;
    }
    init(ready) {
        ready();
    }
    triggerRequiredError() { }
}
function isCaptchaOptions(object) {
    return typeof object === 'object' && "label" in object;
}
const defaultCaptchaOptions = {
    label: 'easycaptchajs',
};

;// CONCATENATED MODULE: ./src/view/captcha/handlers/GoogleRecaptchaHandler.ts


class GoogleRecaptchaHandler extends CaptchaHandler {
    init(ready) {
        this.prepare();
        if (isUndefinedOrNull(this.captchaOptions.ApiToken)) {
            let meta = $("meta[name='" + this.captchaOptions.metaName + "']");
            if (meta.length === 0) {
                console.error("ApiToken is not defined, and no meta defined under name: " + this.captchaOptions.metaName);
            }
            else {
                this.captchaOptions.ApiToken = meta.attr('content');
            }
        }
        $(this.target).EasyCaptcha($.extend(true, this.formValidator.options.strings.captcha, {
            ReCAPTCHA_API_KEY_CLIENT: this.captchaOptions.ApiToken,
            autoVerification: {
                okBtn: this.formValidator.options.okBtn,
            }
        }));
        ready();
    }
    prepare() {
        if (isUndefinedOrNull(this.formValidator.options.form)) {
            console.error("Form is not defined.");
            return;
        }
        if (isUndefinedOrNull(this.formValidator.options.okBtn)) {
            console.error("OkBtn is not defined.");
            return;
        }
        let captchaTarget = $('#ReCaptchaTarget');
        if (captchaTarget.length === 0) {
            captchaTarget = $('<div id="ReCaptchaTarget"></div>');
            captchaTarget.insertBefore(this.formValidator.options.okBtn);
        }
        this.target = captchaTarget;
        this.captchaOptions = Object.assign(Object.assign({}, defaultGoogleRecaptchaOptions), this.formValidator.options.captcha);
    }
    triggerRequiredError() {
    }
}
GoogleRecaptchaHandler.label = "easycaptchajs";
const defaultGoogleRecaptchaOptions = {
    metaName: "google-recaptcha-api-token"
};

;// CONCATENATED MODULE: ./src/view/captcha/handlers/HandlerCollector.ts


function collectCaptchaHandlers(captchaHandlersToRegister = null) {
    if (captchaHandlersToRegister !== null) {
        for (let i = 0; i < captchaHandlersToRegister.length; i++) {
            CaptchaHandlerManager.registerHandler(captchaHandlersToRegister[i]);
        }
    }
    else {
        CaptchaHandlerManager.registerHandler(GoogleRecaptchaHandler);
    }
    console.log("captchaHandlers", CaptchaHandlerManager.handlers);
}

;// CONCATENATED MODULE: ./src/forms/FormValidatorOptionsBuilder.ts








class FormValidatorOptionsBuilder {
    constructor(options = {}) {
        var _a, _b, _c, _d, _e, _f;
        this.options = new FormValidatorOptions();
        this.formValidatorStrings = options.strings ? options.strings : {};
        this.validatorCallbacks = options.callbacks ? options.callbacks : {};
        this.options.defaultConstraints = options.defaultConstraints ? options.defaultConstraints : [];
        this.options.newConstraints = options.newConstraints ? options.newConstraints : [];
        this.options.validatorsSource = (_a = options.validatorsSource) !== null && _a !== void 0 ? _a : defaultValidationSource;
        this.options.customValidations = (_b = options.customValidations) !== null && _b !== void 0 ? _b : [];
        this.options.fieldsValidators = (_c = options.fieldsValidators) !== null && _c !== void 0 ? _c : [];
        this.options.inputMessageRenderer = (_d = options.inputMessageRenderer) !== null && _d !== void 0 ? _d : {};
        // add the form,okBtb
        [this.options.form, this.options.okBtn] = getOkBtnFromForm(options.form, options.okBtn);
        this.options.validationDuringLoading = (_e = options.validationDuringLoading) !== null && _e !== void 0 ? _e : true;
        this.options.captchaHandlersToRegister = (_f = options.captchaHandlersToRegister) !== null && _f !== void 0 ? _f : [];
        if (isUndefinedOrNull(this.options.captcha)) {
            let captcha = options.captcha;
            if (captcha === true) {
                this.options.captcha = defaultCaptchaOptions;
            }
            else if (isCaptchaOptions(captcha)) {
                this.options.captcha = Object.assign(Object.assign({}, defaultCaptchaOptions), captcha);
            }
        }
    }
    build() {
        collectCaptchaHandlers();
        if (Array.isArray(this.options.captchaHandlersToRegister)) {
            collectCaptchaHandlers(this.options.captchaHandlersToRegister);
        }
        else {
            collectCaptchaHandlers([this.options.captchaHandlersToRegister]);
        }
        this.options.strings = Object.assign(Object.assign({}, defaultStrings), this.formValidatorStrings);
        this.options.callbacks = Object.assign(Object.assign({}, defaultCallbacks), this.validatorCallbacks);
        this.options.defaultConstraints = this.buildDefaultConstraints();
        return this.options;
    }
    buildDefaultConstraints() {
        var _a, _b, _c;
        return mergeArrays([
            {
                name: "phoneNumber",
                presence: true,
                length: {
                    minimum: 10,
                    maximum: 10
                },
                format: {
                    pattern: "/^[0-9]+$/",
                }
            },
            {
                name: "username",
                presence: true,
                length: {
                    minimum: 4,
                    maximum: 255
                },
                format: {
                    pattern: "[a-z0-9.]*",
                }
            },
            {
                name: "email",
                presence: true,
                email: true,
                length: {
                    maximum: 255
                }
            },
            {
                name: "password",
                presence: true,
                length: {
                    minimum: 6,
                    maximum: 255,
                    tooShort: (_b = (_a = this.options.strings) === null || _a === void 0 ? void 0 : _a.length) === null || _b === void 0 ? void 0 : _b.passwordTooShort,
                }
            },
            {
                name: "password_confirmation",
                presence: true,
                equality: "password"
            },
            {
                name: "fname",
                presence: true,
                length: {
                    minimum: 3,
                    maximum: 255
                },
                format: {
                    pattern: "[a-zA-Z]+(?:\\s[a-zA-Z]+)*",
                }
            },
            {
                name: "lname",
                presence: true,
                length: {
                    minimum: 3,
                    maximum: 255
                },
                format: {
                    pattern: "[a-zA-Z]+(?:\\s[a-zA-Z]+)*",
                }
            },
            {
                name: "required",
                presence: true
            }
        ], (_c = this.options.defaultConstraints) !== null && _c !== void 0 ? _c : []);
    }
}
function mergeArrays(array1, array2) {
    const mergedArray = [];
    for (const item1 of array1) {
        const matchingItem = array2.find(item2 => (item2 === null || item2 === void 0 ? void 0 : item2.name) === (item1 === null || item1 === void 0 ? void 0 : item1.name));
        if (matchingItem) {
            mergedArray.push(Object.assign(Object.assign({}, item1), matchingItem));
        }
        else {
            if (item1)
                mergedArray.push(item1);
        }
    }
    return mergedArray;
}

;// CONCATENATED MODULE: ./src/forms/FormValidatorOptions.ts

class FormValidatorOptions {
    constructor() { }
    static Builder(options) {
        return new FormValidatorOptionsBuilder(options);
    }
}

// EXTERNAL MODULE: ./node_modules/validate.js/validate.js
var validate = __webpack_require__(765);
;// CONCATENATED MODULE: ./src/view/Messages.ts
var Messages;
(function (Messages) {
    class DefaultMessage {
        constructor(messageData, messageRenderer) {
            this.messageData = messageData;
            this.messageRenderer = messageRenderer;
        }
    }
    Messages.DefaultMessage = DefaultMessage;
    // noinspection JSUnusedGlobalSymbols
    let MessageStatus;
    (function (MessageStatus) {
        MessageStatus["SUCCESS"] = "success";
        MessageStatus["DANGER"] = "danger";
        MessageStatus["WARNING"] = "warning";
        MessageStatus["INFO"] = "info";
    })(MessageStatus = Messages.MessageStatus || (Messages.MessageStatus = {}));
})(Messages || (Messages = {}));

;// CONCATENATED MODULE: ./src/forms/FormValidatorBuilder.ts
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _FormValidatorBuilder_instances, _FormValidatorBuilder_prepareValidateJs, _FormValidatorBuilder_prepare, _FormValidatorBuilder_prepareFieldsValidator, _FormValidatorBuilder_prepareFormFieldsValidator, _FormValidatorBuilder_prepareGivenFieldsValidator, _FormValidatorBuilder_buildFieldsValidatorOfOneInstance, _FormValidatorBuilder_buildOneFieldValidatorOfOneInstance, _FormValidatorBuilder_searchConstraint, _FormValidatorBuilder_prepareRenderer;








var MessageStatus = Messages.MessageStatus;
class FormValidatorBuilder {
    constructor(options, reqEaseOptions) {
        _FormValidatorBuilder_instances.add(this);
        this.fieldsValidators = [];
        this.formValidator = new FormValidator(FormValidatorOptions.Builder(options)
            .build());
        this.reqEaseOptions = reqEaseOptions;
    }
    build() {
        var _a, _b;
        // override default form,okBtn by ReqEaseOptions
        if (!isUndefinedOrNull(this.reqEaseOptions.form)) {
            this.formValidator.options.form = this.reqEaseOptions.form;
        }
        if (!isUndefinedOrNull(this.reqEaseOptions.okBtn)) {
            this.formValidator.options.okBtn = this.reqEaseOptions.okBtn;
        }
        __classPrivateFieldGet(this, _FormValidatorBuilder_instances, "m", _FormValidatorBuilder_prepareValidateJs).call(this);
        __classPrivateFieldGet(this, _FormValidatorBuilder_instances, "m", _FormValidatorBuilder_prepare).call(this);
        this.formValidator.fieldsValidators = this.fieldsValidators;
        this.formValidator.customValidations = (_a = this.formValidator.options.customValidations) !== null && _a !== void 0 ? _a : [];
        this.formValidator.reqEaseOptions = this.reqEaseOptions;
        this.formValidator.validatorCallbacks = Object.assign({
            onSuccess: () => {
            },
            onFailure: () => {
            }
        }, (_b = this.formValidator.options.callbacks) !== null && _b !== void 0 ? _b : {});
        return this.formValidator;
    }
}
_FormValidatorBuilder_instances = new WeakSet(), _FormValidatorBuilder_prepareValidateJs = function _FormValidatorBuilder_prepareValidateJs() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    validate.validators.length.tooShort = isUndefinedOrNull((_b = (_a = this.formValidator.options.strings) === null || _a === void 0 ? void 0 : _a.length) === null || _b === void 0 ? void 0 : _b.defaultTooShort) ? validate.validators.length.tooShort : (_d = (_c = this.formValidator.options.strings) === null || _c === void 0 ? void 0 : _c.length) === null || _d === void 0 ? void 0 : _d.defaultTooShort;
    validate.validators.length.tooLong = isUndefinedOrNull((_f = (_e = this.formValidator.options.strings) === null || _e === void 0 ? void 0 : _e.length) === null || _f === void 0 ? void 0 : _f.defaultTooLong) ? validate.validators.length.tooLong : (_h = (_g = this.formValidator.options.strings) === null || _g === void 0 ? void 0 : _g.length) === null || _h === void 0 ? void 0 : _h.defaultTooLong;
    validate.validators.email.message = isUndefinedOrNull((_k = (_j = this.formValidator.options.strings) === null || _j === void 0 ? void 0 : _j.format) === null || _k === void 0 ? void 0 : _k.defaultInvalid) ? validate.validators.email.message : (_m = (_l = this.formValidator.options.strings) === null || _l === void 0 ? void 0 : _l.format) === null || _m === void 0 ? void 0 : _m.defaultInvalid;
    validate.validators.presence.message = isUndefinedOrNull((_o = this.formValidator.options.strings) === null || _o === void 0 ? void 0 : _o.required) ? validate.validators.presence.message : (_p = this.formValidator.options.strings) === null || _p === void 0 ? void 0 : _p.required;
}, _FormValidatorBuilder_prepare = function _FormValidatorBuilder_prepare() {
    __classPrivateFieldGet(this, _FormValidatorBuilder_instances, "m", _FormValidatorBuilder_prepareFieldsValidator).call(this);
    __classPrivateFieldGet(this, _FormValidatorBuilder_instances, "m", _FormValidatorBuilder_prepareRenderer).call(this);
}, _FormValidatorBuilder_prepareFieldsValidator = function _FormValidatorBuilder_prepareFieldsValidator() {
    if (this.formValidator.options.validatorsSource === ValidatorsSource.FULL) {
        this.formValidator.constraints = mergeArrays(this.formValidator.options.defaultConstraints, this.formValidator.options.newConstraints);
        __classPrivateFieldGet(this, _FormValidatorBuilder_instances, "m", _FormValidatorBuilder_prepareFormFieldsValidator).call(this);
    }
    else if (this.formValidator.options.validatorsSource === ValidatorsSource.ONLY_DEFINED) {
        this.formValidator.constraints = this.formValidator.options.newConstraints;
    }
    __classPrivateFieldGet(this, _FormValidatorBuilder_instances, "m", _FormValidatorBuilder_prepareGivenFieldsValidator).call(this);
}, _FormValidatorBuilder_prepareFormFieldsValidator = function _FormValidatorBuilder_prepareFormFieldsValidator() {
    if (isUndefinedOrNull(this.formValidator.options.form)) {
        if (this.formValidator.options.validatorsSource === ValidatorsSource.FULL) {
            console.error("Form is not defined. when you use 'validatorsSource' as 'FULL', you must define 'form' in ReqEaseOptions.");
        }
        return;
    }
    let form = this.formValidator.options.form;
    let inputs = form.find('input, textarea, select');
    for (let i = 0; i < inputs.length; i++) {
        let fieldElement = $(inputs[i]);
        let constraintName = fieldElement.attr('name');
        if (isUndefinedOrNull(constraintName) || constraintName === "")
            continue;
        let fieldsValidator = __classPrivateFieldGet(this, _FormValidatorBuilder_instances, "m", _FormValidatorBuilder_buildFieldsValidatorOfOneInstance).call(this, fieldElement, constraintName);
        this.fieldsValidators = [...this.fieldsValidators, ...fieldsValidator];
    }
}, _FormValidatorBuilder_prepareGivenFieldsValidator = function _FormValidatorBuilder_prepareGivenFieldsValidator() {
    if (isUndefinedOrNull(this.formValidator.options.fieldsValidators))
        return;
    for (let i = 0; i < this.formValidator.options.fieldsValidators.length; i++) {
        let fieldComplex = this.formValidator.options.fieldsValidators[i].field;
        let constraintName = this.formValidator.options.fieldsValidators[i].constraint;
        let fieldElements;
        if (isUndefinedOrNull(fieldComplex))
            continue;
        let jq;
        if (fieldsAreVoid(fieldComplex)) {
            jq = getJqueryElement(fieldComplex());
        }
        else if (fieldsIsHtmlGeneralElement(fieldComplex)) {
            jq = getJqueryElement(fieldComplex);
        }
        else {
            continue;
        }
        if (isUndefinedOrNull(jq))
            continue;
        fieldElements = jq;
        let fieldsValidator = __classPrivateFieldGet(this, _FormValidatorBuilder_instances, "m", _FormValidatorBuilder_buildFieldsValidatorOfOneInstance).call(this, fieldElements, constraintName);
        this.fieldsValidators = [...this.fieldsValidators, ...fieldsValidator];
    }
}, _FormValidatorBuilder_buildFieldsValidatorOfOneInstance = function _FormValidatorBuilder_buildFieldsValidatorOfOneInstance(fieldElements, constraint) {
    let constraintSearched = __classPrivateFieldGet(this, _FormValidatorBuilder_instances, "m", _FormValidatorBuilder_searchConstraint).call(this, constraint);
    if (typeof constraintSearched === 'undefined')
        return [];
    let fieldValidator = [];
    if (Array.isArray(fieldElements)) {
        for (let i = 0; i < fieldElements.length; i++) {
            let x = __classPrivateFieldGet(this, _FormValidatorBuilder_instances, "m", _FormValidatorBuilder_buildOneFieldValidatorOfOneInstance).call(this, fieldElements[i], constraintSearched);
            if (typeof x === 'undefined')
                continue;
            fieldValidator.push(x);
        }
    }
    else {
        let x = __classPrivateFieldGet(this, _FormValidatorBuilder_instances, "m", _FormValidatorBuilder_buildOneFieldValidatorOfOneInstance).call(this, fieldElements, constraintSearched);
        if (typeof x === 'undefined')
            return fieldValidator;
        fieldValidator.push(x);
    }
    return fieldValidator;
}, _FormValidatorBuilder_buildOneFieldValidatorOfOneInstance = function _FormValidatorBuilder_buildOneFieldValidatorOfOneInstance(fieldElement, constraintSearched) {
    let attr = fieldElement.attr('data-validator-key');
    if (attr === 'ignore' || constraintSearched === 'ignore')
        return undefined;
    let assignedConstraint = (attr && attr !== "") ? __classPrivateFieldGet(this, _FormValidatorBuilder_instances, "m", _FormValidatorBuilder_searchConstraint).call(this, attr) : constraintSearched;
    if (typeof assignedConstraint === 'undefined')
        return undefined;
    assignedConstraint = Object.assign({}, assignedConstraint);
    //generate random number from 10000 to 99999 to add to prefix "fieldValidator_"
    let random = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
    let fieldValidatorName = `fieldValidator_${random}`;
    assignedConstraint.name = fieldValidatorName;
    return {
        field: fieldElement,
        constraint: assignedConstraint,
        name: fieldValidatorName
    };
}, _FormValidatorBuilder_searchConstraint = function _FormValidatorBuilder_searchConstraint(constraintSearch) {
    var _a, _b;
    if (typeof constraintSearch !== 'undefined' && typeof constraintSearch !== 'string') {
        return constraintSearch;
    }
    let constraint = (_a = this.formValidator.constraints) === null || _a === void 0 ? void 0 : _a.find((constraint) => constraint.name === constraintSearch);
    if (typeof constraint === 'undefined' || constraint === null) {
        constraint = (_b = this.formValidator.constraints) === null || _b === void 0 ? void 0 : _b.find((constraint) => constraint.name === 'required');
    }
    return constraint;
}, _FormValidatorBuilder_prepareRenderer = function _FormValidatorBuilder_prepareRenderer() {
    this.formValidator.inputMessageRenderer = Object.assign(Object.assign({}, defaultInputMessageRenderer), this.formValidator.options.inputMessageRenderer);
};
const defaultInputMessageRenderer = {
    buildMessage: (_messageRenderer, _message, messageData) => {
        return $("<p class='validator-message text-" + messageData.status + "'>" + messageData.message + "</p>");
    },
    renderMessages: (messageRenderer, message, messagesData) => {
        var _a;
        let formGroup = (_a = message.targetElement.parent(".form-group")) !== null && _a !== void 0 ? _a : message.targetElement.parent();
        let messages = formGroup.find(".validator-messages-parent");
        if (isUndefinedOrNull(messages) || messages.length === 0) {
            let messages_tmp = $('<div class="validator-messages-parent"></div>');
            messages_tmp.appendTo(formGroup);
            messages = messages_tmp;
        }
        messageRenderer.removeMessages(messageRenderer, message);
        for (let messageData of messagesData) {
            let messageElement = messageRenderer.buildMessage(messageRenderer, message, messageData);
            messageElement.appendTo(messages);
        }
    },
    removeMessages: (_messageRenderer, message) => {
        var _a;
        let formGroup = (_a = message.targetElement.parent(".form-group")) !== null && _a !== void 0 ? _a : message.targetElement.parent();
        formGroup.find('.is-invalid').removeClass('is-invalid');
        formGroup.find('.is-valid').removeClass('is-valid');
        formGroup.find('.validator-messages-parent .validator-message').each(function (_index, element) {
            $(element).remove();
        });
    },
    affectInput: (_messageRenderer, message, messageData) => {
        let firstMessageData = messageData[0];
        if (firstMessageData.status === MessageStatus.SUCCESS) {
            message.targetElement.addClass('is-valid');
        }
        else if (firstMessageData.status === MessageStatus.DANGER) {
            message.targetElement.addClass('is-invalid');
        }
    }
};
function fieldsAreVoid(fields) {
    return typeof fields === 'function';
}
function fieldsIsHtmlGeneralElement(value) {
    return typeof value !== 'undefined' && typeof value !== "function";
}

;// CONCATENATED MODULE: ./src/view/messages/InputMessage.ts

var DefaultMessage = Messages.DefaultMessage;
class InputMessage extends DefaultMessage {
    constructor(messageData, messageRenderer) {
        super(messageData, messageRenderer);
    }
    set targetElement(value) {
        this._targetElement = value;
    }
    get targetElement() {
        return this._targetElement;
    }
    show() {
        this.messageRenderer.renderMessages(this.messageRenderer, this, this.messageData);
        this.eventListener = () => {
            this.destroy();
        };
        this.targetElement.on("input", this.eventListener);
        this.messageRenderer.affectInput(this.messageRenderer, this, this.messageData);
    }
    destroy() {
        if (typeof this.eventListener !== 'undefined') {
            this.targetElement.off("input", this.eventListener);
        }
        this.messageRenderer.removeMessages(this.messageRenderer, this);
    }
}

;// CONCATENATED MODULE: ./src/forms/FormValidator.ts
var FormValidator_classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _FormValidator_instances, _FormValidator_executeValidate, _FormValidator_showAllErrors, _FormValidator_buildRealConstraints, _FormValidator_executeCustomValidation;





var FormValidator_MessageStatus = Messages.MessageStatus;


class FormValidator {
    static Builder(options, reqEaseOptions = ReqEaseOptions.Builder({}).build()) {
        return new FormValidatorBuilder(options, reqEaseOptions);
    }
    constructor(options) {
        _FormValidator_instances.add(this);
        this.constraints = [];
        this.fieldsValidators = [];
        this.customValidations = [];
        this.options = options;
    }
    validate(internalValidatorCallbacks = defaultCallbacks) {
        new Promise((resolve, _reject) => {
            let realConstraint = FormValidator_classPrivateFieldGet(this, _FormValidator_instances, "m", _FormValidator_buildRealConstraints).call(this);
            let errors = FormValidator_classPrivateFieldGet(this, _FormValidator_instances, "m", _FormValidator_executeValidate).call(this, realConstraint);
            if (errors) {
                FormValidator_classPrivateFieldGet(this, _FormValidator_instances, "m", _FormValidator_showAllErrors).call(this, errors);
                resolve(false);
                return;
            }
            FormValidator_classPrivateFieldGet(this, _FormValidator_instances, "m", _FormValidator_executeCustomValidation).call(this, (validationSucceed) => {
                if (!validationSucceed) {
                    resolve(false);
                    return;
                }
                resolve(true);
            });
        }).then(r => {
            if (r) {
                this.validatorCallbacks.onSuccess(this);
                internalValidatorCallbacks.onSuccess(this);
            }
            else {
                this.validatorCallbacks.onFailure(this);
                internalValidatorCallbacks.onFailure(this);
            }
        });
    }
    initiate() {
        var _a;
        let realConstraint = FormValidator_classPrivateFieldGet(this, _FormValidator_instances, "m", _FormValidator_buildRealConstraints).call(this);
        let fieldsValidators = this.fieldsValidators;
        for (let i = 0; i < fieldsValidators.length; i++) {
            let field = fieldsValidators[i].field;
            let eventListener = (e) => {
                let errors = FormValidator_classPrivateFieldGet(this, _FormValidator_instances, "m", _FormValidator_executeValidate).call(this, realConstraint);
                let target = $(e.target);
                let key = target.attr('name');
                if (errors && errors[key]) {
                    FormValidator.showInputError(target, errors[key], this.inputMessageRenderer);
                }
            };
            field.off('change', eventListener);
            field.on('change', eventListener);
        }
        //captcha
        if (this.options.captcha) {
            let captchaHandler = CaptchaHandlerManager.createHandler((_a = this.options.captcha.label) !== null && _a !== void 0 ? _a : "", this, this.options.captcha);
            captchaHandler.init(() => {
                console.log("captcha ready");
            });
        }
    }
    static showInputError(input, errorMsgs, inputMessageRenderer) {
        let messagesData = [];
        for (let i = 0; i < errorMsgs.length; i++) {
            messagesData.push({
                status: FormValidator_MessageStatus.DANGER,
                message: errorMsgs[i]
            });
        }
        let inputMessage = new InputMessage(messagesData, inputMessageRenderer);
        inputMessage.targetElement = input;
        inputMessage.show();
    }
}
_FormValidator_instances = new WeakSet(), _FormValidator_executeValidate = function _FormValidator_executeValidate(realConstraint) {
    return (0,validate.validate)($(this.options.form), realConstraint, { fullMessages: false });
}, _FormValidator_showAllErrors = function _FormValidator_showAllErrors(errors) {
    let fieldsValidators = this.fieldsValidators;
    for (let i = 0; i < fieldsValidators.length; i++) {
        let field = fieldsValidators[i].field;
        let key = field.attr('name');
        if (errors[key])
            FormValidator.showInputError(field, errors[key], this.inputMessageRenderer);
    }
}, _FormValidator_buildRealConstraints = function _FormValidator_buildRealConstraints() {
    let realConstraints = {};
    let fieldsValidators = this.fieldsValidators;
    for (let i = 0; i < fieldsValidators.length; i++) {
        let key = fieldsValidators[i].field.attr('name');
        realConstraints[key] = fieldsValidators[i].constraint;
        delete realConstraints[key].name;
    }
    return realConstraints;
}, _FormValidator_executeCustomValidation = function _FormValidator_executeCustomValidation(done, index = 0) {
    if (index >= this.customValidations.length) {
        done(true);
        return;
    }
    let customValidation = this.customValidations[index];
    customValidation((validationSucceed) => {
        if (!validationSucceed) {
            done(false);
            return;
        }
        FormValidator_classPrivateFieldGet(this, _FormValidator_instances, "m", _FormValidator_executeCustomValidation).call(this, done, index + 1);
    });
};

;// CONCATENATED MODULE: ./src/ReqEaseBuilder.ts
class ReqEaseBuilder {
    constructor(reqEaseOptions, reqEase) {
        this.reqEaseOptions = reqEaseOptions;
        this.reqEase = reqEase;
    }
    build() {
    }
}

;// CONCATENATED MODULE: ./src/view/modal/ModalHandlerManager.ts
class ModalHandlerManager {
    // Register a modal handler with a label
    static registerHandler(handler) {
        ModalHandlerManager.handlers[handler.label] = handler;
    }
    static createHandler(label, requester, options) {
        const handlerClass = ModalHandlerManager.handlers[label];
        if (!handlerClass) {
            console.error(`Modal handler with label "${label}" not registered.`);
            return null;
        }
        return new handlerClass(requester, options);
    }
}
ModalHandlerManager.handlers = {};

;// CONCATENATED MODULE: ./src/view/modal/ActionButtons.ts
var ActionButtons;
(function (ActionButtons) {
    let Actions;
    (function (Actions) {
        let ActionType;
        (function (ActionType) {
            ActionType["CLOSE"] = "close";
            ActionType["REDIRECT"] = "redirect";
            ActionType["REFRESH"] = "refresh";
            ActionType["CONFIRM"] = "confirm";
            ActionType["CANCEL"] = "cancel";
            ActionType["RETRY"] = "retry";
            ActionType["CALL_FUNCTION"] = "call-function";
        })(ActionType = Actions.ActionType || (Actions.ActionType = {}));
        // build Predicates types checking for each action type
        function isCloseAction(action) {
            return action.actionType === ActionType.CLOSE;
        }
        Actions.isCloseAction = isCloseAction;
        function isRedirectAction(action) {
            return action.actionType === ActionType.REDIRECT;
        }
        Actions.isRedirectAction = isRedirectAction;
        function isRefreshAction(action) {
            return action.actionType === ActionType.REFRESH;
        }
        Actions.isRefreshAction = isRefreshAction;
        function isConfirmAction(action) {
            return action.actionType === ActionType.CONFIRM;
        }
        Actions.isConfirmAction = isConfirmAction;
        function isCancelAction(action) {
            return action.actionType === ActionType.CANCEL;
        }
        Actions.isCancelAction = isCancelAction;
        function isRetryAction(action) {
            return action.actionType === ActionType.RETRY;
        }
        Actions.isRetryAction = isRetryAction;
        function isCallFunctionAction(action) {
            return action.actionType === ActionType.CALL_FUNCTION;
        }
        Actions.isCallFunctionAction = isCallFunctionAction;
    })(Actions = ActionButtons.Actions || (ActionButtons.Actions = {}));
})(ActionButtons || (ActionButtons = {}));

;// CONCATENATED MODULE: ./src/view/modal/ModalHandler.ts


var ActionType = ActionButtons.Actions.ActionType;
// noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
class ModalHandler {
    constructor(requester, options) {
        this.$modal = null;
        this.retry = () => { };
        this.options = options;
        this.requester = requester;
        this._modalCallbacks = [{
                onOpen: () => { },
                onClose: () => { },
                onAction: () => { },
                onBeforeAction: (_action, callback) => {
                    callback();
                },
            }];
        this._internalCallbacks = {
            onOpen: () => {
                for (let i = 0; i < this._modalCallbacks.length; i++) {
                    if (isUndefinedOrNull(this._modalCallbacks[i].onOpen))
                        continue;
                    this._modalCallbacks[i].onOpen();
                }
            },
            onClose: () => {
                for (let i = 0; i < this._modalCallbacks.length; i++) {
                    if (isUndefinedOrNull(this._modalCallbacks[i].onClose))
                        continue;
                    this._modalCallbacks[i].onClose();
                }
            },
            onAction: (action) => {
                if (ModalOptionsIsConfirmationOptions(this.options)) {
                    if (action === ActionType.CONFIRM) {
                        this.options.confirm();
                    }
                    else if (action === ActionType.CANCEL) {
                        this.options.cancel();
                    }
                }
                for (let i = 0; i < this._modalCallbacks.length; i++) {
                    if (isUndefinedOrNull(this._modalCallbacks[i].onAction))
                        continue;
                    this._modalCallbacks[i].onAction(action);
                }
            },
            onBeforeAction: (action, callback) => {
                for (let i = 0; i < this._modalCallbacks.length; i++) {
                    if (isUndefinedOrNull(this._modalCallbacks[i].onBeforeAction))
                        continue;
                    this._modalCallbacks[i].onBeforeAction(action, callback);
                }
            }
        };
        this.build();
    }
    get modalCallbacks() {
        return this._internalCallbacks;
    }
    set modalCallbacks(value) {
        this._modalCallbacks.push(value);
    }
    // method to show the modal
    show() { }
    // method to close the modal
    close() { }
    modalIsShowed() {
        return false;
    }
    build() {
        if (ModalOptionsIsLoadingOptions(this.options)) {
            this.buildLoadingModal(this.options);
        }
        else if (ModalOptionsIsProgressOptions(this.options)) {
            this.buildProgressModal(this.options);
        }
        else if (ModalOptionsIsMessageOptions(this.options)) {
            this.buildMessageModal(this.options);
        }
        else if (ModalOptionsIsConfirmationOptions(this.options)) {
            this.buildConfirmationModal(this.options);
        }
        else if (ModalOptionsIsDataNeededOptions(this.options)) {
            this.buildDataNeededModal(this.options);
        }
        else {
            this.buildCustomModal(this.options);
        }
    }
    buildLoadingModal(_options) { }
    buildProgressModal(_options) { }
    buildMessageModal(_options) { }
    buildConfirmationModal(_options) { }
    buildDataNeededModal(_options) { }
    buildCustomModal(_options) { }
    buildIcon() {
        if (!ModalOptionsIsMessageOptions(this.options))
            return "";
        if (isReadyMadeIcon(this.options.icon)) {
            return this.options.icon;
        }
        else {
            return this.options.icon;
        }
    }
}
function isReadyMadeIcon(icon) {
    return [].includes(icon);
}
function getLabelFromReadyModal(useReadyModal) {
    let label;
    if (useReadyModal !== false) {
        label = useReadyModal;
    }
    else {
        label = "bootstrap";
    }
    return label;
}
function ModalOptionsIsLoadingOptions(modalOptions) {
    return modalOptions.hasOwnProperty('loadingMessage');
}
function ModalOptionsIsProgressOptions(modalOptions) {
    return modalOptions.hasOwnProperty('progressMessage');
}
function ModalOptionsIsMessageOptions(modalOptions) {
    return modalOptions.hasOwnProperty('buttons');
}
function ModalOptionsIsConfirmationOptions(modalOptions) {
    return modalOptions.hasOwnProperty('confirm');
}
function ModalOptionsIsDataNeededOptions(modalOptions) {
    return modalOptions.hasOwnProperty('inputs');
}

;// CONCATENATED MODULE: ./src/view/ViewUtils.ts
function getColorFromColorState(colorState) {
    if (colorIsColor(colorState))
        return colorState;
    switch (colorState) {
        case "success":
            return "#28a745";
        case "error":
            return "#dc3545";
        case "warning":
            return "#ffc107";
        case "info":
            return "#17a2b8";
        case "default":
            return "#007bff";
    }
}
function colorIsColor(color) {
    return typeof color === "string" && (color.startsWith("#") || color.startsWith("rgb"));
}
function colorIsColorState(color) {
    return !colorIsColor(color);
}

;// CONCATENATED MODULE: ./src/view/modal/modals/JConfirmModalHandler.ts




var Actions = ActionButtons.Actions;
class JConfirmModalHandler extends ModalHandler {
    constructor(requester, options) {
        super(requester, options);
        this.retry = () => { };
    }
    show() {
        let cl = this;
        // noinspection TypeScriptValidateJSTypes
        $.confirm(Object.assign(Object.assign({}, Object.assign({
            scrollToPreviousElement: false,
            scrollToPreviousElementAnimate: false,
            closeIcon: false,
            typeAnimated: true,
        }, this.jconfirmOptions)), {
            onOpen: function () {
                cl.$jconfirmModal = this;
                // noinspection JSUnresolvedReference
                cl.$modal = cl.$jconfirmModal.$el;
                cl.modalCallbacks.onOpen();
            },
            onClose: function () {
                cl.modalCallbacks.onClose();
            }
        }));
    }
    close() {
        this.$jconfirmModal.close();
    }
    modalIsShowed() {
        // noinspection JSUnresolvedReference
        return this.$jconfirmModal.isOpen();
    }
    buildLoadingModal(options) {
        this.jconfirmOptions = {
            icon: 'fa fa-spinner fa-spin',
            title: 'Loading',
            theme: getJConfirmTheme(options.theme),
            content: options.loadingMessage,
            buttons: '',
            type: getJConfirmColorFromColor(options.color),
            columnClass: getJConfirmColumnClassFromSize(options.size),
        };
    }
    buildProgressModal(_options) { }
    buildMessageModal(options) {
        this.jconfirmOptions = {
            icon: this.buildIcon(),
            title: options.title,
            theme: getJConfirmTheme(options.theme),
            content: options.content,
            buttons: this.buildButtons(options.buttons),
            type: getJConfirmColorFromColor(options.color),
            columnClass: getJConfirmColumnClassFromSize(options.size),
        };
    }
    buildConfirmationModal(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        this.jconfirmOptions = {
            icon: this.buildIcon(),
            title: 'Confirmation',
            theme: getJConfirmTheme(options.theme),
            content: (_g = (_a = options.confirmationMessage) !== null && _a !== void 0 ? _a : (_f = (_e = (_d = (_c = (_b = this.requester) === null || _b === void 0 ? void 0 : _b.requesterOptions) === null || _c === void 0 ? void 0 : _c.strings) === null || _d === void 0 ? void 0 : _d.response) === null || _e === void 0 ? void 0 : _e.modals) === null || _f === void 0 ? void 0 : _f.defaultConfirmationMsg) !== null && _g !== void 0 ? _g : "",
            buttons: this.buildButtons([
                {
                    action: {
                        actionType: Actions.ActionType.CONFIRM,
                    },
                    text: (_m = (_l = (_k = (_j = (_h = this.requester) === null || _h === void 0 ? void 0 : _h.requesterOptions) === null || _j === void 0 ? void 0 : _j.strings) === null || _k === void 0 ? void 0 : _k.response) === null || _l === void 0 ? void 0 : _l.confirmButton) !== null && _m !== void 0 ? _m : "Confirm",
                    color: getJConfirmColorFromColor("info"),
                },
                {
                    action: {
                        actionType: Actions.ActionType.CANCEL,
                    },
                    text: (_s = (_r = (_q = (_p = (_o = this.requester) === null || _o === void 0 ? void 0 : _o.requesterOptions) === null || _p === void 0 ? void 0 : _p.strings) === null || _q === void 0 ? void 0 : _q.response) === null || _r === void 0 ? void 0 : _r.cancelButton) !== null && _s !== void 0 ? _s : "Cancel",
                    color: getJConfirmColorFromColor("default"),
                }
            ]),
            type: getJConfirmColorFromColor(options.color),
            columnClass: getJConfirmColumnClassFromSize(options.size),
        };
    }
    buildDataNeededModal(options) {
        var _a;
        //put in content a bootstrap form with inputs from options.inputs
        const inputs = options.inputs.map(input => `
            <div class="form-group">
                <label for="${input.name}">${input.label}</label>
                <input type="${input.type}" class="form-control" id="${input.name}" name="${input.name}">
            </div>
        `).join('');
        let msg = "";
        if (!isUndefinedOrNull(options.message))
            msg = `<p>${options.message}</p>`;
        const content = `
            <div class="form pr-2 pl-2">
                ${msg}
                ${inputs}
            </div>
        `;
        this.jconfirmOptions = {
            icon: this.buildIcon(),
            title: options.title,
            theme: getJConfirmTheme(options.theme),
            content: content,
            buttons: this.buildButtons([
                {
                    action: {
                        actionType: Actions.ActionType.CONFIRM,
                    },
                    text: "Confirm",
                    color: (_a = options.color) !== null && _a !== void 0 ? _a : "default",
                },
                {
                    action: {
                        actionType: Actions.ActionType.CANCEL,
                    },
                    text: "Cancel",
                    color: "default",
                }
            ]),
            type: getJConfirmColorFromColor(options.color, "blue"),
            columnClass: getJConfirmColumnClassFromSize(options.size),
        };
    }
    // noinspection JSUnresolvedReference
    buildButtonAction(button) {
        if (Actions.isCloseAction(button.action)) {
            return () => {
                return true;
            };
        }
        else if (Actions.isRedirectAction(button.action)) {
            let action = button.action;
            let cl = this;
            return (modal, btn) => {
                // noinspection JSUnresolvedReference
                modal.$btnc.find('.btn').prop('disabled', true);
                btn.html(cl.requester.loadingIndicator.loadingIndicatorOptions.spinnerIcon);
                window.location.href = action.url;
                return false;
            };
        }
        else if (Actions.isRefreshAction(button.action)) {
            let cl = this;
            return (modal, btn) => {
                // noinspection JSUnresolvedReference
                modal.$btnc.find('.btn').prop('disabled', true);
                btn.html(cl.requester.loadingIndicator.loadingIndicatorOptions.spinnerIcon);
                window.location.reload();
                return false;
            };
        }
        else if (Actions.isCallFunctionAction(button.action)) {
            let action = button.action;
            let cl = this;
            return (modal, btn) => {
                // noinspection JSUnresolvedReference
                modal.$btnc.find('.btn').prop('disabled', true);
                btn.html(cl.requester.loadingIndicator.loadingIndicatorOptions.spinnerIcon);
                if (typeof window[action.functionName] === 'function') {
                    window[action.functionName]();
                }
                else {
                    console.warn(`Function ${action.functionName} is not defined.`);
                }
                return true;
            };
        }
        else if (Actions.isConfirmAction(button.action)) {
            return () => {
                return true;
            };
        }
        else if (Actions.isCancelAction(button.action)) {
            return () => {
                return true;
            };
        }
        else if (Actions.isRetryAction(button.action)) {
            return () => {
                this.retry();
                return true;
            };
        }
    }
    buildButtons(buttons_) {
        let buttons = {};
        for (let i = 0; i < buttons_.length; i++) {
            let button = buttons_[i];
            let cl = this;
            buttons[button.text] = {
                text: button.text,
                btnClass: 'btn-' + getJConfirmColorFromColor(button.color),
                action: function () {
                    cl.modalCallbacks.onBeforeAction(button.action.actionType, () => {
                        let ac = cl.buildButtonAction(button);
                        let close = true;
                        if (!isUndefinedOrNull(ac)) { // noinspection JSUnresolvedReference
                            close = ac(cl.$jconfirmModal, cl.$jconfirmModal.buttons[button.text].el);
                        }
                        if (close)
                            cl.$jconfirmModal.close();
                        cl.modalCallbacks.onAction(button.action.actionType);
                    });
                    return false;
                }
            };
        }
        return buttons;
    }
}
JConfirmModalHandler.label = 'jquery-confirm';
function getJConfirmColorFromColor(color, defaultColor = "default") {
    if (isUndefinedOrNull(color) || colorIsColor(color)) {
        return "blue";
    }
    else {
        switch (color) {
            case "success":
                return "green";
            case "error":
                return "red";
            case "warning":
                return "orange";
            case "info":
                return "blue";
            case "default":
            default:
                return defaultColor;
        }
    }
}
function getJConfirmTheme(theme) {
    if (isUndefinedOrNull(theme))
        return 'light';
    if (['dark', 'supervan', 'modern', 'material', 'bootstrap', 'light'].includes(theme))
        return theme;
    return 'light';
}
function getJConfirmColumnClassFromSize(size) {
    if (isUndefinedOrNull(size))
        return 'medium';
    if (['', 'small', 'medium', 'large', 'xlarge'].includes(size))
        return size;
    return 'medium';
}

;// CONCATENATED MODULE: ./src/view/modal/modals/BootstrapModalHandler.ts




var BootstrapModalHandler_ActionType = ActionButtons.Actions.ActionType;
var BootstrapModalHandler_Actions = ActionButtons.Actions;
class BootstrapModalHandler extends ModalHandler {
    constructor(requester, options) {
        super(requester, options);
        this.retry = () => { };
    }
    show() {
        let cl = this;
        this.$modal.on('shown.bs.modal', function () {
            cl.modalCallbacks.onOpen();
        });
        this.$modal.modal('show');
    }
    close() {
        this.$modal.modal('hide');
        this.modalCallbacks.onClose();
    }
    buildLoadingModal(options) {
        var _a;
        this.$modal = $(`
            <div class="modal fade" tabindex="-1" role="dialog" data-backdrop="static">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="d-flex justify-content-center align-items-center pt-3 pb-3">
                            <div class="spinner-border text-primary" role="status"></div>
                            <p class="ml-2 mb-0">${(_a = options.loadingMessage) !== null && _a !== void 0 ? _a : "Please wait..."}</p>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }
    buildProgressModal(_option) { }
    buildMessageModal(options) {
        var _a, _b, _c, _d, _e, _f, _g;
        let icon = this.buildIcon();
        let buttonsStr = "";
        let buttons = [];
        if (!isUndefinedOrNull(options.buttons)) {
            for (let i = 0; i < options.buttons.length; i++) {
                buttons.push(this.buildButtonAction(options.buttons[i]));
            }
        }
        for (let i = 0; i < buttons.length; i++) {
            let color = "";
            if (isUndefinedOrNull(buttons[i].color)) {
                buttonsStr += `<button type="button" class="btn-primary" id="${(_a = buttons[i].id) !== null && _a !== void 0 ? _a : ''}">${(_b = buttons[i].text) !== null && _b !== void 0 ? _b : 'action'}</button>`;
            }
            else {
                let btnColor = buttons[i].color;
                if (colorIsColor(btnColor)) {
                    if (btnColor !== "") {
                        color = `background-color: ${btnColor};`;
                    }
                    buttonsStr += `<button type="button" class="btn" style="${color}" id="${(_c = buttons[i].id) !== null && _c !== void 0 ? _c : ''}">${(_d = buttons[i].text) !== null && _d !== void 0 ? _d : 'action'}</button>`;
                }
                else if (colorIsColorState(btnColor)) {
                    if (btnColor !== "") {
                        color = ` btn-${getBootstrapClassColorFromColor(btnColor)}`;
                    }
                    buttonsStr += `<button type="button" class="btn${color}" id="${(_e = buttons[i].id) !== null && _e !== void 0 ? _e : ''}">${(_f = buttons[i].text) !== null && _f !== void 0 ? _f : 'action'}</button>`;
                }
            }
        }
        let content = options.content;
        if (!isUndefinedOrNull(content) && content !== "") {
            content = '<div class="modal-body">' + content + '</div>';
        }
        //same thing with buttonsStr
        if (buttonsStr !== "") {
            buttonsStr = '<div class="modal-footer">' + buttonsStr + '</div>';
        }
        let header = "";
        if (icon !== "" || options.title !== "") {
            header = `<div class="modal-header"><div class="row"><h5 class="modal-title">${icon !== null && icon !== void 0 ? icon : ""}${(_g = options.title) !== null && _g !== void 0 ? _g : ""}</h5><div class="col-10"></div>`;
        }
        this.$modal = $(`
            <div class="modal fade" tabindex="-1" role="dialog" data-backdrop="static">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        ${header}
                        ${content}
                        ${buttonsStr}
                    </div>
                </div>
            </div>
        `);
        this.$modal.find('.close').on('click', () => {
            this.$modal.modal('hide');
        });
        let cl = this;
        for (let i = 0; i < buttons.length; i++) {
            this.$modal.find('#' + buttons[i].id).on('click', () => {
                var _a;
                cl.modalCallbacks.onBeforeAction((_a = buttons[i].actionType) !== null && _a !== void 0 ? _a : "unknown", () => {
                    var _a;
                    if (buttons[i].action(cl.$modal)) {
                        cl.$modal.modal('hide');
                    }
                    cl.modalCallbacks.onAction((_a = buttons[i].actionType) !== null && _a !== void 0 ? _a : "unknown");
                });
            });
        }
    }
    buildConfirmationModal(_options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        // create a ModalMessageOptions object from ModalConfirmationOptions with buttons yes / no and return after that buildMessageModal
        let options = {
            title: "",
            content: (_g = (_a = _options.confirmationMessage) !== null && _a !== void 0 ? _a : (_f = (_e = (_d = (_c = (_b = this.requester) === null || _b === void 0 ? void 0 : _b.requesterOptions) === null || _c === void 0 ? void 0 : _c.strings) === null || _d === void 0 ? void 0 : _d.response) === null || _e === void 0 ? void 0 : _e.modals) === null || _f === void 0 ? void 0 : _f.defaultConfirmationMsg) !== null && _g !== void 0 ? _g : "",
            buttons: [
                {
                    action: {
                        actionType: BootstrapModalHandler_ActionType.CONFIRM,
                    },
                    text: (_m = (_l = (_k = (_j = (_h = this.requester) === null || _h === void 0 ? void 0 : _h.requesterOptions) === null || _j === void 0 ? void 0 : _j.strings) === null || _k === void 0 ? void 0 : _k.response) === null || _l === void 0 ? void 0 : _l.confirmButton) !== null && _m !== void 0 ? _m : "Confirm",
                    color: "info",
                },
                {
                    action: {
                        actionType: BootstrapModalHandler_ActionType.CANCEL,
                    },
                    text: (_s = (_r = (_q = (_p = (_o = this.requester) === null || _o === void 0 ? void 0 : _o.requesterOptions) === null || _p === void 0 ? void 0 : _p.strings) === null || _q === void 0 ? void 0 : _q.response) === null || _r === void 0 ? void 0 : _r.cancelButton) !== null && _s !== void 0 ? _s : "Cancel",
                    color: "default",
                }
            ]
        };
        this.buildMessageModal(options);
    }
    buildButtonAction(button) {
        if (BootstrapModalHandler_Actions.isCloseAction(button.action)) {
            return {
                actionType: button.action.actionType,
                text: button.text,
                color: button.color,
                id: 'btn-' + Math.random().toString(36).substring(2, 12),
                action: () => {
                    return true;
                }
            };
        }
        else if (BootstrapModalHandler_Actions.isRedirectAction(button.action)) {
            let action = button.action;
            let cl = this;
            return {
                actionType: button.action.actionType,
                text: button.text,
                color: button.color,
                id: 'btn-' + Math.random().toString(36).substring(2, 12),
                action: ($modal) => {
                    $modal.find('.modal-footer .btn').prop('disabled', true);
                    $(this).html(cl.requester.loadingIndicator.loadingIndicatorOptions.spinnerIcon);
                    window.location.href = action.url;
                    return false;
                }
            };
        }
        else if (BootstrapModalHandler_Actions.isRefreshAction(button.action)) {
            let cl = this;
            return {
                actionType: button.action.actionType,
                text: button.text,
                color: button.color,
                id: 'btn-' + Math.random().toString(36).substring(2, 12),
                action: ($modal) => {
                    $modal.find('.modal-footer .btn').prop('disabled', true);
                    $(this).html(cl.requester.loadingIndicator.loadingIndicatorOptions.spinnerIcon);
                    window.location.reload();
                    return false;
                }
            };
        }
        else if (BootstrapModalHandler_Actions.isCallFunctionAction(button.action)) {
            let action = button.action;
            let cl = this;
            return {
                actionType: button.action.actionType,
                text: button.text,
                color: button.color,
                id: 'btn-' + Math.random().toString(36).substring(2, 12),
                action: ($modal) => {
                    $modal.find('.modal-footer .btn').prop('disabled', true);
                    $(this).html(cl.requester.loadingIndicator.loadingIndicatorOptions.spinnerIcon);
                    if (typeof window[action.functionName] === 'function') {
                        window[action.functionName]();
                    }
                    else {
                        console.warn(`Function ${action.functionName} is not defined.`);
                    }
                    return true;
                }
            };
        }
        else if (BootstrapModalHandler_Actions.isConfirmAction(button.action)) {
            return {
                actionType: button.action.actionType,
                text: button.text,
                color: button.color,
                id: 'btn-confirm',
                action: () => {
                    return true;
                }
            };
        }
        else if (BootstrapModalHandler_Actions.isCancelAction(button.action)) {
            return {
                actionType: button.action.actionType,
                text: button.text,
                color: button.color,
                id: 'btn-cancel',
                action: () => {
                    return true;
                }
            };
        }
        else if (BootstrapModalHandler_Actions.isRetryAction(button.action)) {
            return {
                actionType: button.action.actionType,
                text: button.text,
                color: button.color,
                id: 'btn-retry',
                action: () => {
                    this.retry();
                    return true;
                }
            };
        }
    }
    modalIsShowed() {
        return this.$modal.hasClass('show');
    }
}
BootstrapModalHandler.label = 'bootstrap';
function getBootstrapClassColorFromColor(color) {
    switch (color) {
        case "success":
        case "warning":
            return color;
        case "error":
            return "danger";
        case "info":
        case "default":
            return "primary";
    }
}

;// CONCATENATED MODULE: ./src/view/modal/modals/HandlerCollector.ts



function collectModalHandlers(modalHandlersToRegister = null) {
    if (modalHandlersToRegister !== null) {
        for (let i = 0; i < modalHandlersToRegister.length; i++) {
            ModalHandlerManager.registerHandler(modalHandlersToRegister[i]);
        }
    }
    else {
        ModalHandlerManager.registerHandler(JConfirmModalHandler);
        ModalHandlerManager.registerHandler(BootstrapModalHandler);
    }
    console.log("modalHandlers", ModalHandlerManager.handlers);
}

;// CONCATENATED MODULE: ./src/requester/RequesterStrings.ts
const defaultRequesterStrings = {
    response: {
        modals: {
            data_needed: {
                title: "Almost there !",
                message: "You should fill the following fields to continue."
            },
            unknownErrorWithRetry: {
                title: "Unknown Error",
                message: "Unexpected response format. Please try again."
            },
            defaultConfirmationMsg: "Are you sure you want to continue?"
        },
        retryButton: "Retry",
        closeButton: "Close",
        yesButton: "Yes",
        noButton: "No",
        confirmButton: "Confirm",
        cancelButton: "Cancel",
        okButton: "OK"
    },
    loading: {
        loadingMessage: "Loading..."
    }
};

;// CONCATENATED MODULE: ./src/requester/RequesterOptionsBuilder.ts





class RequesterOptionsBuilder {
    constructor(requesterOptionsEntered, reqEase = null) {
        var _a, _b, _c;
        this.requesterOptions = new RequesterOptions();
        this.requesterOptionsEntered = requesterOptionsEntered;
        this.requesterOptions.useReadyModal = (_a = requesterOptionsEntered.useReadyModal) !== null && _a !== void 0 ? _a : false;
        this.requesterOptions.loading = requesterOptionsEntered.loading;
        this.requesterOptions.modalHandlersToRegister = (_b = requesterOptionsEntered.modalHandlersToRegister) !== null && _b !== void 0 ? _b : [];
        this.requesterOptions.strings = $.extend(true, defaultRequesterStrings, (_c = requesterOptionsEntered.strings) !== null && _c !== void 0 ? _c : {});
        this.reqEase = reqEase;
    }
    build() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        collectModalHandlers();
        if (Array.isArray(this.requesterOptions.modalHandlersToRegister)) {
            collectModalHandlers(this.requesterOptions.modalHandlersToRegister);
        }
        else {
            collectModalHandlers([this.requesterOptions.modalHandlersToRegister]);
        }
        this.requesterOptions.showConfirmModal = (_a = this.requesterOptionsEntered.showConfirmModal) !== null && _a !== void 0 ? _a : false;
        // add the form,okBtb
        [this.requesterOptions.form, this.requesterOptions.okBtn] = getOkBtnFromForm(this.requesterOptionsEntered.form, this.requesterOptionsEntered.okBtn);
        if (!isUndefinedOrNull(this.requesterOptions.form)) {
            this.requesterOptionsEntered.request = $.extend(true, {
                url: (_b = this.requesterOptions.form.attr('action')) !== null && _b !== void 0 ? _b : null,
                method: (_c = this.requesterOptions.form.attr('method')) !== null && _c !== void 0 ? _c : null,
                dataType: (_d = this.requesterOptions.form.attr('enctype ')) !== null && _d !== void 0 ? _d : null,
            }, this.requesterOptionsEntered.request);
        }
        this.requesterOptions.fields = (_e = this.requesterOptionsEntered.fields) !== null && _e !== void 0 ? _e : (isUndefinedOrNull(this.requesterOptions.form) ? [] : 'auto');
        this.requesterOptions.requestData = (_f = this.requesterOptionsEntered.requestData) !== null && _f !== void 0 ? _f : {};
        this.requesterOptions.intendedRedirect = (_g = this.requesterOptionsEntered.intendedRedirect) !== null && _g !== void 0 ? _g : 'key:intendedRedirect';
        this.requesterOptions.intendedRedirectPriority = (_h = this.requesterOptionsEntered.intendedRedirectPriority) !== null && _h !== void 0 ? _h : false;
        this.requesterOptions.request = this.requesterOptionsEntered.request;
        this.requesterOptions.response = this.requesterOptionsEntered.response;
        return this.requesterOptions;
    }
}

;// CONCATENATED MODULE: ./src/requester/RequesterOptions.ts

class RequesterOptions {
    static Builder(requesterOptionsEntered, reqEase = null) {
        return new RequesterOptionsBuilder(requesterOptionsEntered, reqEase);
    }
}
function isIntendedRedirectKey(key) {
    return key.startsWith("key:");
}

;// CONCATENATED MODULE: ./src/view/LoadingIndicatorOptions.ts

var LoadingState;
(function (LoadingState) {
    LoadingState["LOADING"] = "loading";
    LoadingState["NOT_LOADING"] = "not-loading";
})(LoadingState || (LoadingState = {}));
const defaultButtonAffect = (loadingIndicator, _loadingIndicatorActions, toState) => {
    if (isUndefinedOrNull(loadingIndicator.requester.requesterOptions.okBtn)) {
        return;
    }
    loadingIndicator.requester.requesterOptions.okBtn.prop("disabled", toState !== LoadingState.NOT_LOADING);
    if (toState === LoadingState.LOADING) {
        loadingIndicator.requester.requesterOptions.okBtn.data('original-content', loadingIndicator.requester.requesterOptions.okBtn.html());
        loadingIndicator.requester.requesterOptions.okBtn.html(loadingIndicator.loadingIndicatorOptions.spinnerIcon);
    }
    else {
        loadingIndicator.requester.requesterOptions.okBtn.html(loadingIndicator.requester.requesterOptions.okBtn.data('original-content'));
    }
    loadingIndicator.requester.requesterOptions.okBtn.data('data-loading-state', toState);
};
const defaultLoadingIndicatorOptions = {
    loadingInModal: true,
    modalOptions: {
        loadingMessage: "Verifying in progress...",
    },
    loadingIndicatorActions: {
        affectButton: defaultButtonAffect
    }
};

;// CONCATENATED MODULE: ./src/view/LoadingIndicatorOptionsBuilder.ts



class LoadingIndicatorOptionsBuilder {
    constructor(requester, loadingIndicatorOptionsEntered) {
        this.loadingIndicatorOptionsEntered = loadingIndicatorOptionsEntered;
        this.requester = requester;
    }
    build() {
        var _a, _b, _c, _d, _e, _f, _g;
        let loadingOptions;
        loadingOptions = $.extend(true, defaultLoadingIndicatorOptions, {
            modalOptions: {
                loadingMessage: (_e = (_d = (_c = (_b = (_a = this.requester) === null || _a === void 0 ? void 0 : _a.requesterOptions) === null || _b === void 0 ? void 0 : _b.strings) === null || _c === void 0 ? void 0 : _c.loading) === null || _d === void 0 ? void 0 : _d.loadingMessage) !== null && _e !== void 0 ? _e : defaultLoadingIndicatorOptions.modalOptions.loadingMessage,
            }
        });
        let label;
        if (this.requester.requesterOptions.useReadyModal !== false) {
            label = this.requester.requesterOptions.useReadyModal;
        }
        else {
            label = "bootstrap";
        }
        if (!isUndefinedOrNull(this.loadingIndicatorOptionsEntered)) {
            loadingOptions = $.extend(true, loadingOptions, this.loadingIndicatorOptionsEntered);
        }
        let loadingIndicatorOptions;
        loadingIndicatorOptions = {
            loadingInModal: (_f = loadingOptions.loadingInModal) !== null && _f !== void 0 ? _f : false,
            loadingIndicatorActions: $.extend(true, loadingOptions.loadingIndicatorActions, {
                modalHandler: ModalHandlerManager.createHandler(label, this.requester, loadingOptions.modalOptions)
            }),
            spinnerIcon: (_g = loadingOptions.spinnerIcon) !== null && _g !== void 0 ? _g : '<div class="spinner-border" role="status"></div>'
        };
        return loadingIndicatorOptions;
    }
}

;// CONCATENATED MODULE: ./src/view/LoadingIndicator.ts


class LoadingIndicator {
    constructor(requester, loadingIndicatorOptionsEntered) {
        this.requester = requester;
        this.loadingIndicatorOptions = (new LoadingIndicatorOptionsBuilder(requester, loadingIndicatorOptionsEntered)).build();
    }
    startLoading() {
        return new Promise((resolve) => {
            this.loadingIndicatorOptions.loadingIndicatorActions.affectButton(this, this.loadingIndicatorOptions.loadingIndicatorActions, LoadingState.LOADING);
            if (this.loadingIndicatorOptions.loadingInModal) {
                this.loadingIndicatorOptions.loadingIndicatorActions.modalHandler.show();
                this.loadingIndicatorOptions.loadingIndicatorActions.modalHandler.modalCallbacks.onOpen = () => {
                    resolve(true);
                };
            }
            else {
                resolve(true);
            }
        });
    }
    stopLoading() {
        if (this.isLoading()) {
            if (this.loadingIndicatorOptions.loadingInModal) {
                this.loadingIndicatorOptions.loadingIndicatorActions.modalHandler.close();
            }
            this.loadingIndicatorOptions.loadingIndicatorActions.affectButton(this, this.loadingIndicatorOptions.loadingIndicatorActions, LoadingState.NOT_LOADING);
        }
    }
    isLoading() {
        return this.loadingIndicatorOptions.loadingInModal ? this.loadingIndicatorOptions.loadingIndicatorActions.modalHandler.modalIsShowed() : (this.requester.requesterOptions.okBtn ? this.requester.requesterOptions.okBtn.prop("disabled") : false);
    }
}

;// CONCATENATED MODULE: ./src/requester/RequesterBuilder.ts



class RequesterBuilder {
    constructor(requesterOptionsEntered, reqEase) {
        this.requesterOptionsEntered = requesterOptionsEntered;
        this.requester = new Requester();
        this.reqEase = reqEase;
    }
    build() {
        var _a, _b;
        // override default form,okBtn by ReqEaseOptions
        this.requesterOptionsEntered.form = (_a = this.requesterOptionsEntered.form) !== null && _a !== void 0 ? _a : this.reqEase.reqEaseOptions.form;
        this.requesterOptionsEntered.okBtn = (_b = this.requesterOptionsEntered.okBtn) !== null && _b !== void 0 ? _b : this.reqEase.reqEaseOptions.okBtn;
        this.requester.requesterOptions = RequesterOptions.Builder(this.requesterOptionsEntered, this.reqEase).build();
        this.requester.reqEaseOptions = this.reqEase.reqEaseOptions;
        this.requester.loadingIndicator = new LoadingIndicator(this.requester, this.requester.requesterOptions.loading);
        return this.requester;
    }
}

;// CONCATENATED MODULE: ./src/requester/request/DataType.ts
var DataType;
(function (DataType) {
    DataType["JSON"] = "json";
    DataType["TEXT"] = "text";
    DataType["HTML"] = "html";
})(DataType || (DataType = {}));
const defaultDataType = DataType.JSON;

;// CONCATENATED MODULE: ./src/requester/request/HttpMethod.ts
var HttpMethod;
(function (HttpMethod) {
    HttpMethod["GET"] = "GET";
    HttpMethod["POST"] = "POST";
    HttpMethod["PUT"] = "PUT";
    HttpMethod["DELETE"] = "DELETE";
})(HttpMethod || (HttpMethod = {}));
const defaultHttpMethod = HttpMethod.POST;

;// CONCATENATED MODULE: ./src/Defaults.ts


let defaultHttpRequestOptions = {
    url: null,
    data: {},
    dataType: DataType.JSON,
    headers: {},
    method: HttpMethod.POST,
    beforeSend: () => { },
    ajaxExtraOptions: {}
};

;// CONCATENATED MODULE: ./src/requester/request/HttpRequestBuilder.ts
var HttpRequestBuilder_classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _HttpRequestBuilder_instances, _HttpRequestBuilder_getDefaultOptions;





class HttpRequestBuilder {
    constructor(requesterOptions, requestOptionsEntered) {
        _HttpRequestBuilder_instances.add(this);
        this.requesterOptions = requesterOptions;
        this.requestOptionsEntered = requestOptionsEntered;
        this.request = new HttpRequest();
    }
    build() {
        var _a, _b, _c;
        this.request.requestOptions = mergeObjects(HttpRequestBuilder_classPrivateFieldGet(this, _HttpRequestBuilder_instances, "m", _HttpRequestBuilder_getDefaultOptions).call(this), (_a = this.requestOptionsEntered) !== null && _a !== void 0 ? _a : {}, [
            "ajaxExtraOptions",
            "beforeSend",
            "headers"
        ]);
        if (!isUndefinedOrNull(this.requesterOptions.fields)) {
            if (this.requesterOptions.fields === 'auto') {
                if (isUndefinedOrNull(this.requesterOptions.form) || this.requesterOptions.form.length === 0) {
                    console.error("Form is not defined.");
                }
                else {
                    let formObj = this.requesterOptions.form.serializeArray();
                    console.log(formObj);
                    let data = {};
                    for (let i = 0; i < formObj.length; i++) {
                        data[formObj[i].name] = formObj[i].value;
                    }
                    this.request.requestOptions.data = Object.assign(Object.assign({}, this.request.requestOptions.data), data);
                }
            }
            else {
                for (let i = 0; i < this.requesterOptions.fields.length; i++) {
                    let field = getOneJqueryElementByName(this.requesterOptions.fields[i]);
                    if (field.length === 0)
                        continue;
                    this.request.requestOptions.data[field.attr('name')] = field.val();
                }
            }
        }
        if (!isUndefinedOrNull(this.requesterOptions.requestData)) {
            if (typeof this.requesterOptions.requestData === 'function') {
                this.requesterOptions.requestData((data) => {
                    this.request.requestOptions.data = Object.assign(Object.assign({}, this.request.requestOptions.data), data);
                });
            }
            else {
                this.request.requestOptions.data = Object.assign(Object.assign({}, this.request.requestOptions.data), this.requesterOptions.requestData);
            }
        }
        this.request.requestOptions = mergeObjects(this.request.requestOptions, (_c = (_b = this.requestOptionsEntered) === null || _b === void 0 ? void 0 : _b.ajaxExtraOptions) !== null && _c !== void 0 ? _c : {}, [
            "beforeSend",
        ]);
        this.request.requestOptions.beforeSend = (jqXHR, settings) => {
            var _a;
            for (let header in this.request.requestOptions.headers) {
                jqXHR.setRequestHeader(header, this.request.requestOptions.headers[header]);
            }
            if (isUndefinedOrNull((_a = this.requestOptionsEntered) === null || _a === void 0 ? void 0 : _a.beforeSend))
                return;
            return this.requestOptionsEntered.beforeSend(jqXHR, settings);
        };
        if (this.requesterOptions.intendedRedirect !== false) {
            let intendedRedirectUrl;
            if (typeof this.requesterOptions.intendedRedirect === 'string' && isIntendedRedirectKey(this.requesterOptions.intendedRedirect)) {
                let key = this.requesterOptions.intendedRedirect.substring(4);
                //get from the current url from get param key
                let url = new URL(window.location.href);
                intendedRedirectUrl = url.searchParams.get(key);
            }
            else if (typeof this.requesterOptions.intendedRedirect === 'function') {
                intendedRedirectUrl = this.requesterOptions.intendedRedirect();
            }
            else {
                intendedRedirectUrl = this.requesterOptions.intendedRedirect;
            }
            if (!isUndefinedOrNull(intendedRedirectUrl) && intendedRedirectUrl !== '') {
                this.request.requestOptions.data.__intendedRedirect__ = intendedRedirectUrl;
            }
        }
        return this.request;
    }
}
_HttpRequestBuilder_instances = new WeakSet(), _HttpRequestBuilder_getDefaultOptions = function _HttpRequestBuilder_getDefaultOptions() {
    return defaultHttpRequestOptions;
};

;// CONCATENATED MODULE: ./src/requester/request/HttpRequest.ts


class HttpRequest {
    constructor() {
        this.callbacks_ = {
            onResponseSuccess: (_response, _autoHandled, _ajaxDoneParams) => {
            },
            onResponseError: (_response, _autoHandled, _ajaxFailParams) => {
            },
            onResponse: (_response, _autoHandled, _ajaxParams) => {
            },
            onInternalError: (_error) => {
            }
        };
    }
    get callbacks_() {
        return this._callbacks_;
    }
    set callbacks_(value) {
        this._callbacks_ = value;
    }
    static Builder(requesterOptions, requestOptionsEntered) {
        return new HttpRequestBuilder(requesterOptions, requestOptionsEntered);
    }
    startRequest() {
        if (isUndefinedOrNull(this.requestOptions.url)) {
            this.callbacks_.onInternalError('url is not defined');
            return;
        }
        $.ajax(this.requestOptions).done((data, textStatus, jqXHR) => {
            this.callbacks_.onResponse(data, false, { data, textStatus, jqXHR });
            this.callbacks_.onResponseSuccess(data, false, { data, textStatus, jqXHR });
        }).fail((jqXHR, textStatus, errorThrown) => {
            this.callbacks_.onResponse(jqXHR.responseJSON, false, { jqXHR, textStatus, errorThrown });
            this.callbacks_.onResponseError(jqXHR.responseJSON, false, { jqXHR, textStatus, errorThrown });
        });
    }
}

;// CONCATENATED MODULE: ./src/view/messages/FormMessage.ts

var FormMessage_DefaultMessage = Messages.DefaultMessage;

class FormMessage extends FormMessage_DefaultMessage {
    constructor(messageData, messageRenderer, form) {
        super(messageData, messageRenderer);
        this.form = form;
    }
    destroy() {
        this.messageRenderer.removeMessages(this.messageRenderer, this);
    }
    show() {
        this.messageRenderer.renderMessages(this.messageRenderer, this, this.messageData);
    }
}
const defaultFormMessageRenderer = {
    buildMessage: (_messageRenderer, _message, messageData) => {
        var _a;
        let buttons = "";
        if (!isUndefinedOrNull(messageData.buttons)) {
            for (let button of messageData.buttons) {
                buttons += `<button class="btn btn-sm btn-outline-${(_a = button.color) !== null && _a !== void 0 ? _a : messageData.status}" type="button">${button.text}</button>`;
            }
        }
        if (buttons !== "") {
            buttons = `<hr><div class="buttons mt-3 mb-2">${buttons}</div>`;
        }
        let hideIcon = '<button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
            '    <span aria-hidden="true">&times;</span>\n' +
            '  </button>';
        return $("<div class='form-message alert alert-" + messageData.status + " alert-dismissible fade show'>" + hideIcon + messageData.message + buttons + "</div>");
    },
    renderMessages: (messageRenderer, message, messagesData) => {
        if (isUndefinedOrNull(message.form)) {
            console.error("FormMessageRenderer: form is undefined");
            return;
        }
        let form = message.form;
        let messages = form.find(".form-messages-parent");
        if (isUndefinedOrNull(messages) || messages.length === 0) {
            let messages_tmp = $('<div class="form-messages-parent"></div>');
            let okBtn = form.find('.btn').last();
            if (okBtn.length === 0) {
                okBtn = form.find('button[type="submit"]').last();
            }
            if (okBtn.parent().hasClass('form-group')) {
                okBtn = okBtn.parent();
            }
            messages_tmp.insertBefore(okBtn);
            messages = messages_tmp;
        }
        messageRenderer.removeMessages(messageRenderer, message);
        for (let messageData of messagesData) {
            let messageElement = messageRenderer.buildMessage(messageRenderer, message, messageData);
            messageElement.appendTo(messages);
        }
    },
    removeMessages: (_messageRenderer, message) => {
        message.form.find('.form-messages-parent .form-message').each(function (_index, element) {
            $(element).remove();
        });
    }
};

;// CONCATENATED MODULE: ./src/view/messages/ToastMessage.ts

var ToastMessage_DefaultMessage = Messages.DefaultMessage;

class ToastMessage extends ToastMessage_DefaultMessage {
    constructor(messageData, messageRenderer) {
        super(messageData, messageRenderer);
    }
    destroy() { }
    show() {
        this.messageRenderer.renderMessages(this.messageRenderer, this, this.messageData);
    }
}
const defaultToastMessageRenderer = {
    buildMessage: (_messageRenderer, _message, messageData) => {
        return $("<div class=\"toast\" role=\"alert\" aria-live=\"assertive\" aria-atomic=\"true\" data-autohide=\"false\"><div class=\"toast-header\">\n" +
            "    <button type=\"button\" class=\"ml-2 mb-1 close\" data-dismiss=\"toast\" aria-label=\"Close\">\n" +
            "      <span aria-hidden=\"true\">&times;</span>\n" +
            "    </button>\n" +
            "  </div><div class=\"toast-body\">" + messageData.message + "</div></div>");
    },
    renderMessages: (messageRenderer, message, messagesData) => {
        let messages = $('body').find(".form-messages-parent");
        if (isUndefinedOrNull(messages) || messages.length === 0) {
            let messages_tmp = $('<div style="position: fixed; bottom: 0; right: 0;" class="pr-4 pb-4"></div>');
            messages_tmp.appendTo('body');
            messages = messages_tmp;
        }
        for (let messageData of messagesData) {
            let messageElement = messageRenderer.buildMessage(messageRenderer, message, messageData);
            messageElement.appendTo(messages).toast('show');
        }
    },
    removeMessages: (_messageRenderer, _message) => { }
};

;// CONCATENATED MODULE: ./src/requester/response/responses/ResponseHandlerManager.ts

var ResponseHandlerManager_Actions = ActionButtons.Actions;
class ResponseHandlerManager {
    // Register a response handler with a label
    static registerHandler(handler) {
        ResponseHandlerManager.handlers[handler.label] = handler;
    }
    static createHandler(label, requester, response) {
        const handlerClass = ResponseHandlerManager.handlers[label];
        if (!handlerClass) {
            console.error(`Response handler with label "${label}" not registered.`);
            return null;
        }
        return new handlerClass(requester, response);
    }
    static showUnknownErrorWithRetry(requester, retry) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
        let handler = ResponseHandlerManager.createHandler("message", requester, {
            buttons: [
                {
                    action: {
                        actionType: ResponseHandlerManager_Actions.ActionType.RETRY
                    },
                    color: 'error',
                    text: (_d = (_c = (_b = (_a = requester === null || requester === void 0 ? void 0 : requester.requesterOptions) === null || _a === void 0 ? void 0 : _a.strings) === null || _b === void 0 ? void 0 : _b.response) === null || _c === void 0 ? void 0 : _c.retryButton) !== null && _d !== void 0 ? _d : ""
                },
                {
                    action: {
                        actionType: ResponseHandlerManager_Actions.ActionType.CLOSE
                    },
                    color: 'default',
                    text: (_h = (_g = (_f = (_e = requester === null || requester === void 0 ? void 0 : requester.requesterOptions) === null || _e === void 0 ? void 0 : _e.strings) === null || _f === void 0 ? void 0 : _f.response) === null || _g === void 0 ? void 0 : _g.closeButton) !== null && _h !== void 0 ? _h : ""
                }
            ],
            color: 'error',
            content: {
                body: (_p = (_o = (_m = (_l = (_k = (_j = requester === null || requester === void 0 ? void 0 : requester.requesterOptions) === null || _j === void 0 ? void 0 : _j.strings) === null || _k === void 0 ? void 0 : _k.response) === null || _l === void 0 ? void 0 : _l.modals) === null || _m === void 0 ? void 0 : _m.unknownErrorWithRetry) === null || _o === void 0 ? void 0 : _o.message) !== null && _p !== void 0 ? _p : "",
                title: (_v = (_u = (_t = (_s = (_r = (_q = requester === null || requester === void 0 ? void 0 : requester.requesterOptions) === null || _q === void 0 ? void 0 : _q.strings) === null || _r === void 0 ? void 0 : _r.response) === null || _s === void 0 ? void 0 : _s.modals) === null || _t === void 0 ? void 0 : _t.unknownErrorWithRetry) === null || _u === void 0 ? void 0 : _u.title) !== null && _v !== void 0 ? _v : ""
            },
            type: "modal-medium",
        });
        handler.retry = retry;
        handler.renderResponse();
    }
}
ResponseHandlerManager.handlers = {};

;// CONCATENATED MODULE: ./src/requester/response/ResponseHandler.ts
class ResponseHandler {
    prepare() { }
    constructor(requester, response) {
        this.retry = () => { };
        this.response = response;
        this.requester = requester;
    }
    // noinspection JSUnusedGlobalSymbols
    renderResponse() { }
}
function getSizeFromType(type) {
    switch (type) {
        case "modal-big":
            return "large";
        case "modal-medium":
            return "medium";
    }
}
function isModalSize(type) {
    return ["modal-big", "modal-medium"].includes(type);
}

;// CONCATENATED MODULE: ./src/requester/response/responses/handlers/MessageResponseHandler.ts






class MessageResponseHandler extends ResponseHandler {
    constructor() {
        super(...arguments);
        this.message = null;
        this.retry = () => { };
    }
    prepare() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        if (isModalSize(this.response.type)) {
            let label = getLabelFromReadyModal(this.requester.requesterOptions.useReadyModal);
            this.modalHandler = ModalHandlerManager.createHandler(label, this.requester, {
                title: (_c = (_b = (_a = this.response) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.title) !== null && _c !== void 0 ? _c : "",
                content: (_f = (_e = (_d = this.response) === null || _d === void 0 ? void 0 : _d.content) === null || _e === void 0 ? void 0 : _e.body) !== null && _f !== void 0 ? _f : "",
                buttons: (_h = (_g = this.response) === null || _g === void 0 ? void 0 : _g.buttons) !== null && _h !== void 0 ? _h : [],
                color: (_k = (_j = this.response) === null || _j === void 0 ? void 0 : _j.color) !== null && _k !== void 0 ? _k : "primary",
                size: getSizeFromType(this.response.type),
            });
            this.modalHandler.retry = this.retry;
        }
        else {
            if (this.response.type === "msg-in-form") {
                let message = (this.response.content.title !== '' ? '<b>' + this.response.content.title + '</b>: ' : '') + this.response.content.body;
                this.message = new FormMessage([
                    {
                        message: message,
                        status: this.response.color,
                        buttons: this.response.buttons
                    }
                ], this.requester.httpResponse.httpResponseOptions.formMessageRenderer, this.requester.requesterOptions.form);
            }
            else if (this.response.type === "msg-in-toast") {
                this.message = new ToastMessage([
                    {
                        message: this.response.content.body,
                        status: this.response.color,
                    }
                ], this.requester.httpResponse.httpResponseOptions.toastMessageRenderer);
            }
            else {
                console.error("Unknown response type ('" + this.response.type + "')");
            }
        }
    }
    renderResponse() {
        this.prepare();
        if (isModalSize(this.response.type)) {
            this.modalHandler.show();
        }
        else {
            if (!isUndefinedOrNull(this.message)) {
                this.message.show();
            }
        }
    }
}
MessageResponseHandler.label = "message";

;// CONCATENATED MODULE: ./src/requester/response/responses/handlers/FieldsValidationResponseHandler.ts



class FieldsValidationResponseHandler extends ResponseHandler {
    prepare() {
        if (!isUndefinedOrNull(this.response.fieldsWithErrors)) {
            for (let fieldName in this.response.fieldsWithErrors) {
                let field = $('[name="' + fieldName + '"]');
                if (field.length === 0) {
                    console.error("Field with name '" + fieldName + "' not found");
                    continue;
                }
                FormValidator.showInputError(field, this.response.fieldsWithErrors[fieldName], this.requester.httpResponse.httpResponseOptions.inputMessageRenderer);
            }
        }
    }
    renderResponse() {
        this.prepare();
    }
}
FieldsValidationResponseHandler.label = "fields_validation_error";

;// CONCATENATED MODULE: ./src/requester/response/responses/handlers/HandlerCollector.ts



function collectResponseHandlers(responseHandlersToRegister = null) {
    if (responseHandlersToRegister !== null) {
        for (let i = 0; i < responseHandlersToRegister.length; i++) {
            ResponseHandlerManager.registerHandler(responseHandlersToRegister[i]);
        }
    }
    else {
        ResponseHandlerManager.registerHandler(MessageResponseHandler);
        ResponseHandlerManager.registerHandler(FieldsValidationResponseHandler);
        //ResponseHandlerManager.registerHandler(DataNeededResponseHandler);
    }
}

;// CONCATENATED MODULE: ./src/requester/response/HttpResponseBuilder.ts





class HttpResponseBuilder {
    constructor(requesterOptions, httpResponseOptionsEntered) {
        var _a;
        this.requesterOptions = requesterOptions;
        this.httpResponseOptionsEntered = httpResponseOptionsEntered !== null && httpResponseOptionsEntered !== void 0 ? httpResponseOptionsEntered : {};
        this.httpResponse = new HttpResponse();
        this.httpResponseOptionsEntered.responseHandlersToRegister = (_a = httpResponseOptionsEntered === null || httpResponseOptionsEntered === void 0 ? void 0 : httpResponseOptionsEntered.responseHandlersToRegister) !== null && _a !== void 0 ? _a : [];
    }
    build() {
        collectResponseHandlers();
        if (Array.isArray(this.httpResponseOptionsEntered.responseHandlersToRegister)) {
            collectResponseHandlers(this.httpResponseOptionsEntered.responseHandlersToRegister);
        }
        else {
            collectResponseHandlers([this.httpResponseOptionsEntered.responseHandlersToRegister]);
        }
        this.httpResponse.httpResponseOptions = $.extend(true, {
            autoResponseRender: true,
            rejectUnknownResponse: true,
            callbacks: {
                onResponse: () => {
                },
                onResponseError: () => {
                },
                onResponseSuccess: () => {
                },
                onInternalError: () => {
                }
            },
            inputMessageRenderer: defaultInputMessageRenderer,
            formMessageRenderer: defaultFormMessageRenderer,
            toastMessageRenderer: defaultToastMessageRenderer,
            responseHandlersToRegister: []
        }, this.httpResponseOptionsEntered);
        return this.httpResponse;
    }
}

;// CONCATENATED MODULE: ./src/requester/response/responses/Responses.ts

var Responses;
(function (Responses) {
    function isResponse(response) {
        return !isUndefinedOrNull(response) && typeof response === 'object' && 'version' in response && 'httpCode' in response;
    }
    Responses.isResponse = isResponse;
    function isCustomResponse(response) {
        return !isUndefinedOrNull(response) && typeof response === 'object' && 'label' in response && !isUndefinedOrNull(response.label);
    }
    Responses.isCustomResponse = isCustomResponse;
    //add function to check type of responses who extends BaseResponse
    function isMessageResponse(response) {
        return 'type' in response && !isUndefinedOrNull(response.type) && 'content' in response;
    }
    Responses.isMessageResponse = isMessageResponse;
    function isProgressResponse(response) {
        return 'progress' in response && !isUndefinedOrNull(response.progress) && 'maxProgress' in response && !isUndefinedOrNull(response.maxProgress);
    }
    Responses.isProgressResponse = isProgressResponse;
    function isDataNeededResponse(response) {
        return 'neededData' in response && !isUndefinedOrNull(response.neededData);
    }
    Responses.isDataNeededResponse = isDataNeededResponse;
    function isFieldsValidationErrorResponse(response) {
        return 'fieldsWithErrors' in response;
    }
    Responses.isFieldsValidationErrorResponse = isFieldsValidationErrorResponse;
    function getResponseLabel(response) {
        if (isResponse(response)) {
            if (isMessageResponse(response)) {
                return "message";
            }
            else if (isProgressResponse(response)) {
                return 'progress';
            }
            else if (isDataNeededResponse(response)) {
                return 'data_needed';
            }
            else if (isFieldsValidationErrorResponse(response)) {
                return 'fields_validation_error';
            }
        }
        return response.label;
    }
    Responses.getResponseLabel = getResponseLabel;
})(Responses || (Responses = {}));

;// CONCATENATED MODULE: ./src/requester/response/HttpResponse.ts




class HttpResponse {
    static Builder(requesterOptions, httpResponseOptionsEntered) {
        return new HttpResponseBuilder(requesterOptions, httpResponseOptionsEntered);
    }
    handle(response, ajaxParams) {
        this.httpResponseOptions.callbacks.onResponse(response, false, ajaxParams);
        if (!this.httpResponseOptions.autoResponseRender)
            return;
        if (!Responses.isResponse(response) && !Responses.isCustomResponse(response)) {
            if (this.httpResponseOptions.rejectUnknownResponse) {
                ResponseHandlerManager.showUnknownErrorWithRetry(this.requester, () => {
                    this.requester.retry();
                });
            }
            return;
        }
        let label = Responses.getResponseLabel(response);
        console.log("label", label);
        let httpResponseHandler = ResponseHandlerManager.createHandler(label, this.requester, response);
        if (!isUndefinedOrNull(httpResponseHandler)) {
            httpResponseHandler.renderResponse();
        }
    }
}

;// CONCATENATED MODULE: ./src/requester/Requester.ts
var Requester_classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Requester_instances, _Requester_prepare;






class Requester {
    constructor() {
        _Requester_instances.add(this);
    }
    static Builder(requesterOptionsEntered, reqEase = null) {
        return new RequesterBuilder(requesterOptionsEntered, reqEase);
    }
    /**
     * in case you're not using ReqEase but the module Requester independently.
     */
    init() {
        if (isUndefinedOrNull(this.reqEaseOptions)) {
            if (isUndefinedOrNull(this.requesterOptions.okBtn)) {
                console.error('okBtn is required');
                return;
            }
            this.requesterOptions.okBtn.on('click', () => {
                this.start();
            });
        }
        else {
            this.start();
        }
    }
    addParams(data) {
        this.httpRequest.requestOptions.data = Object.assign(Object.assign({}, this.httpRequest.requestOptions.data), data);
    }
    start() {
        Requester_classPrivateFieldGet(this, _Requester_instances, "m", _Requester_prepare).call(this);
        console.log("Requester started");
        this.httpRequest.callbacks_ = {
            onResponseSuccess: (response, _autoHandled, ajaxDoneParams) => {
                this.httpResponse.handle(response, ajaxDoneParams);
            },
            onResponseError: (response, _autoHandled, ajaxFailParams) => {
                this.httpResponse.handle(response, ajaxFailParams);
            },
            onResponse: (_response, _autoHandled, _ajaxParams) => {
                this.loadingIndicator.stopLoading();
            },
            onInternalError: (error) => {
                console.error("internal error", error);
                this.loadingIndicator.stopLoading();
            }
        };
        new Promise((resolve) => {
            if (this.requesterOptions.showConfirmModal) {
                let label = getLabelFromReadyModal(this.requesterOptions.useReadyModal);
                let modal = ModalHandlerManager.createHandler(label, this, {
                    confirm: () => {
                        resolve(true);
                    },
                    cancel: () => {
                        resolve(false);
                    }
                });
                modal === null || modal === void 0 ? void 0 : modal.show();
            }
            else {
                resolve(true);
            }
        }).then((go) => {
            if (!go)
                return;
            new Promise((resolve) => {
                if (!this.loadingIndicator.isLoading()) {
                    this.loadingIndicator.startLoading().then(() => resolve(true));
                }
                else {
                    resolve(true);
                }
            }).then(() => {
                this.httpRequest.startRequest();
            });
        });
    }
    retry() {
        this.start();
    }
}
_Requester_instances = new WeakSet(), _Requester_prepare = function _Requester_prepare() {
    console.log("Requester prepare", this.requesterOptions);
    this.httpRequest = HttpRequest.Builder(this.requesterOptions, this.requesterOptions.request).build();
    this.httpResponse = HttpResponse.Builder(this.requesterOptions, this.requesterOptions.response).build();
    this.httpRequest.requester = this;
    this.httpResponse.requester = this;
    this.httpRequest.requesterOptions = this.requesterOptions;
    this.httpResponse.requesterOptions = this.requesterOptions;
};

;// CONCATENATED MODULE: ./src/ReqEase.ts
// ReqEase.ts
var ReqEase_classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ReqEase_instances, _ReqEase_prepare;






class ReqEase {
    constructor(reqEaseOptions = {}) {
        _ReqEase_instances.add(this);
        this.reqEaseOptions = ReqEaseOptions.Builder(reqEaseOptions).build();
        ReqEase.Builder(reqEaseOptions, this).build();
        ReqEase_classPrivateFieldGet(this, _ReqEase_instances, "m", _ReqEase_prepare).call(this);
        this.start();
    }
    static Builder(reqEaseOptions, instance) {
        return new ReqEaseBuilder(reqEaseOptions, instance);
    }
    start() {
        console.log(this.requester);
        if (this.reqEaseOptions.buildMode === BuildMode.everytime) {
            ReqEase_classPrivateFieldGet(this, _ReqEase_instances, "m", _ReqEase_prepare).call(this);
        }
        if (isUndefinedOrNull(this.reqEaseOptions.okBtn)) {
            console.error('okBtn is required');
            return;
        }
        this.formValidator.initiate();
        this.reqEaseOptions.okBtn.on('click', () => {
            new Promise((resolve) => {
                if (this.formValidator.options.validationDuringLoading) {
                    this.requester.loadingIndicator.startLoading().then(() => resolve(true));
                }
                else {
                    resolve(true);
                }
            }).then(() => {
                this.formValidator.validate({
                    onSuccess: () => {
                        this.requester.init();
                    },
                    onFailure: () => {
                        console.log("validation failed -_-", this.requester.loadingIndicator.isLoading());
                        this.requester.loadingIndicator.stopLoading();
                    }
                });
            });
        });
    }
}
_ReqEase_instances = new WeakSet(), _ReqEase_prepare = function _ReqEase_prepare() {
    var _a, _b;
    if (!isUndefinedOrNull(this.reqEaseOptions.form)) {
        this.reqEaseOptions.form.on('submit', (event) => {
            event.preventDefault(); // Prevent the form from submitting traditionally
        });
    }
    this.formValidator = FormValidator.Builder((_a = this.reqEaseOptions.formValidator) !== null && _a !== void 0 ? _a : {}, this.reqEaseOptions).build();
    this.requester = Requester.Builder((_b = this.reqEaseOptions.requester) !== null && _b !== void 0 ? _b : {}, this).build();
};

;// CONCATENATED MODULE: ./src/ReqEaseJquery.ts

function ReqEaseJquery(options) {
    let reqEase = $(this).data('reqease');
    if (typeof reqEase !== 'undefined')
        return reqEase;
    else {
        reqEase = new ReqEase($.extend(true, options, {
            form: $(this),
        }));
        $(this).data('reqease', reqEase);
        return reqEase;
    }
}

;// CONCATENATED MODULE: ./src/index.ts
// index.ts








(function ($) {
    $.fn.ReqEase = ReqEaseJquery;
})(jQuery);
window.ReqEase = ReqEase;
window.Requester = Requester;
window.FormValidator = FormValidator;


})();

/******/ })()
;