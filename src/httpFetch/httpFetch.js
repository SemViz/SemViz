import dotProp from 'dot-prop'
import sift from 'sift'
import WebTripleStore from './../lib/WebTripleStoreLib.js'
// import rdfExt from 'rdf-ext'
//import N3Parser from 'rdf-parser-n3'
//import rdfFetch from 'rdf-fetch-lite'
// import formatsCommon from 'rdf-formats-common'
// import stringToStream from 'string-to-stream'
// //import Readable from 'readable-stream'
// import RdfXmlParser from 'rdf-parser-rdfxml'
// //import rdflib from 'rdflib'
// import TripleToQuadTransform from 'rdf-transform-triple-to-quad'
import {
  querySelectorAllDeep,
  querySelectorDeep
} from 'query-selector-shadow-dom';


export default class httpCrud extends HTMLElement {
  constructor() {
    super();
    this.subscriptions = [];
  }
  setChannel(channel) {
    //console.log('Set Channel');
    this.channel = channel;
    this.subscriptions.push(channel.subscribe("fetch", (data, envelope) => {
      //console.log('server/readManyRequest',data);
      this.execute(data)
      //this.router.navigate('form');
    }));
  }



  execute(paramObjectIn) {
    //console.log('paramObjetIn',paramObjectIn);
    let url = this.attributesValues['url'];
    //console.log(url);
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
        let ObjectValue = dotProp.get(paramObject, ObjectKey)
        url = url.replace(match, encodeURIComponent(JSON.stringify(dotProp.get(paramObject, ObjectKey))));
      }
    }
    this.publish('loading')
    if (this.semanticStorage == true) {
      // console.log("this.webTripleStore", this.webTripleStore);
      if (this.webTripleStore.resolve != undefined) {
        this.webTripleStore.resolve(url
            , {
            reduceSubject: true,
            flatToTree: this.flatToTree
          }
        ).then((datas) => {
          //console.log("data", datas);
          this.publish('response', {
            data: datas[0]['@graph']
          });
          //console.log('PUTAIN');
          // let datas = this.webTripleStore.getALL(url, {
          //   reduceSubject: true,
          //   flatToTree: this.flatToTree
          // }).then((datas) => {
          //   // this.ontologyTripleStore.resolveSemanticContext(data['@context']).then(()=>{
          //   //   this.ontologyTripleStore.getAll((data)=>{
          //   //     console.log("ontologyTripleStore",data);
          //   //   })
          //   // })
          //   console.log("datas", datas[0]['@graph']);
          //   this.publish('response', {
          //     data: datas[0]['@graph'],
          //     ontologyTripleStore: this.ontologyTripleStore
          //   });
          // });
        })
      }

    } else {
      fetch(url, {
          mode: 'cors',
          method: this.attributesValues['method'],
        })
        .then(function(response) {
          return response.json();
        })
        .then((data) => {
          if (this.ontologyTripleStore != undefined) {
            this.ontologyTripleStore.resolveSemanticContext(data['@context']).then(webTripleStore => {
              this.publish('response', {
                data: data[this.attributesValues['data-path']],
                ontologyTripleStore: this.ontologyTripleStore
              })
            })
          } else {
            this.publish('response', {
              data: data[this.attributesValues['data-path']]
            })
          }
        })
        .catch(function(error) {
          console.log('Request failed', error)
        });
    }


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
      this.defaultParamObject = JSON.parse(this.attributesValues['default-param']);
    }
    if (this.attributesValues['auto-fetch'] != undefined) {
      this.execute();
    }
    if (this.attributesValues['semantic-storage'] != undefined) {
      this.semanticStorage = true;
      this.webTripleStore = new WebTripleStore();
      // console.log("this.webTripleStore",this.webTripleStore);
    } else {
      this.semanticStorage = false;
    }
    if (this.attributesValues['flat-to-tree'] != undefined) {
      this.flatToTree = true;
      // console.log("this.webTripleStore",this.webTripleStore);
    } else {
      this.flatToTree = false;
    }
    if (this.attributesValues['ontology-web-triple-store'] != undefined) {
      this.findOntologyTripleStore(this.attributesValues['ontology-web-triple-store']);
    }

  }
  publish(message, data) {

    let count = 0;
    let checkExist = setInterval(() => {
      if (this.channel != undefined) {
        //console.log('CRUD message',message);
        clearInterval(checkExist);
        this.channel.publish(message, data)
      } else {
        count++;
        if (count > 100) {
          clearInterval(checkExist);
          console.warn(`http channel doesn't exist after 10s`);
        }
      }
    }, 100); // check every 100ms
  }

  findOntologyTripleStore(ontologyTripleStoreId) {
    let countTarget = 0;
    let checkExist = setInterval(() => {
      //let TargetElement = document.querySelector(this.Target);
      //console.log(this.Target,TargetElement);
      let component = querySelectorDeep(ontologyTripleStoreId);
      //console.log('components',components);
      if (component != undefined && component.setChannel != undefined) {
        //console.log('ALLOOOO');
        clearInterval(checkExist);
        //console.log("Exists target!",component);

        this.ontologyTripleStore = component;

      } else {
        countTarget++;
        if (countTarget > 100) {
          console.warn(` ontology tripleStore component ${ontologyTripleStoreId} doesn't exist after 10s`);
          clearInterval(checkExist);
        }
      }
    }, 100);
  }
}
window.customElements.define('http-fetch', httpCrud);
