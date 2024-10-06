const socket = io("https://web-rtc-d379249ca0bd.herokuapp.com/");
const buttonCall = document.getElementById("btnCall");
const textRemoteId = document.getElementById("remoteId");
const buttonRegister = document.getElementById("btnRegister");
const textUsername = document.getElementById("username");
const uLUsers = document.getElementById("Users");
const chatDiv = document.getElementById("divChat");
const RegisterDiv = document.getElementById("divRegister");
const header = document.getElementById("header");
const searchUserInput = document.getElementById("searchUser");
const listUser = [];
header.style.display = "none";
chatDiv.style.display = "none";
socket.on("ONLINE_LIST", (arrUserInfo) => {
  chatDiv.style.display = "flex";
  header.style.display = "flex";
  RegisterDiv.style.display = "none";
  arrUserInfo.forEach((user) => {
    const { peerID, username } = user;
    // const li = document.createElement("li");
    // li.textContent = username;
    // li.id = peerID;
    // li.addEventListener("click", () => {
    //   OpenStream().then((stream) => {
    //     PlayStream("localStream", stream);
    //     const call = peer.call(peerID, stream);
    //     call.on("stream", (remoteStream) =>
    //       PlayStream("remoteStream", remoteStream)
    //     );
    //   });
    // });
    // uLUsers.appendChild(li);
    listUser.push({ username: username, id: peerID });
  });
  socket.on("HAVE_NEW_USER", (user) => {
    const { peerID, username } = user;
    // const li = document.createElement("li");
    // li.textContent = username;
    // li.id = peerID;
    // li.addEventListener("click", () => {
    //   OpenStream().then((stream) => {
    //     PlayStream("localStream", stream);
    //     const call = peer.call(peerID, stream);
    //     call.on("stream", (remoteStream) =>
    //       PlayStream("remoteStream", remoteStream)
    //     );
    //   });
    // });
    // uLUsers.appendChild(li);
    listUser.push({ username: username, id: peerID });
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
const peer = new Peer(undefined, {
  config: {
    iceServers: [
      {
        urls: "turn:global.relay.metered.ca:80",
        username: "bcb1cf6a93292e9799ce9da7",
        credential: "SCqcdf7LDWvXDVfu",
      },
    ],
  },
});
peer.on("open", function (id) {
  document.getElementById("peerId").innerText += id;
  buttonRegister.addEventListener("click", () => {
    const username = textUsername.value;
    const usernameProfile = document.getElementById("usernameProfile");
    usernameProfile.textContent = username;
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
searchUserInput.addEventListener("input", function () {
  const query = this.value.toLowerCase(); // Lấy giá trị nhập vào và chuyển sang chữ thường

  // Xóa danh sách người dùng trước đó
  uLUsers.innerHTML = "";

  // Lọc và hiển thị người dùng theo truy vấn
  const filteredUsers = listUser.filter(user => user.username.toLowerCase().includes(query));
  console.log(query);
  // Kiểm tra xem có người dùng nào phù hợp không
  if (filteredUsers.length > 0) {
    uLUsers.style.display = "block";
    filteredUsers.forEach(user => {
      const li = document.createElement("li");
      li.textContent = user.username;
      li.id = user.id;
      li.addEventListener("click", () => {
        OpenStream().then((stream) => {
          PlayStream("localStream", stream);
          const call = peer.call(user.id, stream);
          call.on("stream", (remoteStream) =>
            PlayStream("remoteStream", remoteStream)
          );
        });
      });
      uLUsers.appendChild(li); // Thêm vào danh sách hiển thị
    });
  }
  else {
    uLUsers.style.display = "none";
  }
  if (query === '') {
    uLUsers.style.display = "none";
  }
});
