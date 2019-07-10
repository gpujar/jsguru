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
               // this.sendProactiveMessage(session.userData.savedAddress);
                session.sendTyping();
                this.processMessage(session);
            }else if(session){
                console.log('CTAP Guru :: welcome message display ');
                let title = definitionHeroCard.WELCOME.title;
                let subtitle = definitionHeroCard.WELCOME.subtitle;
                let imageUrl = definitionHeroCard.WELCOME.imageUrl;
                let buttons = definitionHeroCard.WELCOME.buttons;
                let heroCard = new botbuilder.HeroCard(session).title(title);
                if (SkypeBot.isDefined(subtitle)) {
                    heroCard = heroCard.subtitle(subtitle)
                }
                if (SkypeBot.isDefined(imageUrl)) {
                    heroCard = heroCard.images([botbuilder.CardImage.create(session, imageUrl)]);
                }
                if (SkypeBot.isDefined(buttons)) {
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
                if (SkypeBot.isDefined(response.result) && SkypeBot.isDefined(response.result.fulfillment)) {
                    let responseText = response.result.fulfillment.speech;
                    let responseMessages = response.result.fulfillment.messages;
                    let intentAction = response.result.action;
                    let intentParameters = response.result.parameters;

                    console.log('JS Bot :: intentAction '+intentAction);
                    console.log('JS Bot :: intentParameters '+JSON.stringify(intentParameters));
                    console.log('JS Bot :: responseText '+responseText);
                    console.log('JS Bot :: responseMessages '+JSON.stringify(responseMessages));

                    if (SkypeBot.isDefined(responseMessages) && responseMessages.length > 0) {
                        this.getMessage(session, responseMessages, intentAction, intentParameters);
                    } else if (SkypeBot.isDefined(responseText)) {
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
        let response_message;
        switch (intentAction) {
            case "welcome":{
                response_message = this.getHeroCardResponseText(session, definitionHeroCard.WELCOME.title, definitionHeroCard.WELCOME.subtitle, definitionHeroCard.WELCOME.imageUrl, definitionHeroCard.WELCOME.buttons);
                session.send(response_message);
            }
            break;
            case "js-definition":{
                let definition = JSON.parse(fs.readFileSync('./resources/definition/definition_1.json'));
                let high_level_language = JSON.parse(fs.readFileSync('./resources/definition/high_level_language.json'));
                let interpreted_programe = JSON.parse(fs.readFileSync('./resources/definition/interpreted_language.json'));
                let curly_bracket_syntax = JSON.parse(fs.readFileSync('./resources/definition/curly_bracket_syntax.json'));
                let dynamic_typing = JSON.parse(fs.readFileSync('./resources/definition/dynamic_typing.json'));
                let object_oriented = JSON.parse(fs.readFileSync('./resources/definition/object_orientation.json'));
                let first_class_function = JSON.parse(fs.readFileSync('./resources/definition/first_class_function.json'));
                session.send(new botbuilder.Message(session).attachments([definition, high_level_language, interpreted_programe, curly_bracket_syntax, dynamic_typing, object_oriented, first_class_function]).attachmentLayout(botbuilder.AttachmentLayout.carousel));
                // let high_level_language = this.getHeroCard(session, definitionHeroCard.DEFINITION.high_level_language.title, definitionHeroCard.DEFINITION.high_level_language.subtitle, definitionHeroCard.DEFINITION.high_level_language.imageUrl, definitionHeroCard.DEFINITION.high_level_language.buttons);
                // let interpreted_programe = this.getHeroCard(session, definitionHeroCard.DEFINITION.interpreted_language.title, definitionHeroCard.DEFINITION.interpreted_language.subtitle,definitionHeroCard.DEFINITION.interpreted_language.imageUrl, definitionHeroCard.DEFINITION.interpreted_language.buttons);
                // let curly_bracket_syntax = this.getHeroCard(session, definitionHeroCard.DEFINITION.curly_bracket_syntax.title, definitionHeroCard.DEFINITION.curly_bracket_syntax.subtitle,definitionHeroCard.DEFINITION.curly_bracket_syntax.imageUrl, definitionHeroCard.DEFINITION.curly_bracket_syntax.buttons);
                // let dynamic_typing = this.getHeroCard(session, definitionHeroCard.DEFINITION.dynamic_typing.title, definitionHeroCard.DEFINITION.dynamic_typing.subtitle,definitionHeroCard.DEFINITION.dynamic_typing.imageUrl, definitionHeroCard.DEFINITION.dynamic_typing.buttons);
                // let object_oriented = this.getHeroCard(session, definitionHeroCard.DEFINITION.object_oriented.title, definitionHeroCard.DEFINITION.object_oriented.subtitle,definitionHeroCard.DEFINITION.object_oriented.imageUrl, definitionHeroCard.DEFINITION.object_oriented.buttons);
                // let first_class_function = this.getHeroCard(session, definitionHeroCard.DEFINITION.first_class_function.title, definitionHeroCard.DEFINITION.first_class_function.subtitle,definitionHeroCard.DEFINITION.first_class_function.imageUrl, definitionHeroCard.DEFINITION.first_class_function.buttons);
                // response_message = new botbuilder.Message(session).attachmentLayout(botbuilder.AttachmentLayout.carousel).attachments([high_level_language,interpreted_programe,curly_bracket_syntax,dynamic_typing,object_oriented,first_class_function]);
                // session.send(response_message);
            }
            break;
            case "help":{
               // var url = new MediaUrl("Test", "https://www.youtube.com/watch?v=0i4v0Texqco");
                 var card =  new botbuilder.VideoCard(session)
                    .title("description of the video")
                    .media([botbuilder.CardMedia.create(session, "https://marczak.io/images/botseries-rich-cards/CreatingBot.mp4")])
                    .image([{}]);
                    //.buttons([botbuilder.CardAction.openUrl(session, "https://tse1.mm.bing.net/th?id=OVP.Vffb32d4de3ecaecb56e16cadca8398bb&w=150&h=84&c=7&rs=1&pid=2.1", 'Full Screen')]);
                    var msg = new botbuilder.Message(session).addAttachment(card);
                    session.send(msg);

                 // response_message = new botbuilder.VideoCard(session)
                 //    .title("Video Card")
                 //    .subtitle("Microsoft Band")
                 //    .text("This is Microsoft Band. For people who want to live healthier and achieve more there is Microsoft Band. Reach your health and fitness goals by tracking your heart rate, exercise, calorie burn, and sleep quality, and be productive with email, text, and calendar alerts on your wrist.")
                    //.image(botbuilder.CardImage.create(session, "https://tse1.mm.bing.net/th?id=OVP.Vffb32d4de3ecaecb56e16cadca8398bb&w=150&h=84&c=7&rs=1&pid=2.1"))
                    // .media([
                    //     botbuilder.CardMedia.create(session, "http://video.ch9.ms/ch9/08e5/6a4338c7-8492-4688-998b-43e164d908e5/thenewmicrosoftband2_mid.mp4")
                    // ])
                 //    .autoloop(true)
                 //    .autostart(false)
                 //    .shareable(true);
                 // session.send(response_message);
               // validation_message = this.getHeroCardResponseText(session, messages.setup.DEVELOPMENT.title, messages.setup.DEVELOPMENT.subtitle, messages.setup.DEVELOPMENT.imageUrl, messages.setup.DEVELOPMENT.buttons);
               // session.send(validation_message);
            }
            break;
            case "close":{
               // validation_message = this.getHeroCardResponseText(session, messages.setup.CLOSE.steps.title, messages.setup.CLOSE.steps.subtitle, messages.setup.CLOSE.steps.imageUrl, messages.setup.CLOSE.steps.buttons);
               // session.send(validation_message);
               // session.endConversationAction();
            }
            break;
            default:
            {
                for (let messageIndex = 0; messageIndex < message.length; messageIndex++) {
                    let msg = message[messageIndex];
                    switch (msg.type) {
                        //message.type 0 means text message
                        case 0:
                        {
                            if (SkypeBot.isDefined(msg.speech)) {
                                session.send(msg.speech);
                            }
                        }
                        break;
                    }
                }
            }
        }
    }

    getHeroCardResponseText(session, title, subtitle, imageUrl, buttons) {
        let heroCard = new botbuilder.HeroCard(session).title(title);
        if (SkypeBot.isDefined(subtitle)) {
            heroCard = heroCard.subtitle(subtitle)
        }
        console.log('JS Bot :: getHeroCardResponseText imageUrl ' + imageUrl);
        if (SkypeBot.isDefined(imageUrl)) {
            heroCard = heroCard.images([botbuilder.CardImage.create(session, imageUrl)]);
        }
        if (SkypeBot.isDefined(buttons)) {
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
                       // button = botbuilder.CardAction.postBack(session, postback, messageButton.text); //Skype Code
                        button = botbuilder.CardAction.imBack(session, postback, messageButton.text);
                       // button = botbuilder.CardAction.messageBack(session).title(messageButton.text).displayText(messageButton.text).value("Value").text(postback);
                    }
                    buttons_.push(button);
                }
            }
            heroCard.buttons(buttons_);
        }
        //msg.attachmentLayout(builder.AttachmentLayout.carousel)
        return new botbuilder.Message(session).attachmentLayout(botbuilder.AttachmentLayout.carousel).attachments([heroCard]);
        //return new botbuilder.Message(session).attachments([heroCard,heroCard,heroCard,heroCard]);
    }

    getHeroCard(session, title, subtitle, imageUrl, buttons) {
        let heroCard = new botbuilder.HeroCard(session).title(title);
        if (SkypeBot.isDefined(subtitle)) {
            heroCard = heroCard.subtitle(subtitle)
        }
        console.log('JS Bot :: getHeroCard imageUrl ' + imageUrl);
        if (SkypeBot.isDefined(imageUrl)) {
            heroCard = heroCard.images([botbuilder.CardImage.create(session, imageUrl)]);
        }
        if (SkypeBot.isDefined(buttons)) {
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
                       // button = botbuilder.CardAction.postBack(session, postback, messageButton.text); //Skype Code
                        button = botbuilder.CardAction.imBack(session, postback, messageButton.text);
                       // button = botbuilder.CardAction.messageBack(session).title(messageButton.text).displayText(messageButton.text).value("Value").text(postback);
                    }
                    buttons_.push(button);
                }
            }
            heroCard.buttons(buttons_);
        }
        return heroCard;
        //msg.attachmentLayout(builder.AttachmentLayout.carousel)
        //return new botbuilder.Message(session).attachmentLayout(botbuilder.AttachmentLayout.carousel).attachments([heroCard,heroCard,heroCard,heroCard]);
        //return new botbuilder.Message(session).attachments([heroCard,heroCard,heroCard,heroCard]);
    }

    sendAdaptiveCard(session, card){
        var newValue = new botbuilder.Message(session).attachments([card]);
        // return new botbuilder.Message(session).addAttachment(card);
        return newValue;
    }

    doRichContentResponse(session, messages) {

        for (let messageIndex = 0; messageIndex < messages.length; messageIndex++) {
            let message = messages[messageIndex];
            switch (message.type) {
                //message.type 0 means text message
                case 0:
                {
                    if (SkypeBot.isDefined(message.speech)) {
                        session.send(message.speech);
                    }
                }
                    break;
                //message.type 1 means card message
                case 1:
                {
                    let heroCard = new botbuilder.HeroCard(session).title(message.title);

                    if (SkypeBot.isDefined(message.subtitle)) {
                        heroCard = heroCard.subtitle(message.subtitle)
                    }

                    if (SkypeBot.isDefined(message.imageUrl)) {
                        heroCard = heroCard.images([botbuilder.CardImage.create(session, message.imageUrl)]);
                    }

                    if (SkypeBot.isDefined(message.buttons)) {
                        let buttons = [];
                        for (let buttonIndex = 0; buttonIndex < message.buttons.length; buttonIndex++) {
                            let messageButton = message.buttons[buttonIndex];
                            if (messageButton.text) {
                                let postback = messageButton.postback;
                                if (!postback) {
                                    postback = messageButton.text;
                                }
                                let button;
                                if (postback.startsWith("http")) {
                                    button = botbuilder.CardAction.openUrl(session, postback, messageButton.text);
                                } else {
                                    button = botbuilder.CardAction.postBack(session, postback, messageButton.text);
                                }
                                buttons.push(button);
                            }
                        }
                        heroCard.buttons(buttons);
                    }

                    let msg = new botbuilder.Message(session).attachments([heroCard]);
                    session.send(msg);
                }
                    break;

                //message.type 2 means quick replies message
                case 2:
                {
                    let replies = [];
                    let heroCard = new botbuilder.HeroCard(session).title(message.title);
                    if (SkypeBot.isDefined(message.replies)) {
                        for (let replyIndex = 0; replyIndex < message.replies.length; replyIndex++) {
                            let messageReply = message.replies[replyIndex];
                            let reply = botbuilder.CardAction.postBack(session, messageReply, messageReply);
                            replies.push(reply);
                        }
                        heroCard.buttons(replies);
                    }
                    let msg = new botbuilder.Message(session).attachments([heroCard]);
                    session.send(msg);
                }
                    break;
                //message.type 3 means image message
                case 3:
                {
                    let heroCard = new botbuilder.HeroCard(session).images([botbuilder.CardImage.create(session, message.imageUrl)]);
                    let msg = new botbuilder.Message(session).attachments([heroCard]);
                    session.send(msg);
                }
                    break;
                default:
                    break;
            }
        }

    }

    static isDefined(obj) {
        if (typeof obj == 'undefined') {
            return false;
        }
        if (!obj) {
            return false;
        }
        return obj != null;
    }
}