import { useColorModeValue, Box, Heading, Flex, Button, Input, Text, Spinner, Link } from "@chakra-ui/react";
import { useState, useRef } from "react";

const Folder = () => {
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [downloadLink, setDownloadLink] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setError(null);
        setDownloadLink(null);
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first");
            return;
        }

        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("http://127.0.0.1:5000/upload-excel", {
                method: "POST",
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            if (data.db_filename) {
                setDownloadLink(data.db_filename);
            }
        } catch (err) {
            setError(err.message);
            console.error("Upload error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
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
                p={4}
            >
                <Heading size="md" mb={4} textAlign="center">
                    Excel to SQLite Converter
                </Heading>

                <Flex direction="column" flex={1} justifyContent="center">
                    <Input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".xlsx,.xls"
                        display="none"
                    />

                    <Button
                        onClick={() => fileInputRef.current.click()}
                        mb={4}
                        colorScheme="teal"
                        variant="outline"
                    >
                        Select Excel File
                    </Button>

                    {file && (
                        <Text mb={4} textAlign="center">
                            Selected: {file.name}
                        </Text>
                    )}

                    <Button
                        onClick={handleUpload}
                        colorScheme="teal"
                        isLoading={isLoading}
                        loadingText="Converting..."
                        isDisabled={!file || isLoading}
                    >
                        Convert to SQLite
                    </Button>

                    {error && (
                        <Text color="red.500" mt={2} textAlign="center">
                            {error}
                        </Text>
                    )}

                    {downloadLink && (
                        <Flex direction="column" mt={4} alignItems="center">
                            <Text mb={2} color="green.500">
                                Conversion successful!
                            </Text>
                            <Link
                                href={`http://localhost:5000/download-db/${downloadLink}`}
                                download
                            >
                                <Button colorScheme="blue">
                                    Download SQLite Database
                                </Button>
                            </Link>
                        </Flex>
                    )}
                </Flex>
            </Box>
        </>
    );
};

export default Folder;