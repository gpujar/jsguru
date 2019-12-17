/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
'use strict';

const apiai = require('apiai');
const uuid = require('node-uuid');
const botbuilder = require('botbuilder');
const fs = require('fs');
const  Utils = require('./utils');
const util = new Utils();
const Section1 = require('./source/sections/section1/section1_main');
const section1 = new Section1();
const Section2 = require('./source/sections/section2/section2_main');
const section2 = new Section2();
const Section3 = require('./source/sections/section3/section3_main');
const section3 = new Section3();
const Section4 = require('./source/sections/section4/section4_main');
const section4 = new Section4();
const Section5 = require('./source/sections/section5/section5_main');
const section5 = new Section5();
const Section6 = require('./source/sections/section6/section6_main');
const section6 = new Section6();
// Changes to use Azure DB
//const azure = require('botbuilder-azure');

var welcomeAdaptiveCard1 = fs.readFileSync('./resources/welcome/welcome_adaptive_card.json');
const welcomeAdaptiveCard = JSON.parse(welcomeAdaptiveCard1);

// var definition1 = fs.readFileSync('./resources/welcome/definition_1.json');
// var definition = JSON.parse(definition1);

var definitionHeroCard1 = fs.readFileSync('./resources/welcome/definition_hero_card.json');
var definitionHeroCard = JSON.parse(definitionHeroCard1);

// Category and that's object mapping.
var categoryMapper = {
    basic : section1,
    advance : section2,
    algorithms : section3,
    designPattern : section4,
    libraryTools : section5,
    others : section6,
}

