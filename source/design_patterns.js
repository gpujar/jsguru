/**
 * Created by gpujar on 7/21/2019.
 */
/**
 * Created by gpujar on 7/21/2019.
 */

const botbuilder = require('botbuilder');
const Utils = require('./../utils');
const util = new Utils();
const apiai = require('apiai');
const fs = require('fs');
var definitionHeroCard1 = fs.readFileSync('./resources/definition/definition_hero_card.json');
var definitionHeroCard = JSON.parse(definitionHeroCard1);

module.exports = class BasicConcepts{

    sendMessage(session, message, intentAction, intentParameters){
        let response_message;
        switch (intentAction) {
            case "basic_welcome":{
                response_message = util.getHeroCardResponseText(session, definitionHeroCard.WELCOME.title, definitionHeroCard.WELCOME.subtitle, definitionHeroCard.WELCOME.imageUrl, definitionHeroCard.WELCOME.buttons);
                session.send(response_message);
            }
            break;
            case "basic_definition":{
                let definition = JSON.parse(fs.readFileSync('./resources/definition/definition_1.json'));
                let high_level_language = JSON.parse(fs.readFileSync('./resources/definition/high_level_language.json'));
                let interpreted_programe = JSON.parse(fs.readFileSync('./resources/definition/interpreted_language.json'));
                let curly_bracket_syntax = JSON.parse(fs.readFileSync('./resources/definition/curly_bracket_syntax.json'));
                let dynamic_typing = JSON.parse(fs.readFileSync('./resources/definition/dynamic_typing.json'));
                let object_oriented = JSON.parse(fs.readFileSync('./resources/definition/object_orientation.json'));
                let first_class_function = JSON.parse(fs.readFileSync('./resources/definition/first_class_function.json'));
                session.send(new botbuilder.Message(session).attachments([definition, dynamic_typing, first_class_function, interpreted_programe, object_oriented, curly_bracket_syntax, high_level_language]).attachmentLayout(botbuilder.AttachmentLayout.carousel));
                // let high_level_language = util.getHeroCard(session, definitionHeroCard.DEFINITION.high_level_language.title, definitionHeroCard.DEFINITION.high_level_language.subtitle, definitionHeroCard.DEFINITION.high_level_language.imageUrl, definitionHeroCard.DEFINITION.high_level_language.buttons);
                // let interpreted_programe = util.getHeroCard(session, definitionHeroCard.DEFINITION.interpreted_language.title, definitionHeroCard.DEFINITION.interpreted_language.subtitle,definitionHeroCard.DEFINITION.interpreted_language.imageUrl, definitionHeroCard.DEFINITION.interpreted_language.buttons);
                // let curly_bracket_syntax = util.getHeroCard(session, definitionHeroCard.DEFINITION.curly_bracket_syntax.title, definitionHeroCard.DEFINITION.curly_bracket_syntax.subtitle,definitionHeroCard.DEFINITION.curly_bracket_syntax.imageUrl, definitionHeroCard.DEFINITION.curly_bracket_syntax.buttons);
                // let dynamic_typing = util.getHeroCard(session, definitionHeroCard.DEFINITION.dynamic_typing.title, definitionHeroCard.DEFINITION.dynamic_typing.subtitle,definitionHeroCard.DEFINITION.dynamic_typing.imageUrl, definitionHeroCard.DEFINITION.dynamic_typing.buttons);
                // let object_oriented = util.getHeroCard(session, definitionHeroCard.DEFINITION.object_oriented.title, definitionHeroCard.DEFINITION.object_oriented.subtitle,definitionHeroCard.DEFINITION.object_oriented.imageUrl, definitionHeroCard.DEFINITION.object_oriented.buttons);
                // let first_class_function = util.getHeroCard(session, definitionHeroCard.DEFINITION.first_class_function.title, definitionHeroCard.DEFINITION.first_class_function.subtitle,definitionHeroCard.DEFINITION.first_class_function.imageUrl, definitionHeroCard.DEFINITION.first_class_function.buttons);
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
               // validation_message = util.getHeroCardResponseText(session, messages.setup.DEVELOPMENT.title, messages.setup.DEVELOPMENT.subtitle, messages.setup.DEVELOPMENT.imageUrl, messages.setup.DEVELOPMENT.buttons);
               // session.send(validation_message);
            }
            break;
            case "close":{
               // validation_message = util.getHeroCardResponseText(session, messages.setup.CLOSE.steps.title, messages.setup.CLOSE.steps.subtitle, messages.setup.CLOSE.steps.imageUrl, messages.setup.CLOSE.steps.buttons);
               // session.send(validation_message);
               // session.endConversationAction();
            }
            break;
            case "feedback":{
               // validation_message = util.getHeroCardResponseText(session, messages.setup.CLOSE.steps.title, messages.setup.CLOSE.steps.subtitle, messages.setup.CLOSE.steps.imageUrl, messages.setup.CLOSE.steps.buttons);
               // session.send(validation_message);
               // session.endConversationAction();
            }
            break;
            case "input-unknown":{
               // validation_message = util.getHeroCardResponseText(session, messages.setup.CLOSE.steps.title, messages.setup.CLOSE.steps.subtitle, messages.setup.CLOSE.steps.imageUrl, messages.setup.CLOSE.steps.buttons);
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
}