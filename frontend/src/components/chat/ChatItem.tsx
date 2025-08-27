import { Box, Avatar, Typography } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";

// 🔹 Ensure it always returns an array
function extractCodeFromString(message: string): string[] {
  if (message.includes("```")) {
    return message.split("```");
  }
  return [message];
}

function isCodeBlock(str: string) {
  return (
    str.includes("=") ||
    str.includes(";") ||
    str.includes("[") ||
    str.includes("]") ||
    str.includes("{") ||
    str.includes("}") ||
    str.includes("#") ||
    str.includes("//")
  );
}

// 🔹 Helper for safe initials
const getInitials = (name?: string) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
};

const ChatItem = ({
  content,
  role,
}: {
  content: string;
  role: "user" | "assistant";
}) => {
  const messageBlocks = extractCodeFromString(content);
  const auth = useAuth();

  return role === "assistant" ? (
    <Box
      sx={{
        display: "flex",
        p: 2,
        bgcolor: "#004d5612",
        gap: 2,
        borderRadius: 2,
        my: 1,
      }}
    >
      <Avatar sx={{ ml: "0" }}>
        <img src="openai.png" alt="openai" width={"30px"} />
      </Avatar>
      <Box>
        {messageBlocks.map((block, i) =>
          isCodeBlock(block) ? (
            <SyntaxHighlighter
              key={i}
              style={oneDark}
              language="javascript"
              wrapLongLines
            >
              {block}
            </SyntaxHighlighter>
          ) : (
            <Typography key={i} sx={{ fontSize: "20px" }}>
              {block}
            </Typography>
          )
        )}
      </Box>
    </Box>
  ) : (
    <Box
      sx={{
        display: "flex",
        p: 2,
        bgcolor: "#004d56",
        gap: 2,
        borderRadius: 2,
      }}
    >
      <Avatar sx={{ ml: "0", bgcolor: "black", color: "white" }}>
        {getInitials(auth?.user?.name)}
      </Avatar>
      <Box>
        {messageBlocks.map((block, i) =>
          isCodeBlock(block) ? (
            <SyntaxHighlighter
              key={i}
              style={oneDark}
              language="javascript"
              wrapLongLines
            >
              {block}
            </SyntaxHighlighter>
          ) : (
            <Typography key={i} sx={{ fontSize: "20px" }}>
              {block}
            </Typography>
          )
        )}
      </Box>
    </Box>
  );
};

export default ChatItem;
