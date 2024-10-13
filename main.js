const socket = io("https://web-rtc-d379249ca0bd.herokuapp.com/");
// const socket = io("http://localhost:3000");
const buttonCall = document.getElementById("btnCall");
const textRemoteId = document.getElementById("remoteId");
const buttonRegister = document.getElementById("btnRegister");
const textUsername = document.getElementById("username");
const uLUsers = document.getElementById("Users");
const chatDiv = document.getElementById("divChat");
const RegisterDiv = document.getElementById("divRegister");
const header = document.getElementById("header");
const searchUserInput = document.getElementById("searchUser");
const StreamPage = document.getElementById("StreamPage");
const VideoCallPage = document.getElementById("VideoCallPage");
const StreamDiv = document.getElementById("StreamDiv");
const onStreamBtn = document.getElementById("onStream");
const ulVideo = document.getElementById("ulVideo");
const listUser = [];
// let watchStreamUsers = [];
let userID;
let currentStreamer;
let callHandler;
let currentCall;
header.style.display = "none";
chatDiv.style.display = "none";
StreamDiv.style.display = "none";
socket.on("ONLINE_LIST", (arrUserInfo) => {
  chatDiv.style.display = "flex";
  header.style.display = "flex";
  RegisterDiv.style.display = "none";
  if (callHandler) {
    peer.off("call", callHandler);
  }
  callHandler = (call) => {
    OpenStream().then((stream) => {
      call.answer(stream);
      PlayStream("localStream", stream);
      call.on("stream", (remoteStream) =>
        PlayStream("remoteStream", remoteStream)
      );
    });
  };
  peer.on("call", callHandler);
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
    const index = listUser.indexOf((u) => u.id === peerID);
    listUser.splice(index, 1);
    // console.log(peerID);
    // const liElements = document.querySelectorAll("#Users li");
    // liElements.forEach((u) => {
    //   if (u.id === peerID) {
    //     u.remove();
    //   }
    //   console.log(u);
    // });
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
    userID = id;
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
searchUserInput.addEventListener("input", function () {
  const query = this.value.toLowerCase(); // Lấy giá trị nhập vào và chuyển sang chữ thường

  // Xóa danh sách người dùng trước đó
  uLUsers.innerHTML = "";

  // Lọc và hiển thị người dùng theo truy vấn
  const filteredUsers = listUser.filter((user) =>
    user.username.toLowerCase().includes(query)
  );
  console.log(query);
  // Kiểm tra xem có người dùng nào phù hợp không
  if (filteredUsers.length > 0) {
    uLUsers.style.display = "block";
    filteredUsers.forEach((user) => {
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
  } else {
    uLUsers.style.display = "none";
  }
  if (query === "") {
    uLUsers.style.display = "none";
  }
});
StreamPage.addEventListener("click", () => {
  chatDiv.style.display = "none";
  StreamDiv.style.display = "block";
  // watchStreamUsers.push(userID);
  socket.emit("USER_VIEW_LIVESTREAM", { peerID: userID });
  if (callHandler) {
    peer.off("call", callHandler);
  }
  callHandler = (call) => {
    currentCall = call;
    // console.log("emoeos");
    // OpenStream().then((stream) => {
    call.answer();
    // PlayStream("localStream", stream);
    call.on("stream", (remoteStream) => {
      const li = document.createElement("li");
      // Tạo một thẻ video mới
      const video = document.createElement("video");

      // Thiết lập thuộc tính để video tự động phát và tắt âm thanh của nó (nếu cần)
      video.autoplay = true;
      video.muted = true; // Set muted to true if you don't want to hear your own audio
      video.audio = true;
      // Gán remoteStream vào thẻ video
      // video.poster = "images/background.jpg";
      // video.width = "100px";
      // video.height = "100px";
      video.srcObject = remoteStream;
      video.play();
      setTimeout(() => {
        video.pause();
      }, 1000);
      video.addEventListener("click", () => {
        // PlayStream("liveStream", video);
        const liveStreamVideo = document.getElementById("liveStream");

        // Kiểm tra nếu thẻ liveStreamVideo tồn tại
        if (liveStreamVideo) {
          // Gán stream của thẻ video được click vào thẻ liveStreamVideo
          liveStreamVideo.srcObject = video.srcObject;
          liveStreamVideo.play();
          li.style.display = "none";
          const videoElements = document.querySelectorAll(
            "#StreamDiv #ulVideo li"
          );
          console.log(videoElements);
          videoElements.forEach((item) => {
            if (item !== li) {
              item.style.display = "block";
            }
          });
          // Bắt đầu phát stream
        }
      });
      li.appendChild(video);
      // Thêm thẻ video vào một container trên trang, ví dụ như `#remoteVideoContainer`
      ulVideo.appendChild(li);
    });
    // });
  };
  peer.on("call", callHandler);
  // if (currentStreamer) {
  //   socket.emit("USER_VIEW_LIVESTREAM", { peerID: userID });
  //   console.log(currentStreamer);
  //   // Nhận cuộc gọi từ người đang livestream
  // }
});
onStreamBtn.addEventListener("click", () => {
  if (callHandler) {
    peer.off("call", callHandler);
  }
  if (currentCall) {
    currentCall.close(); // Đóng cuộc gọi
    currentCall = null; // Xóa tham chiếu tới cuộc gọi để có thể gọi lại lần sau
  }
  const videoElements = document.querySelectorAll("#StreamDiv #ulVideo li");
  videoElements.forEach((video) => {
    // Nếu thẻ video không có id là "liveStream", thì xóa nó
    // if (video.id !== "liveStream") {
    video.remove();
    // }
  });
  OpenStream().then((stream) => {
    PlayStream("liveStream", stream);
    // console.log(listUser);
    // console.log(listUser.filter((user) => user.id !== userID));
    // Gửi thông tin rằng user này đang livestream
    currentStreamer = userID;
    socket.emit("USER_START_LIVESTREAM", { peerID: userID });
    socket.on("GET_WATCHSTREAMLIST", (arrWatchStream) => {
      for (let i = 0; i < arrWatchStream.length; i++) {
        // console.log(arrWatchStream[i].peerID);
        if (arrWatchStream[i].peerID !== userID) {
          const call = peer.call(arrWatchStream[i].peerID, stream);
          call.on("stream", () => {
            console.log(arrWatchStream[i].peerID);
          });
        }
      }
      console.log(arrWatchStream);
    });
    // watchStreamUsers

    socket.on("NEW_USER_JOIN_LIVESTREAM", (id) => {
      const call = peer.call(id, stream);
      call.on("stream", () => {
        console.log(id);
      });
    });
    // const call = peer.call(id, stream);
    // call.on("stream", (remoteStream) =>
    //   PlayStream("remoteStream", remoteStream)
    // );
  });
});
socket.on("SOMEONE_LIVESTREAMING", (id) => {
  currentStreamer = id;
});
