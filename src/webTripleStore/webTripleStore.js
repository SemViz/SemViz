import dotProp from 'dot-prop'
import sift from 'sift'
import WebTripleStore from './../lib/WebTripleStoreLib.js'

export default class webTripleStore extends HTMLElement {
  constructor() {
    super();
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

  promiseErrorAdapatator(promiseIn) {
    return new Promise((resolve, reject) => {
      promiseIn.then(out => {
        resolve(out);
      }).catch(err => {
        resolve({
          err: err
        });
      })
    })
  }

  loadOntologies(options) {
    Promise.all(
      this.namespaceFileMapping.map(m =>
        this.promiseErrorAdapatator(this.webTripleStore.resolve(m.file,{
        reduceSubject: true
      }))
      )).then(ontologies => {
      console.log('ALLO1');
      console.log("ontologies", ontologies);
    }).catch(e => {
      console.log('ALLO2');
      console.error(e);
    })
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
      this.webTripleStore = new WebTripleStore();
      if (this.attributesValues['namespace-file-mapping'] != undefined) {
        fetch(this.attributesValues['namespace-file-mapping'], {
          method: 'GET'
        }).then((response) => {
          return response.json();
        }).then((data) => {
          this.namespaceFileMapping = data;
          this.loadOntologies();
          //console.log('namespace-file-mapping', data);
        }).catch((error) => {
          //console.error('Request failed', value, error);
          console.error('Request to ' + url + ' failed')
        });

      }

    } catch (e) {
      console.error(e);
    }

  }


}
window.customElements.define('web-triple-store', webTripleStore);
