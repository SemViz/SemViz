import dotProp from 'dot-prop'
import sift from 'sift'
import RdfExt from 'rdf-ext'
import formatsCommon from 'rdf-formats-common'
import stringToStream from 'string-to-stream'
import RdfStoreDataSet from 'rdf-store-dataset'
import {
  RdfXmlParser
} from "rdfxml-streaming-parser";

export default class webTripleStore extends HTMLElement {
  constructor() {
    super();
    this.subscriptions = [];
    this.rdfExtDataset = RdfExt.dataset();
    this.formats = formatsCommon();
    this.cachedUrl = [];
  }
  setChannel(channel) {
    //console.log('Set Channel');
    this.channel = channel;

    // this.subscriptions.push(channel.subscribe("fetch", (data, envelope) => {
    // }));
  }
  resolveSemanticContext(context) {
    return new Promise((resolve, reject) => {
      try {
        let promises = [];
        let reflect = p => p.then(v => ({
            v,
            status: "fulfilled"
          }),
          e => ({
            e,
            status: "rejected"
          }));
        for (let key in context) {
          let value = context[key];
          if (typeof(value) == 'string' || value instanceof String) {
            if (key.indexOf("@base") == -1) {
              let file = value;
              if (this.namespaceFileMapping != undefined) {
                let mapping = sift({
                  namespace: value
                }, this.namespaceFileMapping);
                //console.log(mapping);
                if (mapping.length > 0) {
                  file = mapping[0].file;
                }
              }
              console.log(value,file);
              promises.push(this.resolveSemanticSource(file));
            }
          }
        }
        Promise.all(promises.map(reflect)).then((results) => {
          resolve(this);

        });
      } catch (e) {
        reject(e);
      }
    })

  }

  reduceNamedGraph(records) {
    //console.log('REDUCE');
    return new Promise((resolve, reject) => {
      try {
        let out = [];
        for (let record of records) {
          // console.log(out);
          let everGraphExist = sift({
            '@id': record['@id']
          }, out);
          if (everGraphExist.length > 0) {
            everGraphExist[0]['@graph'].push(record['@graph']);
          } else {
            record['@graph'] = [record['@graph']];
            out.push(record);
          }
        }
        resolve(out);
      } catch (e) {
        console.error(e);
        reject(e)
      };
    });
  }

  reduceSubject(records) {
    options=options||{};
    //console.log('REDUCE');
    return new Promise((resolve, reject) => {
      try {
        let out = [];
        for (let record of records) {
          let everSubjectExist = sift({
            '@id': record['@id']
          }, out);
          if (everSubjectExist.length > 0) {
            //console.log(Object.keys(record['@graph']));
            let key = Object.keys(record)[1];
            //console.log(key, record['@graph'][key]);
            everSubjectExist[0][key] = record[key];
          } else {
            out.push(record);
          }
        }
        resolve(out);
      } catch (e) {
        console.error(e);
        reject(e)
      };
    });
  }

  reduce(records, options) {
    options=options||{};
    return new Promise((resolve, reject) => {
      this.reduceNamedGraph(records).then(graphs => {
        if(options.reduceSubject==true){
          let promises = graphs.map(r => this.reduceSubject(r['@graph']));
          Promise.all(promises).then(reducedGraphs => {
            for (let graphKey in graphs) {
              graphs[graphKey]['@graph'] = reducedGraphs[graphKey];
            }
            resolve(graphs);
          }).catch(e => {
            console.error(e);
            reject(e);
          })
        }else{
          resolve(graphs)
        }
      })
    });
  }

  getALL(options) {
    options=options||{};
    //console.log('ALLO');
    return new Promise((resolve, reject) => {
      //console.log('ALLO-1');
      this.getALLRaw().then(triplets => {
        if (options.notReduceGraph == true) {
          //console.log('ALLO0');
          resolve(triplets);
        } else {
          this.reduce(triplets, options).then(reduced => {
            resolve(reduced);
          }).catch(e => {
            reject(e);
          })
        }
      })
    });
  }

  getALLRaw() {
    //console.log('ALLO');
    return new Promise((resolve, reject) => {
      //console.log(this.rdfExtDataset);
      //let json = this.rdfExtDataset.toStream();
      let serializerJsonLd = this.formats.serializers['application/ld+json'];
      let jsonLdStream = serializerJsonLd.import(this.rdfExtDataset.toStream());
      let jsonLdString = "";
      jsonLdStream.on('data', (data) => {
        jsonLdString = jsonLdString.concat(data);
      }).on('end', () => {
        let jsonLdObjet = JSON.parse(jsonLdString)
        //console.log(jsonLdObjet);
        resolve(jsonLdObjet);
      }).on('error', (err) => {
        reject(err);
      })
    });
  }


