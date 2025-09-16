let socket = io();
let user = { name: '', pic: '' };

$("#login-btn").click(function() {
  let name = $("#profile-input").val().trim();
  if (!name) return;
  user.name = name;
  user.pic = $("#profile-pic").attr("src");
  $("#profile-name").text(name);
  $("#profile-input, #login-btn").hide();
  socket.emit("login", user);
});

socket.on("userlist", function(users) {
  $("#users").empty();
  users.forEach(u => $("#users").append(`<li>${u.name}</li>`));
});

$("#message-form").submit(function(e) {
  e.preventDefault();
  let text = $("#message-input").val();
  if (!text) return;
  let msg = { type:"text", text, user };
  showMessage(msg, 'sent');
  socket.emit('message', msg);
  $("#message-input").val('');
});

socket.on('message', function(msg) {
  showMessage(msg, 'received');
});

function showMessage(msg, side) {
  let bubble = '';
  if (msg.type === "text") bubble = `<div class="bubble">${msg.text}</div>`;
  if (msg.type === "media") bubble = `<div class="bubble media-message"><a href="${msg.file}" target="_blank"><img src="${msg.file}" /></a></div>`;
  $("#chat-messages").append(`<div class="message ${side}">${bubble}</div>`);
  $("#chat-messages").scrollTop($("#chat-messages").scrollHeight);
}

$("#message-input").on("input", function() {
  socket.emit("typing", { user: user.name });
});
socket.on("typing", function(data) {
  $("#typing-indicator").text(`${data.user} is typing...`);
  setTimeout(() => $("#typing-indicator").text(""), 1500);
});

$("#media-btn").click(function() {
  $("#media-upload").click();
});
$("#media-upload").change(function(e){
  let file = e.target.files;
  if (!file) return;
  let formData = new FormData();
  formData.append("file", file);
  $.ajax({
    url: "/upload",
    type: "POST",
    data: formData,
    contentType: false,
    processData: false,
    success: function(res) {
      let msg = { type:"media", file:res.file, user, name:res.name };
      showMessage(msg, 'sent');
      socket.emit('message', msg);
    }
  });
});
