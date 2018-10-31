import postal from 'postal';
import {
  querySelectorAllDeep,
  querySelectorDeep
} from 'query-selector-shadow-dom';

window.postalChannelDirectory = {}
//window.postalRouteur.channelDirectory = [];

export default class WebComponentMessaging extends HTMLElement {
  constructor() {
    super();
    this.mesages=[];
    this.waitLinkingStack = [];
  }
  connectedCallback() {
    this.source = this.attributes.getNamedItem('source').nodeValue;
    this.target = this.attributes.getNamedItem('target').nodeValue;
    this.sourceChannel;
    this.targetChannel;
    let messages = this.querySelectorAll('message');
    //console.log(messages,messages.map);
    this.messages=Array.from(messages).map(r=>{
      return {
        source : r.attributes.getNamedItem('source').nodeValue,
        target : r.attributes.getNamedItem('target').nodeValue
      }
    });

    if (window.postalChannelDirectory[this.source] == undefined) {
      let chan = postal.channel(this.source);
      window.postalChannelDirectory[this.source] = {
        channel: chan,
        component: undefined,
        targetWaintingComponent: [],
        sourceWaitingComponent: []
      }
      this.sourceChannel = chan;
      this.affectSourceChannel();
    } else {
      //console.warn(`channel ${this.source} ever exist`);
      this.sourceChannel = window.postalChannelDirectory[this.source].channel;
      this.affectSourceChannel();
    }

    if (window.postalChannelDirectory[this.target] == undefined) {
      let chan = postal.channel(this.target);
      window.postalChannelDirectory[this.target] = {
        channel: chan,
        component: undefined,
        targetWaintingComponent: [],
        sourceWaitingComponent: []
      };
      this.targetChannel = chan;
      this.affectTargetChannel();
    } else {
      //console.warn(`channel ${this.target} ever exist`);
      this.targetChannel = window.postalChannelDirectory[this.target].channel;
      this.affectTargetChannel();
    }

    for (let message of this.messages){
      this.sourceChannel.subscribe(message.source, (data, envelope) => {
        this.waitLinkingStack.push({
          message: message.target,
          data: data
        })
        if (this.targetComponent == undefined) {
          // console.log('MESSAGING SOURCE WAITING', this.targetMessage);
        } else {
          //console.log('MESSAGING SOURCE PUBLISH', this.targetMessage, this);
          //this.targetChannel.publish(this.targetMessage, data);
        }
        this.unstackWaitLinkingStack();
      });
    }

  }

  affectSourceChannel() {
    let countSource = 0;
    let checkExist = setInterval(() => {
      //let sourceElement = document.querySelector(this.source);
      //console.log(this.source,sourceElement);
      let component = querySelectorDeep(this.source);
      //console.log('components',components);
      if (component != undefined && component.setChannel != undefined) {
        clearInterval(checkExist);
        //console.log("Exists source!",component);

        if (component.channel == undefined) {
          //console.log(`component ${this.source} setChannel`,this.sourceChannel);
          component.setChannel(this.sourceChannel);
        } else {
          //console.log(`component ${this.source} setChannel ever done`);
        }
        this.sourceComponent = component;
        //window.postalChannelDirectory[this.target].component=component;
        this.unstackWaitLinkingStack();
      } else {
        countSource++;
        if (countSource > 100) {
          console.warn(`component ${this.source} or the setChannel function doesn't exist after 10s`);
          clearInterval(checkExist);
        }
      }
    }, 100);
  }
  affectTargetChannel() {
    let countTarget = 0;
    let checkExist = setInterval(() => {
      //let TargetElement = document.querySelector(this.Target);
      //console.log(this.Target,TargetElement);
      let component = querySelectorDeep(this.target);
      //console.log('components',components);
      if (component != undefined && component.setChannel != undefined) {
        //console.log('ALLOOOO');
        clearInterval(checkExist);
        //console.log("Exists target!",component);

        if (component.channel == undefined) {
          //console.log(`component ${this.target} setChannel`);
          component.setChannel(this.targetChannel);
        } else {
          //console.log(`component ${this.target} setChannel ever done`);
        }
        this.targetComponent = component;
        //window.postalChannelDirectory[this.target].component=component;
        this.unstackWaitLinkingStack();
      } else {
        countTarget++;
        if (countTarget > 100) {
          console.warn(`component ${this.target} or the setChannel function doesn't exist after 10s`);
          clearInterval(checkExist);
        }
      }
    }, 100);
  }
  unstackWaitLinkingStack() {
    // console.log('XXXXX unstackWaitLinkingStack', this.waitLinkingStack);
    if (this.sourceComponent != undefined && this.targetComponent != undefined) {
      for (let stack of this.waitLinkingStack) {
        // console.log('MESSAGING SOURCE PUBLISH LATER', stack.message);
        this.targetChannel.publish(stack.message, stack.data);
      }
      this.waitLinkingStack=[];
    }
  }

}
window.customElements.define('postal-messaging', WebComponentMessaging);
