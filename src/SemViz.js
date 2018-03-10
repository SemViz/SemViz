import '@webcomponents/webcomponentsjs';
import qs from 'qs';
import postal from'postal';
console.log(postal);
let urlParamsString=window.location.search;
var urlParams = qs.parse(urlParamsString,{ ignoreQueryPrefix: true });



console.log(urlParams.configFile);
fetch(urlParams.configFile).then(function(response) {
  console.log(response);
  return response.json();
}).then(function(data) {
  console.log(data);

  let importTemplateFile = document.createElement('link');
  importTemplateFile.rel='import';
  //importTemplateFile.href="https://raw.githubusercontent.com/assemblee-virtuelle/SemViz/master/src/template.html";
  importTemplateFile.href="../src/template.html";

  window.customElements.whenDefined('semviz-base-template').then(() => {
    console.log('ready!');
  });
  document.head.appendChild(importTemplateFile);

  console.log('SEMVIZ customElements',window.customElements);

  let domBody = document.querySelector('body');

//  let domTemplate = document.createElement('semviz-base-template', 'coucou');
//  console.log(domTemplate);
//  domTemplate.setBusMessage('ALLO');
// let Template = customElements.get('semviz-base-template');
// console.log('elmt',Template);
// let domTemplate = new Template();
//
//
//   domBody.appendChild(domTemplate);

  // for (let injection of data.injection) {
  //   //console.log(injection);
  //   let shadowDomTemplate=document.querySelector('semviz-base-template');
  //   console.log(shadowDomTemplate);
  //   let doms = shadowDomTemplate.shadowRoot.querySelectorAll(injection.selector);
  //   console.log(doms);
  //   for (let dom of doms) {
  //     console.log(dom);
  //     let importFile = document.createElement('link');
  //     //importFile.setAttribut('rel','import');
  //     // importFile.setAttribut('href',injection.componentUrl);
  //     importFile.rel='import';
  //     importFile.href=injection.componentUrl;
  //     //let node = document.importNode(injection.componentUrl, true);
  //     //dom.appendChild(importFile);
  //     document.head.appendChild(importFile);
  //
  //     let domComponent = document.createElement(injection.componentTag);
  //     dom.appendChild(domComponent);
  //     //dom.innerHTML = injection.html
  //   }
  // }
}).catch(function(e) {
  console.log("config Load Fail", e);
});
