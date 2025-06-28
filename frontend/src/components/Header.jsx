import { Box, Button, Flex, Text, useColorMode, Icon, useColorModeValue } from "@chakra-ui/react"
import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import { FaHome, FaUser, FaCog, FaFolder, FaChrome, FaBrain, FaEnvelope } from "react-icons/fa";
import AIChat from "./AIChat";
import React, { useState } from "react"; // Thêm import useState
import { FaCircleUser } from "react-icons/fa6";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import ProfileCard from "./ProfileCard";
import Folder from "./Folder";

const Header = () => {
    const { colorMode, toggleColorMode } = useColorMode()
    const isLight = colorMode === 'light'
    const [showAI, setShowAI] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showFolder, setShowFolder] = useState(false);
    const user = useRecoilValue(userAtom);
    const handleToggleAI = () => {
        setShowAI(prev => {
            if (!prev) setShowProfile(false);
            return !prev;
        });
    };

    const handleToggleProfile = () => {
        setShowProfile(prev => {
            if (!prev) setShowAI(false);
            return !prev;
        });
    };

    const handleToggleFolder = () => {
        setShowFolder(prev => {
            if (!prev) {
                setShowAI(false);
                setShowProfile(false);
            }
            return !prev;
        });
    }

    return (
        <>
            <Box
                position="fixed"
                bottom={6}
                left="50%"
                transform="translateX(-50%)"
                px={4}
                py={2}
                bg={useColorModeValue('rgba(240, 240, 240, 0.8)', 'rgba(30, 30, 30, 0.8)')}
                border={'1px solid'}
                borderColor={useColorModeValue('gray.200', 'gray.700')}
                boxShadow="lg"
                backdropFilter="blur(3px)"
                borderRadius="24"
                transition="all 0.2s"
                zIndex={100}
                mx={'auto'}
                maxW={'fit-content'}
            >
                <Flex
                    height={16}
                    alignItems={'flex-end'}
                    justifyContent={'center'}
                    gap={2}
                >
                    <Button
                        variant="ghost"
                        p={3}
                        borderRadius="full"
                        transform={showAI ? 'scale(1.2) translateY(-10px)' : 'none'}
                        _hover={{
                            transform: 'translateY(-10px) scale(1.1)',
                        }}
                        transition="all 0.2s"
                        onClick={handleToggleAI}
                    >
                        <Icon as={FaBrain} boxSize={8} />
                    </Button>

                    <Button
                        variant="ghost"
                        p={3}
                        borderRadius="full"
                        transform={showFolder ? 'scale(1.2) translateY(-10px)' : 'none'}
                        _hover={{
                            transform: 'translateY(-10px) scale(1.1)',
                        }}
                        transition="all 0.2s"
                        onClick={handleToggleFolder}
                    >
                        <Icon as={FaFolder} boxSize={8} />
                    </Button>

                    <Button
                        variant="ghost"
                        p={3}
                        borderRadius="full"
                        _hover={{
                            transform: 'translateY(-10px) scale(1.1)',
                        }}
                        transition="all 0.2s"
                    >
                        <Icon as={FaEnvelope} boxSize={8} />
                    </Button>

                    <Button
                        variant="ghost"
                        p={3}
                        borderRadius="full"
                        transform={showProfile ? 'scale(1.2) translateY(-10px)' : 'none'}
                        _hover={{
                            transform: 'translateY(-10px) scale(1.1)',
                        }}
                        transition="all 0.2s"
                        onClick={handleToggleProfile}
                    >
                        <Icon as={FaCircleUser} boxSize={8} />
                    </Button>

                    <Button
                        variant="ghost"
                        p={3}
                        borderRadius="full"
                        _hover={{
                            transform: 'translateY(-10px) scale(1.1)',
                        }}
                        transition="all 0.2s"
                        onClick={toggleColorMode}
                    >
                        <Icon as={colorMode === 'light' ? MoonIcon : SunIcon} boxSize={8} />
                    </Button>
                </Flex>

                <Box
                    position="absolute"
                    bottom={1}
                    left="50%"
                    transform="translateX(-50%)"
                    width="4px"
                    height="4px"
                    bg={isLight ? 'gray.600' : 'gray.300'}
                    borderRadius="full"
                />
            </Box>
            {showAI && (
                <AIChat />
            )}
            {showProfile && (
                <ProfileCard user={user} />
            )}

            {showFolder && (
                <Folder />
            )}
        </>
    )
}

export default Header