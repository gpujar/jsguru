/**
 * Created by gpujar on 7/21/2019.
 */

const botbuilder = require('botbuilder');
// const fs = require('fs');

module.exports = class Utils {

    getHeroCardResponseText(session, title, subtitle, imageUrl, buttons) {
        let heroCard = new botbuilder.HeroCard(session).title(title);
        if (Utils.isDefined(subtitle)) {
            heroCard = heroCard.subtitle(subtitle)
        }
        console.log('JS Bot :: getHeroCardResponseText imageUrl ' + imageUrl);
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
        if (Utils.isDefined(subtitle)) {
            heroCard = heroCard.subtitle(subtitle)
        }
        console.log('JS Bot :: getHeroCard imageUrl ' + imageUrl);
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

    sendAdaptiveCard(session, card) {
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
                    if (Utils.isDefined(message.speech)) {
                        session.send(message.speech);
                    }
                }
                    break;
                //message.type 1 means card message
                case 1:
                {
                    let heroCard = new botbuilder.HeroCard(session).title(message.title);
                    if (Utils.isDefined(message.subtitle)) {
                        heroCard = heroCard.subtitle(message.subtitle)
                    }
                    if (Utils.isDefined(message.imageUrl)) {
                        heroCard = heroCard.images([botbuilder.CardImage.create(session, message.imageUrl)]);
                    }
                    if (Utils.isDefined(message.buttons)) {
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
                    if (Utils.isDefined(message.replies)) {
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