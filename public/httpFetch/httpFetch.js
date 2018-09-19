/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dotProp = __webpack_require__(1);

var _dotProp2 = _interopRequireDefault(_dotProp);

var _sift = __webpack_require__(3);

var _sift2 = _interopRequireDefault(_sift);

var _querySelectorShadowDom = __webpack_require__(4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
// import rdfExt from 'rdf-ext'
//import N3Parser from 'rdf-parser-n3'
//import rdfFetch from 'rdf-fetch-lite'
// import formatsCommon from 'rdf-formats-common'
// import stringToStream from 'string-to-stream'
// //import Readable from 'readable-stream'
// import RdfXmlParser from 'rdf-parser-rdfxml'
// //import rdflib from 'rdflib'
// import TripleToQuadTransform from 'rdf-transform-triple-to-quad'


var httpCrud = function (_HTMLElement) {
  _inherits(httpCrud, _HTMLElement);

  function httpCrud() {
    _classCallCheck(this, httpCrud);

    var _this = _possibleConstructorReturn(this, (httpCrud.__proto__ || Object.getPrototypeOf(httpCrud)).call(this));

    _this.subscriptions = [];
    return _this;
  }

  _createClass(httpCrud, [{
    key: 'setChannel',
    value: function setChannel(channel) {
      var _this2 = this;

      //console.log('Set Channel');
      this.channel = channel;
      this.subscriptions.push(channel.subscribe("fetch", function (data, envelope) {
        //console.log('server/readManyRequest',data);
        _this2.execute(data);
        //this.router.navigate('form');
      }));
    }
  }, {
    key: 'resolveSemanticContext',
    value: function resolveSemanticContext(context) {

      return new Promise(function (resolve, reject) {
        try {
          console.log('ALLO');
          fetch("http://localhost:8083/config/ontologyFileMapping.json", {
            method: 'GET'
          }).then(function (response) {
            console.log(response);
          }).catch(function (error) {
            //console.error('Request failed', value, error);
            console.log('Request to ' + url + ' failed');
          });
        } catch (e) {
          console.log(e);
        }
        // try {
        //   let promises = [];
        //   let reflect = p => p.then(v => ({
        //       v,
        //       status: "fulfilled"
        //     }),
        //     e => ({
        //       e,
        //       status: "rejected"
        //     }));
        //   for (let key in context) {
        //     let value = context[key];
        //     if (typeof(value) == 'string' || value instanceof String) {
        //       if (key.indexOf("@base") == -1) {
        //         promises.push(this.resolveSemanticSource(value));
        //       }
        //     }
        //   }
        //   Promise.all(promises.map(reflect)).then((results) => {
        //     try {
        //       let resolved = sift({
        //         status: 'fulfilled'
        //       }, results);
        //       let merged = [];
        //       for (let ontology of resolved) {
        //         for (let triplet of ontology.v) {
        //           let id = triplet['@id'];
        //           //console.log('id',id);
        //           let everexist = sift({
        //             '@id': triplet['@id']
        //           }, merged);
        //           //console.log(everexist);
        //           if (everexist.length == 0) {
        //             merged.push(triplet);
        //           } else {
        //             if (everexist[0][Object.keys(triplet)[1]] == undefined) {
        //               //console.log('NEW property',everexist[0],triplet);
        //               everexist[0][Object.keys(triplet)[1]] = triplet[Object.keys(triplet)[1]]
        //             } else {
        //
        //             }
        //
        //             //console.log(Object.keys(triplet)[1]);
        //           }
        //         }
        //       }
        //       resolve(merged);
        //     } catch (e) {
        //       reject(e);
        //     }
        //   });
        // } catch (e) {
        //   reject(e);
        // }
      });
    }
  }, {
    key: 'resolveSemanticSource',
    value: function resolveSemanticSource(url) {
      var formats = formatsCommon();
      return new Promise(function (resolve, reject) {
        var corsUrl = 'https://cors-anywhere.herokuapp.com/' + url;
        //console.log(corsUrl);
        var contentType = void 0;
        fetch(corsUrl, {
          method: 'GET',
          //mode: 'no-cors',
          mode: 'cors'
        }).then(function (response) {
          //console.log('Ontology response', response);
          //console.log('Content-Type',value,response.headers.get('Content-Type'));
          var contentTypeFull = response.headers.get('Content-Type');
          //let splitIndex = contentTypeFull.split(';')
          contentType = contentTypeFull.split(';')[0];
          return response.text();
        }).then(function (data) {
          //console.log('ALLO',contentType);
          //console.log('Ontology response',value,contentType, data);
          try {
            var parser = formats.parsers[contentType];
            var quads = [];
            if (parser != undefined) {
              //console.log('auto parser');
              var quadStream = parser.import(stringToStream(data));
              quadStream.on('data', function (quad) {
                //console.log('tripleToQuad data',quad);
              });
              var serializerJsonLd = formats.serializers['application/ld+json'];
              var jsonLdStream = serializerJsonLd.import(quadStream);
              var jsonLdString = "";
              jsonLdStream.on('data', function (data) {
                jsonLdString = jsonLdString.concat(data);
                // console.log('streamJsonLD data',JSON.parse(data));
              }).on('end', function () {
                var jsonLdObjet = JSON.parse(jsonLdString);
                //console.log('JsonLd Ontology', value, contentType, jsonLdObjet);
                resolve(jsonLdObjet);
              }).on('error', function (err) {
                //console.log('ERROR');
                reject(err);
              });
            } else {
              if (contentType == 'application/rdf+xml') {
                //console.log('manual parser');
                var RDFparser = new RdfXmlParser();
                var tripleToQuad = new TripleToQuadTransform();
                var _serializerJsonLd = formats.serializers['application/ld+json'];
                var _jsonLdStream = _serializerJsonLd.import(tripleToQuad);
                var _jsonLdString = "";
                _jsonLdStream.on('data', function (data) {
                  _jsonLdString = _jsonLdString.concat(data);
                  //console.log('streamJsonLD data', JSON.parse(data));
                }).on('end', function () {
                  var jsonLdObjet = JSON.parse(_jsonLdString);
                  //console.log('JsonLd Ontology', value, contentType, jsonLdObjet);
                  resolve(jsonLdObjet);
                }).on('error', function (err) {
                  //console.log('ERROR',err);
                  reject(err);
                });

                RDFparser.stream(data).on('data', function (triple) {
                  var newTriple = {};
                  var object = {};
                  object.value = triple.object.nominalValue;
                  if (triple.object.datatype != undefined) {
                    object.datatype = {
                      value: triple.object.datatype.nominalValue
                    };
                  }
                  if (triple.object.language != undefined) {
                    object.language = triple.language;
                  }
                  newTriple.object = object;
                  newTriple.predicate = {
                    value: triple.predicate.nominalValue
                  };
                  newTriple.subject = {
                    value: triple.subject.nominalValue
                  };
                  //jsonLdString = jsonLdString.concat(data);
                  // console.log('tripleToQuad triple',triple,newTriple);
                  tripleToQuad.write(newTriple);
                }).on('readable', function () {
                  tripleToQuad.end();
                });
              } else {
                //console.warn('No parser for contentType', value, contentType);
                reject(new Error('No parser for contentType ' + contentType));
              }
            }
          } catch (e) {
            reject(e);
          }
        }).catch(function (error) {
          //console.error('Request failed', value, error);
          reject('Request to ' + url + ' failed');
        });
      });
    }
  }, {
    key: 'execute',
    value: function execute(paramObjectIn) {
      var _this3 = this;

      //console.log('paramObjetIn',paramObjectIn);
      var url = this.attributesValues['url'];
      //console.log(url);
      var paramObject = this.defaultParamObject || {};
      if (paramObjectIn != undefined) {
        for (var attr in paramObjectIn) {
          paramObject[attr] = paramObjectIn[attr];
        }
      }

      var regex = /{(\$.*?)}/g;
      var elementsRaw = url.match(regex);
      if (elementsRaw != null) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = elementsRaw[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var match = _step.value;

            var ObjectKey = match.slice(3, -1);
            //console.log(match,ObjectKey,dotProp.get(paramObject, ObjectKey));
            var ObjectValue = _dotProp2.default.get(paramObject, ObjectKey);
            url = url.replace(match, encodeURIComponent(JSON.stringify(_dotProp2.default.get(paramObject, ObjectKey))));
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
      this.publish('loading');
      fetch(url, {
        mode: 'cors',
        method: this.attributesValues['method']
      }).then(function (response) {
        return response.json();
      }).then(function (data) {
        // console.log('FETCH result',data);
        //this.data = data.data;
        //this.renderTable();
        //console.log(data);
        // this.resolveSemanticContext(data['@context']).then(ontology => {
        //   this.publish('ontology', ontology)
        // })

        if (_this3.ontologyTripleStore != undefined) {
          _this3.ontologyTripleStore.resolveSemanticContext(data['@context']).then(function (webTripleStore) {
            _this3.publish('response', { data: data[_this3.attributesValues['data-path']], webTripleStore: _this3.ontologyTripleStore });
          });
        } else {
          _this3.publish('response', { data: data[_this3.attributesValues['data-path']] });
        }
      }).catch(function (error) {
        console.log('Request failed', error);
      });
      //console.log(url);
    }
  }, {
    key: 'connectedCallback',
    value: function connectedCallback() {
      //console.log(this.attributes);
      this.attributesValues = {};
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.attributes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var attribute = _step2.value;

          //console.log(attribute);
          this.attributesValues[attribute.name] = attribute.nodeValue;
        }
        //console.log(this.attributesValues);
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      if (this.attributesValues['default-param'] != undefined) {
        //console.log('default-read-many-param',this.attributesValues['default-read-many-param']);
        //let defaultReadManyParamObject=eval(this.attributesValues['default-read-many-param'])
        this.defaultParamObject = JSON.parse(this.attributesValues['default-param']);
        //console.log('defaultReadManyParamObject',defaultReadManyParamObject);
      }
      if (this.attributesValues['auto-fetch'] != undefined) {
        this.execute();
      }
      if (this.attributesValues['ontology-web-triple-store'] != undefined) {
        //let component = querySelectorDeep(this.attributesValues['ontology-web-triple-store']);
        //console.log(this.attributesValues['ontology-web-triple-store'],component);
        //this.ontologyWebTripleStore=component;
        this.findOntologyTripleStore(this.attributesValues['ontology-web-triple-store']);
      }
      //console.log(this.attributesValues['ontology-we-triplestore']);


      //console.log(this.attributesValues);
      //this.urlReadMany = this.attributes.getNamedItem('urlReadMany').nodeValue;
      //this.defaultReadManyParam = this.attributes.getNamedItem('defaultReadManyParam').nodeValue;
      //this.urlReadOne = this.attributes.getNamedItem('urlReadOne').nodeValue;
      //this.autoReadMany = this.attributes.getNamedItem('autoReadMany').nodeValue;
    }
  }, {
    key: 'publish',
    value: function publish(message, data) {
      var _this4 = this;

      var count = 0;
      var checkExist = setInterval(function () {
        if (_this4.channel != undefined) {
          //console.log('CRUD message',message);
          clearInterval(checkExist);
          _this4.channel.publish(message, data);
        } else {
          count++;
          if (count > 100) {
            clearInterval(checkExist);
            console.warn('http channel doesn\'t exist after 10s');
          }
        }
      }, 100); // check every 100ms
    }
  }, {
    key: 'findOntologyTripleStore',
    value: function findOntologyTripleStore(ontologyTripleStoreId) {
      var _this5 = this;

      var countTarget = 0;
      var checkExist = setInterval(function () {
        //let TargetElement = document.querySelector(this.Target);
        //console.log(this.Target,TargetElement);
        var component = (0, _querySelectorShadowDom.querySelectorDeep)(ontologyTripleStoreId);
        //console.log('components',components);
        if (component != undefined && component.setChannel != undefined) {
          //console.log('ALLOOOO');
          clearInterval(checkExist);
          //console.log("Exists target!",component);

          _this5.ontologyTripleStore = component;
        } else {
          countTarget++;
          if (countTarget > 100) {
            console.warn(' ontology tripleStore component ' + ontologyTripleStoreId + ' doesn\'t exist after 10s');
            clearInterval(checkExist);
          }
        }
      }, 100);
    }
  }]);

  return httpCrud;
}(HTMLElement);

exports.default = httpCrud;

window.customElements.define('http-fetch', httpCrud);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isObj = __webpack_require__(2);

function getPathSegments(path) {
	var pathArr = path.split('.');
	var parts = [];

	for (var i = 0; i < pathArr.length; i++) {
		var p = pathArr[i];

		while (p[p.length - 1] === '\\' && pathArr[i + 1] !== undefined) {
			p = p.slice(0, -1) + '.';
			p += pathArr[++i];
		}

		parts.push(p);
	}

	return parts;
}

module.exports = {
	get: function get(obj, path, value) {
		if (!isObj(obj) || typeof path !== 'string') {
			return value === undefined ? obj : value;
		}

		var pathArr = getPathSegments(path);

		for (var i = 0; i < pathArr.length; i++) {
			if (!Object.prototype.propertyIsEnumerable.call(obj, pathArr[i])) {
				return value;
			}

			obj = obj[pathArr[i]];

			if (obj === undefined || obj === null) {
				// `obj` is either `undefined` or `null` so we want to stop the loop, and
				// if this is not the last bit of the path, and
				// if it did't return `undefined`
				// it would return `null` if `obj` is `null`
				// but we want `get({foo: null}, 'foo.bar')` to equal `undefined`, or the supplied value, not `null`
				if (i !== pathArr.length - 1) {
					return value;
				}

				break;
			}
		}

		return obj;
	},
	set: function set(obj, path, value) {
		if (!isObj(obj) || typeof path !== 'string') {
			return obj;
		}

		var root = obj;
		var pathArr = getPathSegments(path);

		for (var i = 0; i < pathArr.length; i++) {
			var p = pathArr[i];

			if (!isObj(obj[p])) {
				obj[p] = {};
			}

			if (i === pathArr.length - 1) {
				obj[p] = value;
			}

			obj = obj[p];
		}

		return root;
	},
	delete: function _delete(obj, path) {
		if (!isObj(obj) || typeof path !== 'string') {
			return;
		}

		var pathArr = getPathSegments(path);

		for (var i = 0; i < pathArr.length; i++) {
			var p = pathArr[i];

			if (i === pathArr.length - 1) {
				delete obj[p];
				return;
			}

			obj = obj[p];

			if (!isObj(obj)) {
				return;
			}
		}
	},
	has: function has(obj, path) {
		if (!isObj(obj) || typeof path !== 'string') {
			return false;
		}

		var pathArr = getPathSegments(path);

		for (var i = 0; i < pathArr.length; i++) {
			if (isObj(obj)) {
				if (!(pathArr[i] in obj)) {
					return false;
				}

				obj = obj[pathArr[i]];
			} else {
				return false;
			}
		}

		return true;
	}
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = function (x) {
	var type = typeof x === 'undefined' ? 'undefined' : _typeof(x);
	return x !== null && (type === 'object' || type === 'function');
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*
 * Sift 3.x
 *
 * Copryright 2015, Craig Condon
 * Licensed under MIT
 *
 * Filter JavaScript objects with mongodb queries
 */

(function () {

  'use strict';

  /**
   */

  function isFunction(value) {
    return typeof value === 'function';
  }

  /**
   */

  function isArray(value) {
    return Object.prototype.toString.call(value) === '[object Array]';
  }

  /**
   */

  function comparable(value) {
    if (value instanceof Date) {
      return value.getTime();
    } else if (isArray(value)) {
      return value.map(comparable);
    } else if (value && typeof value.toJSON === 'function') {
      return value.toJSON();
    } else {
      return value;
    }
  }

  function get(obj, key) {
    return isFunction(obj.get) ? obj.get(key) : obj[key];
  }

  /**
   */

  function or(validator) {
    return function (a, b) {
      if (!isArray(b) || !b.length) {
        return validator(a, b);
      }
      for (var i = 0, n = b.length; i < n; i++) {
        if (validator(a, get(b, i))) return true;
      }
      return false;
    };
  }

  /**
   */

  function and(validator) {
    return function (a, b) {
      if (!isArray(b) || !b.length) {
        return validator(a, b);
      }
      for (var i = 0, n = b.length; i < n; i++) {
        if (!validator(a, get(b, i))) return false;
      }
      return true;
    };
  }

  function validate(validator, b, k, o) {
    return validator.v(validator.a, b, k, o);
  }

  var OPERATORS = {

    /**
     */

    $eq: or(function (a, b) {
      return a(b);
    }),

    /**
     */

    $ne: and(function (a, b) {
      return !a(b);
    }),

    /**
     */

    $gt: or(function (a, b) {
      return sift.compare(comparable(b), a) > 0;
    }),

    /**
     */

    $gte: or(function (a, b) {
      return sift.compare(comparable(b), a) >= 0;
    }),

    /**
     */

    $lt: or(function (a, b) {
      return sift.compare(comparable(b), a) < 0;
    }),

    /**
     */

    $lte: or(function (a, b) {
      return sift.compare(comparable(b), a) <= 0;
    }),

    /**
     */

    $mod: or(function (a, b) {
      return b % a[0] == a[1];
    }),

    /**
     */

    $in: function $in(a, b) {

      if (b instanceof Array) {
        for (var i = b.length; i--;) {
          if (~a.indexOf(comparable(get(b, i)))) {
            return true;
          }
        }
      } else {
        var comparableB = comparable(b);
        if (comparableB === b && (typeof b === 'undefined' ? 'undefined' : _typeof(b)) === 'object') {
          for (var i = a.length; i--;) {
            if (String(a[i]) === String(b) && String(b) !== '[object Object]') {
              return true;
            }
          }
        }

        /*
          Handles documents that are undefined, whilst also
          having a 'null' element in the parameters to $in.
        */
        if (typeof comparableB == 'undefined') {
          for (var i = a.length; i--;) {
            if (a[i] == null) {
              return true;
            }
          }
        }

        /*
          Handles the case of {'field': {$in: [/regexp1/, /regexp2/, ...]}}
        */
        for (var i = a.length; i--;) {
          var validator = createRootValidator(get(a, i), undefined);
          var result = validate(validator, b, i, a);
          if (result && String(result) !== '[object Object]' && String(b) !== '[object Object]') {
            return true;
          }
        }

        return !!~a.indexOf(comparableB);
      }

      return false;
    },

    /**
     */

    $nin: function $nin(a, b, k, o) {
      return !OPERATORS.$in(a, b, k, o);
    },

    /**
     */

    $not: function $not(a, b, k, o) {
      return !validate(a, b, k, o);
    },

    /**
     */

    $type: function $type(a, b) {
      return b != void 0 ? b instanceof a || b.constructor == a : false;
    },

    /**
     */

    $all: function $all(a, b, k, o) {
      return OPERATORS.$and(a, b, k, o);
    },

    /**
     */

    $size: function $size(a, b) {
      return b ? a === b.length : false;
    },

    /**
     */

    $or: function $or(a, b, k, o) {
      for (var i = 0, n = a.length; i < n; i++) {
        if (validate(get(a, i), b, k, o)) return true;
      }return false;
    },

    /**
     */

    $nor: function $nor(a, b, k, o) {
      return !OPERATORS.$or(a, b, k, o);
    },

    /**
     */

    $and: function $and(a, b, k, o) {
      for (var i = 0, n = a.length; i < n; i++) {
        if (!validate(get(a, i), b, k, o)) {
          return false;
        }
      }
      return true;
    },

    /**
     */

    $regex: or(function (a, b) {
      return typeof b === 'string' && a.test(b);
    }),

    /**
     */

    $where: function $where(a, b, k, o) {
      return a.call(b, b, k, o);
    },

    /**
     */

    $elemMatch: function $elemMatch(a, b, k, o) {
      if (isArray(b)) {
        return !!~search(b, a);
      }
      return validate(a, b, k, o);
    },

    /**
     */

    $exists: function $exists(a, b, k, o) {
      return o.hasOwnProperty(k) === a;
    }
  };

  /**
   */

  var prepare = {

    /**
     */

    $eq: function $eq(a) {

      if (a instanceof RegExp) {
        return function (b) {
          return typeof b === 'string' && a.test(b);
        };
      } else if (a instanceof Function) {
        return a;
      } else if (isArray(a) && !a.length) {
        // Special case of a == []
        return function (b) {
          return isArray(b) && !b.length;
        };
      } else if (a === null) {
        return function (b) {
          //will match both null and undefined
          return b == null;
        };
      }

      return function (b) {
        return sift.compare(comparable(b), a) === 0;
      };
    },

    /**
     */

    $ne: function $ne(a) {
      return prepare.$eq(a);
    },

    /**
     */

    $and: function $and(a) {
      return a.map(parse);
    },

    /**
     */

    $all: function $all(a) {
      return prepare.$and(a);
    },

    /**
     */

    $or: function $or(a) {
      return a.map(parse);
    },

    /**
     */

    $nor: function $nor(a) {
      return a.map(parse);
    },

    /**
     */

    $not: function $not(a) {
      return parse(a);
    },

    /**
     */

    $regex: function $regex(a, query) {
      return new RegExp(a, query.$options);
    },

    /**
     */

    $where: function $where(a) {
      return typeof a === 'string' ? new Function('obj', 'return ' + a) : a;
    },

    /**
     */

    $elemMatch: function $elemMatch(a) {
      return parse(a);
    },

    /**
     */

    $exists: function $exists(a) {
      return !!a;
    }
  };

  /**
   */

  function search(array, validator) {

    for (var i = 0; i < array.length; i++) {
      var result = get(array, i);
      if (validate(validator, get(array, i))) {
        return i;
      }
    }

    return -1;
  }

  /**
   */

  function createValidator(a, validate) {
    return { a: a, v: validate };
  }

  /**
   */

  function nestedValidator(a, b) {
    var values = [];
    findValues(b, a.k, 0, b, values);

    if (values.length === 1) {
      var first = values[0];
      return validate(a.nv, first[0], first[1], first[2]);
    }

    // If the query contains $ne, need to test all elements ANDed together
    var inclusive = a && a.q && typeof a.q.$ne !== 'undefined';
    var allValid = inclusive;
    for (var i = 0; i < values.length; i++) {
      var result = values[i];
      var isValid = validate(a.nv, result[0], result[1], result[2]);
      if (inclusive) {
        allValid &= isValid;
      } else {
        allValid |= isValid;
      }
    }
    return allValid;
  }

  /**
   */

  function findValues(current, keypath, index, object, values) {

    if (index === keypath.length || current == void 0) {

      values.push([current, keypath[index - 1], object]);
      return;
    }

    var k = get(keypath, index);

    // ensure that if current is an array, that the current key
    // is NOT an array index. This sort of thing needs to work:
    // sift({'foo.0':42}, [{foo: [42]}]);
    if (isArray(current) && isNaN(Number(k))) {
      for (var i = 0, n = current.length; i < n; i++) {
        findValues(get(current, i), keypath, index, current, values);
      }
    } else {
      findValues(get(current, k), keypath, index + 1, current, values);
    }
  }

  /**
   */

  function createNestedValidator(keypath, a, q) {
    return { a: { k: keypath, nv: a, q: q }, v: nestedValidator };
  }

  /**
   * flatten the query
   */

  function isVanillaObject(value) {
    return value && value.constructor === Object;
  }

  function parse(query) {
    query = comparable(query);

    if (!query || !isVanillaObject(query)) {
      // cross browser support
      query = { $eq: query };
    }

    var validators = [];

    for (var key in query) {
      var a = query[key];

      if (key === '$options') {
        continue;
      }

      if (OPERATORS[key]) {
        if (prepare[key]) a = prepare[key](a, query);
        validators.push(createValidator(comparable(a), OPERATORS[key]));
      } else {

        if (key.charCodeAt(0) === 36) {
          throw new Error('Unknown operation ' + key);
        }
        validators.push(createNestedValidator(key.split('.'), parse(a), a));
      }
    }

    return validators.length === 1 ? validators[0] : createValidator(validators, OPERATORS.$and);
  }

  /**
   */

  function createRootValidator(query, getter) {
    var validator = parse(query);
    if (getter) {
      validator = {
        a: validator,
        v: function v(a, b, k, o) {
          return validate(a, getter(b), k, o);
        }
      };
    }
    return validator;
  }

  /**
   */

  function sift(query, array, getter) {

    if (isFunction(array)) {
      getter = array;
      array = void 0;
    }

    var validator = createRootValidator(query, getter);

    function filter(b, k, o) {
      return validate(validator, b, k, o);
    }

    if (array) {
      return array.filter(filter);
    }

    return filter;
  }

  /**
   */

  sift.use = function (plugin) {
    if (isFunction(plugin)) return plugin(sift);
    for (var key in plugin) {
      /* istanbul ignore else */
      if (key.charCodeAt(0) === 36) {
        OPERATORS[key] = plugin[key];
      }
    }
  };

  /**
   */

  sift.indexOf = function (query, array, getter) {
    return search(array, createRootValidator(query, getter));
  };

  /**
   */

  sift.compare = function (a, b) {
    if (a === b) return 0;
    if ((typeof a === 'undefined' ? 'undefined' : _typeof(a)) === (typeof b === 'undefined' ? 'undefined' : _typeof(b))) {
      if (a > b) {
        return 1;
      }
      if (a < b) {
        return -1;
      }
    }
  };

  /* istanbul ignore next */
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    Object.defineProperty(exports, "__esModule", {
      value: true
    });

    module.exports = sift;
    exports['default'] = module.exports.default = sift;
  }

  /* istanbul ignore next */
  if (typeof window !== 'undefined') {
    window.sift = sift;
  }
})();

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.querySelectorAllDeep = querySelectorAllDeep;
exports.querySelectorDeep = querySelectorDeep;
/**
 * @author Georgegriff@ (George Griffiths)
 * License Apache-2.0
 */

/**
* Finds first matching elements on the page that may be in a shadow root using a complex selector of n-depth
*
* Don't have to specify all shadow roots to button, tree is travered to find the correct element
*
* Example querySelectorAllDeep('downloads-item:nth-child(4) #remove');
*
* Example should work on chrome://downloads outputting the remove button inside of a download card component
*
* Example find first active download link element querySelectorDeep('#downloads-list .is-active a[href^="https://"]');
*
* Another example querySelectorAllDeep('#downloads-list div#title-area + a');
e.g.
*/
function querySelectorAllDeep(selector) {
    return _querySelectorDeep(selector, true);
}

function querySelectorDeep(selector) {
    return _querySelectorDeep(selector);
}

function _querySelectorDeep(selector, findMany) {
    var lightElement = document.querySelector(selector);

    if (document.head.createShadowRoot || document.head.attachShadow) {
        // no need to do any special if selector matches something specific in light-dom
        if (!findMany && lightElement) {
            return lightElement;
        }
        // do best to support complex selectors and split the query
        var splitSelector = selector.replace(/\s*([,>+~]+)\s*/g, '$1').split(' ');
        var possibleElementsIndex = splitSelector.length - 1;
        var possibleElements = collectAllElementsDeep(splitSelector[possibleElementsIndex]);
        var findElements = findMatchingElement(splitSelector, possibleElementsIndex);
        if (findMany) {
            return possibleElements.filter(findElements);
        } else {
            return possibleElements.find(findElements);
        }
    } else {
        if (!findMany) {
            return lightElement;
        } else {
            return document.querySelectorAll(selector);
        }
    }
}

function findMatchingElement(splitSelector, possibleElementsIndex) {
    return function (element) {
        var position = possibleElementsIndex;
        var parent = element;
        var foundElement = false;
        while (parent) {
            var foundMatch = parent.matches(splitSelector[position]);
            if (foundMatch && position === 0) {
                foundElement = true;
                break;
            }
            if (foundMatch) {
                position--;
            }
            parent = findParentOrHost(parent);
        }
        return foundElement;
    };
}

function findParentOrHost(element) {
    var parentNode = element.parentNode;
    return parentNode && parentNode.host ? parentNode.host : parentNode === document ? null : parentNode;
}

/**
 * Finds all elements on the page, inclusive of those within shadow roots.
 * @param {string=} selector Simple selector to filter the elements by. e.g. 'a', 'div.main'
 * @return {!Array<string>} List of anchor hrefs.
 * @author ebidel@ (Eric Bidelman)
 * License Apache-2.0
 */
function collectAllElementsDeep() {
    var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    var allElements = [];

    var findAllElements = function findAllElements(nodes) {
        for (var i = 0, el; el = nodes[i]; ++i) {
            allElements.push(el);
            // If the element has a shadow root, dig deeper.
            if (el.shadowRoot) {
                findAllElements(el.shadowRoot.querySelectorAll('*'));
            }
        }
    };

    findAllElements(document.querySelectorAll('*'));

    return selector ? allElements.filter(function (el) {
        return el.matches(selector);
    }) : allElements;
}

/***/ })
/******/ ]);