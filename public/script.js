const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myPeer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443", //?443 use this for deployemnt
});
const peers = {}; //empt object
const myVideo = document.createElement("video");
myVideo.muted = true;
let myVideoStream;
sendmessage = (text) => {
  if (event.key === "Enter" && text.value != "") {
    // When enter is pressed and the type message box is not empty
    socket.emit("messagesend", myname + " : " + text.value); // Emit a send message event and pass chat message with userName
    text.value = ""; // Empty chat message box
    main__chat_window.scrollTop = main__chat_window.scrollHeight; // Scroll down
  }
};
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    myPeer.on("call", function (call) {
      // Answer the call, providing our mediaStream
      call.answer(stream);
      const video = document.createElement("video");

      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });
    socket.on("user-connected", (userId) => {
      // user is joining`
      setTimeout(() => {
        // user joined
        connectToNewUser(userId, stream);
      }, 1000);
    });

    let text = $("input");
    //? when pressed send message
    $("html").keydown(function (e) {
      if (e.which == 13 && text.val().length !== 0) {
        socket.emit("message", text.val());
        text.val("");
      }
    });
    socket.on("createMessage", (message) => {
      $("ul").append(`<li class="message"> <b>user </b><br/> ${message}</li>`);
      // scrollToBottom()
    });
  }); //? it prompt the user to use the viedo and audio.  it retuns proomis
myPeer.on("open", function (id) {
  console.log("My peer ID is: " + id);
  socket.emit("join-room", ROOM_ID, id); //* // Emit the 'join-room' event
});
socket.on("A user disconnected", (userId) => {
  if (peers[userId]) {
    peers[userId].close();
  }
});

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
} //? loadedmetadata  is occurs when a metadatfor a spcefied viedo and audio loaded

function connectToNewUser(userId, stream) {
  console.log("User connected:", userId);
  const call = myPeer.call(userId, stream);

  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });
  videoGrid.append(video);

  peers[userId] = call;
}

const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  console.log(myVideoStream.getVideoTracks());
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};
const setStopVideo = () => {
  const html = `<i class="fas fa-video"></i>
    <span>Stop Video</span>`;
  document.querySelector(".main_video_button").innerHTML = html;
};
const setPlayVideo = () => {
  const html = `<i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>`;
  document.querySelector(".main_video_button").innerHTML = html;
};

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};
const setMuteButton = () => {
  const html = ` <i class="fas fa-microphone"></i> 
    <span>Mute</span>`;
  document.querySelector(".main_mute_button").innerHTML = html;
};
const setUnmuteButton = () => {
  const html = ` <i class="unmute fas fa-microphone-slash"></i>  <span>Unmute</span>`;
  document.querySelector(".main_mute_button").innerHTML = html;
};
