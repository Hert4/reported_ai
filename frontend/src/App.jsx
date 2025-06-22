import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import HomePage from './pages/HomePage'
import Header from "./components/Header"
import { Box, Container, Flex } from "@chakra-ui/react"
import userAtom from "./atoms/userAtom"
import { useRecoilValue } from "recoil"
import AuthPage from "./pages/AuthPage"

function App() {
  const user = useRecoilValue(userAtom)
  const location = useLocation()

  return (
    <Flex direction="column" minHeight="100vh">
      <Box flex="1">
        <Container maxW="620px" height="100%">
          <Routes>
            <Route
              path="/"
              element={user ? <HomePage /> : <Navigate to="/auth" />}
            />
            <Route
              path="/auth"
              element={user ? <Navigate to="/" /> : <AuthPage />}
            />
          </Routes>
        </Container>
      </Box>

      {user && location.pathname !== "/auth" && <Header />}
    </Flex>
  )
}

export default App
