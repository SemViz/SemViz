import dotProp from 'dot-prop'

export default class httpCrud extends HTMLElement {
  constructor() {
    super();
    this.subscriptions=[];
  }
  setChannel(channel) {
    //console.log('Set Channel');
    this.channel = channel;
    this.subscriptions.push(channel.subscribe("fetch", (data, envelope) => {
      console.log('server/readManyRequest',data);
      this.execute(data)
      //this.router.navigate('form');
    }));
  }
  execute(paramObjectIn) {
    //console.log('paramObjetIn',paramObjectIn);
    let url = this.attributesValues['url'];
    console.log(url);
    let paramObject = this.defaultParamObject||{};
    if (paramObjectIn != undefined) {
      for(let attr in paramObjectIn){
        paramObject[attr]=paramObjectIn[attr];
      }
    }

    const regex = /{(\$.*?)}/g;
    let elementsRaw = url.match(regex);
    if (elementsRaw != null) {
      for (let match of elementsRaw) {
        let ObjectKey = match.slice(3, -1);
        //console.log(match,ObjectKey,dotProp.get(paramObject, ObjectKey));
        let ObjectValue=dotProp.get(paramObject, ObjectKey)
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
        this.publish('response',data)
      })
      .catch(function(error) {
        log('Request failed', error)
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



    //console.log(this.attributesValues);
    //this.urlReadMany = this.attributes.getNamedItem('urlReadMany').nodeValue;
    //this.defaultReadManyParam = this.attributes.getNamedItem('defaultReadManyParam').nodeValue;
    //this.urlReadOne = this.attributes.getNamedItem('urlReadOne').nodeValue;
    //this.autoReadMany = this.attributes.getNamedItem('autoReadMany').nodeValue;

  }
  publish(message,data){

    let count = 0;
    let checkExist = setInterval(() => {
      if (this.channel != undefined) {
        console.log('CRUD message',message);
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
window.customElements.define('http-fetch', httpCrud);
