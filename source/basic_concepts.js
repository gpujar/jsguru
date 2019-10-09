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
            case "basic_definition":{
                let definition = JSON.parse(fs.readFileSync('./resources/definition/definition_1.json'));
                let high_level_language = JSON.parse(fs.readFileSync('./resources/definition/high_level_language.json'));
                let interpreted_programe = JSON.parse(fs.readFileSync('./resources/definition/interpreted_language.json'));
                let curly_bracket_syntax = JSON.parse(fs.readFileSync('./resources/definition/curly_bracket_syntax.json'));
                let dynamic_typing = JSON.parse(fs.readFileSync('./resources/definition/dynamic_typing.json'));
                let object_oriented = JSON.parse(fs.readFileSync('./resources/definition/object_orientation.json'));
                let first_class_function = JSON.parse(fs.readFileSync('./resources/definition/first_class_function.json'));
                session.send(new botbuilder.Message(session).attachments([definition, dynamic_typing, first_class_function, interpreted_programe, object_oriented, curly_bracket_syntax, high_level_language]).attachmentLayout(botbuilder.AttachmentLayout.carousel));
            }
            break;
            case "basic_variables":{
                let definition = JSON.parse(fs.readFileSync('./resources/concepts/basics/variable_definition.json'));
                let var_type = JSON.parse(fs.readFileSync('./resources/concepts/basics/variable_var.json'));
                let let_type = JSON.parse(fs.readFileSync('./resources/concepts/basics/variable_let.json'));
                let const_type = JSON.parse(fs.readFileSync('./resources/concepts/basics/variable_const.json'));
                session.send(new botbuilder.Message(session).attachments([definition, var_type, let_type, const_type]).attachmentLayout(botbuilder.AttachmentLayout.carousel));
                //response_message = util.getHeroCardResponseText(session, definitionHeroCard.WELCOME.title, definitionHeroCard.WELCOME.subtitle, definitionHeroCard.WELCOME.imageUrl, definitionHeroCard.WELCOME.buttons);
                //session.send(response_message);
            }
            break;
            case "basic_primitive_types":{
                let definition = JSON.parse(fs.readFileSync('./resources/concepts/basics/data_types_definition.json'));
                let number = JSON.parse(fs.readFileSync('./resources/concepts/basics/data_types_number.json'));
                let string = JSON.parse(fs.readFileSync('./resources/concepts/basics/data_types_string.json'));
                let boolean = JSON.parse(fs.readFileSync('./resources/concepts/basics/data_types_boolean.json'));
                let data_type_null = JSON.parse(fs.readFileSync('./resources/concepts/basics/data_types_null.json'));
                let data_types_undefined = JSON.parse(fs.readFileSync('./resources/concepts/basics/data_types_undefined.json'));
                let object = JSON.parse(fs.readFileSync('./resources/concepts/basics/data_types_object.json'));
                session.send(new botbuilder.Message(session).attachments([definition, number, string, boolean, data_type_null, data_types_undefined, object]).attachmentLayout(botbuilder.AttachmentLayout.carousel));
                //response_message = util.getHeroCardResponseText(session, definitionHeroCard.WELCOME.title, definitionHeroCard.WELCOME.subtitle, definitionHeroCard.WELCOME.imageUrl, definitionHeroCard.WELCOME.buttons);
                //session.send(response_message);
            }
            break;
            case "basic_objects":{
                let definition = JSON.parse(fs.readFileSync('./resources/concepts/basics/object_definition.json'));
                let userdefined_creation = JSON.parse(fs.readFileSync('./resources/concepts/basics/object_userdefined_creation.json'));
                let userdefined_destraction = JSON.parse(fs.readFileSync('./resources/concepts/basics/object_userdefined_destruction.json'));
                let buildin = JSON.parse(fs.readFileSync('./resources/concepts/basics/object_buildin.json'));
                session.send(new botbuilder.Message(session).attachments([definition, userdefined_creation, userdefined_destraction, buildin]).attachmentLayout(botbuilder.AttachmentLayout.carousel));
                //response_message = util.getHeroCardResponseText(session, definitionHeroCard.WELCOME.title, definitionHeroCard.WELCOME.subtitle, definitionHeroCard.WELCOME.imageUrl, definitionHeroCard.WELCOME.buttons);
                //session.send(response_message);
            }
            break;
            case "basic_buildin_objects":{
                let definition = JSON.parse(fs.readFileSync('./resources/concepts/basics/object_definition.json'));
                let userdefined_creation = JSON.parse(fs.readFileSync('./resources/concepts/basics/object_userdefined_creation.json'));
                let userdefined_destraction = JSON.parse(fs.readFileSync('./resources/concepts/basics/object_userdefined_destruction.json'));
                let buildin = JSON.parse(fs.readFileSync('./resources/concepts/basics/object_buildin.json'));
                session.send(new botbuilder.Message(session).attachments([definition, userdefined_creation, userdefined_destraction, buildin]).attachmentLayout(botbuilder.AttachmentLayout.carousel));
                //response_message = util.getHeroCardResponseText(session, definitionHeroCard.WELCOME.title, definitionHeroCard.WELCOME.subtitle, definitionHeroCard.WELCOME.imageUrl, definitionHeroCard.WELCOME.buttons);
                //session.send(response_message);
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