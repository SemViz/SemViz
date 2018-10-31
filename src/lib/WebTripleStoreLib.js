import dotProp from 'dot-prop'
import sift from 'sift'
import RdfExt from 'rdf-ext'
import formatsCommon from 'rdf-formats-common'
import stringToStream from 'string-to-stream'
import RdfStoreDataSet from 'rdf-store-dataset'
import {
  RdfXmlParser
} from "rdfxml-streaming-parser";

export default class WebTripleStoreLib{
  constructor() {
    //super();
    this.subscriptions = [];
    this.rdfExtDataset = RdfExt.dataset();
    this.formats = formatsCommon();
    this.cachedUrl = [];
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
              //console.log(value, file);
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

  reduceNamedGraph(records, options) {
    options = options || {};
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

  flatToTree(records, options) {
    // console.log('flatToTree IN',records);
    options = options || {};
    return new Promise((resolve, reject) => {
      try {
        let out = [];
        let targets = [];
        //let r=0;
        // while(records.length>0){
        //   let record=records[0];
        for (let record of records) {
          for (let key in record) {
            if (!(typeof(record[key]) == 'string' || record[key] instanceof String)) {
              let propertyCandidate = record[key];
              let propertyArray;
              if (Array.isArray(propertyCandidate)) {
                propertyArray = propertyCandidate.map((r,i)=>{return{referer:propertyCandidate, key:i}});
              } else {
                propertyArray = [{referer:record, key:key}];
              }
              //console.log('propertyArray', propertyArray);
              for (let propertyReferer of propertyArray) {
                let property = propertyReferer.referer[propertyReferer.key];
                //console.log('property', property);
                for (let propertyKey in property) {
                  //console.log('flatToTree0', property, propertyKey, property[propertyKey]);

                  if (propertyKey == "@id") {
                    console.log('flatToTree',record[key]);
                    let target = sift({
                      "@id": property[propertyKey]
                    }, records)[0];
                    if (target == undefined) {
                      //console.warn('WebTripleStore/flatToTree : identifier not found', property, record, key);
                    } else {
                      targets.push(target);
                      propertyReferer.referer[propertyReferer.key] = target
                    }
                  }
                }
              }
            }
          }


          //out.push(record);
          //records.splice(records.indexOf(record),1);
          //r++;
        }
        //console.log('targets',targets);
        records = sift({
          '@id': {
            $nin: targets.map(r => r['@id'])
          }
        }, records);
        if (out.length == 0) {
          out = records;
        }

        //console.log('flatToTree Result', out);
        resolve(out);
      } catch (e) {
        reject(e);
      }
    });
  }

  reduceSubject(records, options) {
    options = options || {};
    console.log('REDUCE');
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
            if (everSubjectExist[0][key] == undefined) {
              everSubjectExist[0][key] = record[key];
            } else {
              if (Array.isArray(everSubjectExist[0][key])) {
                everSubjectExist[0][key].push(record[key]);
              } else {
                everSubjectExist[0][key] = [everSubjectExist[0][key], record[key]];
              }
            }
            //console.log(key, record['@graph'][key]);

          } else {
            out.push(record);
          }
        }

        if(options.flatToTree==true){
          this.flatToTree(out).then(records=>{
            //console.log('XXXXXXXXXXX',records);
            resolve(records);
          })
        }else{
            resolve(out);
        }

      } catch (e) {
        console.error(e);
        reject(e)
      };
    });
  }

  reduce(records, options) {
    console.log('REDUCE', records);
    options = options || {};
    return new Promise((resolve, reject) => {
      try {
        this.reduceNamedGraph(records).then(graphs => {
          if (options.reduceSubject == true) {
            //console.log('ALLO1',graphs);
            let promises = graphs.map(r => this.reduceSubject(r['@graph'],options));
            //console.log('ALLO2');
            Promise.all(promises).then(reducedGraphs => {
              //console.log('ALLO2');
              for (let graphKey in graphs) {
                graphs[graphKey]['@graph'] = reducedGraphs[graphKey];
              }
              resolve(graphs);
            }).catch(e => {
              console.error(e);
              reject(e);
            })
          } else {
            resolve(graphs)
          }
        })
      } catch (e) {
        console.error(e);
        reject(e);
      }

    });
  }

  getALL(options) {
    options = options || {};
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
        //console.log('XXXXXXXXX',jsonLdString);
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
        //this.cachedUrl.push(url)
        //let corsUrl = 'https://cors-anywhere.herokuapp.com/' + url;
        let corsUrl = url;
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
            //console.log('response',value,contentType, data);
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
                        // console.log();
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
      if (this.attributesValues['namespace-file-mapping'] != undefined) {
        fetch(this.attributesValues['namespace-file-mapping'], {
          method: 'GET'
        }).then((response) => {
          return response.json();
        }).then((data) => {
          this.namespaceFileMapping = data;
          //console.log('namespace-file-mapping', data);
        }).catch((error) => {
          //console.error('Request failed', value, error);
          console.error('Request to ' + url + ' failed')
        });

      }
      //console.log(this.attributesValues['autoload-url']);
      if (this.attributesValues['autoload-url'] != undefined) {
        this.resolveSemanticSource(this.attributesValues['autoload-url']).then(() => {
          this.getALL({
            reduceSubject: true,
            flatToTree :true
          }).then(records => {
            console.log('autoload',records);
          })
        })
      }

    } catch (e) {
      console.error(e);
    }

  }


}
