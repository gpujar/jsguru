/**
 * Created by gpujar on 7/21/2019.
 */

const botbuilder = require('botbuilder');
const Utils = require('./../../../utils');
const util = new Utils();
const apiai = require('apiai');
const fs = require('fs');
var configFile = fs.readFileSync('./source/sections/section4/config/section4.json');
var config = JSON.parse(configFile);

module.exports = class BasicConcepts{
    /**
     * Reads cards from config(foundation.json) file and sends cards response to Bot.
     * 
     * @param {*} session 
     * @param {*} message 
     * @param {*} intentAction 
     * @param {*} intentParameters 
     */
    sendMessage(session, message, intentAction, intentParameters){
        if(intentAction){
            console.log("JS Bot :: config[intentAction]  ",config[intentAction]);
            let cards = config[intentAction].cards;
            let cardsCount = cards.length;
            let displayCards = []; //cards
            for(let i = 0; i < cardsCount; i++){
                let card = JSON.parse(fs.readFileSync(cards[i]));
                displayCards.push(card);
            }
            console.log('JS Bot :: Display Cards ',displayCards);
            session.send(new botbuilder.Message(session).attachments(displayCards).attachmentLayout(botbuilder.AttachmentLayout.carousel));
        }else{
            for (let messageIndex = 0; messageIndex < message.length; messageIndex++) {
                let msg = message[messageIndex];
                switch (msg.type) {
                    //message.type 0 means text message
                    case 0:
                    {
                        if (Utils.isDefined(msg.speech)) {
                            session.send(msg.speech);
                        }
                    }
                    break;
                }
            }
        }
    }

}