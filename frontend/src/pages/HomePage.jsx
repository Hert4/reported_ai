import {
    Box,
    Flex,
    Text,

} from '@chakra-ui/react'
import { FaPaperPlane } from 'react-icons/fa'

const HomePage = () => {

    return (
        <>
            <Flex
                justifyContent="center"
                alignItems="center"
                textAlign="center"
                height={'100vh'}
                fontSize={32}
                fontStyle={'bold'}
            >
                <Text as='h2' >
                    The Repporter
                </Text>
            </Flex>
        </>
    )
}

export default HomePage
