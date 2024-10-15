import { Link } from "react-router-dom"

type AuthHeaderType = {
  type: "signup" | "signin"
}
export const AuthHeader = ({type}: AuthHeaderType) => {
  return (
    <div className="px-10">
      <div className="text-3xl font-extrabold">
        {type==="signup"? "Create an account": "Log In to account"}
      </div>
      <div className="text-slate-500">
        {type==="signup"? "Already have an account?": "Don't have an account"}
        <Link className="pl-2 underline" to={type==="signup"? "/signin": "/signup"}>
          {type==="signup"? "Sign in": "Sign Up"}
        </Link>
      </div>
    </div>
  )
}