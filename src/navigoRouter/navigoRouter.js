import Navigo from 'navigo';
import dotProp from 'dot-prop';

export default class WebComponentMessaging extends HTMLElement {
  constructor() {
    super();
    this.subscriptions=[];

  }
  connectedCallback() {
    this.attributesValues = {};
    for (let attribute of this.attributes) {
      this.attributesValues[attribute.name] = attribute.nodeValue;
    }

    let routes = this.querySelectorAll('route');
    //console.log(messages);
    this.routes=routes.map(r=>{
      return {
        inputMessage : r.attributes.getNamedItem('input-message').nodeValue,
        outputMessage : r.attributes.getNamedItem('output-message').nodeValue,
        url : r.attributes.getNamedItem('url').nodeValue,
        urlBuild : r.attributes.getNamedItem('url-build')==undefined?undefined:r.attributes.getNamedItem('url-build').nodeValue,
        paramBinding : {}
      }
    });

    var root = null;
    var useHash = true; // Defaults to: false
    var hash = '#'; // Defaults to: '#'
    this.router = new Navigo(root, useHash, hash);

    for(let route of this.routes){

      let url = route.url;
      const regex = /{(\$.*?)}/g;
      let elementsRaw = url.match(regex);
      if (elementsRaw != null) {
        for (let match of elementsRaw) {

          let ObjectKey = match.slice(3, -1);
          let navigoParam=ObjectKey.replace(/@/g, '');
          route.paramBinding[navigoParam]=ObjectKey;
          //console.log(match,ObjectKey,dotProp.get(paramObject, ObjectKey));
          //let ObjectValue=dotProp.get(data, ObjectKey)
          url = url.replace(match, ':'+navigoParam);
        }
      }

      // let encoded =encodeURIComponent(route.url);
      // console.log(encoded);
      // encoded=encoded.replace('%2F','/');
      // encoded=encoded.replace('%3A',':');
      // console.log(encoded);
      this.router
        .on(url, (params, query)=>{
          //console.log('route',route.url,params,query);
          let objectParam={};
          for(let param in params){
            let realParam=route.paramBinding[param];
            objectParam[realParam]=params[param];
          }
          //console.log(objectParam);
          this.publish(route.outputMessage,objectParam);
        })
        .resolve();
    }

  }

  setChannel(channel) {
    //console.log('ALLO');
    this.channel = channel;
    for(let route of this.routes){
      this.subscriptions.push(channel.subscribe(route.inputMessage, (data, envelope) => {
        let url = route.url;
        const regex = /{(\$.*?)}/g;
        let elementsRaw = url.match(regex);
        if (elementsRaw != null) {
          for (let match of elementsRaw) {
            let ObjectKey = match.slice(3, -1);

            //console.log(match,ObjectKey,dotProp.get(paramObject, ObjectKey));
            //let ObjectValue=dotProp.get(data, ObjectKey)
            url = url.replace(match, encodeURIComponent(dotProp.get(data, ObjectKey)));
          }
        }
        //console.log('ROUTE ASK',url);
        this.router.navigate(url);
      }));
    }
  }
  publish(message,data){

    let count = 0;
    let checkExist = setInterval(() => {
      if (this.channel != undefined) {
        //console.log('CRUD message',message);
        clearInterval(checkExist);
        this.channel.publish(message,data)
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
window.customElements.define('navigo-router', WebComponentMessaging);
