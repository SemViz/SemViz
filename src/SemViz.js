
import '@webcomponents/webcomponentsjs';
import qs from 'qs';
import postal from 'postal';
//import webComponentLink from './WebComponentLink';
//import webComponentLink from 'WebComponentLink';

// var target = document.body;
//
// // create an observer instance
// var observer = new MutationObserver(function(mutations) {
//     mutations.forEach(function(mutation) {
//         console.log('mutation',mutation);
//     });
// });
//
// // configuration of the observer:
// var config = { attributes: true, childList: true, characterData: true }
//
// // pass in the target node, as well as the observer options
// observer.observe(target, config);



// document.onreadystatechange = function () {
//   console.log(document.readyState);
//     if (document.readyState == "interactive") {
//
//       var target = document.head
//
//       // create an observer instance
//       var observer = new MutationObserver(function(mutations) {
//           mutations.forEach(function(mutation) {
//               console.log('mutation',mutation);
//           });
//       });
//
//       // configuration of the observer:
//       var config = { attributes: true, childList: true, characterData: true }
//
//       // pass in the target node, as well as the observer options
//       console.log(target);
//       observer.observe(target, config);
//     }
// }



//console.log(postal);
let urlParamsString = window.location.search;
var urlParams = qs.parse(urlParamsString, {
  ignoreQueryPrefix: true
});
if(urlParams.configFile==undefined){
//  document.querySelector('body').appendChild(document.createTextNode('SemViz have to be config by json config file (index.html?configFile=file.json)'))
}else{
  //console.log(urlParams.configFile);
  fetch(urlParams.configFile).then(function(response) {
    //console.log('response',response);
    return response.json();
  }).then(function(data) {
    //console.log('data',data);
    // select the target node
    //var target = document.querySelector(data.template.componentTag);



    //target.appendChild(data.template.componentTag)


    // window.customElements.whenDefined(data.template.componentTag).then(() => {
    //   console.log('ready!');
    //   let Template = customElements.get(data.template.componentTag);
    //   //console.log('elmt',Template);
    //   let domTemplate = new Template(postal);
    //   let domBody = document.querySelector('body');
    //   domBody.appendChild(domTemplate);
    //
    //   for (let injection of data.injection) {
    //     window.customElements.whenDefined(injection.componentTag).then(() => {
    //       //console.log('ready!');
    //       let Component = customElements.get(injection.componentTag);
    //       let shadowDomTemplate = document.querySelector(data.template.componentTag);
    //       //console.log(shadowDomTemplate);
    //       let doms = shadowDomTemplate.shadowRoot.querySelectorAll(injection.selector);
    //       console.log(doms);
    //       for (let dom of doms) {
    //         //console.log('elmt',Template);
    //         let domComponent = new Component(postal);
    //         dom.appendChild(domComponent);
    //       }
    //     });
    //   }
    //
    //   let importSources={};
    //   for (let injection of data.injection) {
    //       if(importSources[injection.componentTag]==undefined){
    //         let importFile = document.createElement('link');
    //         importFile.rel = 'import';
    //         importFile.href = injection.componentUrl;
    //         document.head.appendChild(importFile);
    //         importSources[injection.componentTag]=injection.componentUrl;
    //       }
    //   }
    // });

    // let importTemplateFile = document.createElement('link');
    // importTemplateFile.rel = 'import';
    // importTemplateFile.href = data.template.componentUrl;
    // document.head.appendChild(importTemplateFile);
    //
    // console.log('SEMVIZ customElements',window.customElements);


  }).catch(function(e) {
    console.log("config Load Fail", e);
  });
}
