const { ActivityHandler, UserState, MemoryStorage, ConversationState, MessageFactory } = require('botbuilder');
const fetch = require('node-fetch');

// importing other modules
const { MSWidgets } = require('./ms_widgets');
const { WFDialog } = require('./waterfall_dialog');
const { QnABot } = require('./qna');

const logger = console;
const mswidgets = new MSWidgets();
const dialog = new WFDialog();
// const qna = new QnABot(logger)

// to have temp memory
//will be cleared on restart
const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);
const dialogState = conversationState.createProperty('dialogState');

var WIDGETS = ['cardprompt', 'hero', 'adaptive', 'animation', 'audio', 'receipt', 'signin', 'thumbnail', 'video', 'sugg', 'suggcarousel', 'carousel',
'siq date time', 'siq time', 'siq loc', 'siq range cal', 'siq cal', 'siq range slider', 'siq slider', 'siq multiselect', 'siq singleselect', 'siq like', 'siq star', 'siq happy',
'siq article', 'siq image', 'siq link',
'siq sugg', 'siq fwd', 'siq end', 'siq opbusy', 'siq opforward','custom kasi'
];

class AnswerBot extends ActivityHandler {
    constructor() {
        super();
        this.onMessage(async (context, next) => {
            
            if(context.activity.text == "crmkey" )
            {
               this.callingExternalservice(context);
                return;
            }
            
            var res = MessageFactory.text('Response' + ' : '+`vs code | v: 0.1 | context :`+JSON.stringify(context.activity) );
            //await context.sendActivity(res);
            if (context.activity.type === 'message' && context.activity.text) {
                let text = context.activity.text.toLocaleLowerCase();
                switch(text)
                {
                    case 'hello':
                    case 'hi':
                    case 'echo':
                        await context.sendActivity({ text : `You said : aathi new master branch "${ context.activity.text }"`, channelData:{ zohosalesiq:{ replies :[ ` |:| channelData : ` + JSON.stringify(context.activity.channelData)], suggestions:['hello', 'hi', 'widgets', 'waterfall',
                            'hero', 'adaptive', 'animation', 'audio', 'receipt', 'signin', 'thumbnail', 'video', 'sugg', 'suggcarousel', 'carousel',
                            'siq date time', 'siq time', 'siq loc', 'siq range cal', 'siq cal', 'siq range slider', 'siq slider', 'siq multiselect', 'siq singleselect', 'siq like', 'siq star', 'siq happy',
                            'siq article', 'siq image', 'siq link',
                            'siq sugg', 'siq fwd', 'siq end', 'siq opbusy', 'siq opforward','custom kasi'
                            ]}} 
                        });
                        break;
                    case 'widgets':
                        mswidgets.sendWidget('widgets', context);
                        break;
                    case 'waterfall':
                        await dialog.run(context, dialogState);
                        break;
                    default:
                        // await context.sendActivity(`type *intro * waterfall`);
                        if(WIDGETS.indexOf(text) > -1)
                        {
                            mswidgets.sendWidget(text, context);
                        }
                        else
                        {
                            //calling exteran services
                             this.callingExternalservice(context);
//                             var isanssend = false;//qna.getAnsfromQnA(context);
//                             if(!isanssend)
//                             {
//                                 await dialog.run(context, dialogState);
//                             }
                             await context.sendActivity({text:"Sorry try again"});
                        }
                }
            }
            else if(context.activity.attachments)
            {
                await context.sendActivity(` Name : '${ context.activity.attachments[0].name }'`);
                await context.sendActivity(`contentType : '${ context.activity.attachments[0].contentType }'`);
                await context.sendActivity(`contentUrl : '${ context.activity.attachments[0].contentUrl }'`);
            }
            else
            {
                await context.sendActivity(`unable to process :(`);
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
        
        this.onDialog(async (context, next) => {
            // Save any state changes. The load happened during the execution of the Dialog.
            await conversationState.saveChanges(context, false);
            await userState.saveChanges(context, false);
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity('Hello and welcome!');
                    // await next();
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
callingExternalservice(context)
    {
        //var url = 'https://webhook.site/33927a41-f13d-4d56-9aac-629a24f2e1e2';
        var url = 'https://www.zohoapis.com/crm/v2/Leads';
        var text = context.activity.text;
        //var _body = JSON.stringify([{ 'Text': text }])
        var _body = {
            "data": [
                {
                    "Company": "Zylker",
                    "Last_Name": "Daly",
                    "First_Name": "Paul",
                    "Email": "p.daly@zylker.com",
                    "State": "Texas"
                }
            ]
        }

        return fetch(url, {
                method: 'POST',
                body: JSON.stringify(_body),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Zoho-oauthtoken 1000.2fa8721fe60e25851983c0d7f1143743.8a3164b3754b121959152c18b6817a16'
                }
            })
            .then(res => res.json())
            .then(responseBody => {
                logger.log('[callingExternalservice]: |  responseBody :'+JSON.stringify(responseBody));

                context.sendActivity({
                    text : `You said : aathi new master branch "${ context.activity.text }"`
                });

                return;
        });
    }
}

module.exports.AnswerBot = AnswerBot;
