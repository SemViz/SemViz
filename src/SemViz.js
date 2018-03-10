import '@webcomponents/webcomponentsjs';
import qs from 'qs';
import postal from 'postal';
console.log(postal);
let urlParamsString = window.location.search;
var urlParams = qs.parse(urlParamsString, {
  ignoreQueryPrefix: true
});



console.log(urlParams.configFile);
fetch(urlParams.configFile).then(function(response) {
  console.log(response);
  return response.json();
}).then(function(data) {
  console.log(data);





  window.customElements.whenDefined('semviz-base-template').then(() => {
    //console.log('ready!');
    let Template = customElements.get('semviz-base-template');
    //console.log('elmt',Template);
    let domTemplate = new Template(postal);
    let domBody = document.querySelector('body');
    domBody.appendChild(domTemplate);

    for (let injection of data.injection) {
      window.customElements.whenDefined(injection.componentTag).then(() => {
        //console.log('ready!');
        let Component = customElements.get(injection.componentTag);

        let shadowDomTemplate = document.querySelector('semviz-base-template');
        //console.log(shadowDomTemplate);
        let doms = shadowDomTemplate.shadowRoot.querySelectorAll(injection.selector);
        console.log(doms);
        for (let dom of doms) {
          //console.log('elmt',Template);
          let domComponent = new Component(postal);
          dom.appendChild(domComponent);

        }

      });
    }

    for (let injection of data.injection) {
        let importFile = document.createElement('link');
        importFile.rel = 'import';
        importFile.href = injection.componentUrl;
        importTemplateFile.id = injection.componentTag;
        document.head.appendChild(importFile);
    }
  });

  let importTemplateFile = document.createElement('link');
  importTemplateFile.rel = 'import';
  importTemplateFile.href = "https://raw.githubusercontent.com/assemblee-virtuelle/SemViz/master/src/template.html";
  importTemplateFile.id = 'semviz-base-template';
  //importTemplateFile.href="../src/template.html";
  document.head.appendChild(importTemplateFile);

  //console.log('SEMVIZ customElements',window.customElements);


}).catch(function(e) {
  console.log("config Load Fail", e);
});
