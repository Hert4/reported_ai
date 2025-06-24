import {
    Box,
    Flex,
    Text,
    Avatar,
    IconButton,
    Textarea,
    Spinner,
    VStack,
    HStack,
    useColorModeValue
} from "@chakra-ui/react";
import { ArrowUp, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import ToggleThought from "./ToggleThought";


const AIChat = () => {
    // Khởi tạo messages từ localStorage hoặc mảng mặc định
    const [messages, setMessages] = useState(() => {
        const savedMessages = localStorage.getItem("chatHistory");
        return savedMessages
            ? JSON.parse(savedMessages)
            : [
                {
                    id: "1",
                    content: "Xin chào! Tôi là trợ lý AI. Tôi có thể giúp gì cho bạn hôm nay?",
                    role: "assistant",
                    timestamp: new Date().toISOString(),
                },
            ];
    });
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const borderColor = useColorModeValue("gray.200", "gray.700");
    const inputBg = useColorModeValue("gray.50", "gray.700");
    const assistantBg = useColorModeValue("gray.100", "gray.700");
    const userBg = useColorModeValue("blue.50", "blue.900");

    // Lưu messages vào localStorage mỗi khi messages thay đổi
    useEffect(() => {
        localStorage.setItem("chatHistory", JSON.stringify(messages));
    }, [messages]);

    const handleSendMessage = async () => {
        if (input.trim() === "") return;

        const userMessage = {
            id: Date.now().toString(),
            content: input,
            role: "user",
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("http://127.0.0.1:5000/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: input }),
            });

            const data = await res.json();
            console.log("Response from AI:", data);

            const aiResponse = data.response || data.history[data.history.length - 1][1];
            const thoughtMatch = aiResponse.match(/<think>([\s\S]*?)<\/think>/);
            const thought = thoughtMatch ? thoughtMatch[1] : null;
            const response = aiResponse.replace(/<think>[\s\S]*?<\/think>/, '').trim();

            const aiMessage = {
                id: (Date.now() + 1).toString(),
                content: response,
                thought: thought,
                role: "assistant",
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error("Error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    content: "Xin lỗi, đã xảy ra lỗi khi kết nối đến máy chủ.",
                    role: "assistant",
                    timestamp: new Date().toISOString(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <Box
            position="fixed"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            width={["90vw", "500px"]}
            height="70vh"
            maxHeight="700px"
            minHeight="400px"
            border="1px solid"
            borderColor={borderColor}
            borderRadius="12px"
            boxShadow="xl"
            zIndex={999}
            display="flex"
            flexDirection="column"
            overflow="hidden"
            bg={useColorModeValue('rgba(240, 240, 240, 0.8)', 'rgba(30, 30, 30, 0.8)')}
            backdropFilter={'blur(3px)'}
        >
            <Flex
                p={3}
                borderBottom="1px solid"
                borderColor={borderColor}
                alignItems="center"
                bg={useColorModeValue('rgba(240, 240, 240, 0.8)', 'rgba(30, 30, 30, 0.8)')}
                backdropFilter={'blur(3px)'}
            >
                <Avatar
                    size="sm"
                    name="AI Assistant"
                    src="https://avatars.githubusercontent.com/u/108554348?s=200&v=4"
                    mr={2}
                />
                <Text fontWeight="bold">Trợ lý AI</Text>
            </Flex>

            <Box flex={1} overflowY="auto" p={4}>
                <VStack spacing={4} align="stretch">
                    {messages.map((message) => (
                        <Flex
                            key={message.id}
                            direction="column"
                            align={message.role === "user" ? "flex-end" : "flex-start"}
                        >
                            <Flex
                                maxW="80%"
                                bg={message.role === "user" ? userBg : assistantBg}
                                p={3}
                                borderRadius="lg"
                                borderTopLeftRadius={message.role === "assistant" ? 0 : "lg"}
                                borderTopRightRadius={message.role === "user" ? 0 : "lg"}
                            >
                                {message.role === "assistant" && (
                                    <Avatar
                                        size="xs"
                                        name="AI Assistant"
                                        src="https://avatars.githubusercontent.com/u/108554348?s=200&v=4"
                                        mr={2}
                                    />
                                )}
                                <Box>
                                    <ReactMarkdown>{message.content}</ReactMarkdown>
                                    {message.role === "assistant" && message.thought && (
                                        <ToggleThought thought={message.thought} />
                                    )}
                                </Box>
                                {message.role === "user" && (
                                    <Avatar
                                        size="xs"
                                        icon={<User size={12} />}
                                        ml={2}
                                        bg="blue.500"
                                        color="white"
                                    />
                                )}
                            </Flex>
                            <Text fontSize="xs" color="gray.500" mt={1}>
                                {new Date(message.timestamp).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </Text>
                        </Flex>
                    ))}
                    {isLoading && (
                        <Flex justify="flex-start" pl={2}>
                            <Spinner size="sm" />
                        </Flex>
                    )}
                    <div ref={messagesEndRef} />
                </VStack>
            </Box>

            <Box p={3} borderTop="1px solid" borderColor={borderColor}>
                <HStack>
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        size="sm"
                        resize="none"
                        rows={1}
                        bg={inputBg}
                        borderRadius="full"
                        onKeyDown={handleKeyDown}
                    />
                    <IconButton
                        aria-label="Gửi tin nhắn"
                        icon={<ArrowUp size={18} />}
                        size="sm"
                        colorScheme="blue"
                        borderRadius="full"
                        onClick={handleSendMessage}
                        isDisabled={input.trim() === ""}
                        position={'relative'}
                        m={1}
                    />
                </HStack>
                <Text fontSize="xs" color="gray.500" mt={1} textAlign="center">
                    AI có thể sai sót, nếu thông tin quan trọng, hãy kiểm tra lại!
                </Text>
            </Box>
        </Box>
    );
};

export default AIChat;