
const FeedParser = require('feedparser')

const PODCAST_FEED_URL = 'https://anchor.fm/s/1e6c3a54/podcast/rss'
const PODCAST_NAME = 'スクールオブコップ'

// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');

var request = require('request');


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type　=== 'LaunchRequest';
        // return true;
    },
    handle(handlerInput) {
        const speakOutput = 'おハこっぷ！ここではスクールオブコップのポッドキャストが聞けます。最新回を聞きたいときは『最新回を流して』。シャッフルで聞きたいときは『シャッフルでながして』。って言ってね！';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


function pickSslMediaUrl (enclosures) {
  const sslMedia = enclosures.find(item => item.url.startsWith('https'))
  if (sslMedia) return sslMedia.url

  const nonSslMedia = enclosures[0]
  // Alexa Skill の AudioPlayer は https: で提供されるURLしか対応していないため強引に書き換える
  if (nonSslMedia) return nonSslMedia.url.replace(/^http:/, 'https:')

  throw new Error('Media not found.')
}

function getLatestEpisode () {
  return new Promise(async (resolve, reject) => {
    const feedparser = new FeedParser()

    request.get(PODCAST_FEED_URL).pipe(feedparser)

    feedparser.on('data', (data) => {
      const audioUrl = pickSslMediaUrl(data.enclosures)
      resolve({
        title: data.title,
        url: audioUrl,
        published_at: data.pubDate.toISOString()
      })
    })
    
    
  })
}

async function playPodcast (handlerInput) {
  const latestEpisode = await getLatestEpisode()
    const speechText = `${PODCAST_NAME} の最新エピソード、 ${latestEpisode.title} 、を再生します`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(PODCAST_NAME, speechText)
      .addAudioPlayerPlayDirective('REPLACE_ALL', latestEpisode.url, latestEpisode.url, 0)
      .getResponse();
}

const playPodcastIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'playPodcastIntent';
    },
    async handle(handlerInput) {
        return await playPodcast(handlerInput)
    },
};


function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}



// function pickRandomSslMediaUrl (enclosures) {
    
//   //const sslMedia = enclosures.find(item => item.url.startsWith('https'))
  
//   const original = enclosures.filter(item => item.url.startsWith('https'))
//   //const sslMedia = original[Math.floor(Math.random() * original.length)]
//   var sslMedia = original[Math.floor(Math.random() * original.length)]
//   if(original.length > 1){
//       sslMedia = original[Math.floor(Math.random() * original.length)]
//   } 
//   else {
//       sslMedia = original[0]
//   }
//   sslMedia = original[Math.floor(Math.random() * original.length)]
    
  
//   if (sslMedia) return sslMedia.url

// //   const nonSslMedia = enclosures[0]
// //   // Alexa Skill の AudioPlayer は https: で提供されるURLしか対応していないため強引に書き換える
// //   if (nonSslMedia) return nonSslMedia.url.replace(/^http:/, 'https:')

//   throw new Error('Media not found.')
// }

function getRandomEpisode () {
  return new Promise(async (resolve, reject) => {
      
    var req = request(PODCAST_FEED_URL);  
    var feedparser = new FeedParser({});

    var item;
    var items = [];

    req.on('response', function (res) {  
        this.pipe(feedparser);
    });

    feedparser.on('meta', function(meta) {  
        console.log('==== %s ====', meta.title);
    });

    feedparser.on('readable', function() {  
        while(item = this.read()) {
            // console.log(item);
            items.push(item);
        }
    });

    feedparser.on('end', function() {  
        // show titles
        items.forEach(function(item) {
            // console.log('- [' + item.title + ']' + '(' + item.link + ')');
        });
        var randomNum = Math.floor(Math.random() * items.length-1);
        
        resolve({
            title: items[randomNum].title,
            url: pickSslMediaUrl(items[randomNum].enclosures), //items[randomNum].enclosures.url,
            published_at: items[randomNum].pubDate.toISOString()
        })
    });
    
    
  })
}

async function playRandom (handlerInput) {
  const randomEpisode = await getRandomEpisode()
    const speechText = `${PODCAST_NAME} のシャッフルエピソード、 ${randomEpisode.title} 、を再生します`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(PODCAST_NAME, speechText)
      .addAudioPlayerPlayDirective('REPLACE_ALL', randomEpisode.url, randomEpisode.url, 0)
      .getResponse();
}

const playRandomIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'playRandomIntent';
    },
    async handle(handlerInput) {
        return await playRandom(handlerInput)

        // return handlerInput.responseBuilder
        //     .speak('プレイランダム')
        //     .getResponse()
    },
};








const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'ここではスクールオブコップのポッドキャストが聞けます。最新回を聞きたいときは『最新回を流して』。シャッフルで聞きたいときは『シャッフルでながして』。って言ってね！';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'こっぱーーーーい！';
        return handlerInput.responseBuilder
            .addAudioPlayerStopDirective()
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder
            .addAudioPlayerStopDirective()
            .speak('こっぱーーーーい！')
            .getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = 'おハこっぷ！ここではスクールオブコップのポッドキャストが聞けます。最新回を聞きたいときは『最新回を流して』。シャッフルで聞きたいときは『シャッフルでながして』。って言ってね！';//`You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `すみません。ちょっと何言ってるかわかんないです。もう一度お願いします。`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


const PauseIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return (request.type === 'IntentRequest' && request.intent.name === 'AMAZON.PauseIntent');
    },
    async handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak("ポッドキャストを停止します。")
            .addAudioPlayerStopDirective()
            .getResponse();
    }
};
const ResumeIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return (request.type === 'IntentRequest' && request.intent.name === 'AMAZON.ResumeIntent');
    },
    async handle(handlerInput) {
        const url = PODCAST_FEED_URL;
        const AudioPlayer = handlerInput.requestEnvelope.context.AudioPlayer;
        const token = AudioPlayer.token;
        const offset = AudioPlayer.offsetInMilliseconds;
        // return handlerInput.responseBuilder
        //     .speak("リジュームインテントハンドラーです。ポッドキャストを再開します。")
        //     .addAudioPlayerPlayDirective('REPLACE_ALL', url, token, offset, null)
        //     .getResponse();
        return await playPodcast(handlerInput)
  }
};



// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        PauseIntentHandler,
        ResumeIntentHandler,
        CancelAndStopIntentHandler,
        HelpIntentHandler,
        SessionEndedRequestHandler,
        playRandomIntentHandler,
        playPodcastIntentHandler,
        secretEpisodeIntentHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
