import { useState } from 'react';
import { Collapse, Button, Box, Text, useColorModeValue } from '@chakra-ui/react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ToggleThought = ({ thought }) => {
    const [showThought, setShowThought] = useState(false);

    const colorMode = useColorModeValue()
    if (!thought) return null;

    return (
        <Box mt={2} pl={6}>
            <Button
                size="xs"
                variant="ghost"
                rightIcon={showThought ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                onClick={() => setShowThought(!showThought)}
                colorScheme="gray"
            >
                {showThought ? 'Ẩn suy nghĩ' : 'Xem suy nghĩ của AI'}
            </Button>
            <Collapse in={showThought}>
                <Box
                    mt={1}
                    p={2}
                    bg={colorMode == 'light' ? 'gray.100' : 'gray.700'}
                    borderRadius="md"
                    fontSize="sm"
                    color={colorMode == 'light' ? 'gray.600' : 'gray.300'}
                    whiteSpace="pre-wrap"
                >
                    <Text fontStyle="italic">{thought}</Text>
                </Box>
            </Collapse>
        </Box>
    );
};

export default ToggleThought;