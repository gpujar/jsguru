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
const express = require('express');
const bodyParser = require('body-parser');

const DirectChannelBot = require('./direct_channel');
const WebBotConfig = require('./webbotconfig');

const REST_PORT = (process.env.PORT || 5000);

// const botConfig = new WebBotConfig(
//     process.env.APIAI_ACCESS_TOKEN,
//     process.env.APIAI_LANG,
//     process.env.APP_ID,
//     process.env.APP_SECRET
// );

const botConfig = new WebBotConfig(
    // Dialogflow access token, used to communicate with dialogflow.
    "a2c925efb5f44da28d127b494794c133",
    // Dialogflow language type.
    "en",
    // Microsoft Azure Web bot application id.
    "7042563e-db5b-4fad-b543-4a7f0dd95c0e",
    // Microsoft Azure secrete id of web bot.
    "iO:4mNCi8d-Cl6RIv0bipXypCrkie=@9"
);

const directChannelBot = new DirectChannelBot(botConfig);

// console timestamps
require('console-stamp')(console, 'yyyy.mm.dd HH:MM:ss.l');

const app = express();
app.use(bodyParser.json());
// Request from Azure to process request which is received from bot.
app.post('/chat', directChannelBot.botService.listen());

// Added for testing server using API/postman
app.get('/chat', function(){
     console.log('JS Guru Bot Test API ..... ');
});

// Server up notification.
app.listen(REST_PORT, function () {
    console.log('JS Guru Bot Rest service ready on port ' + REST_PORT);
    return;
});