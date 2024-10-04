const socket = io("https://web-rtc-d379249ca0bd.herokuapp.com/");
const buttonCall = document.getElementById("btnCall");
const textRemoteId = document.getElementById("remoteId");
const buttonRegister = document.getElementById("btnRegister");
const textUsername = document.getElementById("username");
const uLUsers = document.getElementById("Users");
const chatDiv = document.getElementById("divChat");
const RegisterDiv = document.getElementById("divRegister");
chatDiv.style.display = "none";
socket.on("ONLINE_LIST", (arrUserInfo) => {
  chatDiv.style.display = "block";
  RegisterDiv.style.display = "none";
  arrUserInfo.forEach((user) => {
    const { peerID, username } = user;
    const li = document.createElement("li");
    li.textContent = username;
    li.id = peerID;
    li.addEventListener("click", () => {
      OpenStream().then((stream) => {
        PlayStream("localStream", stream);
        const call = peer.call(peerID, stream);
        call.on("stream", (remoteStream) =>
          PlayStream("remoteStream", remoteStream)
        );
      });
    });
    uLUsers.appendChild(li);
  });
  socket.on("HAVE_NEW_USER", (user) => {
    const { peerID, username } = user;
    const li = document.createElement("li");
    li.textContent = username;
    li.id = peerID;
    li.addEventListener("click", () => {
      console.log(`Clicked on user: ${username}, peerID: ${peerID}`);
    });
    uLUsers.appendChild(li);
  });
  socket.on("SOMEONE_DISCONNECT", (peerID) => {
    console.log(peerID);
    const liElements = document.querySelectorAll("#Users li");
    liElements.forEach((u) => {
      if (u.id === peerID) {
        u.remove();
      }
      console.log(u);
    });
  });
});
socket.on("REGISTER_FALSE", () => {
  alert("Vui lòng chọn username khác");
});
function OpenStream() {
  const config = { audio: false, video: true };
  return navigator.mediaDevices.getUserMedia(config);
}
function PlayStream(idVideoTag, stream) {
  const video = document.getElementById(idVideoTag);
  video.srcObject = stream;
  video.play();
}
// OpenStream().then((stream) => PlayStream("localStream", stream));
const peer = new Peer();
peer.on("open", function (id) {
  document.getElementById("peerId").innerText += id;
  buttonRegister.addEventListener("click", () => {
    const username = textUsername.value;
    socket.emit("USER_REGISTER", { peerID: id, username: username });
  });
});

buttonCall.addEventListener("click", () => {
  const id = textRemoteId.value;
  OpenStream().then((stream) => {
    PlayStream("localStream", stream);
    const call = peer.call(id, stream);
    call.on("stream", (remoteStream) =>
      PlayStream("remoteStream", remoteStream)
    );
  });
});
peer.on("call", (call) => {
  OpenStream().then((stream) => {
    call.answer(stream);
    PlayStream("localStream", stream);
    call.on("stream", (remoteStream) =>
      PlayStream("remoteStream", remoteStream)
    );
  });
});