module.exports = class SkypeBot {

    get apiaiService() {
        return this._apiaiService;
    }

    set apiaiService(value) {
        this._apiaiService = value;
    }

    get botConfig() {
        return this._botConfig;
    }

    set botConfig(value) {
        this._botConfig = value;
    }

    get botService() {
        return this._botService;
    }

    set botService(value) {
        this._botService = value;
    }

    get sessionIds() {
        return this._sessionIds;
    }

    set sessionIds(value) {
        this._sessionIds = value;
    }

    constructor(botConfig) {
        this._botConfig = botConfig;
        var apiaiOptions = {
            language: botConfig.apiaiLang,
            requestSource: "skype"
        };

        this._apiaiService = apiai(botConfig.apiaiAccessToken, apiaiOptions);
        this._sessionIds = new Map();

        this.botService = new botbuilder.ChatConnector({
            appId: this.botConfig.skypeAppId,
            appPassword: this.botConfig.skypeAppSecret
        });

        var inMemoryStorage = new botbuilder.MemoryBotStorage();
        this._bot = new botbuilder.UniversalBot(this.botService).set('storage', inMemoryStorage); // Register in memory storage

       // this._bot = new botbuilder.UniversalBot(this.botService).set('storage', cosmosStorage); //Working with Azure DB

        this._bot.dialog('/', (session) => {
            console.log('dialog dialog dialog.... session ',session);
            if (session.message && session.message.text) {
                console.log("CTAP Guru :: address ",session.message.address);
                //Changes to use Azure DB
                // let savedAddress = session.message.address;
                // session.userData.savedAddress = savedAddress;
               // util.sendProactiveMessage(session.userData.savedAddress);
                session.sendTyping();
                this.processMessage(session);
            }else if(session){
                // Auto replay for first time hitting URL. Displays welcome Hero card with scope of bot.
                console.log('CTAP Guru :: welcome message display..... ');
                let title = definitionHeroCard.WELCOME.title;
                let subtitle = definitionHeroCard.WELCOME.subtitle;
                let imageUrl = definitionHeroCard.WELCOME.imageUrl;
                let buttons = definitionHeroCard.WELCOME.buttons;
                let heroCard = new botbuilder.HeroCard(session).title(title);
                if (Utils.isDefined(subtitle)) {
                    heroCard = heroCard.subtitle(subtitle)
                }
                if (Utils.isDefined(imageUrl)) {
                    heroCard = heroCard.images([botbuilder.CardImage.create(session, imageUrl)]);
                }
                if (Utils.isDefined(buttons)) {
                    let buttons_ = [];
                    for (let buttonIndex = 0; buttonIndex < buttons.length; buttonIndex++) {
                        let messageButton = buttons[buttonIndex];
                        if (messageButton.text) {
                            let postback = messageButton.postback;
                            if (!postback) {
                                postback = messageButton.text;
                            }
                            let button;
                            if (postback.startsWith("http")) {
                                button = botbuilder.CardAction.openUrl(session, postback, messageButton.text);
                            } else {
                                button = botbuilder.CardAction.imBack(session, postback, messageButton.text);
                            }
                            buttons_.push(button);
                        }
                    }
                    heroCard.buttons(buttons_);
                }
                let  welcome_message = new botbuilder.Message(session).attachmentLayout(botbuilder.AttachmentLayout.carousel).attachments([heroCard]);
                session.send(welcome_message);
            }
        });

        /**
         * Display welcome message on launch of direct channel page.
         * Welcome message to the user.
         */
        this._bot.on('event', (session) => {
            console.log('JSGuru :: event received  ');
            if(session.name === "ConversationUpdate"){
               // this.sendProactiveMessage(session.address);
               this._bot.beginDialog(session.address, '/');
            }
        });
        
    }

    /**
     * Sends proactive messages to active users.
     * 
     * @param {*} address - Address/session info of users.
     */
    sendProactiveMessage(address) {
        var msg = new botbuilder.Message().address(address);
        msg.text('Welcome to JS Guru');
        //msg.textLocale('en-US');
        this._bot.send(msg);
        this._bot.beginDialog(address, '/');
    }

    /**
     * 1. Reads user text from session.
     * 2. Request DialogFlow(API.AI) with user input for NLP.
     * 3. Reads intentAction, intentParameter, responseText and responseMessage from DialogFlow.
     * 4. Based on tententAction, gets relevant cards (mostly adaptive cards).
     * 5. Sends response back to bot.
     * 
     * @param {*} session 
     */
    processMessage(session) {
        let messageText = session.message.text;
        let sender = session.message.address.conversation.id;
        if (messageText && sender) {
            console.log(sender, messageText);
            if (!this._sessionIds.has(sender)) {
                this._sessionIds.set(sender, uuid.v1());
            }
            // Dialogflow request for NLP.
            let apiaiRequest = this._apiaiService.textRequest(messageText,
                {
                    sessionId: this._sessionIds.get(sender),
                    originalRequest: {
                        data: session.message,
                        source: "skype"
                    }
                });
            // Response from Dialogflow.
            apiaiRequest.on('response', (response) => {
                console.log('JS Bot :: Api.ai response  ', JSON.stringify(response));
                if (this._botConfig.devConfig) {
                    console.log(sender, "Received api.ai response");
                }
                if (Utils.isDefined(response.result) && Utils.isDefined(response.result.fulfillment)) {
                    let responseText = response.result.fulfillment.speech;
                    let responseMessages = response.result.fulfillment.messages;
                    let intentAction = response.result.action;
                    let intentParameters = response.result.parameters;

                    console.log('JS Bot :: intentAction '+intentAction);
                    console.log('JS Bot :: intentParameters '+JSON.stringify(intentParameters));
                    console.log('JS Bot :: responseText '+responseText);
                    console.log('JS Bot :: responseMessages '+JSON.stringify(responseMessages));

                    if (Utils.isDefined(responseMessages) && responseMessages.length > 0) {
                        // Sends cards based on intentAction.
                        this.getMessage(session, responseMessages, intentAction, intentParameters);
                    } else if (Utils.isDefined(responseText)) {
                        // Send dialogflow response text if intentAction is not received from dialogflow.
                        console.log(sender, 'Response as text message');
                        session.send(responseText);
                    } else {
                        // No response if intentAction and responseText not received from dialogFlow.
                        console.log(sender, 'Received empty speech');
                    }
                } else {
                    console.log(sender, 'Received empty result');
                }
            });
            // Dialogflow request failed case.
            apiaiRequest.on('error', (error) => {
                console.error(sender, 'Error while call to api.ai/dialogflow ', error);
            });
            apiaiRequest.end();
        } else {
            // Empty response from Bot
            console.log('Empty message received from bot.');
        }
    }

    /**
     * Based on intent category, delegates call to respective category file to send message/response.
     * There are 10 intent categories now. These are categorised based on content of JS.
     * 1. Basic Concepts - JS basic concepts are covered.
     * 2. Advance Concepts - JS advanced/important and latest upcoming concepts are covered.
     * 3. Difference - JS concepts difference Ex. let and const etc.
     * 4. Algorithms and Data Structure
     * 5. Design Patterns
     * 6. Libraries and Tools
     * 7. Debugging
     * 8. Unit Tests
     * 9. Errors
     * 10. Others
     * 
     * @param {*} session - Session object received from Bot 
     * @param {*} message - Response message received from dialogflow, not using now.
     * @param {*} intentAction - Intent action received from dialogflows, decides response to user.
     * @param {*} intentParameters - Intent parameters received from dialogflow, not using now.
     */
    getMessage(session, message, intentAction, intentParameters) {
        let category = intentAction.split('_')[0];
        console.log('JS Bot :: getMessage category ',category);
        // Gets category object from mapper object, using action type. Ex basic_.... = basic_concepts.js
        // For any new category, shall be added in categoryMapper object.
        let object = categoryMapper[category];
        if(object){
            object.sendMessage(session, message, intentAction, intentParameters);
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