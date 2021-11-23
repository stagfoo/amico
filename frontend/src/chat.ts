const $usernameInput: any = $(".usernameInput"); // Input for username
const $messages = $(".messages"); // Messages area
const $inputMessage = $(".inputMessage"); // Input message input box
const $loginPage = $(".login.page"); // The login page
const $chatPage = $(".chat.page"); // The chatroom page

function addMessageElement(el: any, options: { fade?: any; prepend?: any }) {
  let $el = $(el);
  // Setup default options
  if (!options) {
    options = {};
  }
  if (typeof options.fade === "undefined") {
    options.fade = true;
  }
  if (typeof options.prepend === "undefined") {
    options.prepend = false;
  }

  if (options.prepend) {
    $messages.prepend($el);
  } else {
    $messages.append($el);
  }
  $messages[0].scrollTop = $messages[0].scrollHeight;
}

function log(message: string, options: { prepend?: boolean; fade?: boolean }) {
  let $el = $("<li>").addClass("log").text(message);
  addMessageElement($el, options);
}
// Prevents input from having injected markup
function cleanInput(input: any) {
  return $("<div/>").text(input).text();
}
// Gets the 'X is typing' messages of a user
function getTypingMessages(data: { username: any }) {
  return $(".typing.message").filter(function () {
    return $(this).data("username") === data.username;
  });
}
// Adds the visual chat message to the message list
function addChatMessage(
  data: { username: any; message: any; typing?: any },
  options: { fade?: any } | undefined
) {
  // Don't fade the message in if there is an 'X was typing'
  let $typingMessages = getTypingMessages(data);
  options = options || {};
  if ($typingMessages.length !== 0) {
    options.fade = false;
    $typingMessages.remove();
  }

  let $usernameDiv = $('<span class="username"/>')
    .text(data.username)
    .css("color", "#000");
  let $messageBodyDiv = $('<span class="messageBody">').text(data.message);

  let typingClass = data.typing ? "typing" : "";
  let $messageDiv = $('<li class="message"/>')
    .data("username", data.username)
    .addClass(typingClass)
    .append($usernameDiv, $messageBodyDiv);

  addMessageElement($messageDiv, options);
}

// Sends a chat message
function sendMessage(
  connected: any,
  username: any,
  socket: { emit: (arg0: string, arg1: any) => void }
) {
  let message = $inputMessage.val();
  // Prevent markup from being injected into the message
  message = cleanInput(message);
  // if there is a non-empty message and a socket connection
  if (message && connected) {
    $inputMessage.val("");
    addChatMessage(
      {
        username: username,
        message: message,
      },
      {
        fade: false,
      }
    );
    // tell server to execute 'new message' and send along one parameter
    socket.emit("new message", message);
  }
}
// Updates the typing event
function updateTyping(connected: boolean, typing: boolean, socket: any, lastTypingTime: number) {
  if (connected) {
    if (!typing) {
      typing = true;
      socket.emit("typing");
    }
    lastTypingTime = new Date().getTime();

    setTimeout(function () {
      let typingTimer = new Date().getTime();
      let timeDiff = typingTimer - lastTypingTime;
      if (timeDiff >= 500 && typing) {
        socket.emit("stop typing");
        typing = false;
      }
    }, 500);
  }
}
function removeChatTyping(data: any) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }
  // Adds the visual chat typing message
function addChatTyping(data: any) {
    data.typing = true;
    data.message = "is typing";
    if (data.typing) {
    }
    addChatMessage(data, { fade: false });
  }
  function addParticipantsMessage(data: { numUsers?: number }) {
    let message = "";
    if (data.numUsers === 1) {
      message += "there's 1 participant";
    } else {
      message += "there are " + data.numUsers + " participants";
    }
    log(message, {
      prepend: false,
    });
  }

export {
  $usernameInput,
  $messages,
  $inputMessage,
  $loginPage,
  $chatPage,
  log,
  addMessageElement,
  sendMessage,
  addChatMessage,
  getTypingMessages,
  cleanInput,
  updateTyping,
  removeChatTyping,
  addChatTyping,
  addParticipantsMessage
};
