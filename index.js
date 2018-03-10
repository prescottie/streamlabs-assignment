let chatData = [];

// After the API loads, call a function to enable the search box.
function handleAPILoaded() {
  getVideos();
}

// Search for a specified string.
function getVideos() {

  fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&eventType=live&maxResults=25&order=relevance&type=video&key=AIzaSyCgi2Ml11DAKwyLeG4Etg3KwVCWSt6Gqtg', {
    headers: {
      "Accept": "application/json"
    },
    method: 'GET'
  }).then(response => response.json())
  .then(videos => {
    videos.items.forEach(v => {
      buildVideo(v);
    });
  });
  // var request = gapi.client.youtube.search.list({
  //   q: '',
  //   eventType: 'live',
  //   maxResults: '25',
  //   type: 'video',
  //   part: 'snippet'
  // });

  // request.execute(response => {
  //   const videos = response.result.items;
  //   videos.forEach(v => {
  //     buildVideo(v);
  //   })
  // });
}

function getLiveChat(videoId) {
  fetch(`https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}&key=AIzaSyCgi2Ml11DAKwyLeG4Etg3KwVCWSt6Gqtg`, {
    headers: {
      "Accept": "application/json"
    },
    method: 'GET'
  }).then(response => response.json())
  .then(video => {
    const v = video.items[0];
    const chatId = v.liveStreamingDetails.activeLiveChatId;
    
    fetch(`https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${chatId}&part=snippet&fields=items(snippet(authorChannelId%2CdisplayMessage%2CpollEditedDetails%2CpollOpenedDetails%2CpollVotedDetails%2CpublishedAt%2CsuperChatDetails%2CtextMessageDetails%2Ctype%2CuserBannedDetails))&key=AIzaSyCgi2Ml11DAKwyLeG4Etg3KwVCWSt6Gqtg`, {
      headers: {
        "Accept": "application/json"
      },
      method: 'GET'
    }).then(response => response.json())
    .then(chat => {
      chat.items.forEach(item => {
        chatData.push(item.snippet);
      })
      chat.items.forEach((item,i) => {
        fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${item.snippet.authorChannelId}&fields=items(id%2Csnippet%2Ftitle)&key=AIzaSyCgi2Ml11DAKwyLeG4Etg3KwVCWSt6Gqtg`, {
          headers: {
            "Accept": "application/json"
          },
          method: 'GET'
        }).then(response => response.json())
        .then(channel => {
          chatData[i].channelName = channel.items[0].snippet.title;
        })
      })
      console.log(chatData[0]);
      
    })
  })

  // const requestId = gapi.client.youtube.videos.list({
  //   id: videoId,
  //   part: "liveStreamingDetails"
  // });

  // requestId.execute(response => {
  //   const video = response.items[0];
  //   const requestChat = gapi.client.youtube.liveChatMessages.list({
  //     liveChatId: video.liveStreamingDetails.activeLiveChatId,
  //     part: "snippet"
  //   });
  //   requestChat.execute(response => {
  //     console.log(response.items);
      
  //     // buildChat(response.items);
  //   })
  // })
}

function handleClick(videoId) {
  $('#all-videos').hide();
  $('#live-video').show();

  let frameContainer = $('<div>').addClass('embed-video');
  let frame = $('<iframe>').attr('src', `https://www.youtube.com/embed/${videoId}?autoplay=1`);
    frame.attr('allowfullscreen');
    frame.attr('frameborder', '0');
    frame.width(560);
    frame.height(315);
  frameContainer.append(frame);

  let chatContainer = $('<div>').addClass('embed-chat');
  let chat = $('<iframe>').attr('src', `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=streamingvideoapp.s3-website-us-west-2.amazonaws.com`);
    chat.width(480);
    chat.height(315);
    chat.attr('frameborder', '0');
  chatContainer.append(chat)
  
  getLiveChat(videoId);

  const back = $('<button>').addClass('back-btn')
    .text('Back');
    back.on('click', () => {
      $('#live-video').empty();
      $('#live-video').hide();
      $('#all-videos').show();
    });

  const chatSearch = $('<div>').attr('id', 'chat-search')
  const searchInput = $('<input>').addClass('search-input')
  searchInput.attr('placeholder', 'Enter Username');

  searchInput.on('keypress', (e) => {
    if(e.key === 'Enter') { 
      let searchResults = chatData.filter(message => message.channelName === e.target.value);
      buildSearchResult(searchResults);
    }
   })
   chatSearch.append(searchInput);

  $('#live-video').append(frameContainer)
    .append(chatContainer)
    .append(chatSearch)
    .append(back);
  
}

function buildSearchResult(searchResults) {
  const searchResult = $('<div>').addClass('search-results');
  const header = $('<h4>').addClass('search-result-header');
  header.text(`${searchResults[0].channelName} has contributed ${searchResults.length} messages.`);
  searchResult.append(header);

  searchResults.forEach(result => {
    const msg = $('<div>').addClass('search-msg');
    const timestamp = $('<time>').addClass('search-msg-timestamp');
    const date = new Date(result.publishedAt);
    let hour = date.getHours();
    let min = date.getMinutes();
    if (min < 10) {min = "0" + min};
    timestamp.text(hour + ':' + min);
    const msgContent = $('<span>').addClass('search-msg-content');
    msgContent.text(result.displayMessage);

    msg.append(timestamp)
      .append(msgContent);

    searchResult.append(msg);
  })
  $('#chat-search').append(searchResult);
}


function buildVideo(v) {
  console.log('building videos');
  
  const video = $('<div>').addClass('video');
  video.attr('id', v.id.videoId);
  const thumbnail = $('<img>').addClass('video-thumb').attr('src', v.snippet.thumbnails.medium.url);
  const title = $('<span>').addClass('video-title').text(v.snippet.title);
  video.on('click', () => {
    const target = $(event.target).parent()[0];
    const videoId = $(target).attr('id');
    console.log(videoId);
    
    handleClick(videoId);
  })
  video.append(thumbnail).append(title);
  $('#all-videos').append(video);
}