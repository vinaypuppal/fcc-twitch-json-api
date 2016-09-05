$(document).ready(function(){
var streamers = [
    'freecodecamp', 'storbeck', 'terakilobyte', 'beohoff', 'RobotCaleb',
    'thomasballinger', 'noobs2ninjas', 'habathcx', 'riotgames', 'starladder1',
    'beyondthesummit', 'tsm_theoddone', 'Tsm_dyrus', 'esl_csgo', 'garenatw',
    'HiRezTV', 'smitegame', 'Nightblue3', 'nl_kripp', 'imaqtpie', 'esl_lol',
    'asiagodtonegg3be0', 'destructoid', 'sodapoppin', 'OGNGlobal', 'ongamenet',
    'joindotared', 'faceittv', 'taketv', 'versuta', 'Voyboy',
    'wingsofdeath', 'towelliee', 'TrumpSC', 'leveluplive', 'twitch', 'itshafu',
    'dotastarladder_en', 'riotgamesturkish', 'twitchplayspokemon',
    'aces_tv', 'gamespot', 'sc2proleague', 'SirhcEz', 'totalbiscuit', 'mlgsc2',
    'scarra', 'RocketBeansTV', 'lethalfrag', 'dendi', 'wcs_america', 'mlglol',
    'defrancogames', 'shadbasemurdertv', 'yogscast', 'Imt_wildturtle', 'magic',
    'streamerhouse', 'dhingameclient', 'wcs_europe', 'sing_sing', 'roomonfire',
    'onemoregametv', 'dreamleague', 'syndicate', 'saintvicious', 'brunofin','comster404'
];
  var streamUrl = 'https://api.twitch.tv/kraken/streams/';

  var streamRequests = streamers.map(function(item){
    return axios.get(streamUrl+item, {
  validateStatus: function (status) {
    return status < 500; // Reject only if the status code is greater than or equal to 500
  }
    });
  });

  var userUrl = 'https://api.twitch.tv/kraken/users/';

  var userRequests = streamers.map(function(item){
    return axios.get(userUrl+item,{
  validateStatus: function (status) {
    return status < 500; // Reject only if the status code is greater than or equal to 500
  }
    });
  });
  axios.all(streamRequests)
  .then(function(response){
 $('.loading').find('.info').text('Almost Ready!')
    return response;
  }).then(function(streamResponse){
    axios.all(userRequests)
    .then(function(userResponse){
        $('.loading').hide();
 seperateData(streamResponse,userResponse);
    });
  }).catch(function (response) {
    if (response instanceof Error) {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', response.message);
    } else {
      // The request was made, but the server responded with a status code
      // that falls out of the range of 2xx
      console.log(response.data);
      console.log(response.status);
      console.log(response.headers);
      console.log(response.config);
    }
  });

  function seperateData(streamResults,userResults){
    var unknownStreamResults = streamResults.filter(function(item){
      return item.status === 422;
    }).map(function(item){return item.data;});
    var unknownUsers = [userResults.pop().data,userResults.pop().data];

    //console.log(unknownStreamResults,unknownUsers);

    var knownStreamResults = streamResults.filter(function(item){
      return item.status === 200;
    });

    var all = knownStreamResults.map(function(item){
      return item.data;
    });

    var users = userResults.map(function(item){
      return item.data;
    });

    var unknownStreamWithUsers = [];
    for(var i=0;i<unknownStreamResults.length;i++){
      var temp = unknownStreamResults[i];
      temp.user = unknownUsers[i];
      unknownStreamWithUsers.push(temp);
    }

    var streamWithUsers = [];
    for(var i=0;i<all.length;i++){
      var temp = all[i];
      temp.user = users[i];
      streamWithUsers.push(temp);
    }
    var online = streamWithUsers.filter(function(item){
      return item.stream;
    });
    var offline = streamWithUsers.filter(function(item){
      return !item.stream;
    });
    streamWithUsers = streamWithUsers.sort(function(a,b){
      return a.user.display_name < b.user.display_name;
    })
    $("#online").text('Online ('+online.length+')');
    $("#offline").text('Offline ('+offline.length+')');
    $("#all").text('All ('+streamWithUsers.length+')');
    $('#unknown').text('Unkown ('+unknownStreamWithUsers.length+')');
    renderToDom(online);
    $('input[type=radio]').on('change',function(e){
     switch(e.target.value){
       case 'online':
         clearDom();
         renderToDom(online);
         break;
       case 'offline':
         clearDom();
         renderToDom(offline);
         break;
       case 'all':
         clearDom();
         renderToDom(streamWithUsers);
         break;
       case 'unknown':
         clearDom();
         renderToDom(unknownStreamWithUsers);
         break;
     }
    });
  }
  function generateCard(data){
    var logo = data.user.logo ? data.user.logo : "https://placeholdit.imgix.net/~text?txtsize=14&txt=Logo&w=50&h=50";
    if(data.status === 422){
     var state = "Account Closed";
    }else{
      var state = data.stream ? 'online' : 'offline';
    }
    var bioUrl = data.user.bio ? "https://placeholdit.imgix.net/~text?txtsize=15&txt="+data.user.bio+"&w=300&h=200" : "https://placeholdit.imgix.net/~text?txtsize=160&txt=?&w=300&h=200"
    var previewUrl = data.stream ? data.stream.preview.medium : bioUrl;
    var lang = data.stream ? data.stream.channel.broadcaster_language : '--';
    var viewers = data.stream ? data.stream.viewers : '--';
    var playing = data.stream ? data.stream.game : '--';
    var twitchUrl = "https://www.twitch.tv/"+data.user.name
    return '<li class="animated zoomIn"><a href="'+twitchUrl+'" class="card"  target="_blank" ><div class="card-header"><div class="left"><img src="'+logo+'" alt="logo" /></div><div class="right"><div class="top">'+data.user.display_name+'</div><div class="bottom '+state+'"><i class="fa fa-circle"></i> '+state[0].toUpperCase()+state.slice(1)+'</div></div></div><div class="card-body"><img src="'+previewUrl+'" alt="preview" /></div><div class="card-footer"><div class="top"><div class="left"><span>Lang</span>: '+lang+'</div><div class="right"><span>Viewers</span>: '+viewers+'</div></div><div class="bottom"><span>Playing</span>: '+playing+'</div></div></a></li>';
  }
  function renderToDom(data){
    data.forEach(function(item){
      var card = generateCard(item);
      //render card to dom
      //console.log(card);
      $('.js-list').append(card);
    });
  }
  function clearDom(){
    $('.js-list').empty();
  }
});
