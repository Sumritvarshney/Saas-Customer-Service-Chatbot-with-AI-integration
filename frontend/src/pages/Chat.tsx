import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Box, Avatar, Typography, Button, IconButton } from "@mui/material";
import red from "@mui/material/colors/red";
import { useAuth } from "../context/AuthContext";
import ChatItem from "../components/chat/ChatItem";
import { IoMdSend } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import {
  deleteUserChats,
  getUserChats,
  sendChatRequest,
} from "../helpers/api-communicator";
import toast from "react-hot-toast";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const Chat = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const auth = useAuth();
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Redirect to login if not logged in
  useEffect(() => {
    if (!auth?.user) {
      navigate("/login");
    }
  }, [auth]);

  // Load user chats
  useLayoutEffect(() => {
    if (auth?.isLoggedIn && auth.user) {
      setLoading(true);
      toast.loading("Loading Chats", { id: "loadchats" });

      getUserChats()
        .then((data) => {
          setChatMessages(data?.chats || []);
          toast.success("Successfully loaded chats", { id: "loadchats" });
        })
        .catch((err) => {
          console.log(err);
          toast.error("Loading Failed", { id: "loadchats" });
        })
        .finally(() => setLoading(false));
    }
  }, [auth]);

  // Handle sending a message
  const handleSubmit = async () => {
    const content = inputRef.current?.value.trim();
    if (!content) return;

    inputRef.current!.value = "";
    const newMessage: Message = { role: "user", content };
    setChatMessages((prev) => [...prev, newMessage]);

    try {
      const chatData = await sendChatRequest(content);
      setChatMessages(chatData?.chats || []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to send message");
    }
  };

  // Handle deleting chats
  const handleDeleteChats = async () => {
    try {
      toast.loading("Deleting Chats", { id: "deletechats" });
      await deleteUserChats();
      setChatMessages([]);
      toast.success("Deleted Chats Successfully", { id: "deletechats" });
    } catch (error) {
      console.log(error);
      toast.error("Deleting chats failed", { id: "deletechats" });
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        width: "100%",
        height: "100%",
        mt: 3,
        gap: 3,
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          display: { md: "flex", xs: "none", sm: "none" },
          flex: 0.2,
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            width: "100%",
            height: "60vh",
            bgcolor: "rgb(17,29,39)",
            borderRadius: 5,
            flexDirection: "column",
            mx: 3,
          }}
        >
          <Avatar
            sx={{
              mx: "auto",
              my: 2,
              bgcolor: "white",
              color: "black",
              fontWeight: 700,
            }}
          >
            {auth?.user?.name?.[0]}
            {auth?.user?.name?.split(" ")[1]?.[0] || ""}
          </Avatar>
          <Typography sx={{ mx: "auto", fontFamily: "work sans" }}>
            You are talking to a ChatBOT
          </Typography>
          <Typography
            sx={{ mx: "auto", fontFamily: "work sans", my: 4, p: 3 }}
          >
            You can ask questions related to Knowledge, Business, Advice,
            Education, etc. Avoid sharing personal information.
          </Typography>
          <Button
            onClick={handleDeleteChats}
            sx={{
              width: "200px",
              my: "auto",
              color: "white",
              fontWeight: "700",
              borderRadius: 3,
              mx: "auto",
              bgcolor: red[300],
              ":hover": {
                bgcolor: red.A400,
              },
            }}
          >
            Clear Conversation
          </Button>
        </Box>
      </Box>

      {/* Chat Area */}
      <Box
        sx={{
          display: "flex",
          flex: { md: 0.8, xs: 1, sm: 1 },
          flexDirection: "column",
          px: 3,
        }}
      >
        <Typography
          sx={{
            fontSize: "40px",
            color: "white",
            mb: 2,
            mx: "auto",
            fontWeight: "600",
          }}
        >
          Model - GPT 3.5 Turbo
        </Typography>

        <Box
          sx={{
            width: "100%",
            height: "60vh",
            borderRadius: 3,
            mx: "auto",
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
            scrollBehavior: "smooth",
          }}
        >
          {loading ? (
            <Typography sx={{ color: "white", mx: "auto", mt: 2 }}>
              Loading chats...
            </Typography>
          ) : chatMessages?.length > 0 ? (
            chatMessages.map((chat, index) => (
              <ChatItem content={chat.content} role={chat.role} key={index} />
            ))
          ) : (
            <Typography sx={{ color: "white", mx: "auto", mt: 2 }}>
              No chats yet. Start the conversation!
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            width: "100%",
            borderRadius: 2,
            backgroundColor: "rgb(17,27,39)",
            display: "flex",
            mt: 2,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            style={{
              width: "100%",
              backgroundColor: "transparent",
              padding: "20px",
              border: "none",
              outline: "none",
              color: "white",
              fontSize: "18px",
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <IconButton onClick={handleSubmit} sx={{ color: "white", mx: 1 }}>
            <IoMdSend />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;
