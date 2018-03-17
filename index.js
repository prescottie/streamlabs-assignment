let chatData = [];

$().ready(() => {
  $('#buttons').hide();
});

// After the API loads, call a function to enable the search box.
function handleAPILoaded() {
  $('#search-button').attr('disabled', false);
  $('#buttons').show();
}

// Search for a specified string.
function getVideos() {
  var q = $('#query').val();
  var request = gapi.client.youtube.search.list({
    q: q, 
    eventType: 'live',
    maxResults: '25',
    type: 'video',
    part: 'snippet'
  });

  request.execute(response => {
    const videos = response.result.items;
    videos.forEach(v => {
      buildVideo(v);
    })
  });

}

//get the chat for a specific video
function getLiveChat(videoId) {

  const requestId = gapi.client.youtube.videos.list({
    id: videoId,
    part: "liveStreamingDetails"
  });

  requestId.execute(response => {
    const video = response.items[0];
    const requestChat = gapi.client.youtube.liveChatMessages.list({
      liveChatId: video.liveStreamingDetails.activeLiveChatId,
      part: "snippet"
    });
    requestChat.execute(response => {
      response.items.forEach((item, i) => {
        chatData.push(item.snippet)
      });
      response.items.forEach((item, i) => {
        const requestChannelName = gapi.client.youtube.channels.list({
          id: item.snippet.authorChannelId,
          part: "snippet"
        });
        requestChannelName.execute(response => {
          chatData[i].channelName = response.items[0].snippet.title;
        });
      });
      console.log(chatData[1]);
    });
  });
}

function buildChat(chat) {
  let chatContainer = $('<div>').addClass('embed-chat');
  let chatHeader = $('<div>').addClass('chat-header');
  let headerTitle = $('<h2>').addClass('chat-title').text('Live Chat');
  let msgContainer = $('<div>').addClass('chat-messages');

  chatContainer.append(chatHeader);
  chatContainer.append(msgContainer);
  chatHeader.append(headerTitle);

  
  
  chat.forEach(msg => {
    console.log(msg.channelName);
    

    let message = $('<div>').addClass('chat-msg');
    let channel = $('<span>').addClass('chat-channel-name');
    channel.text(msg.channelName);
    let timestamp = $('<time>').addClass('chat-msg-timestamp');
    let date = new Date(msg.publishedAt);
    let hour = date.getHours();
    let min = date.getMinutes();
    if (min < 10) {min = "0" + min};
    timestamp.text(hour + ':' + min);
    let msgContent = $('<span>').addClass('chat-msg-content');
    msgContent.text(msg.displayMessage);

    message.append(channel)
      .append(msgContent)
      .append(timestamp);

    msgContainer.prepend(message);
  });

  $('#live-video').append(chatContainer);
}

function handleClick(video) {
  $('#all-videos').hide();
  $('#buttons').hide();
  $('#live-video').show();

  let frameContainer = $('<div>').addClass('embed-video');
  let frame = $('<iframe>').attr('src', `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`);
    frame.attr('allowfullscreen');
    frame.attr('frameborder', '0');
    frame.width(825);
    frame.height(475);

  let vidTitle = $('<h2>').addClass('embed-video-title').text(video.snippet.title);

  frameContainer.append(frame);
  frameContainer.append(vidTitle);
  
  getLiveChat(video.id.videoId);

  const back = $('<button>').addClass('back-btn')
    .text('Back');
    back.on('click', () => {
      $('#live-video').empty();
      $('#buttons').show();
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
    // .append(chatContainer)
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
  const video = $('<div>').addClass('video');
  const thumbnail = $('<img>').addClass('video-thumb').attr('src', v.snippet.thumbnails.medium.url);
  const title = $('<span>').addClass('video-title').text(v.snippet.title);
  video.on('click', () => {
    
    handleClick(v);
  })
  video.append(thumbnail).append(title);
  $('#all-videos').append(video);
}