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
const WatchStreamDiv = document.getElementById("WatchStreamDiv");
const SelectStreamPage = document.getElementById("SelectStreamPage");
const WatchLiveStream = document.getElementById("WatchLiveStream");
const liveStreamPage = document.getElementById("liveStreamPage");
const watchStreamPage = document.getElementById("watchStreamPage");
const chatCommentsContainer = document.getElementById("chatCommentsContainer");
const chatCommentsInput = document.getElementById("chatCommentsInput");
const chatMComments = document.getElementById("chatMComments");
const sendCommentsButton = document.getElementById("sendCommentsButton");
const stopCallingButton = document.getElementById("stopCalling");
const stopstopStreaming = document.getElementById("stopLiveStream");
const shareScreenButton = document.getElementById("shareScreen");
const chatMCommentsFan = document.getElementById("chatMCommentsFan");
const listUser = [];
let listCall = [];
let mediaStream;
let calling = false;
// let watchStreamUsers = [];
let userID;
let currentStreamer;
let callHandler = null;
let currentCall;
let toggleStreamPage = false;
let mediaRecorder;
let recordedChunks = [];
header.style.display = "none";
chatDiv.style.display = "none";
StreamDiv.style.display = "none";
WatchStreamDiv.style.display = "none";
SelectStreamPage.style.display = "none";
socket.on("ONLINE_LIST", (arrUserInfo) => {
  console.log(callHandler);
  chatDiv.style.display = "flex";
  header.style.display = "flex";
  RegisterDiv.style.display = "none";
  if (callHandler) {
    peer.off("call", callHandler);
  }
  callHandler = (call) => {
    currentCall = call;
    OpenStream().then((stream) => {
      mediaStream = stream;
      call.answer(stream);
      PlayStream("localStream", stream);
      call.on("stream", (remoteStream) => {
        console.log(remoteStream);
        return PlayStream("remoteStream", remoteStream);
      });
    });
  };
  peer.on("call", callHandler);
  console.log(callHandler);
  arrUserInfo.forEach((user) => {
    const { peerID, username, publicKey } = user;
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
    listUser.push({ username: username, id: peerID, publicKey: publicKey });
  });
  socket.on("HAVE_NEW_USER", (user) => {
    const { peerID, username, publicKey } = user;
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
    listUser.push({ username: username, id: peerID, publicKey: publicKey });
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
  const config = { audio: true, video: true };
  return navigator.mediaDevices.getUserMedia(config);
}
function PlayStream(idVideoTag, stream) {
  const video = document.getElementById(idVideoTag);
  video.srcObject = stream;
  setTimeout(() => {
    video.play();
  }, 1000);
}
function stopStreaming() {
  // Tắt sự kiện khi streamer chuyển trang
  socket.off("NEW_USER_JOIN_LIVESTREAM");
  socket.off("GET_WATCHSTREAMLIST");
  // Đóng tất cả các cuộc gọi trong danh sách listCall
  if (listCall.length > 0) {
    listCall.forEach((call) => call.close());
    listCall = [];
    console.log(listCall);
  }

  // Dừng tất cả các track của stream để tắt camera/microphone
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
  }
  stopRecording();
  // Ẩn hoặc chuyển đến trang mới
  // StreamDiv.style.display = "none";
  // chatDiv.style.display = "block";
}
stopstopStreaming.addEventListener("click", () => {
  chatMCommentsFan.innerHTML = "";
  socket.emit("DELETE_HISTORY_COMMENT_BY_USERID", userID);
  stopStreaming();
});
function stopCalling() {
  if (mediaStream) {
    // console.log(mediaStream);
    mediaStream.getTracks().forEach((track) => track.stop());
  }
  socket.emit("REQUEST_STOP_CALLING", currentCall.peer);
  if (currentCall) {
    currentCall.close(); // Đóng cuộc gọi
    currentCall = null; // Xóa tham chiếu tới cuộc gọi để có thể gọi lại lần sau
  }
}
stopCallingButton.addEventListener("click", () => {
  chatMComments.innerHTML = "";
  stopCalling();
});
function startRecording(stream) {
  recordedChunks = [];
  mediaRecorder = new MediaRecorder(stream);

  // Lưu các đoạn dữ liệu vào mảng khi có sẵn
  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };
  // Tải xuống bản ghi khi có sẵn
  mediaRecorder.onstop = () => {
    console.log(recordedChunks);
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "recording.webm";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    console.log("Recording downloaded");
    recordedChunks = [];
  };
  // Bắt đầu ghi
  mediaRecorder.start();
  console.log("Recording started");
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    console.log("Recording stopped");
    recordedChunks = [];
  }
}
socket.on("STOP_CALLING", () => {
  if (mediaStream) {
    // console.log(mediaStream);
    mediaStream.getTracks().forEach((track) => track.stop());
  }
  if (currentCall) {
    currentCall.close(); // Đóng cuộc gọi
    currentCall = null; // Xóa tham chiếu tới cuộc gọi để có thể gọi lại lần sau
    calling = false;
  }
});
// OpenStream().then((stream) => PlayStream("localStream", stream));
const peer = new Peer(undefined, {
  config: {
    iceServers: [
      {
        urls: "turn:standard.relay.metered.ca:80",
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
    // Tạo cặp khóa RSA khi người dùng đăng ký
    generateKeyPair().then((keyPair) => {
      exportKeys(keyPair).then(({ publicKeyString, privateKeyString }) => {
        // Gửi thông tin đăng ký lên server bao gồm cả khóa công khai
        socket.emit("USER_REGISTER", {
          peerID: userID,
          username: username,
          publicKey: publicKeyString,
        });

        // Lưu khóa bí mật trên client
        localStorage.setItem("privateKey", privateKeyString);
      });
    });
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
let senderId;
searchUserInput.addEventListener("input", function () {
  const query = this.value.toLowerCase(); // Lấy giá trị nhập vào và chuyển sang chữ thường
  const username = textUsername.value;
  // Xóa danh sách người dùng trước đó
  uLUsers.innerHTML = "";

  // Lọc và hiển thị người dùng theo truy vấn
  const filteredUsers = listUser.filter((user) =>
    user.username.toLowerCase().includes(query)
  );
  // console.log(query);
  // Kiểm tra xem có người dùng nào phù hợp không
  if (filteredUsers.length > 0) {
    uLUsers.style.display = "block";
    filteredUsers.forEach((user) => {
      const li = document.createElement("li");
      li.textContent = user.username;
      li.id = user.id;
      li.addEventListener("click", () => {
        senderId = user.id;
        socket.emit("CALL_USER", {
          callerPeerID: userID,
          callerName: username,
          receiverPeerID: user.id,
        });
        // OpenStream().then((stream) => {
        //   PlayStream("localStream", stream);
        //   const call = peer.call(user.id, stream);
        //   call.on("stream", (remoteStream) =>
        //     PlayStream("remoteStream", remoteStream)
        //   );
        // });
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
let receiverId;
// Lắng nghe sự kiện có cuộc gọi đến từ server
socket.on("INCOMING_CALL", ({ callerPeerID, callerName, receiverPeerID }) => {
  // Bây giờ người nhận đã có được peerID của người gọi
  const username = textUsername.value;
  // Sử dụng SweetAlert để hiện thông báo với các tùy chọn
  Swal.fire({
    title: `Incoming call from ${callerName}`,
    text: "Do you want to accept the call?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Accept",
    cancelButtonText: "Reject",
  }).then((result) => {
    if (result.isConfirmed) {
      // Người dùng chọn Accept
      receiverId = callerPeerID;
      OpenStream().then((stream) => {
        mediaStream = stream;
        PlayStream("localStream", stream);
        const call = peer.call(callerPeerID, stream);
        currentCall = call;
        call.on("stream", (remoteStream) =>
          PlayStream("remoteStream", remoteStream)
        );
      });
    } else {
      // Người dùng chọn Reject
      socket.emit("REJECT_CALL", {
        callerPeerID: callerPeerID,
        username: username,
      });
    }
  });
});
socket.on("CALL_REJECTION_NOTIFICATION", (message) => {
  Swal.fire({
    title: "Cuộc gọi bị từ chối",
    text: message,
    icon: "warning",
    confirmButtonText: "OK",
  });
});
VideoCallPage.addEventListener("click", () => {
  stopStreaming();
  chatDiv.style.display = "flex";
  StreamDiv.style.display = "none";
  WatchStreamDiv.style.display = "none";
});
StreamPage.addEventListener("click", () => {
  if (!toggleStreamPage) {
    SelectStreamPage.style.display = "flex";
    toggleStreamPage = !toggleStreamPage;
  } else {
    SelectStreamPage.style.display = "none";
    toggleStreamPage = !toggleStreamPage;
  }
});
liveStreamPage.addEventListener("click", () => {
  chatCommentsContainer.style.display = "block";
  chatMCommentsFan.style.display = "flex";
  // console.log(mediaStream);
  if (mediaStream && !currentStreamer) {
    // console.log(mediaStream);
    mediaStream.getTracks().forEach((track) => track.stop());
  }
  chatDiv.style.display = "none";
  StreamDiv.style.display = "block";
  WatchStreamDiv.style.display = "none";
  if (currentCall) {
    currentCall.close(); // Đóng cuộc gọi
    currentCall = null; // Xóa tham chiếu tới cuộc gọi để có thể gọi lại lần sau
  }
});
let currentStreamerId = null;
let isClick = false;
watchStreamPage.addEventListener("click", () => {
  if (isClick) {
    return;
  }
  isClick = true;
  // Xử lý các logic khác của bạn...

  // Bật lại nút sau 3 giây
  setTimeout(() => {
    isClick = false;
  }, 3000);
  chatMCommentsFan.style.display = "none";
  stopStreaming();
  chatDiv.style.display = "none";
  StreamDiv.style.display = "none";
  WatchStreamDiv.style.display = "block";
  if (currentCall) {
    currentCall.close(); // Đóng cuộc gọi
    currentCall = null; // Xóa tham chiếu tới cuộc gọi để có thể gọi lại lần sau
  }
  const vElements = document.querySelectorAll("#WatchStreamDiv #ulVideo li");
  vElements.forEach((item) => item.remove());
  // watchStreamUsers.push(userID);
  socket.emit("USER_VIEW_LIVESTREAM", { peerID: userID });
  if (callHandler) {
    peer.off("call", callHandler);
    console.log(callHandler);
  }
  // if (listCall.length > 0) {
  //   console.log(listCall);
  //   listCall.forEach((c) => c.close());
  //   listCall = [];
  // }
  // if (currentCall) {
  //   currentCall.close();
  //   console.log(currentCall); // Đóng cuộc gọi
  //   currentCall = null; // Xóa tham chiếu tới cuộc gọi để có thể gọi lại lần sau
  // }
  callHandler = (call) => {
    const streamerID = currentStreamer;
    listCall.push(call);
    // currentCall = call;
    // console.log(call);
    // console.log(currentCall);
    // console.log("emoeos");
    // OpenStream().then((stream) => {

    call.answer();
    // PlayStream("localStream", stream);
    const receivedStreams = new Set();
    call.on("stream", (remoteStream) => {
      if (!receivedStreams.has(remoteStream.id)) {
        receivedStreams.add(remoteStream.id);
        // console.log("New stream received from:", call.peer);
        // console.log("Stream details:", remoteStream);
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
        }, 3000);
        video.addEventListener("click", () => {
          // PlayStream("liveStream", video);
          const liveStreamVideo = document.getElementById("WatchLiveStream");
          chatCommentsContainer.style.display = "block";
          // Nếu người dùng đã ở trong room của streamer khác, rời khỏi room đó
          if (currentStreamerId !== call.peer) {
            chatMComments.innerHTML = "";
            currentStreamerId = call.peer;
            socket.emit("CREATE_CHAT_COMMENT_ROOM", call.peer);
            // socket.emit("CHAT_COMMENT_HISTORY", call.peer);
          }
          if (liveStreamVideo) {
            // Gán stream của thẻ video được click vào thẻ liveStreamVideo
            liveStreamVideo.srcObject = video.srcObject;
            liveStreamVideo.play();
            li.style.display = "none";
            const videoElements = document.querySelectorAll(
              "#WatchStreamDiv #ulVideo li"
            );
            // console.log(videoElements);
            videoElements.forEach((item) => {
              if (item !== li) {
                item.style.display = "block";
              }
            });
            // Bắt đầu phát stream
          }
        });
        console.log(li);
        li.appendChild(video);
        // Thêm thẻ video vào một container trên trang, ví dụ như `#remoteVideoContainer`
        ulVideo.appendChild(li);
      }
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
    startRecording(stream);
    mediaStream = stream;
    // console.log(listUser);
    // console.log(listUser.filter((user) => user.id !== userID));
    // Gửi thông tin rằng user này đang livestream
    currentStreamer = userID;
    socket.emit("USER_START_LIVESTREAM", { peerID: userID });
    socket.on("GET_WATCHSTREAMLIST", (arrWatchStream) => {
      for (let i = 0; i < arrWatchStream.length; i = i + 1) {
        // console.log(arrWatchStream[i].peerID);
        if (arrWatchStream[i].peerID !== userID) {
          const call = peer.call(arrWatchStream[i].peerID, stream);
          // console.log(listCall);
          listCall.push(call);
          call.on("stream", () => {
            console.log(arrWatchStream[i].peerID);
          });
        }
      }
      // console.log(arrWatchStream);
    });
    // watchStreamUsers

    socket.on("NEW_USER_JOIN_LIVESTREAM", (id) => {
      const call = peer.call(id, stream);
      listCall.push(call);
      console.log(listCall);
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
socket.on("SOMEONE_LIVESTREAMING", ({ streamer }) => {
  // console.log(streamer);
  currentStreamer = streamer;
});
shareScreenButton.addEventListener(
  "click",
  async () => {
    try {
      // Lấy luồng chia sẻ màn hình
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true, // Bật nếu muốn chia sẻ âm thanh hệ thống
      });
      stopRecording();
      // Cập nhật stream mới cho video element để xem trước chia sẻ màn hình
      PlayStream("liveStream", screenStream);
      startRecording(screenStream);
      // Cập nhật stream cho tất cả các cuộc gọi hiện tại
      listCall.forEach((call) => {
        // Lấy các track video hiện tại và thay thế bằng track từ screenStream
        const sender = call.peerConnection
          .getSenders()
          .find((s) => s.track.kind === "video");
        if (sender) {
          sender.replaceTrack(screenStream.getVideoTracks()[0]);
        }
      });

      // Dừng luồng video camera cũ nếu cần thiết
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }

      // Cập nhật lại mediaStream với luồng màn hình mới
      mediaStream = screenStream;

      // Xử lý sự kiện khi người dùng ngừng chia sẻ màn hình
      screenStream.getVideoTracks()[0].onended = () => {
        console.log("Screen sharing stopped");
        stopRecording();
        // Bạn có thể gọi lại hàm OpenStream để quay lại stream từ camera
        OpenStream().then((stream) => {
          PlayStream("liveStream", stream);
          mediaStream = stream;
          startRecording(stream);
          // Cập nhật lại các cuộc gọi với stream camera
          listCall.forEach((call) => {
            const sender = call.peerConnection
              .getSenders()
              .find((s) => s.track.kind === "video");
            if (sender) {
              sender.replaceTrack(stream.getVideoTracks()[0]);
            }
          });
        });
      };
    } catch (error) {
      console.error("Error switching to screen share:", error);
    }
  }

  // Gọi hàm `switchToScreenShare` khi muốn chuyển sang chia sẻ màn hình
);
// ----------------------------Chating---------------------------------------
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const sendMessageButton = document.getElementById("sendMessageButton");

sendMessageButton.addEventListener("click", async () => {
  const message = chatInput.value;
  const username = textUsername.value;
  console.log(username);
  // Kiểm tra xem người gửi và người nhận có hợp lệ không
  if (!message) {
    alert("Vui lòng nhập tin nhắn!");
    return;
  }
  const receiver = listUser.find((user) => user.id === receiverId);
  const sender = listUser.find((user) => user.id === senderId);
  if (receiver) {
    const publicKeyReceiver = await crypto.subtle.importKey(
      "spki",
      Uint8Array.from(atob(receiver.publicKey), (c) => c.charCodeAt(0)),
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["encrypt"]
    );
    const li = document.createElement("li");
    const p = document.createElement("p");
    p.id = "sendP";
    li.id = "sendLi";
    p.textContent = `${message}`;
    li.appendChild(p);
    chatMessages.appendChild(li);
    const encryptedMessage = await encryptMessage(publicKeyReceiver, message);
    console.log("Encrypted message:", encryptedMessage);

    socket.emit("NEW_CHAT_MESSAGE", { userID, message: encryptedMessage });
    chatInput.value = "";
  } else if (sender) {
    const publicKeyReceiver = await crypto.subtle.importKey(
      "spki",
      Uint8Array.from(atob(sender.publicKey), (c) => c.charCodeAt(0)),
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["encrypt"]
    );
    const li = document.createElement("li");
    const p = document.createElement("p");
    p.id = "sendP";
    li.id = "sendLi";
    p.textContent = `${message}`;
    li.appendChild(p);
    chatMessages.appendChild(li);
    const encryptedMessage = await encryptMessage(publicKeyReceiver, message);
    socket.emit("NEW_CHAT_MESSAGE", { userID, message: encryptedMessage });
    chatInput.value = "";
  } else {
    alert("Không tìm thấy người nhận!");
  }
});

socket.on("RECEIVE_CHAT_MESSAGE", async (data) => {
  const { username, message } = data;

  // Lấy khóa bí mật từ localStorage
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    Uint8Array.from(atob(localStorage.getItem("privateKey")), (c) =>
      c.charCodeAt(0)
    ),
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["decrypt"]
  );

  // Giải mã tin nhắn
  const decryptedMessage = await decryptMessage(privateKey, message);

  // Kiểm tra xem tin nhắn đã được giải mã thành công hay không
  if (decryptedMessage === null) {
    console.error("Failed to decrypt message:", message);
    return; // Nếu không giải mã được thì thoát khỏi hàm
  }

  // console.log("Decrypted message:", decryptedMessage);

  // Hiển thị tin nhắn đã giải mã
  const li = document.createElement("li");
  const p = document.createElement("p");
  p.id = "recieveP";
  li.id = "recieveLi";
  p.textContent = `${username}: ${decryptedMessage}`;
  li.appendChild(p);
  chatMessages.appendChild(li);
});
// Hàm mã hóa tin nhắn bằng khóa công khai
async function encryptMessage(publicKey, message) {
  const encodedMessage = new TextEncoder().encode(message);
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    encodedMessage
  );

  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

async function decryptMessage(privateKey, encryptedMessage) {
  try {
    const encryptedData = Uint8Array.from(atob(encryptedMessage), (c) =>
      c.charCodeAt(0)
    ); // Giải mã từ Base64
    const decrypted = await crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      encryptedData
    );
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("Error during decryption:", error.message); // In ra thông điệp lỗi chi tiết
    return null; // Trả về null nếu có lỗi
  }
}

async function generateKeyPair() {
  try {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );

    return keyPair;
  } catch (error) {
    console.error("Error generating key pair:", error);
  }
}

async function exportKeys(keyPair) {
  try {
    const publicKey = await window.crypto.subtle.exportKey(
      "spki",
      keyPair.publicKey
    );
    const privateKey = await window.crypto.subtle.exportKey(
      "pkcs8",
      keyPair.privateKey
    );

    const publicKeyString = btoa(
      String.fromCharCode(...new Uint8Array(publicKey))
    );
    const privateKeyString = btoa(
      String.fromCharCode(...new Uint8Array(privateKey))
    );

    return { publicKeyString, privateKeyString };
  } catch (error) {
    console.error("Error exporting keys:", error);
  }
}
// ----------------------------COMMENT---------------------------------------

socket.on("RECEIVE_CHAT_COMMENT_HISTORY", (history) => {
  // Xóa các comment cũ nếu cần
  chatMComments.innerHTML = ""; // Hoặc giữ lại comment cũ

  history.forEach((message) => {
    console.log(message);
    const li = document.createElement("li");

    // Tạo các thẻ p
    const p1 = document.createElement("p");
    p1.id = "p1"; // Nếu cần có thể thêm class thay vì id
    p1.textContent = `${message.username}: `; // Hiển thị tên người dùng

    const p2 = document.createElement("p");
    p2.textContent = message.message; // Hiển thị nội dung comment

    // Thêm các thẻ p vào li
    li.appendChild(p1);
    li.appendChild(p2);

    // Thêm li vào danh sách comment
    chatMComments.appendChild(li);
  });
});

// Nhận lịch sử chat khi kết nối tới server

sendCommentsButton.addEventListener("click", () => {
  const message = chatCommentsInput.value;
  const streamerID = currentStreamerId;
  if (!message) {
    alert("Vui lòng nhập tin nhắn!");
    return;
  }
  socket.emit("NEW_CHAT_COMMENT", { userID, message, streamerID });
  chatCommentsInput.value = "";
});
socket.on("RECEIVE_CHAT_COMMENT", (data) => {
  const { streamerID, username, message } = data;
  if (streamerID !== currentStreamerId) {
    return;
  }
  const li = document.createElement("li");
  const p1 = document.createElement("p");
  p1.id = "p1";
  const p2 = document.createElement("p");
  p1.textContent = `${username}: `;
  p2.textContent = `${message}`;
  li.appendChild(p1);
  li.appendChild(p2);
  chatMComments.appendChild(li);
});
socket.on("RECEIVE_CHAT_COMMENT_FOR_STREAMER", (history) => {
  chatMCommentsFan.innerHTML = ""; // Hoặc giữ lại comment cũ
  const { streamerID, username, message } = history;
  const li = document.createElement("li");
  const p1 = document.createElement("p");
  p1.id = "p1";
  const p2 = document.createElement("p");
  p1.textContent = `${username}: `;
  p2.textContent = `${message}`;
  li.appendChild(p1);
  li.appendChild(p2);
  chatMCommentsFan.appendChild(li);
});