  resolveSemanticSource(url) {

    return new Promise((resolve, reject) => {
      // console.log(this.cachedUrl);
      let existingGraph = localStorage.getItem(url);
      if (existingGraph != undefined) {
        let jsonLdGraph = {
          '@id': url,
          '@graph': JSON.parse(existingGraph)
        };
        let jsonParser = this.formats.parsers['application/ld+json'];
        jsonParser.import(stringToStream(JSON.stringify(jsonLdGraph))).on('data', (quad) => {
          this.rdfExtDataset.add(quad)
        }).on('end', () => {
          resolve();
        })

      } else {
        this.cachedUrl.push(url)
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
              let parser = this.formats.parsers[contentType];
              let quads = [];
              let quadStream;
              if (parser != undefined) {
                parser.import(stringToStream(data)).on('data', quad => {
                  quad.graph = RdfExt.namedNode(url);
                  this.rdfExtDataset.add(quad)
                }).on('end', () => {
                  let serializerJsonLd = this.formats.serializers['application/ld+json'];
                  let jsonLdStream = serializerJsonLd.import(this.rdfExtDataset.match(null, null, null, RdfExt.namedNode(url)).toStream());
                  let jsonLdString = "";
                  jsonLdStream.on('data', (data) => {
                    jsonLdString = jsonLdString.concat(data);
                  }).on('end', () => {
                    let jsonLdObjet = JSON.parse(jsonLdString);
                    //console.log(this);
                    try {
                      this.reduceNamedGraph(jsonLdObjet).then(reduced => {
                        console.log();
                        localStorage.setItem(reduced[0]['@id'], JSON.stringify(reduced[0]['@graph']));
                        resolve();
                      })
                    } catch (e) {
                      console.error(e);
                      reject(e);
                    }
                    //resolve(jsonLdObjet);
                  }).on('error', (err) => {
                    reject(err);
                  })
                })
              } else if (contentType == 'application/rdf+xml') {
                let rdfXmlParser = new RdfXmlParser();
                stringToStream(data).pipe(rdfXmlParser).on('data', quad => {
                  quad.graph = RdfExt.namedNode(url);
                  this.rdfExtDataset.add(quad)
                }).on('end', () => {
                  // let imported = this.rdfExtDataset.match(null, null, null, RdfExt.namedNode(url))
                  // console.log(imported);
                  let serializerJsonLd = this.formats.serializers['application/ld+json'];
                  let jsonLdStream = serializerJsonLd.import(this.rdfExtDataset.match(null, null, null, RdfExt.namedNode(url)).toStream());
                  let jsonLdString = "";
                  jsonLdStream.on('data', (data) => {
                    jsonLdString = jsonLdString.concat(data);
                  }).on('end', () => {
                    let jsonLdObjet = JSON.parse(jsonLdString);
                    //console.log(this);
                    try {
                      this.reduceNamedGraph(jsonLdObjet).then(reduced => {
                        console.log();
                        localStorage.setItem(reduced[0]['@id'], JSON.stringify(reduced[0]['@graph']));
                        resolve();
                      })
                    } catch (e) {
                      console.error(e);
                      reject(e);
                    }
                    //resolve(jsonLdObjet);
                  }).on('error', (err) => {
                    reject(err);
                  })

                });
              } else {
                console.warn('No parser for contentType', url, contentType);
                reject(new Error('No parser for contentType ' + contentType));
              }
            } catch (e) {
              console.error(e);
              reject(e);
            }
          })
          .catch(function(error) {
            //console.error('Request failed', value, error);
            reject('Request to ' + url + ' failed')
          });
      }
    });
  }

  connectedCallback() {
    //console.log(this.attributes);
    this.attributesValues = {};
    for (let attribute of this.attributes) {
      //console.log(attribute);
      this.attributesValues[attribute.name] = attribute.nodeValue;
    }
    try {
      //console.log('ALLO');
      fetch(this.attributesValues['namespace-file-mapping'], {
        method: 'GET'
      }).then((response) => {
        return response.json();
      }).then((data) => {
        this.namespaceFileMapping = data;
        console.log('namespace-file-mapping', data);
      }).catch((error) => {
        //console.error('Request failed', value, error);
        console.log('Request to ' + url + ' failed')
      });
    } catch (e) {
      console.log(e);
    }

  }


}
window.customElements.define('web-triple-store', webTripleStore);
