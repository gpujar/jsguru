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
const BasicConcepts = require('./source/basic_concepts');
const basicConcepts = new BasicConcepts();
const AlgorithmsDatastructure = require('./source/algorithm_dataStructure');
const algorithmsDatastructure = new AlgorithmsDatastructure();
const CoreConcepts = require('./source/core_concepts');
const coreConcepts = new CoreConcepts();
const DesignPatterns = require('./source/design_patterns');
const designPatterns = new DesignPatterns();
const LibraryTools = require('./source/library_tools');
const libraryTools = new LibraryTools();
const Others = require('./source/others');
const others = new Others();

// Changes to use Azure DB
//const azure = require('botbuilder-azure');

var welcomeAdaptiveCard1 = fs.readFileSync('./resources/welcome/welcome_adaptive_card.json');
const welcomeAdaptiveCard = JSON.parse(welcomeAdaptiveCard1);

var definition1 = fs.readFileSync('./resources/definition/definition_1.json');
var definition = JSON.parse(definition1);

var definitionHeroCard1 = fs.readFileSync('./resources/definition/definition_hero_card.json');
var definitionHeroCard = JSON.parse(definitionHeroCard1);

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
                console.log('CTAP Guru :: welcome message display ');
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

    sendProactiveMessage(address) {
        var msg = new botbuilder.Message().address(address);
        msg.text('Welcome to JS Guru');
        //msg.textLocale('en-US');
        this._bot.send(msg);
        this._bot.beginDialog(address, '/');
    }

    processMessage(session) {
        let messageText = session.message.text;
        let sender = session.message.address.conversation.id;
        if (messageText && sender) {
            console.log(sender, messageText);
            if (!this._sessionIds.has(sender)) {
                this._sessionIds.set(sender, uuid.v1());
            }
            let apiaiRequest = this._apiaiService.textRequest(messageText,
                {
                    sessionId: this._sessionIds.get(sender),
                    originalRequest: {
                        data: session.message,
                        source: "skype"
                    }
                });
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
                        this.getMessage(session, responseMessages, intentAction, intentParameters);
                    } else if (Utils.isDefined(responseText)) {
                        console.log(sender, 'Response as text message');
                        session.send(responseText);
                    } else {
                        console.log(sender, 'Received empty speech');
                    }
                } else {
                    console.log(sender, 'Received empty result');
                }
            });
            apiaiRequest.on('error', (error) => {
                console.error(sender, 'Error while call to api.ai', error);
            });
            apiaiRequest.end();
        } else {
            console.log('Empty message');
        }
    }

    getMessage(session, message, intentAction, intentParameters) {
        if(intentAction.indexOf('basic_') !== -1){
            basicConcepts.sendMessage(session, message, intentAction, intentParameters);
        }else if(intentAction.indexOf('core_') !== -1){
            coreConcepts.sendMessage(session, message, intentAction, intentParameters);
        }else if(intentAction.indexOf('design_') !== -1){
            designPatterns.sendMessage(session, message, intentAction, intentParameters);
        }else if(intentAction.indexOf('algo_ds_') !== -1){
            algorithmsDatastructure.sendMessage(session, message, intentAction, intentParameters);
        }else if(intentAction.indexOf('lib_tool_') !== -1){
            libraryTools.sendMessage(session, message, intentAction, intentParameters);
        }else if(intentAction.indexOf('others_') !== -1){
            others.sendMessage(session, message, intentAction, intentParameters);
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