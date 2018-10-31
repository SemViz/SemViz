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


  resolveSemanticSource(url) {
    let formats = formatsCommon();
    return new Promise((resolve, reject) => {
      let corsUrl = 'https://cors-anywhere.herokuapp.com/' + url;
      //console.log(corsUrl);
      let contentType;
      fetch(corsUrl, {
          method: 'GET',
          //mode: 'no-cors',
          mode: 'cors',
        })
        .then((response) => {
          //console.log('Ontology response', response);
          //console.log('Content-Type',value,response.headers.get('Content-Type'));
          let contentTypeFull = response.headers.get('Content-Type');
          //let splitIndex = contentTypeFull.split(';')
          contentType = contentTypeFull.split(';')[0];
          return response.text();
        })
        .then((data) => {
          //console.log('ALLO',contentType);
          //console.log('Ontology response',value,contentType, data);
          try {
            let parser = formats.parsers[contentType];
            let quads = [];
            if (parser != undefined) {
              //console.log('auto parser');
              let quadStream = parser.import(stringToStream(data));
              quadStream.on('data', (quad) => {
                //console.log('tripleToQuad data',quad);
              })
              let serializerJsonLd = formats.serializers['application/ld+json'];
              let jsonLdStream = serializerJsonLd.import(quadStream);
              let jsonLdString = "";
              jsonLdStream.on('data', (data) => {
                jsonLdString = jsonLdString.concat(data);
                // console.log('streamJsonLD data',JSON.parse(data));
              }).on('end', () => {
                let jsonLdObjet = JSON.parse(jsonLdString)
                //console.log('JsonLd Ontology', value, contentType, jsonLdObjet);
                resolve(jsonLdObjet);
              }).on('error', (err) => {
                //console.log('ERROR');
                reject(err)
              })
            } else {
              if (contentType == 'application/rdf+xml') {
                //console.log('manual parser');
                let RDFparser = new RdfXmlParser();
                let tripleToQuad = new TripleToQuadTransform();
                let serializerJsonLd = formats.serializers['application/ld+json'];
                let jsonLdStream = serializerJsonLd.import(tripleToQuad);
                let jsonLdString = "";
                jsonLdStream.on('data', (data) => {
                  jsonLdString = jsonLdString.concat(data);
                  //console.log('streamJsonLD data', JSON.parse(data));
                }).on('end', () => {
                  let jsonLdObjet = JSON.parse(jsonLdString)
                  //console.log('JsonLd Ontology', value, contentType, jsonLdObjet);
                  resolve(jsonLdObjet);
                }).on('error', (err) => {
                  //console.log('ERROR',err);
                  reject(err);
                })

                RDFparser.stream(data).on('data', (triple) => {
                  let newTriple = {};
                  let object = {};
                  object.value = triple.object.nominalValue;
                  if (triple.object.datatype != undefined) {
                    object.datatype = {
                      value: triple.object.datatype.nominalValue
                    }
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
                }).on('readable', () => {
                  tripleToQuad.end();
                })


              } else {
                //console.warn('No parser for contentType', value, contentType);
                reject(new Error('No parser for contentType ' + contentType));
              }
            }
          } catch (e) {
            reject(e);
          }
        })
        .catch(function(error) {
          //console.error('Request failed', value, error);
          reject('Request to ' + url + ' failed')
        });
    })
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
    if(this.semanticStorage==true){
      this.webTripleStore.resolveSemanticSource(url).then(()=>{
        let datas= this.webTripleStore.getALL({reduceSubject:true,flatToTree:this.flatToTree}).then((datas)=>{
          console.log("datas",datas[0]['@graph']);
          this.publish('response', {data:datas[0]['@graph'],webTripleStore:this.ontologyTripleStore});
        });

      })
    }else{
      fetch(url, {
          mode: 'cors',
          method: this.attributesValues['method'],
        })
        .then(function(response) {
          return response.json();
        })
        .then((data) => {
          if(this.ontologyTripleStore!=undefined){
            this.ontologyTripleStore.resolveSemanticContext(data['@context']).then(webTripleStore=>{
              this.publish('response', {data:data[this.attributesValues['data-path']],webTripleStore:this.ontologyTripleStore})
            })
          }else{
              this.publish('response', {data:data[this.attributesValues['data-path']]})
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
      this.semanticStorage=true;
      this.webTripleStore=new WebTripleStore();
      // console.log("this.webTripleStore",this.webTripleStore);
    }else{
      this.semanticStorage=false;
    }
    if (this.attributesValues['flat-to-tree'] != undefined) {
      this.flatToTree=true;
      // console.log("this.webTripleStore",this.webTripleStore);
    }else{
      this.flatToTree=false;
    }
    if(this.attributesValues['ontology-web-triple-store']!=undefined){
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
