import dotProp from 'dot-prop'
import sift from 'sift'
import RdfExt from 'rdf-ext'
import formatsCommon from 'rdf-formats-common'
import stringToStream from 'string-to-stream'
// import RdfStoreDataset from 'rdf-store-dataset'
// import RdfDatasetSimple from 'rdf-dataset-simple'
import {
  RdfXmlParser
} from "rdfxml-streaming-parser";

export default class WebTripleStoreLib {
  constructor() {
    //super();
    this.subscriptions = [];
    this.ontologyDataSet = RdfExt.dataset();
    this.ontologyUrlEverREsolved=[];
    //this.datasets = {};
    //this.rdfExtDataset = new RdfDatasetSimple();
    this.formats = formatsCommon();
    this.cachedUrl = [];
    this.currentUrl;
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
            //record['@graph'] = [record['@graph']];
            out.push({'@id':record['@id'],'@graph':[record['@graph']]});
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
                propertyArray = propertyCandidate.map((r, i) => {
                  return {
                    referer: propertyCandidate,
                    key: i
                  }
                });
              } else {
                propertyArray = [{
                  referer: record,
                  key: key
                }];
              }
              //console.log('propertyArray', propertyArray);
              for (let propertyReferer of propertyArray) {
                let property = propertyReferer.referer[propertyReferer.key];
                //console.log('property', property);
                for (let propertyKey in property) {
                  //console.log('flatToTree0', property, propertyKey, property[propertyKey]);

                  if (propertyKey == "@id") {
                    console.log('flatToTree', record[key]);
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

        if (options.flatToTree == true) {
          this.flatToTree(out).then(records => {
            //console.log('XXXXXXXXXXX',records);
            resolve(records);
          })
        } else {
          resolve(out);
        }

      } catch (e) {
        console.error(e);
        reject(e)
      };
    });
  }

  reduce(records, options) {
    //console.log('REDUCE', records);
    options = options || {};
    return new Promise((resolve, reject) => {
      try {
        this.reduceNamedGraph(records).then(graphs => {
          if (options.reduceSubject == true) {
            //console.log('ALLO1',graphs);
            let promises = graphs.map(r => this.reduceSubject(r['@graph'], options));
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

  getALL(dataset, options) {
    options = options || {};
    // console.log('getALL', dataset, options, this.datasets);
    return new Promise((resolve, reject) => {
      // console.log('STEP-1', Math.round(new Date().getTime() / 1000));
      this.getALLRaw(dataset).then(triplets => {
        // console.log('STEP-2', Math.round(new Date().getTime() / 1000), triplets);
        //console.log('triplets',triplets);
        if (options.notReduceGraph == true) {
          // console.log('STEP-3 notReduceGraph', Math.round(new Date().getTime() / 1000));
          //console.log('ALLO0');
          resolve(triplets);
        } else {
          //console.log('STEP-3', Math.round(new Date().getTime() / 1000));
          this.reduce(triplets, options).then(reduced => {
            // console.log('STEP-3', Math.round(new Date().getTime() / 1000), reduced);
            if (reduced.length > 0) {
              resolve(reduced);
            } else {
              resolve([{
                "@graph": []
              }]);
            }

          }).catch(e => {
            reject(e);
          })
        }
      })
    });
  }

  getALLRaw(dataset) {
    //console.log('ALLO');
    return new Promise((resolve, reject) => {
      //console.log(this.rdfExtDataset);
      //let json = this.rdfExtDataset.toStream();
      let serializerJsonLd = this.formats.serializers['application/ld+json'];
      //console.log("this.rdfExtDataset",this.rdfExtDataset);
      let jsonLdStream = serializerJsonLd.import(dataset.toStream());
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

  resolve(url, options) {

    return new Promise((resolve, reject) => {

      this.resolveSemanticSource(url).then(dataset => {
        // console.log("** Data resolveSemanticSource",dataset);
        // try{
        //   let typeFilter= RdfExt.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
        //   let types = dataset.match(null, typeFilter, null, null);
        //   console.log("types",types);
        // }catch(e){
        //   console.error(e);
        // }


        this.getALL(dataset, options).then(data => {
          // console.log("** Data getALL", data);
          resolve(data)
        }).catch(e=>{
          reject(e);
        });
        // this.getALL(this.datasetOntology,options).then(data=>{
        //   console.log("** Ontology getALL",data);
        //   resolve(data)
        // })
      }).catch(e=>{
        reject(e);
      });
    });
  }

  resolveSemanticSource(url) {

    return new Promise((resolve, reject) => {
      // console.log(this.cachedUrl);
      //if(this.datasets[url]==undefined){
      //** bug datase.removeGrag (non responding). trick to skirt*//
      //this.datasets[url] = RdfExt.dataset();
      // }else{
      //
      // }
      let currentDataSet = RdfExt.dataset();

      console.log('resolveSemanticSource', url);
      let existingGraph = localStorage.getItem(url);
      if (existingGraph != undefined) {
        // console.log('STEP-00', Math.round(new Date().getTime() / 1000));
        //console.log(existingGraph);
        // let jsonLdGraph = {
        //   '@id': url,
        //   '@graph': JSON.parse(existingGraph)
        // };

        try{
          let jsonParser = this.formats.parsers['application/ld+json'];
          // console.log('STEP-01', Math.round(new Date().getTime() / 1000));
          // let jsonLdGraphStringify = JSON.stringify(jsonLdGraph);
          // console.log('STEP-02', Math.round(new Date().getTime() / 1000));
          jsonParser.import(stringToStream(existingGraph)).on('data', (quad) => {
            //console.log('STEP-021', Math.round(new Date().getTime() / 1000),quad);
            currentDataSet.add(quad)
          }).on('end', () => {
            // console.log('STEP-03', Math.round(new Date().getTime() / 1000),currentDataSet);
            resolve(currentDataSet);
          }).on('error', (err) => {
            console.error(err);
          })
        }catch(e){
          console.error(e);
        }


      } else {
        //this.cachedUrl.push(url)
        let corsUrl = 'https://cors-anywhere.herokuapp.com/' + url;
        //let corsUrl = url;
        // console.log(corsUrl);
        //console.log('ALLO1');
        let contentType;
        fetch(corsUrl, {
            method: 'GET',
            //mode: 'no-cors',
            mode: 'cors',
          })
          .then((response) => {
            //console.log('ALLO2');
            // console.log('Content-Type',response.headers.get('Content-Type'));
            let contentTypeFull = response.headers.get('Content-Type');
            //let splitIndex = contentTypeFull.split(';')
            contentType = contentTypeFull.split(';')[0];
            return response.text();
          })
          .then((data) => {
            //console.log('Semantic response', data,contentType);
            //console.log('ALLO',contentType);
            //console.log('response',value,contentType, data);
            try {
              //let context= JSON.parse(data)["@context"];
              //console.log(context);
              let parser = this.formats.parsers[contentType];
              //console.log('parser',parser);
              let quads = [];
              let quadStream;
              if (parser != undefined) {
                parser.import(stringToStream(data)).on('data', quad => {
                  //console.log('ALLO');
                  quad.graph = RdfExt.namedNode(url);
                  //console.log('quad',quad);
                  currentDataSet.add(quad)
                }).on('end', () => {
                  //console.log('END');
                  let serializerJsonLd = this.formats.serializers['application/ld+json'];
                  let jsonLdData = currentDataSet.match(null, null, null, RdfExt.namedNode(url));
                  if (jsonLdData.length > 0) {
                    let jsonLdStream = serializerJsonLd.import(jsonLdData.toStream());
                    let jsonLdString = "";
                    jsonLdStream.on('data', (data) => {
                      jsonLdString = jsonLdString.concat(data);
                    }).on('end', () => {
                      // console.log('END2');
                      try {
                        let jsonLdObjet = JSON.parse(jsonLdString);
                        //console.log('END3', jsonLdObjet[0]);
                        // localStorage.setItem(jsonLdObjet[0]['@id'], JSON.stringify(jsonLdObjet[0]));
                        // resolve(currentDataSet);
                        //console.log(this);
                        this.reduceNamedGraph(jsonLdObjet).then(reduced => {
                          try {
                            //console.log('END4', reduced);
                            localStorage.setItem(reduced[0]['@id'], JSON.stringify(reduced[0]));
                            // console.log('END5');
                            resolve(currentDataSet);
                          } catch (e) {
                            console.error(e);
                            reject(e);
                          }
                        })
                      } catch (e) {
                        console.error(e);
                        reject(e);
                      }
                      //resolve(jsonLdObjet);
                    }).on('error', (err) => {
                      console.log(err);
                      reject(err);
                    })
                  } else {
                    localStorage.setItem(url, JSON.stringify([]));
                    resolve(url)
                  }
                }).on('error', (err) => {
                  console.log(err);
                  reject(err);
                })
              } else if (contentType == 'application/rdf+xml') {
                let rdfXmlParser = new RdfXmlParser();
                stringToStream(data).pipe(rdfXmlParser).on('data', quad => {
                  quad.graph = RdfExt.namedNode(url);
                  currentDataSet.add(quad)
                }).on('end', () => {
                  // let imported = this.rdfExtDataset.match(null, null, null, RdfExt.namedNode(url))
                  // console.log(imported);
                  let serializerJsonLd = this.formats.serializers['application/ld+json'];
                  let jsonLdStream = serializerJsonLd.import(currentDataSet.match(null, null, null, RdfExt.namedNode(url)).toStream());
                  let jsonLdString = "";
                  jsonLdStream.on('data', (data) => {
                    jsonLdString = jsonLdString.concat(data);
                  }).on('end', () => {
                    let jsonLdObjet = JSON.parse(jsonLdString);
                    //console.log(this);
                    try {
                      this.reduceNamedGraph(jsonLdObjet).then(reduced => {
                        // console.log();
                        localStorage.setItem(reduced[0]['@id'], JSON.stringify(reduced[0]));
                        resolve(currentDataSet);
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

  // connectedCallback() {
  //   //console.log(this.attributes);
  //   this.attributesValues = {};
  //   for (let attribute of this.attributes) {
  //     //console.log(attribute);
  //     this.attributesValues[attribute.name] = attribute.nodeValue;
  //   }
  //   try {
  //     //console.log('ALLO');
  //     if (this.attributesValues['namespace-file-mapping'] != undefined) {
  //       fetch(this.attributesValues['namespace-file-mapping'], {
  //         method: 'GET'
  //       }).then((response) => {
  //         return response.json();
  //       }).then((data) => {
  //         this.namespaceFileMapping = data;
  //         //console.log('namespace-file-mapping', data);
  //       }).catch((error) => {
  //         //console.error('Request failed', value, error);
  //         console.error('Request to ' + url + ' failed')
  //       });
  //
  //     }
  //     //console.log(this.attributesValues['autoload-url']);
  //     if (this.attributesValues['autoload-url'] != undefined) {
  //       this.resolveSemanticSource(this.attributesValues['autoload-url']).then(() => {
  //         this.getALL({
  //           reduceSubject: true,
  //           flatToTree: true
  //         }).then(records => {
  //           console.log('autoload', records);
  //         })
  //       })
  //     }
  //
  //   } catch (e) {
  //     console.error(e);
  //   }
  //
  // }


}
