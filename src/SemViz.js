import '@webcomponents/webcomponentsjs';
import qs from 'qs';
let urlParamsString=window.location.search;
var urlParams = qs.parse(urlParamsString,{ ignoreQueryPrefix: true });

let importTemplateFile = document.createElement('link');
importTemplateFile.rel='import';
importTemplateFile.href="https://raw.githubusercontent.com/assemblee-virtuelle/SemViz/master/src/template.html";
document.head.appendChild(importTemplateFile);
let domBody = document.querySelectorAll('body');
let domTemplate = document.createElement('semViz-base-template');
domBody.appendChild(domComponent);

console.log(urlParams.configFile);
fetch(urlParams.configFile).then(function(response) {
  console.log(response);
  return response.json();
}).then(function(data) {
  console.log(data);
  for (let injection of data.injection) {
    //console.log(injection);
    let doms = document.querySelectorAll(injection.selector);
    //console.log(doms);
    for (let dom of doms) {
      console.log(dom);
      let importFile = document.createElement('link');
      //importFile.setAttribut('rel','import');
      // importFile.setAttribut('href',injection.componentUrl);
      importFile.rel='import';
      importFile.href=injection.componentUrl;
      //let node = document.importNode(injection.componentUrl, true);
      //dom.appendChild(importFile);
      document.head.appendChild(importFile);

      let domComponent = document.createElement(injection.componentTag);
      dom.appendChild(domComponent);
      //dom.innerHTML = injection.html
    }
  }
}).catch(function(e) {
  console.log("config Load Fail", e);
});
