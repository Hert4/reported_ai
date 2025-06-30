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
import { IoIosAdd } from "react-icons/io";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import ToggleThought from "./ToggleThought";


const AIChat = () => {
    // --- Conversation State ---
    const [conversations, setConversations] = useState(() => {
        const saved = localStorage.getItem("conversations");
        if (saved) return JSON.parse(saved);
        // Khởi tạo một cuộc trò chuyện mặc định
        return [
            {
                id: "conv-1",
                name: "Cuộc trò chuyện mới",
                messages: [
                    {
                        id: "1",
                        content: "Xin chào! Tôi là trợ lý AI. Tôi có thể giúp gì cho bạn hôm nay?",
                        role: "assistant",
                        timestamp: new Date().toISOString(),
                    },
                ],
                createdAt: new Date().toISOString(),
            },
        ];
    });
    const [currentConvId, setCurrentConvId] = useState(() => {
        const saved = localStorage.getItem("currentConvId");
        if (saved) return saved;
        return "conv-1";
    });
    const currentConv = conversations.find((c) => c.id === currentConvId) || conversations[0];
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const borderColor = useColorModeValue("gray.200", "gray.700");
    const inputBg = useColorModeValue("gray.50", "gray.700");
    const assistantBg = useColorModeValue("gray.100", "gray.700");
    const userBg = useColorModeValue("blue.50", "blue.900");

    // Lưu conversations và currentConvId vào localStorage mỗi khi thay đổi
    useEffect(() => {
        localStorage.setItem("conversations", JSON.stringify(conversations));
    }, [conversations]);
    useEffect(() => {
        localStorage.setItem("currentConvId", currentConvId);
    }, [currentConvId]);

    // Tạo cuộc trò chuyện mới
    const handleNewConversation = () => {
        const newId = `conv-${Date.now()}`;
        const newConv = {
            id: newId,
            name: `Cuộc trò chuyện ${conversations.length + 1}`,
            messages: [
                {
                    id: "1",
                    content: "Xin chào! Tôi là trợ lý AI. Tôi có thể giúp gì cho bạn hôm nay?",
                    role: "assistant",
                    timestamp: new Date().toISOString(),
                },
            ],
            createdAt: new Date().toISOString(),
        };
        setConversations((prev) => [newConv, ...prev]);
        setCurrentConvId(newId);
    };

    // Đổi tên cuộc trò chuyện
    const handleRenameConversation = (id, newName) => {
        setConversations((prev) => prev.map(c => c.id === id ? { ...c, name: newName } : c));
    };

    // Xóa cuộc trò chuyện
    const handleDeleteConversation = (id) => {
        let newConvs = conversations.filter(c => c.id !== id);
        if (newConvs.length === 0) {
            // Nếu xóa hết thì tạo mới
            handleNewConversation();
            newConvs = conversations;
        }
        setConversations(newConvs);
        if (currentConvId === id && newConvs.length > 0) {
            setCurrentConvId(newConvs[0].id);
        }
    };

    // Gửi tin nhắn
    const handleSendMessage = async () => {
        if (input.trim() === "") return;
        const userMessage = {
            id: Date.now().toString(),
            content: input,
            role: "user",
            timestamp: new Date().toISOString(),
        };
        setConversations((prev) => prev.map(conv =>
            conv.id === currentConvId
                ? { ...conv, messages: [...conv.messages, userMessage] }
                : conv
        ));
        setInput("");
        setIsLoading(true);
        try {
            const res = await fetch("http://127.0.0.1:5001/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    {
                        message: input,
                        history: currentConv.messages.map(m => ({
                            role: m.role,
                            content: m.content,
                        }))
                    }
                ),
            });
            const data = await res.json();
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
            setConversations((prev) => prev.map(conv =>
                conv.id === currentConvId
                    ? { ...conv, messages: [...conv.messages, aiMessage] }
                    : conv
            ));
        } catch (error) {
            console.error("Error sending message:", error);
            setConversations((prev) => prev.map(conv =>
                conv.id === currentConvId
                    ? {
                        ...conv,
                        messages: [
                            ...conv.messages,
                            {
                                id: (Date.now() + 1).toString(),
                                content: "Xin lỗi, đã xảy ra lỗi khi kết nối đến máy chủ.",
                                role: "assistant",
                                timestamp: new Date().toISOString(),
                            },
                        ],
                    }
                    : conv
            ));
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
    }, [currentConv.messages]);

    // --- UI ---
    return (
        <Flex
            position="fixed"
            top="45%"
            left="50%"
            transform="translate(-50%, -50%)"
            width={["95vw", "700px"]}
            height="75vh"
            maxHeight="750px"
            minHeight="400px"
            border="1px solid"
            borderColor={borderColor}
            borderRadius="12px"
            boxShadow="xl"
            zIndex={999}
            bg={useColorModeValue('rgba(240, 240, 240, 0.8)', 'rgba(30, 30, 30, 0.8)')}
            backdropFilter={'blur(3px)'}
            overflow="hidden"
        >
            {/* Sidebar: Danh sách cuộc trò chuyện */}
            <Box w={["32vw", "220px"]} bg={useColorModeValue('gray.100', 'gray.800')} p={3} borderRight="1px solid" borderColor={borderColor}>
                <Flex align="center" mb={3} justify="space-between">
                    <Text fontWeight="bold">Cuộc trò chuyện</Text>
                    <IconButton icon={<IoIosAdd />} size="xs" aria-label="Tạo mới" onClick={handleNewConversation} />
                </Flex>
                <VStack align="stretch" spacing={1} maxH="60vh" overflowY="auto">
                    {conversations.map((conv) => (
                        <Flex
                            key={conv.id}
                            align="center"
                            p={2}
                            borderRadius="md"
                            bg={conv.id === currentConvId ? useColorModeValue('blue.100', 'blue.700') : 'transparent'}
                            cursor="pointer"
                            _hover={{ bg: useColorModeValue('blue.50', 'blue.900') }}
                            onClick={() => setCurrentConvId(conv.id)}
                        >
                            <Text flex={1} fontSize="sm" isTruncated>{conv.name}</Text>
                            {/* Đổi tên nhanh bằng double click */}
                            {/* <IconButton icon={<EditIcon />} size="xs" aria-label="Đổi tên" ml={1} /> */}
                            <IconButton icon={<Box as="span" fontWeight="bold">×</Box>} size="xs" aria-label="Xóa" ml={1} onClick={e => { e.stopPropagation(); handleDeleteConversation(conv.id); }} />
                        </Flex>
                    ))}
                </VStack>
            </Box>

            {/* Main Chat UI */}
            <Box flex={1} display="flex" flexDirection="column" overflow="hidden">
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
                    <Text fontWeight="bold">{currentConv.name}</Text>
                </Flex>

                <Box flex={1} overflowY="auto" p={4}>
                    <VStack spacing={4} align="stretch">
                        {currentConv.messages.map((message) => (
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
        </Flex>
    );
};

export default AIChat;