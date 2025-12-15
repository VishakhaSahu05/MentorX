import { BrowserRouter, Routes, Route } from "react-router-dom";
import Body from "./components/Body";
import Landing from "./components/Landing";
import Mentors from "./components/Mentors";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Feed from "./components/Feed";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Body />}>
          <Route
            path="/" element={
              <>
                <Landing />
                <Mentors />   
              </>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/feed" element={<Feed />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
