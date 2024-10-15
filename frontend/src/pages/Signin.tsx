import { useState } from "react";
import { AuthHeader } from "../components/AuthHeader";
import { LabelledInput } from "../components/LabelledInput";
import { Quote } from "../components/Quote";
import { SigninType} from "@moin17/writewave-common2";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../conf/conf";

export default function () {
  const navigate = useNavigate();
  const [postInputs, setPostInputs] = useState<SigninType>({
    email: "",
    password: ""
  });

  async function sendRequest () {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/user/signin`, postInputs);
      const jwt = response.data.token;
      localStorage.setItem("token",jwt);
      navigate("/blogs")
    } catch(e) {
      console.log(e);
      alert("Error while signing up")
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <div>
        <div className="h-screen flex justify-center flex-col">
          <div className="flex justify-center">
            <div>
              <AuthHeader type="signin"/>
              <div className="pt-8">
                <LabelledInput label="Email" placeholder="johndeo@gmail.com" onChange={(e) => {
                  setPostInputs({...postInputs, 
                    email: e.target.value
                  })
                }}/>
                <LabelledInput label="Password" type={"password"} placeholder="123456" onChange={(e) => {
                  setPostInputs({...postInputs, 
                    password: e.target.value
                  })
                }}/>
                <button type="button" onClick={sendRequest} className="mt-8 w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 ">Sign in</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:block">
        <Quote/>
      </div>
    </div>
  )
}