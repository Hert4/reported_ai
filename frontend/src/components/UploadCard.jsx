import { Box, useColorModeValue } from "@chakra-ui/react";

const UploadCard = () => {
    const borderColor = useColorModeValue("gray.200", "gray.700");

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

        </Box>
    );
}

export default UploadCard;