window.WebComponentLinkGlobal = {};
window.WebComponentLinkGlobal.linksRequest = [];
window.WebComponentLinkGlobal.linksResolved = [];

export default class WebComponentLink extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    window.WebComponentLinkGlobal.lastTimeDeclaration = new Date();
    let record = {
      url: this.attributes.getNamedItem('url').nodeValue,
      main: this.attributes.getNamedItem('main').nodeValue,
      tag: this.attributes.getNamedItem('tag').nodeValue,
      class: this.attributes.getNamedItem('class').nodeValue,
    }
    window.WebComponentLinkGlobal.linksRequest.push(record);
    this.linksRequestSize = window.WebComponentLinkGlobal.linksRequest.length;
    window.setTimeout(this.checkForInject.bind(this), 10);
  }
  // defineWhenClassReady(componentClassName,tag,template) {
  //   //console.log('defineWhenClassReady',componentClassName);
  //   try {
  //     let componentClass = eval(componentClassName);
  //     if(componentClass.default!=undefined){
  //       componentClass=componentClass.default;
  //     }
  //     console.log(componentClass);
  //     componentClass.prototype.connectedCallback = function() {
  //       const shadowRoot = this.attachShadow({
  //         mode: 'open'
  //       });
  //       shadowRoot.appendChild(template.content.cloneNode(true));
  //     }
  //     console.log('YOUHOU',componentClassName,tag,template);
  //     window.customElements.define(tag, componentClass);
  //   } catch (e) {
  //     console.warn(e);
  //     //console.log('this',this);
  //     window.setTimeout(this.defineWhenClassReady.bind(this,componentClassName,tag,template), 10000);
  //   }
  // }
  checkForInject() {
    if (this.linksRequestSize == window.WebComponentLinkGlobal.linksRequest.length) {
      let orderedRequest = window.WebComponentLinkGlobal.linksRequest.sort((a, b) => {
        return a.src > b.src
      });
      window.WebComponentLinkGlobal.linksRequest = [];
      for (let wcl of orderedRequest) {
        let everResolved = window.WebComponentLinkGlobal.linksResolved.find((r) => {
          return r.tag == wcl.tag
        });
        if (everResolved != undefined) {
          console.warn('tag ' + wcl.tag + ' ever exist. ' + wcl.url + wcl.main + ' can\'t replace ' + everResolved.url + everResolved.main);
        } else {
          console.log('tag ' + wcl.tag + ' define whith src ' + wcl.url + wcl.main);
          let importFile = document.createElement('link');
          importFile.rel = 'import';
          importFile.href = wcl.url + wcl.main;
          importFile.onload = function(load) {
            //console.log(load);
            let count = 0;
            // let checkExist = setInterval(() => {
            //   //let sourceElement = document.querySelector(this.source);
            //   //console.log(this.source,sourceElement);
            //   let target = load.target;
            //   //console.log('components',components);
            //   if (target != undefined) {
            //     clearInterval(checkExist);
            //     console.log("Exists TARGET!",load.target);
            //   } else {
            //     console.log("TARGET don't exist!");
            //     count++;
            //     if (count > 100) {
            //       console.warn(`TARGET doesn't exist after 10s`);
            //       clearInterval(checkExist);
            //     }
            //   }
            // }, 100);
            let template = load.target.querySelector('template');
            let relativs = template.content.querySelector('[src*="./"]');
            if (relativs == null) {
              relativs = [];
            } else if (!Array.isArray(relativs)) {
              relativs = [relativs];
            }
            for (let relativ of relativs) {
              relativ.src = relativ.src.replace('./', wcl.url);
            }
            //this.defineWhenClassReady(wcl.class,wcl.tag,template);
            let componentClass = eval(wcl.class);
            if(componentClass.default!=undefined){
              componentClass=componentClass.default;
            }
            // console.log('componentClass.prototype.connectedCallback',componentClass.prototype.connectedCallback);
            componentClass.prototype.oldConnectedCallback = componentClass.prototype.connectedCallback;
            componentClass.prototype.connectedCallback = function() {
              const shadowRoot = this.attachShadow({
                mode: 'open'
              });
              shadowRoot.appendChild(template.content.cloneNode(true));
              if(this.oldConnectedCallback!=undefined){
                this.oldConnectedCallback();
              }
            }
            //console.log('YOUHOU',componentClassName,tag,template);
            window.customElements.define(wcl.tag, componentClass);
          }.bind(this);
          importFile.onerror = function(e) {
            console.log('error loading', e)
          };
          document.head.appendChild(importFile);
          window.WebComponentLinkGlobal.linksResolved.push(wcl);
        }
      }
    }
  }
}
window.customElements.define('web-component-link', WebComponentLink);
