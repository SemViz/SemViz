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
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_dot_prop__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_dot_prop___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_dot_prop__);


class httpCrud extends HTMLElement {
  constructor() {
    super();
    this.subscriptions = [];
  }
  setChannel(channel) {
    //console.log('Set Channel');
    this.channel = channel;
    this.subscriptions.push(channel.subscribe("fetch", (data, envelope) => {
      console.log('server/readManyRequest', data);
      this.execute(data);
      //this.router.navigate('form');
    }));
  }
  execute(paramObjectIn) {
    //console.log('paramObjetIn',paramObjectIn);
    let url = this.attributesValues['url'];
    console.log(url);
    let paramObject = this.defaultParamObject || {};
    if (paramObjectIn != undefined) {
      for (let attr in paramObjectIn) {
        paramObject[attr] = paramObjectIn[attr];
      }
    }

    const regex = /{(\$.*?)}/g;
    let elementsRaw = url.match(regex);
    if (elementsRaw != null) {
      for (let match of elementsRaw) {
        let ObjectKey = match.slice(3, -1);
        //console.log(match,ObjectKey,dotProp.get(paramObject, ObjectKey));
        let ObjectValue = __WEBPACK_IMPORTED_MODULE_0_dot_prop___default.a.get(paramObject, ObjectKey);
        url = url.replace(match, encodeURIComponent(JSON.stringify(__WEBPACK_IMPORTED_MODULE_0_dot_prop___default.a.get(paramObject, ObjectKey))));
      }
    }
    this.publish('loading');
    fetch(url, {
      mode: 'cors',
      method: this.attributesValues['method']
    }).then(function (response) {
      return response.json();
    }).then(data => {
      // console.log('FETCH result',data);
      //this.data = data.data;
      //this.renderTable();
      this.publish('response', data);
    }).catch(function (error) {
      log('Request failed', error);
    });
    //console.log(url);
  }

  connectedCallback() {
    //console.log(this.attributes);
    this.attributesValues = {};
    for (let attribute of this.attributes) {
      //console.log(attribute);
      this.attributesValues[attribute.name] = attribute.nodeValue;
    }
    //console.log(this.attributesValues);
    if (this.attributesValues['default-param'] != undefined) {
      //console.log('default-read-many-param',this.attributesValues['default-read-many-param']);
      //let defaultReadManyParamObject=eval(this.attributesValues['default-read-many-param'])
      this.defaultParamObject = JSON.parse(this.attributesValues['default-param']);
      //console.log('defaultReadManyParamObject',defaultReadManyParamObject);
    }
    if (this.attributesValues['auto-fetch'] != undefined) {
      this.execute();
    }

    //console.log(this.attributesValues);
    //this.urlReadMany = this.attributes.getNamedItem('urlReadMany').nodeValue;
    //this.defaultReadManyParam = this.attributes.getNamedItem('defaultReadManyParam').nodeValue;
    //this.urlReadOne = this.attributes.getNamedItem('urlReadOne').nodeValue;
    //this.autoReadMany = this.attributes.getNamedItem('autoReadMany').nodeValue;
  }
  publish(message, data) {

    let count = 0;
    let checkExist = setInterval(() => {
      if (this.channel != undefined) {
        console.log('CRUD message', message);
        clearInterval(checkExist);
        this.channel.publish(message, data);
      } else {
        count++;
        if (count > 100) {
          clearInterval(checkExist);
          console.warn(`http channel doesn't exist after 10s`);
        }
      }
    }, 100); // check every 100ms
  }
}
/* harmony export (immutable) */ __webpack_exports__["default"] = httpCrud;

window.customElements.define('http-fetch', httpCrud);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const isObj = __webpack_require__(2);

function getPathSegments(path) {
	const pathArr = path.split('.');
	const parts = [];

	for (let i = 0; i < pathArr.length; i++) {
		let p = pathArr[i];

		while (p[p.length - 1] === '\\' && pathArr[i + 1] !== undefined) {
			p = p.slice(0, -1) + '.';
			p += pathArr[++i];
		}

		parts.push(p);
	}

	return parts;
}

module.exports = {
	get(obj, path, value) {
		if (!isObj(obj) || typeof path !== 'string') {
			return value === undefined ? obj : value;
		}

		const pathArr = getPathSegments(path);

		for (let i = 0; i < pathArr.length; i++) {
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

	set(obj, path, value) {
		if (!isObj(obj) || typeof path !== 'string') {
			return obj;
		}

		const root = obj;
		const pathArr = getPathSegments(path);

		for (let i = 0; i < pathArr.length; i++) {
			const p = pathArr[i];

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

	delete(obj, path) {
		if (!isObj(obj) || typeof path !== 'string') {
			return;
		}

		const pathArr = getPathSegments(path);

		for (let i = 0; i < pathArr.length; i++) {
			const p = pathArr[i];

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

	has(obj, path) {
		if (!isObj(obj) || typeof path !== 'string') {
			return false;
		}

		const pathArr = getPathSegments(path);

		for (let i = 0; i < pathArr.length; i++) {
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

module.exports = function (x) {
	var type = typeof x;
	return x !== null && (type === 'object' || type === 'function');
};


/***/ })
/******/ ]);