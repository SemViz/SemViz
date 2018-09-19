import dotProp from 'dot-prop'
import sift from 'sift'
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
  resolveSemanticContext(context) {

    return new Promise((resolve, reject) => {
      try {
        console.log('ALLO');
        fetch("http://localhost:8083/config/ontologyFileMapping.json", {
          method: 'GET'
        }).then((response) => {
          console.log(response);
        }).catch((error) => {
          //console.error('Request failed', value, error);
          console.log('Request to ' + url + ' failed')
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
    })

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
    fetch(url, {
        mode: 'cors',
        method: this.attributesValues['method'],
      })
      .then(function(response) {
        return response.json();
      })
      .then((data) => {
        // console.log('FETCH result',data);
        //this.data = data.data;
        //this.renderTable();
        //console.log(data);
        // this.resolveSemanticContext(data['@context']).then(ontology => {
        //   this.publish('ontology', ontology)
        // })

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
    if(this.attributesValues['ontology-web-triple-store']!=undefined){
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
